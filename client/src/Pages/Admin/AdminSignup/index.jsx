import { Formik, Form } from 'formik';
import * as yup from 'yup';
import TextField from '@src/Components/FormikFields/TextField';
import { BiLoaderAlt } from 'react-icons/bi';
import { adminSignup } from './api';
import { useNavigate } from 'react-router-dom';
import { Brain, Eye, EyeOff, Copy } from 'lucide-react';
import { useState } from 'react';
import { SuccessNotification } from '@src/utils';

const AdminSignup = () => {
    const navigate = useNavigate();
    const [showSuccess, setShowSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [credentials, setCredentials] = useState({ email: '', password: '' });

    const validationSchema = yup.object({
        name: yup.string().min(3, "Come on don't be shy").required('Required'),
        email: yup.string().email('Invalid email').required('Required'),
        password: yup
            .string()
            .min(8, 'Min 8 characters')
            .matches(/[A-Z]/, 'One uppercase required')
            .matches(/[a-z]/, 'One lowercase required')
            .matches(/\d/, 'One number required')
            .matches(/[!@#$%^&*(),.?":{}|<>]/, 'One special char required')
            .required('Required'),
        confirmPassword: yup
            .string()
            .oneOf([yup.ref('password')], 'Passwords must match')
            .required('Required'),
    });

    const initialValues = {
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    };

    const handleSubmit = async (values, { setSubmitting }) => {
        const { confirmPassword, ...payload } = values;
        payload.role = 'admin';

        try {
            await adminSignup(payload);
            setCredentials({ email: payload.email, password: payload.password });
            setShowSuccess(true);
        } catch (error) {
            console.log("Signup Error: ", error?.message);
        } finally {
            setSubmitting(false);
        }
    };

   const handleCopy = async () => {
    const text = `Email: ${credentials.email}\nPassword: ${credentials.password}`;

    try {
        // Try the modern async clipboard API
        await navigator.clipboard.writeText(text);
        SuccessNotification("Copied to clipboard!");
    } catch (err) {
        // Fallback for Safari or unsupported environments
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed"; // prevent scrolling to bottom
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();

        try {
            const successful = document.execCommand("copy");
            if (successful) {
                SuccessNotification("Copied to clipboard!");
            } else {
                alert("Copy failed. Please copy manually.");
            }
        } catch (err) {
            alert("Copy not supported on this device.");
        }

        document.body.removeChild(textarea);
    }
};


    return (
        <>
            <h1 className="w-full text-center text-c-zinc font-bold text-3xl md:text-4xl mb-6 pt-8 flex flex-col md:flex-row justify-center items-center md:space-x-2">
                <Brain className="w-10 h-10" />
                <span>ADHD Symptom Tracker</span>
            </h1>

            {showSuccess && (
                <div className="md:mx-auto mx-4 max-w-xl rounded-2xl bg-white/70 border border-gray-200 shadow-xl backdrop-blur-md py-6 px-4 mb-8 space-y-4 transition-all duration-300">

                    <p className="text-center text-gray-600 font-bold text-xl  uppercase tracking-widest">
                        Admin Created Successfully
                    </p>

                    <div className="relative max-w-sm mx-auto bg-green-100 border border-green-200 rounded-xl px-5 py-4 space-y-2 text-sm text-zinc-700 shadow-inner">

                        <p>
                            <span className="font-semibold text-zinc-900">Email:</span> {credentials.email}
                        </p>

                        <p className="flex items-center">
                            <span className="font-semibold text-zinc-900 mr-1">Password:</span>
                            <span className="tracking-widest">{showPassword ? credentials.password : '••••••••'}</span>
                            <button
                                type="button"
                                onClick={() => setShowPassword(prev => !prev)}
                                className="ml-2 text-zinc-500 hover:text-zinc-900 transition-colors duration-150"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </p>

                        <button
                            type="button"
                            onClick={handleCopy}
                            className="btn-primary !py-3 !text-xs !flex"
                        >
                            Copy credentials
                            <Copy className="ml-2 w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-center bg-gray-50 px-4 my-8">
                <div className="w-full max-w-xl bg-white shadow-xl rounded-2xl p-6 md:p-8">

                    <h2 className="text-c-zinc font-bold text-2xl md:text-3xl mb-4 text-center">Create New Admin</h2>


                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {(form) => (
                            <Form className="space-y-4">
                                <TextField field="name" label_text="Full Name" placeholder="Enter admin name" />
                                <TextField field="email" label_text="Email" placeholder="Enter admin email" />

                                <TextField
                                    field="password"
                                    label_text="Password"
                                    placeholder="Enter password"
                                    type={showPassword ? "text" : "password"}
                                    icon={
                                        <button type="button" onClick={() => setShowPassword(prev => !prev)}>
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    }
                                />

                                <TextField
                                    field="confirmPassword"
                                    label_text="Confirm Password"
                                    placeholder="Confirm password"
                                    type={showConfirm ? "text" : "password"}
                                    icon={
                                        <button type="button" onClick={() => setShowConfirm(prev => !prev)}>
                                            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    }
                                />

                                <button
                                    className="btn w-full btn-primary"
                                    type="submit"
                                    disabled={form.isSubmitting}
                                >
                                    {form.isSubmitting ? (
                                        <BiLoaderAlt className="animate-spin text-2xl mx-auto" />
                                    ) : (
                                        'Create Admin'
                                    )}
                                </button>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </>
    );
};

export default AdminSignup;
