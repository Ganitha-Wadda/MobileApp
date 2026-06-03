import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: null,
  pendingPhone: "",
  selectedLevel: null,
  selectedGrade: null,
  selectedStream: null,
  signupDistrict: "",
  isForgotPasswordFlow: false,
  forgotPasswordPhone: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload || null;
    },
    clearAuth: (state) => {
      state.token = null;
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
  clearAuth,
  setPendingIdentity,
  setGradeSelection,
  clearGradeSelection,
  setSignupDistrict,
  setForgotPasswordFlow,
  clearForgotPasswordFlow,
} = authSlice.actions;

export default authSlice.reducer;