import axios from 'axios'
import { BASE_URL } from '@src/constants';
// import store from '../redux/store';
// import { getToken, removeToken } from "@src/utils"
// import { logout } from '@src/redux/slices/userSlice';

//any global headers go here.
let headers = {
    Accept: "application/json",
    // 'Accept-Language':localStorage.getItem(ADHD_APP_ACCESS)

};

// create axios instance
export const Axios = axios.create({
    baseURL: BASE_URL + "/",
    headers: headers,
    withCredentials: true
});

// Using this because we might have to cancel requests
// axiosCancel(Axios, {
//     debug: false // default
// })
