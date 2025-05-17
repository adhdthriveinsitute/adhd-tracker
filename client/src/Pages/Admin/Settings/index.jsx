import { useEffect, useState } from 'react';
import { Axios } from '@src/api';
import { ErrorNotification, SuccessNotification } from '@src/utils';
import Toggle from '@src/Components/UI/Toggle';
import { NavLink } from 'react-router-dom';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    allowUserRegistration: false,
    requireEmailVerification: false,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await Axios.get('/admin/settings');
      if (res.status === 200 && res.data?.settings) {
        setSettings(res.data.settings);
        console.log(res.data.settings);
      }
    } catch (err) {
      ErrorNotification(err?.response?.data?.error || 'Failed to fetch settings.');
    }
  };

  const updateSetting = async (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated); // UI updates instantly
    setLoading(true);
    try {
      const res = await Axios.put('/admin/settings', updated);
      if (res.status === 200) {
        SuccessNotification('Settings updated successfully.');
      }
    } catch (err) {
      ErrorNotification(err?.response?.data?.error || 'Failed to update settings.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Admin Settings</h2>

      <div className="space-y-6">
        {/* Allow Registration */}
        <div className="bg-gray-100 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-700">Allow New User Registration</h3>
              <p className="text-sm text-gray-500">Enable or disable account creation for new users.</p>
            </div>
            <Toggle
              value={settings.allowUserRegistration}
              onChange={(val) => updateSetting('allowUserRegistration', val)}
            />
          </div>
        </div>

        {/* Email Verification */}
        <div className="bg-gray-100 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-700">Require Email Verification</h3>
              <p className="text-sm text-gray-500">Users must verify their email after signing up.</p>
            </div>
            <Toggle
              value={settings.requireEmailVerification}
              onChange={(val) => updateSetting('requireEmailVerification', val)}
            />
          </div>
        </div>

        {/* Add New Admin */}
        <div className="bg-gray-100 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between md:items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-700">Manage Admins</h3>
            <p className="text-sm text-gray-500">Add admin-level users.</p>
          </div>
          <NavLink
            to="/add-admin"
            className={"btn-primary mt-4 md:!my-0 !text-center"}>
            Add New Admin
          </NavLink>
        </div>
      </div>
    </div>
  );
}
