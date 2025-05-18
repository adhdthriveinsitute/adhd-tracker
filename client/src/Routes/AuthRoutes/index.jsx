import { Navigate, Route, Routes } from "react-router-dom"
import { lazy } from "react"

// lazy load
const Login = lazy(() => import('@src/Pages/User/Login'))
const Signup = lazy(() => import('@src/Pages/User/Signup'))
const AdminLogin = lazy(() => import('@src/Pages/Admin/Login'))
const VerifyEmail = lazy(() => import('@src/Pages/User/VerifyEmail'))
const ForgotPassword = lazy(() => import('@src/Pages/User/Login/ForgotPassword'))
const ResetPassword = lazy(() => import('@src/Pages/User/Login/ResetPassword'))



function AuthRoutes() {
    return (
        <Routes>
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="*" element={<Navigate to="/login" />} />

        </Routes>
    )
}

export default AuthRoutes
