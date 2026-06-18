import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../api/api";

export const rankApi = createApi({
  reducerPath: "rankApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api/rank`,

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

  tagTypes: ["Rank", "Leaderboard"],

  endpoints: (builder) => ({
    getMyRank: builder.query({
      query: () => ({
        url: "/my-rank",
        method: "GET",
      }),
      providesTags: ["Rank"],
    }),

    getMyGradeLeaderboard: builder.query({
      query: (limit = 10) => ({
        url: `/leaderboard?limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["Leaderboard", "Rank"],
    }),
  }),
});

export const {
  useGetMyRankQuery,
  useGetMyGradeLeaderboardQuery,
} = rankApi;