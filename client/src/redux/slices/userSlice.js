import { createSlice } from "@reduxjs/toolkit";
import { getAuthUser } from "@src/utils";

const initialState = getAuthUser();


// const initialState = {
//     firstName: "Asad",
//     lastName: "Riaz",
//     email:"hafizasad419@gmail.com",
//     address:"Islamabad",
//     city:"Islamabad",
//     province:"AB",
//     age: 20,
//     phoneNumber:"111 123 4560"
// }


const userSlice = createSlice({
    name: 'User',
    initialState,
    reducers: {
        loginSuccess: (state, action) => {
            return action.payload
            
        },
        logout: (state) => {
            return false
        },
        updateUserInfo: (state, action) => {
            // Update user details (if needed for later functionality)
            Object.assign(state, action.payload);
        },
    },
});

export const { loginSuccess, logout, updateUserInfo } = userSlice.actions;
export default userSlice.reducer;
