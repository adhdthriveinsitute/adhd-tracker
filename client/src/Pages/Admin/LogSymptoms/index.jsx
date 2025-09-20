import React, { useState, useEffect } from 'react';
import { parse, isValid, format, subDays } from 'date-fns';
import * as yup from 'yup';
import Papa from 'papaparse';
import { BiLoaderAlt, BiUpload, BiCheck, BiX, BiFile, BiDownload } from 'react-icons/bi';
import { Brain, Upload, Activity, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { Axios } from '@src/api';
import { DATE_FORMAT_STRING, DATE_FORMAT_REGEX } from '@src/constants';
import { SuccessNotification, ErrorNotification } from '@src/utils';

const LogSymptoms = () => {
    const [csvFile, setCsvFile] = useState(null);
    const [csvData, setCsvData] = useState([]);
    const [validationResults, setValidationResults] = useState([]);
    const [isValidating, setIsValidating] = useState(false);
    const [isLogging, setIsLogging] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [validLogs, setValidLogs] = useState([]);
    const [invalidLogs, setInvalidLogs] = useState([]);
    const [symptoms, setSymptoms] = useState([]);
    const [isLoadingSymptoms, setIsLoadingSymptoms] = useState(false);

    // Fetch symptoms on component mount
    useEffect(() => {
        fetchSymptomsData();
    }, []);

    const fetchSymptomsData = async () => {
        setIsLoadingSymptoms(true);
        try {
            const response = await Axios.get("/symptoms");
            const symptomsData = response?.data?.symptoms || [];
            setSymptoms(symptomsData);
        } catch (error) {
            ErrorNotification(error?.response?.data?.error || 'Failed to fetch symptoms.');
            console.error('Failed to fetch symptoms:', error);
        } finally {
            setIsLoadingSymptoms(false);
        }
    };

    // Helper function to map symptom name to ID
    const getSymptomIdByName = (symptomName) => {
        const symptom = symptoms.find(s =>
            s.name.toLowerCase() === symptomName.toLowerCase() ||
            s.id === symptomName
        );
        return symptom ? symptom.id : null;
    };

    // Create validation schema dynamically based on available symptoms
    const createValidationSchema = () => {
        const scoreValidation = {};
        
        // Define the six optional symptom fields that can be null for bulk-uploaded users
        const optionalFields = ['itching', 'flushing', 'eczema', 'urinating', 'wheezing', 'other'];

        symptoms.forEach(symptom => {
            const isOptional = optionalFields.includes(symptom.id);
            
            scoreValidation[symptom.id] = yup
                .number()
                .min(0, `${symptom.name} score must be at least 0`)
                .max(10, `${symptom.name} score must be at most 10`)
                .typeError(`${symptom.name} score must be a number`)
                .nullable() // Allow null values
                .transform((value, originalValue) => {
                    // Convert empty strings, undefined to null for optional fields
                    if (isOptional && (originalValue === '' || originalValue === undefined)) {
                        return null;
                    }
                    return value;
                })
                .test('required-unless-optional', `${symptom.name} score is required`, function(value) {
                    // Only require if not optional or if value is provided
                    if (isOptional) {
                        return true; // Optional fields are always valid
                    }
                    return value !== null && value !== undefined;
                });
        });

        return yup.object({
            email: yup.string().email('Invalid email format').required('Email is required'),
            date: yup
                .string()
                .required("Date is required")
                .matches(DATE_FORMAT_REGEX, "Invalid date format. Please use MM-DD-YYYY")
                .test("is-valid-date", "Invalid date", (value) => {
                    if (!value) return false;
                    const parsedDate = parse(value, DATE_FORMAT_STRING, new Date());
                    return (
                        isValid(parsedDate) &&
                        format(parsedDate, DATE_FORMAT_STRING) === value
                    );
                })
                .test("date-not-future", "Date cannot be in the future", (value) => {
                    if (!value) return false;
                    const date = parse(value, DATE_FORMAT_STRING, new Date());
                    const today = new Date();
                    today.setHours(23, 59, 59, 999); // End of today
                    return date <= today;
                }),
            ...scoreValidation
        });
    };

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
        setValidLogs([]);
        setInvalidLogs([]);

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

    const validateSymptomLogs = async () => {
        if (csvData.length === 0) {
            ErrorNotification('No data to validate');
            return;
        }

        if (symptoms.length === 0) {
            ErrorNotification('Symptoms data not loaded. Please refresh the page.');
            return;
        }

        setIsValidating(true);
        const results = [];
        const valid = [];
        const invalid = [];
        const validationSchema = createValidationSchema();

        for (let i = 0; i < csvData.length; i++) {
            const row = csvData[i];
            const rowNumber = i + 1;

            try {
                // Normalize the data to match expected field names
                const logData = {
                    email: row.email || '',
                    date: row.date || '',
                };

                // Map CSV columns (symptom names) to symptom IDs for validation and processing
                Object.keys(row).forEach(columnName => {
                    if (columnName !== 'email' && columnName !== 'date') {
                        const symptomId = getSymptomIdByName(columnName);
                        if (symptomId) {
                            logData[symptomId] = row[columnName];
                        }
                    }
                });

                // Validate against schema
                await validationSchema.validate(logData, { abortEarly: false });

                // Create scores array for API
                const scores = symptoms.map(symptom => ({
                    symptomId: symptom.id,
                    score: logData[symptom.id]
                })).filter(score => {
                    // Include scores that are not undefined, empty string, or null (unless it's an optional field)
                    const optionalFields = ['itching', 'flushing', 'eczema', 'urinating', 'wheezing', 'other'];
                    const isOptional = optionalFields.includes(score.symptomId);
                    
                    if (isOptional) {
                        // For optional fields, include null values (they will be stored as null in DB)
                        return score.score !== undefined && score.score !== '';
                    } else {
                        // For required fields, exclude null/undefined/empty values
                        return score.score !== undefined && score.score !== '' && score.score !== null;
                    }
                });

                // If validation passes
                const validLog = {
                    email: logData.email,
                    date: logData.date,
                    scores,
                    rowNumber
                };

                valid.push(validLog);
                results.push({
                    rowNumber,
                    isValid: true,
                    data: validLog,
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
        setValidLogs(valid);
        setInvalidLogs(invalid);
        setShowPreview(true);
        setIsValidating(false);

        if (valid.length === 0) {
            ErrorNotification('No valid symptom logs found. Please check your data and try again.');
        } else if (invalid.length > 0) {
            ErrorNotification(`${invalid.length} symptom logs have validation errors. Please review and fix them.`);
        } else {
            SuccessNotification(`All ${valid.length} symptom logs are valid and ready to be logged!`);
        }
    };

    const logSymptoms = async () => {
        if (validLogs.length === 0) {
            ErrorNotification('No valid symptom logs to create');
            return;
        }

        if (invalidLogs.length > 0) {
            ErrorNotification('Please fix validation errors before logging symptoms');
            return;
        }

        setIsLogging(true);

        try {
            // Use the new bulk endpoint
            const response = await Axios.post('/symptom-logs/bulk', {
                logs: validLogs
            });

            const { summary, successful, failed } = response.data;

            if (summary.successful > 0 && summary.failed === 0) {
                SuccessNotification(`Successfully logged symptoms for ${summary.successful} entries!`);
                resetForm();
            } else if (summary.successful > 0 && summary.failed > 0) {
                SuccessNotification(`Logged ${summary.successful} entries. ${summary.failed} failed.`);
                console.error('Failed logs:', failed);

                // Show detailed error information
                const failedEmails = failed.map(f => f.email).join(', ');
                ErrorNotification(`Failed to log symptoms for: ${failedEmails}`);
            } else {
                ErrorNotification('Failed to log symptoms. Please try again.');
                console.error('All logs failed:', failed);
            }

        } catch (error) {
            ErrorNotification(error?.response?.data?.error || 'Failed to log symptoms. Please try again.');
            console.error('Bulk logging error:', error);
        } finally {
            setIsLogging(false);
        }
    };

    const downloadStarterCSV = async () => {
        if (symptoms.length === 0) {
            if (isLoadingSymptoms) {
                ErrorNotification('Still loading symptoms data. Please wait...');
                return;
            }
            ErrorNotification('No symptoms data available. Please refresh the page.');
            return;
        }

        // Create sample data with symptom names as headers (for admin readability)
        // but map them to symptom IDs internally
        const headers = ['email', 'date'];
        const symptomHeaders = [];

        symptoms.forEach(symptom => {
            headers.push(symptom.name); // Use full symptom name in CSV
            symptomHeaders.push({ id: symptom.id, name: symptom.name });
        });

        const sampleData = [
            {
                email: 'hafizasad419@gmail.com',
                date: format(subDays(new Date(), 1), DATE_FORMAT_STRING),
                ...symptoms.reduce((acc, symptom) => {
                    acc[symptom.name] = Math.floor(Math.random() * 6) + 1; // Random score 1-6
                    return acc;
                }, {})
            }
        ];

        const csv = Papa.unparse(sampleData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');

        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'symptom_logs_starter.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            SuccessNotification('Starter CSV downloaded successfully!');
        }
    };

    const resetForm = () => {
        setCsvFile(null);
        setCsvData([]);
        setValidationResults([]);
        setShowPreview(false);
        setValidLogs([]);
        setInvalidLogs([]);
        document.getElementById('csvFileInput').value = '';
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
                        <span>Bulk Symptom Logging</span>
                    </h1>
                    <p className="text-slate-600 text-lg">Upload a CSV file to log symptoms for multiple users at once</p>
                </div>

                {/* CSV Upload Section */}
                <div className="bg-white shadow-xl rounded-2xl p-6 md:p-8 mb-6">

                    <div className="flex justify-between items-center">

                        <h2 className="text-c-zinc font-bold text-2xl mb-6 flex items-center">
                            <Upload className="w-6 h-6 mr-2" />
                            Upload CSV File
                        </h2>


                        <div className="mb-4">
                            <button
                                onClick={downloadStarterCSV}
                                disabled={isLoadingSymptoms || symptoms.length === 0}
                                className="btn btn-primary flex items-center"
                            >
                                {isLoadingSymptoms ? (
                                    <BiLoaderAlt className="animate-spin w-4 h-4 mr-2" />
                                ) : (
                                    <BiDownload className="w-4 h-4 mr-2" />
                                )}
                                Download Starter CSV
                            </button>
                        </div>

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
                                        Required columns: email, date (MM-DD-YYYY format), and symptom scores using full symptom names as column headers (values 0-10)
                                        <br />
                                        <strong>Note:</strong> Download the starter CSV to get the correct format with all symptom columns using readable symptom names.
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
                            onClick={validateSymptomLogs}
                            disabled={!csvFile || csvData.length === 0 || isValidating || symptoms.length === 0}
                            className="btn btn-primary flex items-center"
                        >
                            {isValidating ? (
                                <BiLoaderAlt className="animate-spin mr-2" />
                            ) : (
                                <CheckCircle className="w-4 h-4 mr-2" />
                            )}
                            Validate Symptom Logs
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
                            <Activity className="w-6 h-6 mr-2" />
                            Validation Results
                        </h2>

                        {/* Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-center">
                                    <BiCheck className="w-6 h-6 text-green-600 mr-2" />
                                    <div>
                                        <p className="text-green-800 font-semibold">Valid Logs</p>
                                        <p className="text-2xl font-bold text-green-600">{validLogs.length}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-center">
                                    <BiX className="w-6 h-6 text-red-600 mr-2" />
                                    <div>
                                        <p className="text-red-800 font-semibold">Invalid Logs</p>
                                        <p className="text-2xl font-bold text-red-600">{invalidLogs.length}</p>
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

                        {/* Invalid Logs Details */}
                        {invalidLogs.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-red-600 font-semibold text-lg mb-4 flex items-center">
                                    <AlertCircle className="w-5 h-5 mr-2" />
                                    Logs with Validation Errors
                                </h3>
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                                    {invalidLogs.map((log, index) => (
                                        <div key={index} className="mb-4 last:mb-0">
                                            <div className="font-medium text-red-800">
                                                Row {log.rowNumber}: {log.data.email || 'Unknown'} - {log.data.date || 'No date'}
                                            </div>
                                            <ul className="list-disc list-inside text-sm text-red-600 mt-1">
                                                {log.errors.map((error, errorIndex) => (
                                                    <li key={errorIndex}>{error}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Valid Logs Preview */}
                        {validLogs.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-green-600 font-semibold text-lg mb-4 flex items-center">
                                    <CheckCircle className="w-5 h-5 mr-2" />
                                    Valid Symptom Logs Preview
                                </h3>
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-green-200">
                                                    <th className="text-left py-2 px-3 font-semibold text-green-800">Email</th>
                                                    <th className="text-left py-2 px-3 font-semibold text-green-800">Date</th>
                                                    <th className="text-left py-2 px-3 font-semibold text-green-800">Symptoms Count</th>
                                                    <th className="text-left py-2 px-3 font-semibold text-green-800">Avg Score</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {validLogs.map((log, index) => {
                                                    const avgScore = log.scores.reduce((sum, s) => sum + s.score, 0) / log.scores.length;
                                                    return (
                                                        <tr key={index} className="border-b border-green-100">
                                                            <td className="py-2 px-3 text-green-700">{log.email}</td>
                                                            <td className="py-2 px-3 text-green-700">{log.date}</td>
                                                            <td className="py-2 px-3 text-green-700">{log.scores.length}</td>
                                                            <td className="py-2 px-3 text-green-700">{avgScore.toFixed(1)}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Log Symptoms Button */}
                        {validLogs.length > 0 && (
                            <div className="flex justify-center">
                                <button
                                    onClick={logSymptoms}
                                    disabled={invalidLogs.length > 0 || isLogging}
                                    className="btn btn-primary btn-lg flex items-center"
                                >
                                    {isLogging ? (
                                        <BiLoaderAlt className="animate-spin mr-2" />
                                    ) : (
                                        <Activity className="w-5 h-5 mr-2" />
                                    )}
                                    {isLogging ? `Logging ${validLogs.length} Entries...` : `Log ${validLogs.length} Symptom Entries`}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LogSymptoms;