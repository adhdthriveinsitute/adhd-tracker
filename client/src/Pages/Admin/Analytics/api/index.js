import { Axios } from "@src/api"
import { SYMPTOMS } from "@src/constants"
import { ErrorNotification } from "@src/utils"




export const fetchAllUsers = async () => {
    const res = await Axios.get("/admin/users/all");
    // console.log(res.data.users)
    return res.data.users;
};



/**
 * Fetch symptoms for a specific date
 * @param {String} userId - ID of the user
 * @param {String} date - Date string in MM-yyyy-dd format
 * @returns {Object} - { symptoms: [...], entryAlreadySaved: boolean }
 */
export const fetchSymptomEntryForDate = async (userId, date) => {
    try {
        const res = await Axios.get("/symptom-logs/by-date", {
            params: {
                userId,
                date,
            },
        });

        if (res.status === 200) {
            const savedScores = res.data.scores;
            const updatedSymptoms = SYMPTOMS.map(symptom => {
                const matchingScore = savedScores.find(s => s.symptomId === symptom.id);
                return {
                    ...symptom,
                    value: matchingScore?.score || symptom.defaultValue,
                };
            });

            return {
                symptoms: updatedSymptoms,
                entryAlreadySaved: true,
            };
        }
    } catch (err) {
        if (err?.response?.status === 404) {
            const initialSymptoms = SYMPTOMS.map(symptom => ({
                ...symptom,
                value: symptom.defaultValue,
            }));

            return {
                symptoms: initialSymptoms,
                entryAlreadySaved: false,
            };
        } else {
            ErrorNotification("Failed to fetch entry for selected date");
            throw err.response ? err : new Error("Something went wrong");
        }
    }
};

/**
 * Fetch all saved entry dates for a user
 * @param {String} userId - ID of the user
 * @returns {Object} - Map of saved entry dates
 */
export const fetchAllSavedEntryDates = async (userId) => {
    try {
        const res = await Axios.get("/symptom-logs/dates", {
            params: { userId },
        });

        if (res.status === 200) {
            const map = Object.fromEntries(
                res.data.datesWithEntries.map(dateStr => [dateStr, true])
            );
            return map;
        }
    } catch (error) {
        ErrorNotification(error?.response?.data?.error || 'Failed to fetch all dates with entries');
        throw error.response ? error : new Error("Something went wrong while fetching all dates with entries");
    }
};
