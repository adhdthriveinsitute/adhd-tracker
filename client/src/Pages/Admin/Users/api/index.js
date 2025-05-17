import { Axios } from "@src/api";

export const getAllUsers = async () => {
    const res = await Axios.get("/admin/users/all");
    // console.log(res.data.users)
    return res.data.users;
};

export const getAllUsersWithSymptoms = async () => {
    const res = await Axios.get("/admin/users/all/with-symptoms");
    // console.log(res.data.users)
    return res.data.users;
};


export const deleteUserById = async (userId) => {
    const res = await Axios.delete("/admin/users", {
        params: {
            userId
        }
    });
    const deletedUser = res?.data?.user;
    return deletedUser
};


