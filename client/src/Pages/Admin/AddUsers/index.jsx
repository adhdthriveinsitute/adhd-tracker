import React, { useState } from 'react';
import { parse, isValid, format } from 'date-fns';
import * as yup from 'yup';
import Papa from 'papaparse';
import { BiLoaderAlt, BiUpload, BiCheck, BiX, BiUser, BiFile, BiDownload } from 'react-icons/bi';
import { Brain, Upload, Users, CheckCircle, AlertCircle, Eye, EyeOff, Download } from 'lucide-react';
import { userSignup } from '@src/Pages/User/Signup/api/index'; // Adjust import path as needed
import { DATE_FORMAT_STRING, GENDERS, WEIGHT_UNIT, DATE_FORMAT_REGEX } from '@src/constants';
import { SuccessNotification, ErrorNotification } from '@src/utils';
import { useNavigate } from 'react-router-dom';

const AddUsers = () => {
    const [csvFile, setCsvFile] = useState(null);
    const [csvData, setCsvData] = useState([]);
    const [validationResults, setValidationResults] = useState([]);
    const [isValidating, setIsValidating] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [validUsers, setValidUsers] = useState([]);
    const [invalidUsers, setInvalidUsers] = useState([]);

    const navigate = useNavigate()

    // Validation schema based on Signup.jsx
    const userValidationSchema = yup.object({
        name: yup.string().min(3, "Name must be at least 3 characters").required('Name is required'),
        dateOfBirth: yup
            .string()
            .required("Date of birth is required")
            .matches(DATE_FORMAT_REGEX, "Invalid date format. Please use MM-DD-YYYY")
            .test("is-valid-date", "Invalid date", (value) => {
                if (!value) return false;
                const parsedDate = parse(value, DATE_FORMAT_STRING, new Date());
                return (
                    isValid(parsedDate) &&
                    format(parsedDate, DATE_FORMAT_STRING) === value
                );
            })
            .test("age-limit", "Date must be between 1900 and today", (value) => {
                if (!value) return false;
                const date = parse(value, DATE_FORMAT_STRING, new Date());
                const year = date.getFullYear();
                const today = new Date();
                return year >= 1900 && date <= today;
            }),
        gender: yup
            .string()
            .oneOf(GENDERS, 'Invalid gender')
            .required('Gender is required'),
        weight: yup
            .number()
            .max(500, "Weight seems unrealistic")
            .typeError("Weight must be a number")
            .required("Weight is required"),
        email: yup.string().email('Invalid email format').required('Email is required'),
        type: yup
            .string()
            .oneOf(['client', 'non-client'], 'Type must be either "client" or "non-client"')
            .required('Type is required'),
    });

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
            ErrorNotification('Please upload a valid CSV file');
            return;
        }

        setCsvFile(file);
        setCsvData([]);
        setValidationResults([]);
        setShowPreview(false);
        setValidUsers([]);
        setInvalidUsers([]);

        // Parse CSV
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
            delimitersToGuess: [',', '\t', '|', ';'],
            transformHeader: (header) => header.trim().toLowerCase(),
            complete: (results) => {
                if (results.errors.length > 0) {
                    ErrorNotification('CSV parsing failed. Please check your file format.');
                    console.error('CSV parsing errors:', results.errors);
                    return;
                }
                setCsvData(results.data);
            },
            error: (error) => {
                ErrorNotification('Failed to read CSV file');
                console.error('CSV reading error:', error);
            }
        });
    };

    const validateUsers = async () => {
        if (csvData.length === 0) {
            ErrorNotification('No data to validate');
            return;
        }

        setIsValidating(true);
        const results = [];
        const valid = [];
        const invalid = [];

        for (let i = 0; i < csvData.length; i++) {
            const row = csvData[i];
            const rowNumber = i + 1;

            try {
                // Normalize the data to match expected field names
                const userData = {
                    name: row.name || row.fullname || row.full_name || '',
                    dateOfBirth: row.dateofbirth || row.date_of_birth || row.dob || '',
                    gender: row.gender || '',
                    weight: row.weight || '',
                    email: row.email || '',
                    type: row.type || row.client_type || 'non-client',
                };

                // Validate against schema
                await userValidationSchema.validate(userData, { abortEarly: false });

                // If validation passes
                const validUser = {
                    ...userData,
                    password: 'Pass@1234!', // Default password
                    role: 'user',
                    rowNumber
                };

                valid.push(validUser);
                results.push({
                    rowNumber,
                    isValid: true,
                    data: validUser,
                    errors: []
                });

            } catch (error) {
                // If validation fails
                const errors = error.inner ? error.inner.map(err => err.message) : [error.message];

                invalid.push({
                    rowNumber,
                    data: row,
                    errors
                });

                results.push({
                    rowNumber,
                    isValid: false,
                    data: row,
                    errors
                });
            }
        }

        setValidationResults(results);
        setValidUsers(valid);
        setInvalidUsers(invalid);
        setShowPreview(true);
        setIsValidating(false);

        if (valid.length === 0) {
            ErrorNotification('No valid users found. Please check your data and try again.');
        } else if (invalid.length > 0) {
            ErrorNotification(`${invalid.length} users have validation errors. Please review and fix them.`);
        } else {
            SuccessNotification(`All ${valid.length} users are valid and ready to be created!`);
        }
    };

    const createUsers = async () => {
        if (validUsers.length === 0) {
            ErrorNotification('No valid users to create');
            return;
        }

        if (invalidUsers.length > 0) {
            ErrorNotification('Please fix validation errors before creating users');
            return;
        }

        setIsCreating(true);
        let successCount = 0;
        let failureCount = 0;
        const failedUsers = [];

        for (const user of validUsers) {
            try {
                const { rowNumber, ...userData } = user;
                await userSignup(userData);
                successCount++;
            } catch (error) {
                failureCount++;
                failedUsers.push({
                    user: user.name,
                    email: user.email,
                    error: error.message || 'Unknown error'
                });
                console.error(`Failed to create user ${user.email}:`, error);
            }
        }

        setIsCreating(false);

        if (successCount > 0 && failureCount === 0) {
            SuccessNotification(`Successfully created ${successCount} users!`);
            // Reset form
            setCsvFile(null);
            setCsvData([]);
            setValidationResults([]);
            setShowPreview(false);
            setValidUsers([]);
            setInvalidUsers([]);
            navigate("/")
            document.getElementById('csvFileInput').value = '';
        } else if (successCount > 0 && failureCount > 0) {
            SuccessNotification(`Created ${successCount} users. ${failureCount} failed.`);
            console.error('Failed users:', failedUsers);
        } else {
            ErrorNotification('Failed to create users. Please try again.');
            console.error('Failed users:', failedUsers);
        }
    };

    const resetForm = () => {
        setCsvFile(null);
        setCsvData([]);
        setValidationResults([]);
        setShowPreview(false);
        setValidUsers([]);
        setInvalidUsers([]);
        document.getElementById('csvFileInput').value = '';
    };

    const downloadSampleCSV = () => {
        const sampleData = [
            {
                name: 'John Doe',
                email: 'john.doe@example.com',
                dateOfBirth: '01-15-1990',
                gender: 'Male',
                weight: 70,
                type: 'non-client'
            }
        ];

        const csv = Papa.unparse(sampleData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');

        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'sample_users.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            SuccessNotification('Sample CSV downloaded successfully!');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-c-zinc font-bold text-3xl md:text-4xl mb-4 flex flex-col md:flex-row justify-center items-center md:space-x-2">
                        <span>
                            <Brain className="w-10 h-10" />
                        </span>
                        <span>Bulk User Registration</span>
                    </h1>
                    <p className="text-gray-700 text-lg font-semibold">Upload a CSV file to register multiple users at once</p>
                </div>

                {/* CSV Upload Section */}
                <div className="bg-white shadow-xl rounded-2xl p-6 md:p-8 mb-6">

                    <div className='mb-6 flex justify-between items-center'>
                        <h2 className="text-c-zinc font-bold text-2xl mb-6 flex items-center">
                            <Upload className="w-6 h-6 mr-2" />
                            Upload CSV File
                        </h2>


                        <button
                            onClick={downloadSampleCSV}
                            className="btn btn-primary flex items-center"
                        >
                            <BiDownload className="w-4 h-4 mr-2" />
                            Download Starter CSV
                        </button>
                    </div>

                    <div className="mb-6">
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <BiFile className="h-5 w-5 text-blue-400" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-blue-700">
                                        <strong>CSV Format Requirements:</strong><br />
                                        Required columns: name, email, dateOfBirth (MM-DD-YYYY), gender ({GENDERS.join(', ')}), weight (in {WEIGHT_UNIT}), type (client/non-client)
                                        <br />
                                        <strong>Note:</strong> All users will be assigned the default password: Pass@1234!
                                    </p>
                                </div>
                            </div>
                        </div>


                        <div className="flex items-center justify-center w-full">
                            <label htmlFor="csvFileInput" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <BiUpload className="w-10 h-10 mb-3 text-gray-400" />
                                    <p className="mb-2 text-sm text-gray-500">
                                        <span className="font-semibold">Click to upload</span>
                                    </p>
                                    <p className="text-xs text-gray-500">CSV files only</p>
                                    {csvFile && (
                                        <p className="mt-2 text-sm text-green-600 font-medium">
                                            Selected: {csvFile.name}
                                        </p>
                                    )}
                                </div>
                                <input
                                    id="csvFileInput"
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={validateUsers}
                            disabled={!csvFile || csvData.length === 0 || isValidating}
                            className="btn btn-primary flex items-center"
                        >
                            {isValidating ? (
                                <BiLoaderAlt className="animate-spin mr-2" />
                            ) : (
                                <CheckCircle className="w-4 h-4 mr-2" />
                            )}
                            Validate Users
                        </button>

                        <button
                            onClick={resetForm}
                            className="btn btn-outline flex items-center"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                {/* Validation Results */}
                {showPreview && (
                    <div className="bg-white shadow-xl rounded-2xl p-6 md:p-8">
                        <h2 className="text-c-zinc font-bold text-2xl mb-6 flex items-center">
                            <Users className="w-6 h-6 mr-2" />
                            Validation Results
                        </h2>

                        {/* Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-center">
                                    <BiCheck className="w-6 h-6 text-green-600 mr-2" />
                                    <div>
                                        <p className="text-green-800 font-semibold">Valid Users</p>
                                        <p className="text-2xl font-bold text-green-600">{validUsers.length}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-center">
                                    <BiX className="w-6 h-6 text-red-600 mr-2" />
                                    <div>
                                        <p className="text-red-800 font-semibold">Invalid Users</p>
                                        <p className="text-2xl font-bold text-red-600">{invalidUsers.length}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center">
                                    <BiFile className="w-6 h-6 text-blue-600 mr-2" />
                                    <div>
                                        <p className="text-blue-800 font-semibold">Total Rows</p>
                                        <p className="text-2xl font-bold text-blue-600">{csvData.length}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Invalid Users Details */}
                        {invalidUsers.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-red-600 font-semibold text-lg mb-4 flex items-center">
                                    <AlertCircle className="w-5 h-5 mr-2" />
                                    Users with Validation Errors
                                </h3>
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                                    {invalidUsers.map((user, index) => (
                                        <div key={index} className="mb-4 last:mb-0">
                                            <div className="font-medium text-red-800">
                                                Row {user.rowNumber}: {user.data.name || user.data.email || 'Unknown'}
                                            </div>
                                            <ul className="list-disc list-inside text-sm text-red-600 mt-1">
                                                {user.errors.map((error, errorIndex) => (
                                                    <li key={errorIndex}>{error}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Valid Users Preview */}
                        {validUsers.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-green-600 font-semibold text-lg mb-4 flex items-center">
                                    <CheckCircle className="w-5 h-5 mr-2" />
                                    Valid Users Preview (First 5)
                                </h3>
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-green-200">
                                                    <th className="text-left py-2 px-3 font-semibold text-green-800">Name</th>
                                                    <th className="text-left py-2 px-3 font-semibold text-green-800">Email</th>
                                                    <th className="text-left py-2 px-3 font-semibold text-green-800">DOB</th>
                                                    <th className="text-left py-2 px-3 font-semibold text-green-800">Gender</th>
                                                    <th className="text-left py-2 px-3 font-semibold text-green-800">Weight</th>
                                                    <th className="text-left py-2 px-3 font-semibold text-green-800">Type</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {validUsers.slice(0, 5).map((user, index) => (
                                                    <tr key={index} className="border-b border-green-100">
                                                        <td className="py-2 px-3 text-green-700">{user.name}</td>
                                                        <td className="py-2 px-3 text-green-700">{user.email}</td>
                                                        <td className="py-2 px-3 text-green-700">{user.dateOfBirth}</td>
                                                        <td className="py-2 px-3 text-green-700">{user.gender}</td>
                                                        <td className="py-2 px-3 text-green-700">{user.weight}</td>
                                                        <td className="py-2 px-3 text-green-700">{user.type}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {validUsers.length > 5 && (
                                            <p className="text-sm text-green-600 mt-2">
                                                ... and {validUsers.length - 5} more users
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Create Users Button */}
                        {validUsers.length > 0 && (
                            <div className="flex justify-center">
                                <button
                                    onClick={createUsers}
                                    disabled={invalidUsers.length > 0 || isCreating}
                                    className="btn btn-primary btn-lg flex items-center"
                                >
                                    {isCreating ? (
                                        <BiLoaderAlt className="animate-spin mr-2" />
                                    ) : (
                                        <BiUser className="mr-2" />
                                    )}
                                    {isCreating ? `Creating ${validUsers.length} Users...` : `Create ${validUsers.length} Users`}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddUsers;