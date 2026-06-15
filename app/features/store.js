// app/store.js
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  createTransform,
} from "redux-persist";

import authReducer             from "./authSlice";
import userReducer             from "./userSlice";
import languageSelectionReducer from "./Languageselectionslice";
import { authApi }             from "./authApi";
import { liveApi }             from "./Liveapi";
import { enrollmentApi }       from "./enrollmentApi";
import { languageApi }         from "./Languageapi";

// ── Auth persistence transform (unchanged) ─────────────────────────────────
const authTransform = createTransform(
  (inboundState) => ({
    token:          inboundState?.token || null,
    pendingPhone:   "",
    selectedLevel:  null,
    selectedGrade:  null,
    selectedStream: null,
    signupDistrict: "",
  }),
  (outboundState) => ({
    token:          outboundState?.token || null,
    pendingPhone:   "",
    selectedLevel:  null,
    selectedGrade:  null,
    selectedStream: null,
    signupDistrict: "",
  }),
  { whitelist: ["auth"] }
);

// ── Persist config ─────────────────────────────────────────────────────────
// languageSelection is persisted so the chosen language survives app restarts
const persistConfig = {
  key:        "root",
  storage:    AsyncStorage,
  whitelist:  ["auth", "user", "languageSelection"], // ← added languageSelection
  transforms: [authTransform],
};

// ── Root reducer ───────────────────────────────────────────────────────────
const rootReducer = combineReducers({
  auth:              authReducer,
  user:              userReducer,
  languageSelection: languageSelectionReducer,          // ← NEW
  [authApi.reducerPath]:       authApi.reducer,
  [liveApi.reducerPath]:       liveApi.reducer,
  [enrollmentApi.reducerPath]: enrollmentApi.reducer,
  [languageApi.reducerPath]:   languageApi.reducer,     // ← NEW
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

// ── Store ──────────────────────────────────────────────────────────────────
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    })
      .concat(authApi.middleware)
      .concat(liveApi.middleware)
      .concat(enrollmentApi.middleware)
      .concat(languageApi.middleware),                  // ← NEW
});

export const persistor = persistStore(store);
export default store;