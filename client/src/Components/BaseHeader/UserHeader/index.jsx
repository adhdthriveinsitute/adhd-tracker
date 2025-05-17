import ReusableHeader from '@src/Components/BaseHeader/ReusableHeader';
import { useSelector } from 'react-redux';
import { Home, UserRound } from 'lucide-react';

const UserHeader = ({ setShowLogoutConfirm, isLoggingOut }) => {
  const user = useSelector(state => state?.user);

  const menuItems = [
    { label: 'Home', to: '/', Icon: Home },
    { label: 'Profile', to: '/profile', Icon: UserRound },
  ];


  return (
    <>
      <ReusableHeader
        showLogout={true}
        menuItems={menuItems}
        onLogout={() => setShowLogoutConfirm(true)}
        isLoggingOut={isLoggingOut}
      />

    </>
  );
};

export default UserHeader;
