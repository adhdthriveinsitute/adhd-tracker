import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Axios } from '@src/api';

// Async thunk to fetch symptoms
export const fetchSymptoms = createAsyncThunk(
  'symptoms/fetchSymptoms',
  async (_, { rejectWithValue }) => {
    try {
      const res = await Axios.get('/symptoms');
      console.log("symptoms from backend", res.data.symptoms)
      return res.data.symptoms || [];
    } catch (error) {
      const message = error?.response?.data?.error || 'Failed to fetch symptoms.';
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  symptoms: [],
  loading: false,
  error: null,
};

const symptomSlice = createSlice({
  name: 'symptoms',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSymptoms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSymptoms.fulfilled, (state, action) => {
        state.loading = false;
        state.symptoms = action.payload;
      })
      .addCase(fetchSymptoms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default symptomSlice.reducer;
