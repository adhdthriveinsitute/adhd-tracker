import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Axios } from '@src/api';
import { ErrorNotification } from '@src/utils';

// Async thunks
export const fetchSymptoms = createAsyncThunk(
  'symptoms/fetchSymptoms',
  async (_, { rejectWithValue }) => {
    try {
      const res = await Axios.get('/symptoms');
      return res.data.symptoms || [];
    } catch (error) {
      const message = error?.response?.data?.error || 'Failed to fetch symptoms.';
      ErrorNotification(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchAllUsers = createAsyncThunk(
  'symptoms/fetchAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      const res = await Axios.get('/admin/users/all');
      return res.data.users;
    } catch (error) {
      const message = error?.response?.data?.error || 'Failed to fetch users.';
      ErrorNotification(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchSymptomLogsBatch = createAsyncThunk(
  'symptoms/fetchSymptomLogsBatch',
  async ({ userIds, dates }, { rejectWithValue }) => {
    try {
      const res = await Axios.post('/symptom-logs/batch', {
        userIds,
        dates
      });
      return res.data;
    } catch (error) {
      const message = error?.response?.data?.error || 'Failed to fetch symptom logs batch.';
      ErrorNotification(message);
      return rejectWithValue(message);
    }
  }
);

// NEW: Batch fetch for symptom log dates
export const fetchSymptomLogDatesBatch = createAsyncThunk(
  'symptoms/fetchSymptomLogDatesBatch',
  async (userIds, { rejectWithValue }) => {
    try {
      const res = await Axios.post('/symptom-logs/dates/batch', {
        userIds
      });
      return res.data;
    } catch (error) {
      const message = error?.response?.data?.error || 'Failed to fetch symptom log dates batch.';
      ErrorNotification(message);
      return rejectWithValue(message);
    }
  }
);

// DEPRECATED: Keep for backward compatibility but prefer batch version
export const fetchUserDates = createAsyncThunk(
  'symptoms/fetchUserDates',
  async (userIds, { rejectWithValue }) => {
    try {
      const promises = userIds.map(async (userId) => {
        const res = await Axios.get('/symptom-logs/dates', {
          params: { userId }
        });
        return {
          userId,
          dates: res.data.datesWithEntries || []
        };
      });
      
      const results = await Promise.all(promises);
      const datesByUser = {};
      results.forEach(({ userId, dates }) => {
        datesByUser[userId] = dates;
      });
      
      return datesByUser;
    } catch (error) {
      const message = error?.response?.data?.error || 'Failed to fetch user dates.';
      ErrorNotification(message);
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  symptoms: [],
  users: [],
  symptomLogs: {}, // Structure: { userId: { date: { symptoms: [...] } } }
  userDates: {}, // Structure: { userId: [dates...] }
  loading: {
    symptoms: false,
    users: false,
    logs: false,
    dates: false
  },
  error: null,
  lastFetch: {
    symptoms: null,
    users: null,
    logs: {},
    dates: {}
  }
};

const symptomsSlice = createSlice({
  name: 'symptoms',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    // Cache invalidation helpers
    invalidateLogsCache: (state, action) => {
      const { userIds, dates } = action.payload;
      userIds.forEach(userId => {
        dates.forEach(date => {
          if (state.symptomLogs[userId]?.[date]) {
            delete state.symptomLogs[userId][date];
          }
        });
      });
    },
    invalidateDatesCache: (state, action) => {
      const { userIds } = action.payload;
      userIds.forEach(userId => {
        if (state.userDates[userId]) {
          delete state.userDates[userId];
        }
        if (state.lastFetch.dates[userId]) {
          delete state.lastFetch.dates[userId];
        }
      });
    },
    // Batch update for better performance
    updateMultipleEntries: (state, action) => {
      const { updates } = action.payload;
      updates.forEach(({ userId, date, symptoms }) => {
        if (!state.symptomLogs[userId]) {
          state.symptomLogs[userId] = {};
        }
        state.symptomLogs[userId][date] = { symptoms };
      });
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch symptoms
      .addCase(fetchSymptoms.pending, (state) => {
        state.loading.symptoms = true;
        state.error = null;
      })
      .addCase(fetchSymptoms.fulfilled, (state, action) => {
        state.loading.symptoms = false;
        state.symptoms = action.payload;
        state.lastFetch.symptoms = Date.now();
      })
      .addCase(fetchSymptoms.rejected, (state, action) => {
        state.loading.symptoms = false;
        state.error = action.payload;
      })
      
      // Fetch users
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading.users = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading.users = false;
        state.users = action.payload;
        state.lastFetch.users = Date.now();
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading.users = false;
        state.error = action.payload;
      })
      
      // Fetch symptom logs batch
      .addCase(fetchSymptomLogsBatch.pending, (state) => {
        state.loading.logs = true;
        state.error = null;
      })
      .addCase(fetchSymptomLogsBatch.fulfilled, (state, action) => {
        state.loading.logs = false;
        const batchData = action.payload;
        
        // Update the symptom logs cache
        Object.entries(batchData).forEach(([userId, userLogs]) => {
          if (!state.symptomLogs[userId]) {
            state.symptomLogs[userId] = {};
          }
          Object.entries(userLogs).forEach(([date, logData]) => {
            state.symptomLogs[userId][date] = logData;
          });
        });
        
        // Update last fetch timestamp for cache validation
        const now = Date.now();
        Object.keys(batchData).forEach(userId => {
          if (!state.lastFetch.logs[userId]) {
            state.lastFetch.logs[userId] = {};
          }
          Object.keys(batchData[userId]).forEach(date => {
            state.lastFetch.logs[userId][date] = now;
          });
        });
      })
      .addCase(fetchSymptomLogsBatch.rejected, (state, action) => {
        state.loading.logs = false;
        state.error = action.payload;
      })

      // NEW: Fetch symptom log dates batch
      .addCase(fetchSymptomLogDatesBatch.pending, (state) => {
        state.loading.dates = true;
        state.error = null;
      })
      .addCase(fetchSymptomLogDatesBatch.fulfilled, (state, action) => {
        state.loading.dates = false;
        state.userDates = { ...state.userDates, ...action.payload };
        const now = Date.now();
        Object.keys(action.payload).forEach(userId => {
          state.lastFetch.dates[userId] = now;
        });
      })
      .addCase(fetchSymptomLogDatesBatch.rejected, (state, action) => {
        state.loading.dates = false;
        state.error = action.payload;
      })
      
      // DEPRECATED: Keep for backward compatibility
      .addCase(fetchUserDates.pending, (state) => {
        state.loading.dates = true;
        state.error = null;
      })
      .addCase(fetchUserDates.fulfilled, (state, action) => {
        state.loading.dates = false;
        state.userDates = { ...state.userDates, ...action.payload };
        const now = Date.now();
        Object.keys(action.payload).forEach(userId => {
          state.lastFetch.dates[userId] = now;
        });
      })
      .addCase(fetchUserDates.rejected, (state, action) => {
        state.loading.dates = false;
        state.error = action.payload;
      });
  }
});

// Selectors with memoization
export const selectSymptoms = (state) => state.symptoms.symptoms;
export const selectUsers = (state) => state.symptoms.users;
export const selectSymptomLogs = (state) => state.symptoms.symptomLogs;
export const selectUserDates = (state) => state.symptoms.userDates;
export const selectLoading = (state) => state.symptoms.loading;
export const selectError = (state) => state.symptoms.error;

// Complex selectors for derived data
export const selectSymptomOptions = (state) => {
  const symptoms = selectSymptoms(state);
  return [
    { value: 'all', label: 'All Symptoms' },
    ...symptoms.map(symptom => ({ value: symptom.id, label: symptom.name }))
  ];
};

export const selectUserOptions = (state) => {
  const users = selectUsers(state);
  return [
    { label: 'All Users', value: 'all' },
    ...users.map(u => ({ label: u.name, value: u._id }))
  ];
};

// Cache validation selectors
export const selectIsCacheValid = (cacheTime, maxAge = 5 * 60 * 1000) => {
  return cacheTime && (Date.now() - cacheTime) < maxAge;
};

export const selectNeedsFetch = (state, userIds, dates) => {
  const logs = selectSymptomLogs(state);
  const lastFetch = state.symptoms.lastFetch.logs;
  
  const missingData = [];
  const staleData = [];
  
  userIds.forEach(userId => {
    dates.forEach(date => {
      const hasData = logs[userId]?.[date];
      const fetchTime = lastFetch[userId]?.[date];
      const isStale = !selectIsCacheValid(fetchTime);
      
      if (!hasData) {
        missingData.push({ userId, date });
      } else if (isStale) {
        staleData.push({ userId, date });
      }
    });
  });
  
  return { missingData, staleData, needsRefresh: missingData.length > 0 || staleData.length > 0 };
};

// NEW: Check which users need dates to be fetched
export const selectUsersNeedingDatesFetch = (state, userIds) => {
  const userDates = selectUserDates(state);
  const lastFetch = state.symptoms.lastFetch.dates;
  
  return userIds.filter(userId => {
    const hasData = userDates[userId];
    const fetchTime = lastFetch[userId];
    const isStale = !selectIsCacheValid(fetchTime);
    
    return !hasData || isStale;
  });
};

export const { 
  clearError, 
  invalidateLogsCache, 
  invalidateDatesCache, 
  updateMultipleEntries 
} = symptomsSlice.actions;

export default symptomsSlice.reducer;