import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../api/api";

const rawApiBaseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  process.env.EXPO_PUBLIC_API_URL ||
  BASE_URL ||
  "http://localhost:8080";

const ensureApiBaseUrl = (value = "") => {
  const clean = String(value || "http://localhost:8080").replace(/\/+$/, "");

  // Your backend routes are mounted in server.js like:
  // app.use("/api/recording", recordingRouter)
  // So even if .env has http://localhost:8080, app must call http://localhost:8080/api
  if (/\/api$/i.test(clean)) return clean;

  // Prevent wrong URLs like http://localhost:8080/recording/demo
  // or http://localhost:8080/api/recording/recording/demo.
  const withoutRecording = clean.replace(/\/api\/recording$/i, "/api").replace(/\/recording$/i, "");

  if (/\/api$/i.test(withoutRecording)) return withoutRecording;

  return `${withoutRecording}/api`;
};

const API_BASE_URL = ensureApiBaseUrl(rawApiBaseUrl);

const getTokenFromState = (state) =>
  state?.auth?.token ??
  state?.auth?.accessToken ??
  state?.user?.token ??
  null;

const buildQueryString = (params = {}) => {
  if (!params || typeof params !== "object") return "";

  const query = new URLSearchParams();

  const grade =
    params?.grade ??
    params?.selectedGrade ??
    params?.userGrade ??
    "";

  const batchnumber =
    params?.batchnumber ??
    params?.batchNumber ??
    params?.batchNo ??
    params?.batch ??
    params?.batch_number ??
    "";

  const userId =
    params?.userId ??
    params?._id ??
    params?.id ??
    "";

  if (grade) query.append("grade", String(grade));
  if (batchnumber) query.append("batchnumber", String(batchnumber));
  if (userId) query.append("userId", String(userId));

  const qs = query.toString();

  return qs ? `?${qs}` : "";
};

export const recordingApi = createApi({
  reducerPath: "recordingApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = getTokenFromState(getState());

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      headers.set("Content-Type", "application/json");

      return headers;
    },
  }),
  tagTypes: ["Recording"],
  endpoints: (builder) => ({
    // Approved student recordings. Backend uses logged-in user's approved enrollment.
    getMyRecordings: builder.query({
      query: (params) => {
        const qs = buildQueryString(params);
        return `/recording/my-recordings${qs}`;
      },
      providesTags: [{ type: "Recording", id: "MY_RECORDINGS" }],
    }),

    // Public demo lesson. Works even when student is not enrolled.
    getDemoRecordings: builder.query({
      query: () => "/recording/demo",
      providesTags: [{ type: "Recording", id: "DEMO" }],
    }),

    getRecordingsByGradeAndBatch: builder.query({
      query: (params = {}) => {
        const qs = buildQueryString(params);
        return `/recording/by-grade-batch${qs}`;
      },
      providesTags: ["Recording"],
    }),

    getAllRecordings: builder.query({
      query: () => "/recording",
      providesTags: ["Recording"],
    }),

    getRecordingById: builder.query({
      query: (id) => `/recording/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Recording", id }],
    }),
  }),
});

export const {
  useGetMyRecordingsQuery,
  useGetDemoRecordingsQuery,
  useGetRecordingsByGradeAndBatchQuery,
  useGetAllRecordingsQuery,
  useGetRecordingByIdQuery,
} = recordingApi;
