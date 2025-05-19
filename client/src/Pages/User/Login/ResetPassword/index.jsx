import { Formik, Form } from 'formik';
import * as yup from 'yup';
import TextField from '@src/Components/FormikFields/TextField';
import { BiLoaderAlt } from 'react-icons/bi';
import { resetPasswordRequest } from '../api';
import { useLocation, useNavigate } from 'react-router-dom';
import { ErrorNotification, SuccessNotification } from '@src/utils';

const ResetPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const query = new URLSearchParams(location.search);
    const token = query.get('token');
    const role = query.get('role');

    if (!token) {
        ErrorNotification('Reset token is missing.');
        navigate('/forgot-password');
        return null;
    }

    const validationSchema = yup.object({
        newPassword: yup.string().min(6, 'Too short').required('Required'),
        confirmPassword: yup
            .string()
            .oneOf([yup.ref('newPassword'), null], 'Passwords must match')
            .required('Confirm password is required'),
    });

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            await resetPasswordRequest(token, values.newPassword, role);
            SuccessNotification('Password has been reset successfully!');
            navigate('/login');
        } catch (error) {
            ErrorNotification(
                error?.response?.data?.error || 'Failed to reset password.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center bg-gray-50 px-4 my-8 pb-6">
            <div className="w-full max-w-md bg-white shadow rounded-2xl px-6 md:px-8 py-12">
                <h2 className="text-c-zinc font-bold text-2xl md:text-3xl mb-6 text-center">
                    Reset Your Password
                </h2>

                <Formik
                    initialValues={{
                        newPassword: "",
                        confirmPassword: ""
                    }}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {(form) => (
                        <Form className="space-y-4">
                            <TextField
                                field="newPassword"
                                type="password"
                                label_text="New Password"
                                placeholder="Enter new password"
                            />
                            <TextField
                                field="confirmPassword"
                                type="password"
                                label_text="Confirm Password"
                                placeholder="Enter new password again"
                            />
                            <button
                                className="btn w-full btn-primary"
                                type="submit"
                                disabled={form.isSubmitting}
                            >
                                {form.isSubmitting ? (
                                    <BiLoaderAlt className="animate-spin text-2xl mx-auto" />
                                ) : (
                                    'Reset Password'
                                )}
                            </button>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default ResetPassword;