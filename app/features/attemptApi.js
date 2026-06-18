import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../api/api";

export const attemptApi = createApi({
  reducerPath: "attemptApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api/attempt`,

    prepareHeaders: (headers, { getState }) => {
      const token = getState()?.auth?.token;

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      headers.set("Content-Type", "application/json");

      return headers;
    },

    credentials: "include",
  }),

  tagTypes: ["Attempt"],

  endpoints: (builder) => ({
    createLiveClassAttempt: builder.mutation({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Attempt"],
    }),

    getMyLiveClassAttempts: builder.query({
      query: () => ({
        url: "/my",
        method: "GET",
      }),
      providesTags: ["Attempt"],
    }),
  }),
});

export const {
  useCreateLiveClassAttemptMutation,
  useGetMyLiveClassAttemptsQuery,
} = attemptApi;