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
import { enrollmentApi } from "./enrollmentApi";
import { languageApi } from "./Languageapi";
import { gradeApi } from "./gradeApi";
import { recordingApi } from "./recordingApi";
import { shortzApi } from "./Shortzapi";
import { paperApi } from "./paperApi";

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

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  languageSelection: languageSelectionReducer,
  [authApi.reducerPath]: authApi.reducer,
  [liveApi.reducerPath]: liveApi.reducer,
  [enrollmentApi.reducerPath]: enrollmentApi.reducer,
  [languageApi.reducerPath]: languageApi.reducer,
  [gradeApi.reducerPath]: gradeApi.reducer,
  [recordingApi.reducerPath]: recordingApi.reducer,
  [shortzApi.reducerPath]: shortzApi.reducer,
  [paperApi.reducerPath]: paperApi.reducer,
});

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
      .concat(enrollmentApi.middleware)
      .concat(languageApi.middleware)
      .concat(gradeApi.middleware)
      .concat(recordingApi.middleware)
      .concat(shortzApi.middleware)
      .concat(paperApi.middleware),
});

export const persistor = persistStore(store);
export default store;
