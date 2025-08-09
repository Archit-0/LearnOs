import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,        // Stores user details
  token: null,       // JWT token
  isAuthenticated: false
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    updateUserDetails: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    }
  }
});

export const { loginSuccess, logout, updateUserDetails } = authSlice.actions;
export default authSlice.reducer;
