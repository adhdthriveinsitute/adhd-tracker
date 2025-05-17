import { Axios } from '@src/api';
import { ErrorNotification, SuccessNotification } from '@src/utils';

export const adminSignup = async (values) => {
    const {
        name,
        email,
        password,
        role,
    } = values;

    try {
        const response = await Axios.post('/auth/signup', {
            name,
            email,
            password,
            role
        });

        if (response.status === 201) {
            SuccessNotification('Admin created successfully!');
            return response.data;
        }
    } catch (error) {
        ErrorNotification(error?.response?.data?.error || 'Failed to create new admin.');
        throw error.response ? error : new Error("Something went wrong");
    }
};
