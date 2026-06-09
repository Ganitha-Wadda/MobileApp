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
import { authApi }  from "./authApi";
import { liveApi }  from "./Liveapi";
// ── Auth persistence transform (unchanged) ─────────────────────────────────
const authTransform = createTransform(
  (inboundState) => ({
    token:           inboundState?.token || null,
    pendingPhone:    "",
    selectedLevel:   null,
    selectedGrade:   null,
    selectedStream:  null,
    signupDistrict:  "",
  }),
  (outboundState) => ({
    token:           outboundState?.token || null,
    pendingPhone:    "",
    selectedLevel:   null,
    selectedGrade:   null,
    selectedStream:  null,
    signupDistrict:  "",
  }),
  { whitelist: ["auth"] }
);

// ── Persist config (unchanged) ─────────────────────────────────────────────
const persistConfig = {
  key:        "root",
  storage:    AsyncStorage,
  whitelist:  ["auth", "user"],   // RTK Query caches are intentionally excluded
  transforms: [authTransform],
};

// ── Root reducer — liveApi slice added ─────────────────────────────────────
const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  [authApi.reducerPath]: authApi.reducer,
  [liveApi.reducerPath]: liveApi.reducer,   // ← NEW
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

// ── Store — liveApi middleware added ───────────────────────────────────────
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    })
      .concat(authApi.middleware)
      .concat(liveApi.middleware),  // ← NEW
});

export const persistor = persistStore(store);
export default store;