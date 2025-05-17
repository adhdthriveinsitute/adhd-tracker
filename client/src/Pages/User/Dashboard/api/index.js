import { Axios } from "@src/api";
import { ErrorNotification } from "@src/utils"; 

export const fetchSymptoms = async () => {
    try {
        const res = await Axios.get("/symptoms");
        return res?.data?.symptoms || [];
    } catch (error) {
        ErrorNotification(error?.response?.data?.error || 'Failed to fetch symptoms.');
        throw error.response ? error : new Error("Something went wrong");
    }
};
