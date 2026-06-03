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
import { authApi } from "./authApi";

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
  whitelist: ["auth", "user"],
  transforms: [authTransform],
};

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  [authApi.reducerPath]: authApi.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(authApi.middleware),
});

export const persistor = persistStore(store);
export default store;