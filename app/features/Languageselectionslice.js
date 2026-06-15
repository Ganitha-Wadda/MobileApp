// app/features/languageSelectionSlice.js
import { createSlice } from "@reduxjs/toolkit";

const languageSelectionSlice = createSlice({
  name: "languageSelection",

  initialState: {
    language: "si", // default Sinhala
  },

  reducers: {
    setLanguage: (state, action) => {
      const lang = String(action.payload || "si")
        .toLowerCase()
        .trim();
      state.language = ["en", "si"].includes(lang) ? lang : "si";
    },
  },
});

export const { setLanguage } = languageSelectionSlice.actions;

export default languageSelectionSlice.reducer;