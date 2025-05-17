import { Axios } from '@src/api';
import { ErrorNotification, SuccessNotification } from '@src/utils';

export const resendVerificationEmail = async (email) => {
    try {
        const response = await Axios.post('/auth/resend-email-verification', {
            email
        });

        if (response.status === 200) {
            SuccessNotification('Verification email resent. Please check your inbox!');
            return response.data;
        }
    } catch (error) {
        ErrorNotification(error?.response?.data?.error || 'Failed to resend email or already verified.');
        throw error.response ? error : new Error("Something went wrong");
    }
};
