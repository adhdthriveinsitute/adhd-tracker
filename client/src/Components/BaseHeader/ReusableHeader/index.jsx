import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Brain, Menu, X, LogOut, Settings, UserRound, Home } from 'lucide-react';
import { BiLoaderAlt } from 'react-icons/bi';

const ReusableHeader = ({
    menuItems = [],
    onLogout,
    isLoggingOut,
    showLogout = false
}) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        setMenuOpen(false); // Close menu on route change
    }, [location.pathname]);


    return (
        <header className="w-full bg-white shadow-md z-50">
            {/* Top Nav Row */}
            <div className="flex justify-between items-center px-6 md:px-12 py-4 relative">
                <NavLink to="/" className="flex items-center space-x-2">
                    <Brain className="w-10 h-10 text-c-zinc" />
                    <h1 className="text-4xl font-bold text-c-zinc hidden md:block">ADHD Tracker</h1>
                </NavLink>

                {/* Desktop Menu Items */}
                <div className="hidden md:flex items-center space-x-8">
                    {menuItems?.map(({ to, Icon, label }, index) => (
                        <span
                            key={index}
                        >
                            <NavLink
                                to={to}
                                title={label}
                            >
                                {Icon && <Icon
                                    className="cursor-pointer text-c-zinc w-6 h-6" />}
                            </NavLink>

                        </span>
                    ))}

                    {showLogout && (
                        <span title='Logout'>
                            {isLoggingOut ? (
                                <BiLoaderAlt className="w-5 h-5 animate-spin mr-2" />
                            ) : (
                                <LogOut
                                    className="cursor-pointer text-c-zinc w-6 h-6"
                                    onClick={onLogout}
                                    disabled={isLoggingOut}
                                />
                            )}

                        </span>
                    )}


                </div>

                {/* Mobile Hamburger */}
                < div className="md:hidden" >
                    <button onClick={() => setMenuOpen(!menuOpen)} className="focus:outline-none">
                        {menuOpen ? (
                            <X className="w-10 h-10 text-c-zinc" />
                        ) : (
                            <Menu className="w-10 h-10 text-c-zinc" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="md:hidden flex flex-col w-full space-y-4 px-6 pt-6 pb-12 ">
                    {menuItems?.map(({ label, to, Icon }, idx) => (
                        <NavLink
                            key={idx}
                            to={to}
                            onClick={() => {
                                setMenuOpen(false);
                            }}
                        >
                            <button className="btn btn-primary w-full flex items-center justify-center">
                                {Icon && <Icon className="w-5 h-5 mr-2" />}
                                {label}
                            </button>
                        </NavLink>
                    ))}


                    {/* Logout Button */}
                    {showLogout && (
                        <button
                            className="btn btn-outline w-full flex items-center justify-center"
                            onClick={onLogout}
                            disabled={isLoggingOut}
                        >
                            {isLoggingOut ? (
                                <BiLoaderAlt className="w-5 h-5 animate-spin mr-2" />
                            ) : (
                                <LogOut className="w-5 h-5 mr-2" />
                            )}
                            Logout
                        </button>

                    )}


                </div>
            )}
        </header>
    );
};

export default ReusableHeader;
