import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Axios } from '@src/api';
import { BiLoaderAlt } from 'react-icons/bi';
import { ErrorNotification, SuccessNotification } from '@src/utils';
import { resendVerificationEmail } from './api';

const VerifyEmail = () => {
    const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error' | 'idle'
    const [message, setMessage] = useState('');
    const [loadingResend, setLoadingResend] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [hasNotified, setHasNotified] = useState(false);
    const hasVerified = useRef(false);

    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setStatus('idle'); // idle shows resend view
            return;
        }

        if (hasVerified.current) return;

        hasVerified.current = true;

        const verifyToken = async () => {
            try {
                const res = await Axios.get('/auth/verify-email', {
                    params: { token }
                });

                console.log(res)

                if (res.status === 200) {
                    setStatus('success');
                    setMessage('Email verified successfully! Redirecting to login...');

                    if (!hasNotified) {
                        SuccessNotification('Email verified!');
                        setHasNotified(true);
                    }
                    localStorage.removeItem("signedUpEmail");

                    // 👇 Important: return early to avoid falling into catch accidentally
                    setTimeout(() => navigate('/login'), 3000);
                    return;
                }

                ErrorNotification("Unexpected server response.")
                throw new Error('Unexpected server response.');

            } catch (error) {
                setStatus('error');
                setMessage(
                    error?.response?.data?.error ||
                    'Verification failed. Token may be invalid or expired.'
                );
                if (!hasNotified) {
                    ErrorNotification('Email verification failed');
                    setHasNotified(true);
                }
            }
        };

        verifyToken();
    }, [token, navigate, hasNotified]);

    const handleResend = async () => {
        try {
            setLoadingResend(true);
            const email = localStorage.getItem("signedUpEmail");
            if (!email) {
                ErrorNotification("No email found. Possibly already verified. Please try logging in");
                return;
            }
            await resendVerificationEmail(email);

        } catch (err) {
            console.error(err.message || "Failed to resend. Try again later.");
        } finally {
            setLoadingResend(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
            <div className="bg-white shadow-lg rounded-2xl p-6 md:p-10 max-w-md w-full text-center">
                {/* ✅ Verifying token */}
                {status === 'verifying' && (
                    <>
                        <BiLoaderAlt className="text-4xl animate-spin text-blue-600 mb-4 mx-auto" />
                        <p className="text-lg font-medium">Verifying your email...</p>
                    </>
                )}

                {/* ✅ Verification Success */}
                {status === 'success' && (
                    <>
                        <p className="text-green-600 text-xl font-semibold mb-2">Success!</p>
                        <p className="text-gray-700">{message}</p>
                    </>
                )}

                {/* ✅ Token Error */}
                {status === 'error' && (
                    <>
                        <p className="text-red-600 text-xl font-semibold mb-2">Verification Failed</p>
                        <p className="text-gray-700 mb-4">{message}</p>
                        <button
                            onClick={handleResend}
                            disabled={loadingResend}
                            className="btn btn-outline"
                        >
                            {loadingResend ? 'Resending...' : 'Resend Verification Email'}
                        </button>
                    </>
                )}

                {/* ✅ No Token: Ask to verify + option to resend */}
                {status === 'idle' && (
                    <>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Email</h1>
                        <p className="text-gray-600 mb-4">
                            We’ve sent a verification link to your email. Please check your inbox.
                        </p>
                        <button
                            onClick={handleResend}
                            disabled={loadingResend}
                            className="btn btn-outline"
                        >
                            {loadingResend ? 'Resending...' : 'Resend Verification Email'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
