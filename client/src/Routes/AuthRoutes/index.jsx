import { Navigate, Route, Routes } from "react-router-dom"
import { lazy } from "react"

// lazy load
const Login = lazy(() => import('@src/Pages/User/Login'))
const Signup = lazy(() => import('@src/Pages/User/Signup'))
const AdminLogin = lazy(() => import('@src/Pages/Admin/Login'))
const VerifyEmail = lazy(() => import('@src/Pages/User/VerifyEmail'))


function AuthRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="*" element={<Navigate to="/login" />} />

        </Routes>
    )
}

export default AuthRoutes
