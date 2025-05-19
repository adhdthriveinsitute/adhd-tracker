import { Formik, Form } from 'formik';
import * as yup from 'yup';
import TextField from '@src/Components/FormikFields/TextField';
import { BiLoaderAlt } from 'react-icons/bi';
import { forgotPasswordRequest } from '../api';
import { ErrorNotification, SuccessNotification } from '@src/utils';
import { usePreviousLocation } from '@src/hooks/usePreviousLocation';
import { NavLink } from 'react-router-dom';

const ForgotPassword = () => {

    const previousLocation = usePreviousLocation();
    const role = previousLocation?.pathname?.startsWith("/admin") ? "admin" : "user";

    const validationSchema = yup.object({
        email: yup.string().email('Invalid email').required('Required'),
    });

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            await forgotPasswordRequest(values.email, role);
            SuccessNotification('Reset link sent to your email!');
            resetForm();
        } catch (error) {
            ErrorNotification(
                error?.response?.data?.error || 'Failed to send reset email.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center bg-gray-50 px-4 my-8 pb-6">
            <div className="w-full max-w-md bg-white shadow rounded-2xl px-6 md:px-8 py-12">
                <h2 className="text-c-zinc font-bold text-2xl md:text-3xl mb-6 text-center">
                    Forgot Password
                </h2>

                <Formik
                    initialValues={{ email: '' }}
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
                            <button
                                className="btn w-full btn-primary"
                                type="submit"
                                disabled={form.isSubmitting}
                            >
                                {form.isSubmitting ? (
                                    <BiLoaderAlt className="animate-spin text-2xl mx-auto" />
                                ) : (
                                    'Email Reset Link'
                                )}
                            </button>
                        </Form>
                    )}
                </Formik>



                <div className="text-center mt-6">
                    <span className="text-gray-700">Go Back to </span>
                    <NavLink
                        to="/login"
                        className="text-c-zinc underline font-bold"
                    >
                        Login
                    </NavLink>
                </div>


            </div>
        </div>
    );
};

export default ForgotPassword;