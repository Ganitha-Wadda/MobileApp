import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: null,
  accessToken: null,
  user: null,

  pendingPhone: "",
  selectedLevel: null,
  selectedGrade: null,
  selectedStream: null,
  signupDistrict: "",
  isForgotPasswordFlow: false,
  forgotPasswordPhone: "",
};

const readTokenFromValue = (value) => {
  if (!value) return null;

  if (typeof value === "string") {
    const clean = value.trim();
    return clean || null;
  }

  if (typeof value === "object") {
    return (
      readTokenFromValue(value.token) ||
      readTokenFromValue(value.accessToken) ||
      readTokenFromValue(value.jwt) ||
      readTokenFromValue(value.authToken) ||
      readTokenFromValue(value?.data?.token) ||
      readTokenFromValue(value?.data?.accessToken) ||
      readTokenFromValue(value?.data?.jwt) ||
      readTokenFromValue(value?.user?.token) ||
      readTokenFromValue(value?.user?.accessToken) ||
      null
    );
  }

  return null;
};

const readUserFromValue = (value) => {
  if (!value || typeof value !== "object") return null;

  return (
    value.user ||
    value.profile ||
    value.currentUser ||
    value.data?.user ||
    value.data?.profile ||
    null
  );
};

export const selectAuthToken = (state) =>
  readTokenFromValue(state?.auth?.token) ||
  readTokenFromValue(state?.auth?.accessToken) ||
  readTokenFromValue(state?.auth?.user) ||
  readTokenFromValue(state?.user?.token) ||
  readTokenFromValue(state?.user?.accessToken) ||
  readTokenFromValue(state?.user?.user) ||
  readTokenFromValue(state?.user?.profile) ||
  readTokenFromValue(state?.user?.data) ||
  null;

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (state, action) => {
      const token = readTokenFromValue(action.payload);

      if (token) {
        state.token = token;
        state.accessToken = token;
      }
    },

    setCredentials: (state, action) => {
      const payload = action.payload || {};
      const token = readTokenFromValue(payload);
      const user = readUserFromValue(payload);

      // Important: never clear a valid token just because one response only returns user.
      if (token) {
        state.token = token;
        state.accessToken = token;
      }

      if (user) {
        state.user = user;
      }
    },

    clearAuth: (state) => {
      state.token = null;
      state.accessToken = null;
      state.user = null;
      state.pendingPhone = "";
      state.selectedLevel = null;
      state.selectedGrade = null;
      state.selectedStream = null;
      state.signupDistrict = "";
      state.isForgotPasswordFlow = false;
      state.forgotPasswordPhone = "";
    },

    setPendingIdentity: (state, action) => {
      const { phone } = action.payload || {};
      state.pendingPhone = phone || "";
    },

    setGradeSelection: (state, action) => {
      const { level, grade, stream } = action.payload || {};
      state.selectedLevel = level ?? null;
      state.selectedGrade = grade ?? null;
      state.selectedStream = stream ?? null;
    },

    clearGradeSelection: (state) => {
      state.selectedLevel = null;
      state.selectedGrade = null;
      state.selectedStream = null;
    },

    setSignupDistrict: (state, action) => {
      state.signupDistrict = String(action.payload || "");
    },

    setForgotPasswordFlow: (state, action) => {
      state.isForgotPasswordFlow = true;
      state.forgotPasswordPhone = action.payload || "";
    },

    clearForgotPasswordFlow: (state) => {
      state.isForgotPasswordFlow = false;
      state.forgotPasswordPhone = "";
    },
  },
});

export const {
  setToken,
  setCredentials,
  clearAuth,
  setPendingIdentity,
  setGradeSelection,
  clearGradeSelection,
  setSignupDistrict,
  setForgotPasswordFlow,
  clearForgotPasswordFlow,
} = authSlice.actions;

export default authSlice.reducer;