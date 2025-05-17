import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

const Users = lazy(() => import('@src/Pages/Admin/Users'))
const Analytics = lazy(() => import('@src/Pages/Admin/Analytics'))
const Symptoms = lazy(() => import('@src/Pages/Admin/Symptoms'))
const Settings = lazy(() => import('@src/Pages/Admin/Settings'))
const AdminSignup = lazy(() => import('@src/Pages/Admin/AdminSignup'))

function AdminRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Users />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/symptoms" element={<Symptoms />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/add-admin" element={<AdminSignup />} />
            <Route path="*" element={<Navigate to={"/"} />} />

        </Routes>
    )
}

export default AdminRoutes