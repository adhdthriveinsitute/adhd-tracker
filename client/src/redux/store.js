import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice"

const store =  configureStore({
    reducer: {
        user: userReducer,
    },
    devTools: process.env.NODE_ENV === "DEV" ? true : false,
});

export default store;