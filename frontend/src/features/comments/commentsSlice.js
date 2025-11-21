import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Fetch comments for a specific post
export const fetchComments = createAsyncThunk("comments/fetchComments", async (postId, { rejectWithValue }) => {
  try {
    const response = await axios.get(`/api/posts/${postId}/comments`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Add a new comment
export const addComment = createAsyncThunk("comments/addComment", async ({ postId, text }, { rejectWithValue }) => {
  try {
    const response = await axios.post(`/api/posts/${postId}/comments`, { text });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Delete a comment
export const deleteComment = createAsyncThunk("comments/deleteComment", async (commentId, { rejectWithValue }) => {
  try {
    await axios.delete(`/api/comments/${commentId}`);
    return commentId;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

const commentsSlice = createSlice({
  name: "comments",
  initialState: {
    comments: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = action.payload;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.comments.push(action.payload);
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.comments = state.comments.filter((comment) => comment.id !== action.payload);
      });
  },
});

export default commentsSlice.reducer;
