import { Axios } from "@src/api"
import { ErrorNotification } from "@src/utils"


/**
 * Fetch symptoms for a specific date
 * @param {String} userId - ID of the user
 * @param {String} date - Date string in MM-yyyy-dd format
 * @param {Array} dynamicSymptoms - Symptoms loaded from redux
 * @returns {Object} - { symptoms: [...], entryAlreadySaved: boolean }
 */
export const fetchSymptomEntryForDate = async (userId, date, dynamicSymptoms = []) => {

    try {

        const res = await Axios.get("/symptom-logs/by-date", {
            params: {
                userId,
                date,
            },
        });

        if (res.status === 200 || res.status === 304) {
            // console.log("dynamicSymptoms", dynamicSymptoms)
            const savedScores = res.data.scores;
            const updatedSymptoms = dynamicSymptoms.map(symptom => {
                const matchingScore = savedScores.find(s => s.symptomId === symptom.id);
                return {
                    ...symptom,
                    value: matchingScore?.score ?? symptom.defaultValue ?? 0,
                };
            });

            return {
                symptoms: updatedSymptoms,
                entryAlreadySaved: true,
            };
        }
    } catch (err) {
        if (err?.response?.status === 404) {
            const initialSymptoms = dynamicSymptoms.map(symptom => ({
                ...symptom,
                value: symptom.defaultValue ?? 0,
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
