import { Axios } from "@src/api";
import { ErrorNotification } from "@src/utils";

// Cache for API responses to avoid redundant calls
const apiCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCacheKey = (endpoint, params = {}) => {
    return `${endpoint}:${JSON.stringify(params)}`;
};

const isCacheValid = (timestamp) => {
    return Date.now() - timestamp < CACHE_DURATION;
};

const getCachedData = (key) => {
    const cached = apiCache.get(key);
    if (cached && isCacheValid(cached.timestamp)) {
        return cached.data;
    }
    return null;
};

const setCachedData = (key, data) => {
    apiCache.set(key, {
        data,
        timestamp: Date.now()
    });
};

export const fetchAllUsers = async () => {
    const cacheKey = getCacheKey('/admin/users/all');
    const cached = getCachedData(cacheKey);

    if (cached) {
        return cached;
    }

    try {
        const res = await Axios.get("/admin/users/all");
        const users = res.data.users;
        setCachedData(cacheKey, users);
        return users;
    } catch (error) {
        ErrorNotification(error?.response?.data?.error || 'Failed to fetch symptom logs batch.');
        throw error.response ? error : new Error("Something went wrong fetching symptom logs batch");
    }
};

/**
 * Batch fetch all saved entry dates for multiple users
 * @param {Array} userIds - Array of user IDs
 * @returns {Object} - Object with userId as key and dates array as value
 */
export const fetchAllSavedEntryDatesBatch = async (userIds) => {
    const cacheKey = getCacheKey('/symptom-logs/dates/batch', { userIds });
    const cached = getCachedData(cacheKey);

    if (cached) {
        return cached;
    }

    try {
        const promises = userIds.map(async (userId) => {
            const individualCacheKey = getCacheKey('/symptom-logs/dates', { userId });
            const individualCached = getCachedData(individualCacheKey);

            if (individualCached) {
                return { userId, dates: individualCached };
            }

            const res = await Axios.get("/symptom-logs/dates", {
                params: { userId },
            });

            const dates = res.data.datesWithEntries || [];
            setCachedData(individualCacheKey, dates);
            return { userId, dates };
        });

        const results = await Promise.all(promises);
        const datesByUser = {};

        results.forEach(({ userId, dates }) => {
            datesByUser[userId] = dates;
        });

        setCachedData(cacheKey, datesByUser);
        return datesByUser;
    } catch (error) {
        ErrorNotification(error?.response?.data?.error || 'Failed to fetch user dates batch.');
        throw error.response ? error : new Error("Something went wrong fetching user dates batch");
    }
};

/**
 * LEGACY: Fetch symptoms for a specific date (keeping for backward compatibility)
 * @param {String} userId - ID of the user
 * @param {String} date - Date string in MM-yyyy-dd format
 * @param {Array} backendSymptoms - Symptoms from backend (optional, will fetch if not provided)
 * @returns {Object} - { symptoms: [...], entryAlreadySaved: boolean }
 */
export const fetchSymptomEntryForDate = async (userId, date, backendSymptoms = null) => {
    const cacheKey = getCacheKey('/symptom-logs/by-date', { userId, date });
    const cached = getCachedData(cacheKey);

    if (cached) {
        // Transform cached data to expected format
        let symptomsToUse = backendSymptoms;
        if (!symptomsToUse || symptomsToUse.length === 0) {
            symptomsToUse = await fetchSymptoms();
        }

        const savedScores = cached.scores || [];
        const updatedSymptoms = symptomsToUse.map(symptom => {
            const matchingScore = savedScores.find(s => s.symptomId === symptom.id);
            return {
                ...symptom,
                value: matchingScore?.score || 0,
            };
        });

        const knownSymptomIds = symptomsToUse.map(s => s.id);
        const unknownSymptoms = savedScores
            .filter(score => !knownSymptomIds.includes(score.symptomId))
            .map(score => ({
                id: score.symptomId,
                name: score.symptomId.charAt(0).toUpperCase() + score.symptomId.slice(1),
                value: score.score,
                defaultValue: 0
            }));

        return {
            symptoms: [...updatedSymptoms, ...unknownSymptoms],
            entryAlreadySaved: cached.entryAlreadySaved || true,
        };
    }

    try {
        // Fetch symptoms from backend if not provided
        let symptomsToUse = backendSymptoms;
        if (!symptomsToUse || symptomsToUse.length === 0) {
            symptomsToUse = await fetchSymptoms();
        }

        const res = await Axios.get("/symptom-logs/by-date", {
            params: {
                userId,
                date,
            },
        });

        if (res.status === 200) {
            const savedScores = res.data.scores;
            const updatedSymptoms = symptomsToUse.map(symptom => {
                const matchingScore = savedScores.find(s => s.symptomId === symptom.id);
                return {
                    ...symptom,
                    value: matchingScore?.score || 0,
                };
            });

            // Handle any scores that don't match known symptoms from backend
            const knownSymptomIds = symptomsToUse.map(s => s.id);
            const unknownSymptoms = savedScores
                .filter(score => !knownSymptomIds.includes(score.symptomId))
                .map(score => ({
                    id: score.symptomId,
                    name: score.symptomId.charAt(0).toUpperCase() + score.symptomId.slice(1),
                    value: score.score,
                    defaultValue: 0
                }));

            const result = {
                symptoms: [...updatedSymptoms, ...unknownSymptoms],
                entryAlreadySaved: true,
            };

            // Cache the result
            setCachedData(cacheKey, {
                scores: savedScores,
                entryAlreadySaved: true
            });

            return result;
        }
    } catch (err) {
        if (err?.response?.status === 404) {
            // Fetch symptoms from backend if not provided
            let symptomsToUse = backendSymptoms;
            if (!symptomsToUse || symptomsToUse.length === 0) {
                symptomsToUse = await fetchSymptoms();
            }

            const initialSymptoms = symptomsToUse.map(symptom => ({
                ...symptom,
                value: symptom.defaultValue || 0,
            }));

            const result = {
                symptoms: initialSymptoms,
                entryAlreadySaved: false,
            };

            // Cache the empty result
            setCachedData(cacheKey, {
                scores: [],
                entryAlreadySaved: false
            });

            return result;
        } else {
            ErrorNotification("Failed to fetch entry for selected date");
            throw err.response ? err : new Error("Something went wrong");
        }
    }
};

