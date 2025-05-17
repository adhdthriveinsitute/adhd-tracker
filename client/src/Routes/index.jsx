import AuthRoutes from './AuthRoutes'
import { Suspense } from 'react'
import Fallback from '@src/Components/Fallback'
import ProtectedRoutes from './ProtectedRoutes/UserRoutes'
import AdminRoutes from './ProtectedRoutes/AdminRoutes'


function BaseRoutes({ user }) {

    return (
        <Suspense fallback={<Fallback />}>
            <>
                {
                    user?.role === "user" ? (
                        <>
                            <ProtectedRoutes />
                        </>
                    )
                        :
                        user?.role === "admin" ? (
                            <AdminRoutes />
                        )
                            :
                            (
                                <>
                                    <AuthRoutes />
                                </>
                            )

                }
            </>
        </Suspense >
    )
}

export default BaseRoutes






