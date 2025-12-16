import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  accessToken: localStorage.getItem("accessToken"),
  isAuthenticated: !!localStorage.getItem("accessToken"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAccessToken(state, action) {
      state.accessToken = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem("accessToken", action.payload);
    },
    logout(state) {
      state.accessToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem("accessToken");
    },
  },
});

export const { setAccessToken, logout } = authSlice.actions;
export default authSlice.reducer;
