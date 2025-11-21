import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Fetch all posts
export const fetchPosts = createAsyncThunk("posts/fetchPosts", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get("/api/posts");
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Fetch a single post by ID
export const fetchPostById = createAsyncThunk("posts/fetchPostById", async (postId, { rejectWithValue }) => {
  try {
    const response = await axios.get(`/api/posts/${postId}`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Add a new post
export const addPost = createAsyncThunk("posts/addPost", async (post, { rejectWithValue }) => {
  try {
    const response = await axios.post("/api/posts", post);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Update a post
export const updatePost = createAsyncThunk("posts/updatePost", async ({ id, title, content }, { rejectWithValue }) => {
  try {
    const response = await axios.put(`/api/posts/${id}`, { title, content });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Delete a post
export const deletePost = createAsyncThunk("posts/deletePost", async (postId, { rejectWithValue }) => {
  try {
    await axios.delete(`/api/posts/${postId}`);
    return postId;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

const postsSlice = createSlice({
  name: "posts",
  initialState: {
    posts: [],
    post: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = Array.isArray(action.payload) ? action.payload : []; 
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.post = action.payload;
      })
      .addCase(addPost.fulfilled, (state, action) => {
        state.posts.push(action.payload);
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.posts = state.posts.map((post) => (post.id === action.payload.id ? action.payload : post));
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter((post) => post.id !== action.payload);
      });
  },
});

export default postsSlice.reducer;
