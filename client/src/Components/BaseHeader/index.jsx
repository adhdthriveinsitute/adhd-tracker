import AdminHeader from './AdminHeader';
import UserHeader from './UserHeader';
import AuthHeader from './AuthHeader';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@src/redux/slices/userSlice';
import { ErrorNotification, getActiveRole, removeToken, SuccessNotification } from '@src/utils';
import { Axios } from '@src/api';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import BasePopup from '@src/Components/UI/BasePopup';
import { BiLoaderAlt } from 'react-icons/bi';

const BaseHeader = () => {
    const user = useSelector((state) => state.user);


    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogout = async () => {
        const activeRole = getActiveRole();
        try {
            setIsLoggingOut(true);
            if (!activeRole) throw new Error("No active role found.");

            await Axios.post('/auth/logout', { role: activeRole });
            removeToken(activeRole);
            dispatch(logout());
            setShowLogoutConfirm(false)
            SuccessNotification("Logged out successfully!");
            navigate('/login');
        } catch (err) {
            console.error("Logout Error", err);
            ErrorNotification("Logout failed. Please try again.");
        } finally {
            setIsLoggingOut(false);
            setShowLogoutConfirm(false);
        }
    };

    return (
        <>
            {
                user?.role === 'admin' ? (
                    <AdminHeader
                        isLoggingOut={isLoggingOut}
                        setShowLogoutConfirm={setShowLogoutConfirm}
                    />
                )
                    :
                    user?.role === 'user' ? (
                        <UserHeader
                            isLoggingOut={isLoggingOut}
                            setShowLogoutConfirm={setShowLogoutConfirm}
                        />
                    )
                        :
                        (
                            <AuthHeader />
                        )
            }


            <BasePopup
                title="Are you sure you want to logout?"
                show={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
            >
                <div className="flex justify-center space-x-4 mt-6">
                    <button
                        className="btn btn-outline"
                        onClick={() => setShowLogoutConfirm(false)}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                    >
                        {isLoggingOut ? (
                            <span>
                                <BiLoaderAlt
                                    className='text-white w-6 h-6 animate-spin inline mr-2'
                                />
                                Logging out
                            </span>
                        ) : 'Logout'}
                    </button>
                </div>
            </BasePopup>



        </>
    )

};

export default BaseHeader;
