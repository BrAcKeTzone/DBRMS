import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Fetch all users
export const fetchUsers = createAsyncThunk("dashboard/fetchUsers", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get("/api/users");
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Delete a user
export const deleteUser = createAsyncThunk("dashboard/deleteUser", async (userId, { rejectWithValue }) => {
  try {
    await axios.delete(`/api/users/${userId}`);
    return userId;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    users: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((user) => user.id !== action.payload);
      });
  },
});

export default dashboardSlice.reducer;
