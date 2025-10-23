import { useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { parse, format } from 'date-fns';
import { DATE_FORMAT_STRING } from '@src/constants';

import {
    fetchSymptoms,
    fetchAllUsers,
    fetchSymptomLogsBatch,
    fetchSymptomLogDatesBatch,
    selectSymptoms,
    selectUsers,
    selectSymptomLogs,
    selectUserDates,
    selectLoading,
    // selectNeedsFetch,
    selectUsersNeedingDatesFetch
} from '@src/redux/slices/symptomsSlice';

/**
 * Custom hook for managing analytics data fetching and processing
 * @param {Object} filters - Filter parameters
 * @param {string} filters.selectedUser - Selected user ID or "all"
 * @param {string} filters.selectedSymptom - Selected symptom ID or "all"  
 * @param {string} filters.selectedRange - Selected time range
 * @param {Date} filters.startDate - Custom start date
 * @param {Date} filters.endDate - Custom end date
 * @param {Function} filters.getCutoffForRange - Function to get cutoff date for range
 * @returns {Object} - Processed analytics data and loading states
 */
export const useAnalyticsData = (filters) => {
    const {
        selectedUser,
        selectedSymptom,
        selectedRange,
        startDate,
        endDate,
        getCutoffForRange
    } = filters;

    const dispatch = useDispatch();

    // Redux selectors - ALL selectors must be called at the top level
    const symptoms = useSelector(selectSymptoms);
    const users = useSelector(selectUsers);
    const symptomLogs = useSelector(selectSymptomLogs);
    const userDates = useSelector(selectUserDates);
    const loading = useSelector(selectLoading);

    // FIXED: Move useSelector to top level and use useMemo for derived data
    const allUserIds = useMemo(() => users.map(u => u._id), [users]);
    const usersNeedingFetch = useSelector(state => 
        selectUsersNeedingDatesFetch(state, allUserIds)
    );

    // Initialize data loading
    useEffect(() => {
        if (symptoms.length === 0) {
            dispatch(fetchSymptoms());
        }
    }, [dispatch, symptoms.length]);

    useEffect(() => {
        if (users.length === 0) {
            dispatch(fetchAllUsers());
        }
    }, [dispatch, users.length]);

    // FIXED: Now using the selector that's called at top level
    useEffect(() => {
        if (users.length > 0 && usersNeedingFetch.length > 0) {
            dispatch(fetchSymptomLogDatesBatch(usersNeedingFetch));
        }
    }, [dispatch, users.length]);

    // Memoized filtered data
    const { filteredUserIds, filteredDates } = useMemo(() => {
        if (users.length === 0 || Object.keys(userDates).length === 0) {
            return { filteredUserIds: [], filteredDates: [] };
        }

        const cutoff = getCutoffForRange(selectedRange);
        const userIds = selectedUser === "all"
            ? users.filter(u => u._id !== "all").map(u => u._id)
            : [selectedUser];

        let dates = [];

        // Collect all unique dates from relevant users
        userIds.forEach(userId => {
            const userDatesList = userDates[userId] || [];
            dates = [...new Set([...dates, ...userDatesList])];
        });

        // Sort dates
        dates.sort();

        // Apply date filtering
        if (cutoff) {
            dates = dates.filter(dateStr =>
                parse(dateStr, DATE_FORMAT_STRING, new Date()) >= cutoff
            );
        }

        if (startDate && endDate) {
            dates = dates.filter(dateStr => {
                const parsed = parse(dateStr, DATE_FORMAT_STRING, new Date());
                return parsed >= startDate && parsed <= endDate;
            });
        }

        return { filteredUserIds: userIds, filteredDates: dates };
    }, [selectedUser, users, userDates, selectedRange, startDate, endDate, getCutoffForRange]);

    // Smart data fetching
    const fetchRequiredData = useCallback(async () => {
        if (filteredUserIds.length === 0 || filteredDates.length === 0) return;

        // Check what data we need to fetch
        const missingData = [];

        filteredUserIds.forEach(userId => {
            filteredDates.forEach(date => {
                const hasData = symptomLogs[userId]?.[date];
                if (!hasData) {
                    missingData.push({ userId, date });
                }
            });
        });

        // Only fetch if we have missing data
        if (missingData.length > 0) {
            await dispatch(fetchSymptomLogsBatch({
                userIds: filteredUserIds,
                dates: filteredDates
            }));
        }
    }, [dispatch, filteredUserIds, filteredDates, symptomLogs]);

    // Trigger data fetching when filters change
    useEffect(() => {
        if (users.length > 0 && Object.keys(userDates).length > 0) {
            fetchRequiredData();
        }
    }, [fetchRequiredData, users.length, userDates]);

    // Process chart data
    const processedData = useMemo(() => {
        if (filteredUserIds.length === 0 || filteredDates.length === 0 || symptoms.length === 0) {
            return { chartData: [], reductionData: [], overallChange: null };
        }

        // Check if we have all required data
        const hasAllData = filteredUserIds.every(userId =>
            filteredDates.every(date => symptomLogs[userId]?.[date])
        );

        if (!hasAllData) {
            return { chartData: [], reductionData: [], overallChange: null };
        }

        const mergedData = [];
        const reductionScores = {};
        const dateScoreMap = new Map();
        const dateUserContributions = new Map(); // Track which users contributed to each date

        // Process symptom logs
        filteredUserIds.forEach(userId => {
            filteredDates.forEach(date => {
                const entry = symptomLogs[userId]?.[date];
                if (!entry) return;

                const symptomsData = entry.symptoms || [];
                let score = 0;

                const formattedDate = format(parse(date, DATE_FORMAT_STRING, new Date()), "MMM dd yyyy");

                // Calculate score based on selected symptom
                if (selectedSymptom === "all") {
                    score = symptomsData.reduce((acc, s) => acc + (s?.score || 0), 0);
                } else {
                    const match = symptomsData.find(s => s.symptomId === selectedSymptom);
                    score = match?.score ?? 0;
                }

                // Aggregate data based on user selection
                if (selectedUser === "all") {
                    const currentScore = dateScoreMap.get(formattedDate) || 0;
                    dateScoreMap.set(formattedDate, currentScore + score);
                    
                    // Track user contributions for filtering
                    if (!dateUserContributions.has(formattedDate)) {
                        dateUserContributions.set(formattedDate, new Set());
                    }
                    dateUserContributions.get(formattedDate).add(userId);
                } else {
                    mergedData.push({ date: formattedDate, score });
                }

                // Collect data for reduction calculations
                symptomsData.forEach(s => {
                    const key = s.symptomId;
                    if (selectedSymptom === "all" || key === selectedSymptom) {
                        if (!reductionScores[key]) {
                            reductionScores[key] = [];
                        }
                        reductionScores[key].push({ date, value: s.score, userId });
                    }
                });
            });
        });

        // Convert dateScoreMap to mergedData for "all users"
        if (selectedUser === "all") {
            mergedData.length = 0;
            
            // For "all symptoms" case, we need to filter out users with only one entry
            if (selectedSymptom === "all") {
                // First, get all valid users who have at least 2 entries
                const userEntryCounts = {};
                const userSymptomLogs = {}; // Store all logs per user
                
                // Count entries and collect logs per user
                filteredUserIds.forEach(userId => {
                    userEntryCounts[userId] = 0;
                    userSymptomLogs[userId] = [];
                    
                    filteredDates.forEach(date => {
                        const entry = symptomLogs[userId]?.[date];
                        if (entry) {
                            userEntryCounts[userId]++;
                            userSymptomLogs[userId].push({
                                date,
                                symptoms: entry.symptoms || []
                            });
                        }
                    });
                });
                
                // Filter out users with fewer than 2 entries
                const validUserIds = filteredUserIds.filter(userId => userEntryCounts[userId] >= 2);
                
                // If no valid users, return empty data
                if (validUserIds.length === 0) {
                    mergedData.length = 0;
                } else {
                    // For "all symptoms" with "all users", we need to calculate individual user changes
                    // and then aggregate them properly for the chart
                    const filteredDateScoreMap = new Map();
                    
                    validUserIds.forEach(userId => {
                        // Sort user's entries by date
                        const sortedEntries = userSymptomLogs[userId].sort((a, b) => 
                            new Date(a.date) - new Date(b.date)
                        );
                        
                        sortedEntries.forEach(entry => {
                            const formattedDate = format(parse(entry.date, DATE_FORMAT_STRING, new Date()), "MMM dd yyyy");
                            const score = entry.symptoms.reduce((acc, s) => acc + (s?.score || 0), 0);
                            
                            const currentScore = filteredDateScoreMap.get(formattedDate) || 0;
                            filteredDateScoreMap.set(formattedDate, currentScore + score);
                        });
                    });
                    
                    // Convert filtered data to mergedData format
                    for (const [date, score] of filteredDateScoreMap.entries()) {
                        mergedData.push({ date, score });
                    }
                }
            } else {
                // For specific symptoms, use original logic
                for (const [date, score] of dateScoreMap.entries()) {
                    mergedData.push({ date, score });
                }
            }
        }

        // Sort by date
        mergedData.sort((a, b) => new Date(a.date) - new Date(b.date));

        // Calculate reduction data
        let averagedReductions = [];
        
        // Special handling for "all symptoms" case
        if (selectedSymptom === "all" && selectedUser === "all") {
            // Count total entries per user across all dates
            const userEntryCounts = {};
            const userSymptomLogs = {}; // Store all logs per user
            
            // Count entries and collect logs per user
            filteredUserIds.forEach(userId => {
                userEntryCounts[userId] = 0;
                userSymptomLogs[userId] = [];
                
                filteredDates.forEach(date => {
                    const entry = symptomLogs[userId]?.[date];
                    if (entry && entry.symptoms && entry.symptoms.length > 0) {
                        userEntryCounts[userId]++;
                        userSymptomLogs[userId].push({
                            date,
                            symptoms: entry.symptoms || []
                        });
                    }
                });
            });
            
            // Filter out users with fewer than 2 entries
            const validUserIds = filteredUserIds.filter(userId => userEntryCounts[userId] >= 2);
            
            console.log("All users + All symptoms - Entry counts:", userEntryCounts);
            console.log("All users + All symptoms - Valid users:", validUserIds);
            console.log("Total filtered users:", filteredUserIds.length);
            console.log("Users with 2+ entries:", validUserIds.length);
            
            // Debug: Show entry counts for first few users
            const entryCountsArray = Object.entries(userEntryCounts).slice(0, 5);
            console.log("First 5 users entry counts:", entryCountsArray);
            
            if (validUserIds.length > 0) {
                // Calculate individual user percentage changes for all symptoms combined
                const userPercentageChanges = [];
                
                validUserIds.forEach(userId => {
                    const userEntries = userSymptomLogs[userId].sort((a, b) => 
                        new Date(a.date) - new Date(b.date)
                    );
                    
                    console.log(`User ${userId}: Has ${userEntries.length} entries`);
                    
                    if (userEntries.length >= 2) {
                        const firstEntry = userEntries[0];
                        const lastEntry = userEntries[userEntries.length - 1];
                        
                        const firstScore = firstEntry.symptoms.reduce((acc, s) => acc + (s?.score || 0), 0);
                        const lastScore = lastEntry.symptoms.reduce((acc, s) => acc + (s?.score || 0), 0);
                        
                        console.log(`User ${userId}: First entry date: ${firstEntry.date}, First score: ${firstScore}`);
                        console.log(`User ${userId}: Last entry date: ${lastEntry.date}, Last score: ${lastScore}`);
                        
                        let pctChange;
                        if (firstScore === 0) {
                            pctChange = lastScore === 0 ? 0 : 100;
                        } else {
                            pctChange = ((lastScore - firstScore) / firstScore) * 100;
                        }
                        
                        console.log(`User ${userId}: Percentage change: ${pctChange}%`);
                        userPercentageChanges.push(pctChange);
                    } else {
                        console.log(`User ${userId}: Not enough entries (${userEntries.length})`);
                    }
                });
                
                if (userPercentageChanges.length > 0) {
                    // Calculate average percentage change
                    const avgPctChange = userPercentageChanges.reduce((sum, change) => sum + change, 0) / userPercentageChanges.length;
                    
                    console.log("All users + All symptoms calculation:");
                    console.log("Valid users:", validUserIds);
                    console.log("User percentage changes:", userPercentageChanges);
                    console.log("Average percentage change:", avgPctChange);
                    
                    averagedReductions = [{
                        symptom: "All Symptoms",
                        avgPctChange: Math.abs(avgPctChange),
                        rawPctChange: avgPctChange,
                        formattedChange: `${avgPctChange > 0 ? "+" : ""}${avgPctChange.toFixed(1)}%`
                    }];
                } else {
                    console.log("No valid users with percentage changes found");
                }
            }
        } else {
            // Original logic for specific symptoms
            averagedReductions = Object.entries(reductionScores).map(([symptomId, values]) => {
                const numericValues = values
                    .filter(v => typeof v.value === "number")
                    .sort((a, b) => new Date(a.date) - new Date(b.date));

                if (numericValues.length < 2) {
                    return null;
                }

                // For "all users" calculation, filter out users with only one entry
                let filteredValues = numericValues;
                if (selectedUser === "all") {
                    // For specific symptoms, count entries per user for this symptom only
                    const userEntryCounts = {};
                    numericValues.forEach(v => {
                        if (v.userId) {
                            userEntryCounts[v.userId] = (userEntryCounts[v.userId] || 0) + 1;
                        }
                    });
                    
                    // Only include entries from users who have 2 or more entries for this symptom
                    filteredValues = numericValues.filter(v => 
                        !v.userId || userEntryCounts[v.userId] >= 2
                    );
                    
                    // If no users have 2+ entries, return null
                    if (filteredValues.length < 2) {
                        return null;
                    }
                }

                const first = filteredValues[0];
                const last = filteredValues[filteredValues.length - 1];

                let pctChange;
                if (first.value === 0) {
                    pctChange = last.value === 0 ? 0 : 100;
                } else {
                    pctChange = ((last.value - first.value) / first.value) * 100;
                }

                const symptomName = symptoms.find(s => s.id === symptomId)?.name || symptomId;

                return {
                    symptom: symptomName,
                    avgPctChange: Math.abs(pctChange),
                    rawPctChange: pctChange,
                    formattedChange: `${pctChange > 0 ? "+" : ""}${pctChange.toFixed(1)}%`
                };
            }).filter(Boolean);
        }

        const topReducedSymptoms = averagedReductions
            .sort((a, b) => a.rawPctChange - b.rawPctChange)
            .slice(0, 5);

        // Calculate overall change
        let overallChangeValue = null;

        if (mergedData.length > 1) {
            if (selectedSymptom === "all") {
                // For "all symptoms" case, calculate individual user changes and average them
                if (selectedUser === "all") {
                    // Count total entries per user across all dates
                    const userEntryCounts = {};
                    const userSymptomLogs = {}; // Store all logs per user
                    
                    // Count entries and collect logs per user
                    filteredUserIds.forEach(userId => {
                        userEntryCounts[userId] = 0;
                        userSymptomLogs[userId] = [];
                        
                        filteredDates.forEach(date => {
                            const entry = symptomLogs[userId]?.[date];
                            if (entry) {
                                userEntryCounts[userId]++;
                                userSymptomLogs[userId].push({
                                    date,
                                    symptoms: entry.symptoms || []
                                });
                            }
                        });
                    });
                    
                    // Filter out users with fewer than 2 entries
                    const validUserIds = filteredUserIds.filter(userId => userEntryCounts[userId] >= 2);
                    
                    if (validUserIds.length === 0) {
                        overallChangeValue = "Not enough data";
                    } else {
                        // Calculate individual user percentage changes
                        const userPercentageChanges = [];
                        
                        validUserIds.forEach(userId => {
                            const userEntries = userSymptomLogs[userId].sort((a, b) => 
                                new Date(a.date) - new Date(b.date)
                            );
                            
                            if (userEntries.length >= 2) {
                                const firstEntry = userEntries[0];
                                const lastEntry = userEntries[userEntries.length - 1];
                                
                                const firstScore = firstEntry.symptoms.reduce((acc, s) => acc + (s?.score || 0), 0);
                                const lastScore = lastEntry.symptoms.reduce((acc, s) => acc + (s?.score || 0), 0);
                                
                                let pctChange;
                                if (firstScore === 0) {
                                    pctChange = lastScore === 0 ? 0 : 100;
                                } else {
                                    pctChange = ((lastScore - firstScore) / firstScore) * 100;
                                }
                                
                                userPercentageChanges.push(pctChange);
                            }
                        });
                        
                        if (userPercentageChanges.length === 0) {
                            overallChangeValue = "Not enough data";
                        } else {
                            // Calculate average percentage change
                            const avgPctChange = userPercentageChanges.reduce((sum, change) => sum + change, 0) / userPercentageChanges.length;
                            overallChangeValue = `${avgPctChange > 0 ? "+" : ""}${avgPctChange.toFixed(2)}%`;
                        }
                    }
                } else {
                    // For individual user, use the mergedData directly
                    const sortedData = [...mergedData].sort((a, b) => new Date(a.date) - new Date(b.date));
                    const firstScore = sortedData[0]?.score ?? 0;
                    const lastScore = sortedData[sortedData.length - 1]?.score ?? 0;

                    if (firstScore === 0) {
                        overallChangeValue = lastScore === 0 ? "No change" : `Started from 0 → ${lastScore}`;
                    } else {
                        const change = ((lastScore - firstScore) / firstScore) * 100;
                        overallChangeValue = `${change > 0 ? "+" : ""}${change.toFixed(2)}%`;
                    }
                }
            } else {
                const values = reductionScores[selectedSymptom];
                if (values && values.length > 1) {
                    let sortedValues = values
                        .filter(v => typeof v.value === 'number')
                        .sort((a, b) => new Date(a.date) - new Date(b.date));

                    // For "all users" calculation, filter out users with only one entry
                    if (selectedUser === "all") {
                        // Group by userId and filter out users with only one entry
                        const userEntryCounts = {};
                        sortedValues.forEach(v => {
                            if (v.userId) {
                                userEntryCounts[v.userId] = (userEntryCounts[v.userId] || 0) + 1;
                            }
                        });
                        
                        // Only include entries from users who have 2 or more entries
                        sortedValues = sortedValues.filter(v => 
                            !v.userId || userEntryCounts[v.userId] >= 2
                        );
                    }

                    if (sortedValues.length >= 2) {
                        const firstValue = sortedValues[0].value;
                        const lastValue = sortedValues[sortedValues.length - 1].value;

                        if (firstValue === 0) {
                            overallChangeValue = lastValue === 0 ? "No change" : `Started from 0 → ${lastValue}`;
                        } else {
                            const change = ((lastValue - firstValue) / firstValue) * 100;
                            overallChangeValue = `${change > 0 ? "+" : ""}${change.toFixed(2)}%`;
                        }
                    } else {
                        overallChangeValue = "Not enough data";
                    }
                } else {
                    overallChangeValue = "Not enough data";
                }
            }
        } else {
            overallChangeValue = "Not enough data";
        }

        return {
            chartData: mergedData,
            reductionData: topReducedSymptoms,
            overallChange: overallChangeValue
        };
    }, [filteredUserIds, filteredDates, symptomLogs, selectedSymptom, selectedUser, symptoms]);

    return {
        symptoms,
        users,
        loading: loading.symptoms || loading.users || loading.logs || loading.dates,
        ...processedData,
        filteredUserIds,
        filteredDates,
        hasData: processedData.chartData.length > 0
    };
};