import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice"
import symptomsReducer from "./slices/symptomsSlice"
import symptomsListReducer from "./slices/symptomsListSlice";

const store = configureStore({
    reducer: {
        user: userReducer,
        symptoms: symptomsReducer,
        symptomsList: symptomsListReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
                // Ignore these field paths in all actions
                ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
                // Ignore these paths in the state
                ignoredPaths: ['items.dates'],
            },
        }),
    devTools: process.env.NODE_ENV === "DEV" ? true : false,
});

export default store;
