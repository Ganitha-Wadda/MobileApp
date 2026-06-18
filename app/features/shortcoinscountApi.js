import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../api/api";

const getToken = (state) =>
  state?.auth?.token ??
  state?.auth?.accessToken ??
  state?.user?.token ??
  null;

const getList = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.shortlessons)) return response.shortlessons;
  if (Array.isArray(response?.shortsublessons)) return response.shortsublessons;
  return [];
};

export const shortCoinsCountApi = createApi({
  reducerPath: "shortCoinsCountApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api/shortcoinscount`,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = getToken(getState());
      if (token) headers.set("Authorization", `Bearer ${token}`);
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),

  tagTypes: ["ShortCoins", "ShortLessonOverview", "ShortSubLessonOverview"],

  endpoints: (builder) => ({
    getMyTotalShortCoins: builder.query({
      query: () => ({ url: "/my-total", method: "GET" }),
      providesTags: [{ type: "ShortCoins", id: "TOTAL" }],
    }),

    getShortLessonOverview: builder.query({
      query: () => ({ url: "/lesson-overview", method: "GET" }),
      transformResponse: getList,
      providesTags: ["ShortLessonOverview", { type: "ShortCoins", id: "TOTAL" }],
    }),

    getShortSubLessonOverview: builder.query({
      query: (shortLessonId) => ({
        url: `/sublesson-overview/${shortLessonId}`,
        method: "GET",
      }),
      transformResponse: getList,
      providesTags: (_result, _error, shortLessonId) => [
        { type: "ShortSubLessonOverview", id: String(shortLessonId || "none") },
        { type: "ShortCoins", id: "TOTAL" },
      ],
    }),

    markShortVideoWatched: builder.mutation({
      query: (body) => ({
        url: "/video-watched",
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, body) => [
        { type: "ShortSubLessonOverview", id: String(body?.shortLessonId || "none") },
      ],
    }),

    submitShortActivityAttempt: builder.mutation({
      query: (body) => ({
        url: "/activity-attempt",
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, body) => [
        { type: "ShortCoins", id: "TOTAL" },
        { type: "ShortSubLessonOverview", id: String(body?.shortLessonId || "none") },
        "ShortLessonOverview",
      ],
    }),
  }),
});

export const {
  useGetMyTotalShortCoinsQuery,
  useGetShortLessonOverviewQuery,
  useGetShortSubLessonOverviewQuery,
  useMarkShortVideoWatchedMutation,
  useSubmitShortActivityAttemptMutation,
} = shortCoinsCountApi;
