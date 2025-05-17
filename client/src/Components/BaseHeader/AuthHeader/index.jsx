import ReusableHeader from '@src/Components/BaseHeader/ReusableHeader';
import { KeyRoundIcon, UserRoundPlus } from 'lucide-react';

const AuthHeader = () => {
  const menuItems = [
    { label: 'Sign Up', to: '/signup', Icon: UserRoundPlus },
    { label: 'Login', to: '/login', Icon: KeyRoundIcon },
  ];

  return <ReusableHeader
    menuItems={menuItems} />;
};

export default AuthHeader;
