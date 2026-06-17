import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload || null;
    },
    clearUser: (state) => {
      state.user = null;
    },
    updateUserFields: (state, action) => {
      if (!state.user) state.user = {};
      state.user = { ...state.user, ...(action.payload || {}) };
    },
  },
});

export const { setUser, clearUser, updateUserFields } = userSlice.actions;
export default userSlice.reducer;
