import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

const Dashboard = lazy(() => import('@src/Pages/User/Dashboard'))
const Profile = lazy(() => import('@src/Pages/User/Profile'))

function UserRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to={"/"} />} />


        </Routes>
    )
}

export default UserRoutes