import { ChartLine, ListIcon, Settings, UsersRoundIcon } from "lucide-react";
import ReusableHeader from "../ReusableHeader";

const AdminHeader = ({ isLoggingOut, setShowLogoutConfirm }) => {

  const menuItems = [
    { label: 'Users', to: '/', type: "primary", Icon: UsersRoundIcon },
    { label: 'Analytics', to: '/analytics', type: "primary", Icon: ChartLine },
    { label: 'Symptoms', to: '/symptoms', type: "primary", Icon: ListIcon },
    { label: 'Settings', to: '/settings', type: "primary", Icon: Settings },
  ];



  return (
    <>
      <ReusableHeader
        menuItems={menuItems}
        showLogout={true}
        onLogout={() => setShowLogoutConfirm(true)}
        isLoggingOut={isLoggingOut}

      />
    </>
  );
};

export default AdminHeader;
