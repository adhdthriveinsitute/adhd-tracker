import { toast } from 'react-hot-toast';
import { format } from "date-fns"
import Papa from "papaparse";
import { USER_STORAGE_KEYS, ACTIVE_USER_ROLE_KEY, DATE_FORMAT_OPTIONS } from "@src/constants";


export const SuccessNotification = (message = 'Success!') => {
  toast.success(message, {
    duration: 3000,
    position: 'center-top',
    style: {
      background: '#10b981', // Tailwind green-500
      color: '#fff',
      padding: '12px 16px',
      borderRadius: '8px',
      fontWeight: 500,
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#10b981',
    },
  });
};

export const ErrorNotification = (message = 'Something went wrong') => {
  toast.error(message, {
    duration: 4000,
    position: 'center-top',
    style: {
      background: '#ef4444', // Tailwind red-500
      color: '#fff',
      padding: '12px 16px',
      borderRadius: '8px',
      fontWeight: 500,
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#ef4444',
    },
  });
};

export const formatDateOfBirthInput = (value) => {
  // Remove non-digit characters
  const digitsOnly = value.replace(/\D/g, '');

  // Extract MM-DD-YYYY
  const month = digitsOnly.slice(0, 2);
  const day = digitsOnly.slice(2, 4);
  const year = digitsOnly.slice(4, 8);

  let formatted = '';
  if (month) formatted += month;
  if (day) formatted += `-${day}`;
  if (year) formatted += `-${year}`;

  return formatted;
};



export const formatSymptomScoresPayload = (symptoms) => {
  return symptoms.map(symptom => ({
    symptomId: symptom.id,
    score: symptom.value
  }));
};


export const setActiveRole = (role) => {
  localStorage.setItem(ACTIVE_USER_ROLE_KEY, role);
};

export const getActiveRole = () => {
  const role = localStorage.getItem(ACTIVE_USER_ROLE_KEY);
  return role || null;
};

export const getToken = (role) => {
  const data = localStorage.getItem(USER_STORAGE_KEYS[role]);
  return data ? JSON.parse(data).accessToken : null;
};

export const setToken = (role, payload) => {
  localStorage.setItem(USER_STORAGE_KEYS[role],
    JSON.stringify(payload));
  setActiveRole(role); // set the active role
};

export const getAuthUser = (role) => {
  try {
    const resolvedRole = role || getActiveRole();
    if (!resolvedRole) return null;
    const data = localStorage.getItem(USER_STORAGE_KEYS[resolvedRole]);
    if (!data) return null;
    const parsed = JSON.parse(data);
    return parsed[resolvedRole] || null;
  } catch {
    return null;
  }
};


export const updateAuthUser = (role, updatedUser) => {
  const resolvedRole = role || getActiveRole();
  if (!resolvedRole) return;

  const storageKey = USER_STORAGE_KEYS[resolvedRole];
  const existingData = localStorage.getItem(storageKey);
  if (!existingData) return;

  try {
    const parsed = JSON.parse(existingData);
    const updated = {
      ...parsed,
      user: updatedUser, // direct overwrite
    };


    localStorage.setItem(storageKey, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to update user in localStorage:", err);
  }
};


export const removeToken = (role) => {
  const resolvedRole = role || getActiveRole();
  if (resolvedRole) {
    localStorage.removeItem(USER_STORAGE_KEYS[resolvedRole]);
  }
  localStorage.removeItem(ACTIVE_USER_ROLE_KEY);
};



/**
 * Format a date as a readable string
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  return format(date, "EEEE, MMMM do, yyyy")
}


export const formatDateToMDY = (date = new Date()) => {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const year = date.getFullYear();
  return `${month}-${day}-${year}`;
};





/**
 * Format a date for display in the profile
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatProfileDate = (date) => {
  return format(date, "MMMM d, yyyy")
}

/**
 * Format a date of birth
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDateOfBirth = (date) => {
  return format(date, "MMMM d, yyyy")
}

// utils/getTrendChartData.js

export const buildSymptomTrendData = async (selectedSymptomId, fetchAllSavedEntryDates, fetchSymptomEntryForDate) => {
  const dates = await fetchAllSavedEntryDates();
  const result = [];

  for (const date of dates) {
    const res = await fetchSymptomEntryForDate(date);
    const scores = res?.data?.scores || [];

    const score = selectedSymptomId === "all"
      ? scores.reduce((acc, s) => acc + (s?.score || 0), 0)
      : scores.find(s => s.symptomId === selectedSymptomId)?.score || 0;

    result.push({ date, score });
  }

  return result;
};


/**
 * Calculate total symptom score from individual ratings
 */
export const calculateTotalScore = (symptoms) => {
  return symptoms.reduce((total, symptom) => total + symptom.value, 0)
}


export const popupAnimation = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.25, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: 40, // slide down effect
    scale: 0.95,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};


// Export User Data to CSV (For Admin)
export const exportToCSV = (users) => {
  if (!users || users.length === 0) return;

  // Format `createdAt` and `updatedAt`, everything else passed as-is
  const formattedUsers = users.map(user => ({
    ...user,
    createdAt: new Date(user.createdAt).toLocaleDateString("en-GB", DATE_FORMAT_OPTIONS),
    updatedAt: new Date(user.updatedAt).toLocaleDateString("en-GB", DATE_FORMAT_OPTIONS),
  }));

  const csv = Papa.unparse(formattedUsers);

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", "users.csv");
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link)
}


export const generateSymptomIdFromName = (name) => {
        const words = name.trim().split(" ");
        if (words.length === 0) return null;

        const first = words[0];
        if (first.length >= 4) {
            return first.toLowerCase();
        }

        const second = words[1] || "";
        const combined = `${first}${second}`.toLowerCase();
        return combined;
    };





