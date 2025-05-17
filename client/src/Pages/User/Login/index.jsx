import { Formik, Form } from 'formik';
import * as yup from 'yup';
import TextField from '@src/Components/FormikFields/TextField';
import { BiLoaderAlt } from 'react-icons/bi';
import { userLogin } from './api';
import { loginSuccess } from '@src/redux/slices/userSlice';
import { ErrorNotification, setToken } from '@src/utils';
import { useDispatch } from 'react-redux';
import { Brain } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

const Login = () => {

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const validationSchema = yup.object({
        email: yup
            .string()
            .email('Invalid email')
            .required('Required'),
        password: yup
            .string()
            .required("Required")
    });

    const initialValues = {
        email: '',
        password: '',
    };

    const handleSubmit = async (values, { setSubmitting }) => {
        const payload = {
            email: values.email,
            password: values.password,
            role: 'user',
        };

        try {
            const loggedInUser = await userLogin(payload);

            if (loggedInUser) {
                dispatch(loginSuccess(loggedInUser?.user));
                setToken("user", loggedInUser);
                navigate("/")
            }
        }
        catch (error) {
            if (error.response && error.response.data && error.response.data.error) {
                if (error.response.status === 403) {
                    navigate("/verify-email")
                }
                ErrorNotification(error.response.data.error);
            } else {
                ErrorNotification("An unexpected error occured while logging in");
            }
        } finally {
            setSubmitting(false);
        }
    };
    return (
        <>
            <h1 className="w-full text-center text-c-zinc font-bold text-3xl md:text-4xl mb-6 pt-8 flex flex-col md:flex-row justify-center items-center md:space-x-2">
                <span>
                    <Brain className="w-10 h-10" />
                </span>
                <span>ADHD Symptom Tracker</span>
            </h1>

            <div className="flex items-center justify-center bg-gray-50 px-4 my-8 pb-6">
                <div className="w-full max-w-md bg-white shadow rounded-2xl px-6 md:px-8 py-12">
                    <h2 className="text-c-zinc font-bold text-2xl md:text-3xl mb-6 text-center">Welcome Back</h2>

                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {(form) => (
                            <Form className="space-y-4">
                                <TextField
                                    field="email"
                                    label_text="Email"
                                    placeholder="Enter your email"
                                />
                                <TextField
                                    field="password"
                                    type="password"
                                    label_text="Password"
                                    placeholder="Enter your password"
                                />

                                <button
                                    className="btn w-full btn-primary"
                                    type="submit"
                                    disabled={form.isSubmitting}
                                >
                                    {form.isSubmitting ? (
                                        <BiLoaderAlt className="animate-spin text-2xl mx-auto" />
                                    ) : (
                                        'Login'
                                    )}
                                </button>
                            </Form>
                        )}
                    </Formik>

                    <div className="text-center mt-6">
                        <span className="text-slate-700">Don't have an account? </span>
                        <NavLink
                            to="/signup"
                            className="text-slate-700 underline font-bold"
                        >
                            Sign Up
                        </NavLink>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;