/**
 * LEGACY: Fetch all saved entry dates for a user (keeping for backward compatibility)
 * @param {String} userId - ID of the user
 * @returns {Object} - Map of saved entry dates
 */
export const fetchAllSavedEntryDates = async (userId) => {
    const cacheKey = getCacheKey('/symptom-logs/dates', { userId });
    const cached = getCachedData(cacheKey);

    if (cached) {
        return Object.fromEntries(cached.map(dateStr => [dateStr, true]));
    }

    try {
        const res = await Axios.get("/symptom-logs/dates", {
            params: { userId },
        });

        if (res.status === 200) {
            const dates = res.data.datesWithEntries || [];
            setCachedData(cacheKey, dates);

            const map = Object.fromEntries(
                dates.map(dateStr => [dateStr, true])
            );
            return map;
        }
    } catch (error) {
        ErrorNotification(error?.response?.data?.error || 'Failed to fetch all dates with entries');
        throw error.response ? error : new Error("Something went wrong while fetching all dates with entries");
    }
};

/**
 * Clear cache for specific keys or all cache
 * @param {String|Array} keys - Specific cache keys to clear, or null to clear all
 */
export const clearApiCache = (keys = null) => {
    if (keys === null) {
        apiCache.clear();
    } else if (Array.isArray(keys)) {
        keys.forEach(key => apiCache.delete(key));
    } else {
        apiCache.delete(keys);
    }
};

/**
 * Get cache statistics for debugging
 * @returns {Object} - Cache statistics
 */
export const getCacheStats = () => {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    for (const [key, value] of apiCache.entries()) {
        if (isCacheValid(value.timestamp)) {
            validEntries++;
        } else {
            expiredEntries++;
        }
    }

    return {
        totalEntries: apiCache.size,
        validEntries,
        expiredEntries,
        cacheHitRate: validEntries / (validEntries + expiredEntries) || 0
    };
};

/**
 * Fetch symptoms from backend with caching
 * @returns {Array} - Array of symptoms from backend
 */
export const fetchSymptoms = async () => {
    const cacheKey = getCacheKey('/symptoms');
    const cached = getCachedData(cacheKey);

    if (cached) {
        return cached;
    }

    try {
        const res = await Axios.get("/symptoms");
        const symptoms = res.data.symptoms || [];
        setCachedData(cacheKey, symptoms);
        return symptoms;
    } catch (error) {
        ErrorNotification(error?.response?.data?.error || 'Failed to fetch symptoms.');
        throw error.response ? error : new Error("Something went wrong fetching symptoms");
    }
};

/**
 * NEW: Batch fetch symptom logs for multiple users and dates
 * @param {Array} userIds - Array of user IDs
 * @param {Array} dates - Array of date strings
 * @returns {Object} - Batch response data
 */
export const fetchSymptomLogsBatch = async (userIds, dates) => {
    const cacheKey = getCacheKey('/api/v1/symptom-logs/batch', { userIds, dates });
    const cached = getCachedData(cacheKey);

    if (cached) {
        return cached;
    }

    try {
        const res = await Axios.post("/api/v1/symptom-logs/batch", {
            userIds,
            dates
        });

        const batchData = res.data;
        setCachedData(cacheKey, batchData);

        // Also cache individual entries for future single requests
        Object.entries(batchData).forEach(([userId, userLogs]) => {
            Object.entries(userLogs).forEach(([date, logData]) => {
                const individualKey = getCacheKey('/symptom-logs/by-date', { userId, date });
                setCachedData(individualKey, {
                    scores: logData.symptoms || [],
                    entryAlreadySaved: true
                });
            });
        });

        return batchData;
    } catch (error) {
        ErrorNotification(error?.response?.data?.error || 'Failed to fetch users.');
        throw error.response ? error : new Error("Something went wrong fetching users");
    }
};