import { Axios } from '@src/api';
import { ErrorNotification, SuccessNotification } from '@src/utils';


export const userLogin = async (
    {
        email,
        password,
        role = "user",
    }
) => {

    try {
        const response = await Axios.post('/auth/login', {
            email,
            password,
            role,
        },);

        if (response.status === 200) {
            SuccessNotification('Logged in successfully!');
            return response.data;
        }
        
    } catch (error) {
        throw error.response ? error : new Error("Something went wrong, Please Try again after some time.");

    }


};


