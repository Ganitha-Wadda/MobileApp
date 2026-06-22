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

import authReducer from "./authSlice";
import userReducer from "./userSlice";
import languageSelectionReducer from "./Languageselectionslice";

import { authApi } from "./authApi";
import { liveApi } from "./Liveapi";
import { attemptApi } from "./attemptApi";
import { enrollmentApi } from "./enrollmentApi";
import { languageApi } from "./Languageapi";
import { gradeApi } from "./gradeApi";
import { classApi } from "./classApi";
import { recordingApi } from "./recordingApi";
import { shortzApi } from "./Shortzapi";
import { paperApi } from "./paperApi";
import { paperResultApi } from "./paperResultApi";
import { shortCoinsCountApi } from "./shortcoinscountApi";
import { userTotalcoinscountApi } from "./userTotalcoinscountApi";
import { rankApi } from "./rankApi";

// ─────────────────────────────────────────────────────────────────────────────
// LOGOUT action type — dispatching this resets ALL reducers to their
// initial state without needing to know individual slice action names.
// Import and dispatch this from any screen to perform a full local logout.
//
// Usage:
//   import { LOGOUT_ACTION } from "./store";
//   dispatch(LOGOUT_ACTION);
// ─────────────────────────────────────────────────────────────────────────────
export const LOGOUT_ACTION = { type: "LOGOUT" };

const authTransform = createTransform(
  (inboundState) => ({
    token: inboundState?.token || null,
    pendingPhone: "",
    selectedLevel: null,
    selectedGrade: null,
    selectedStream: null,
    signupDistrict: "",
  }),
  (outboundState) => ({
    token: outboundState?.token || null,
    pendingPhone: "",
    selectedLevel: null,
    selectedGrade: null,
    selectedStream: null,
    signupDistrict: "",
  }),
  { whitelist: ["auth"] }
);

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["auth", "user", "languageSelection"],
  transforms: [authTransform],
};

// ── Step 1: combine all reducers ─────────────────────────────────────────────
const appReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  languageSelection: languageSelectionReducer,

  [authApi.reducerPath]: authApi.reducer,
  [liveApi.reducerPath]: liveApi.reducer,
  [attemptApi.reducerPath]: attemptApi.reducer,
  [enrollmentApi.reducerPath]: enrollmentApi.reducer,
  [languageApi.reducerPath]: languageApi.reducer,
  [gradeApi.reducerPath]: gradeApi.reducer,
  [classApi.reducerPath]: classApi.reducer,
  [recordingApi.reducerPath]: recordingApi.reducer,
  [shortzApi.reducerPath]: shortzApi.reducer,
  [paperApi.reducerPath]: paperApi.reducer,
  [paperResultApi.reducerPath]: paperResultApi.reducer,
  [shortCoinsCountApi.reducerPath]: shortCoinsCountApi.reducer,
  [userTotalcoinscountApi.reducerPath]: userTotalcoinscountApi.reducer,
  [rankApi.reducerPath]: rankApi.reducer,
});

// ── Step 2: wrap with LOGOUT handler ─────────────────────────────────────────
// When LOGOUT is dispatched, every reducer receives (undefined, action)
// which makes each one return its own initial state — a clean full reset.
const rootReducer = (state, action) => {
  if (action.type === "LOGOUT") {
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};

// ── Step 3: persist the wrapped root reducer ─────────────────────────────────
const persistedReducer = persistReducer(persistConfig, rootReducer);

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
      .concat(attemptApi.middleware)
      .concat(enrollmentApi.middleware)
      .concat(languageApi.middleware)
      .concat(gradeApi.middleware)
      .concat(classApi.middleware)
      .concat(recordingApi.middleware)
      .concat(shortzApi.middleware)
      .concat(paperApi.middleware)
      .concat(paperResultApi.middleware)
      .concat(shortCoinsCountApi.middleware)
      .concat(userTotalcoinscountApi.middleware)
      .concat(rankApi.middleware),
});

export const persistor = persistStore(store);
export default store;