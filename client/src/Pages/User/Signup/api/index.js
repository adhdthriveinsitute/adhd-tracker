import { Axios } from '@src/api';
import { ErrorNotification, SuccessNotification } from '@src/utils';

export const userSignup = async (values) => {
    const {
        name,
        dateOfBirth,
        gender,
        email,
        password,
        role,
        weight,
        type
    } = values;

    try {
        const response = await Axios.post('/auth/signup', {
            name,
            dateOfBirth,
            gender,
            email,
            password,
            role,
            weight,
            type
        });

        if (response.status === 201) {
            // SuccessNotification('Account created successfully!');
            return response.data.user;
        }
    } catch (error) {
        ErrorNotification(error?.response?.data?.error || 'Failed to create account.');
        throw error.response ? error : new Error("Something went wrong");
    }
};
