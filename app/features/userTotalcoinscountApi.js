import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../api/api";

const getToken = (state) =>
  state?.auth?.token ??
  state?.auth?.accessToken ??
  state?.user?.token ??
  null;

const numberValue = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const normalizeTotalCoinsResponse = (response = {}) => {
  const data = response?.data || response || {};

  return {
    ...response,
    ...data,

    totalCoins: numberValue(data.totalCoins ?? response.totalCoins),
    paperCoins: numberValue(data.paperCoins ?? response.paperCoins),
    activityCoins: numberValue(
      data.activityCoins ?? data.shortActivityCoins ?? response.activityCoins
    ),
    shortActivityCoins: numberValue(
      data.shortActivityCoins ?? data.activityCoins ?? response.shortActivityCoins
    ),
    totalShortCoins: numberValue(data.totalShortCoins ?? response.totalShortCoins),
    completedPapersCount: numberValue(
      data.completedPapersCount ??
        data.totalCompletedPapersCount ??
        response.completedPapersCount
    ),
    totalCompletedPapersCount: numberValue(
      data.totalCompletedPapersCount ??
        data.completedPapersCount ??
        response.totalCompletedPapersCount
    ),
    completedPapersByCategory:
      data.completedPapersByCategory ?? response.completedPapersByCategory ?? {},
    allPapersByCategory: data.allPapersByCategory ?? response.allPapersByCategory ?? {},
  };
};

export const userTotalcoinscountApi = createApi({
  reducerPath: "userTotalcoinscountApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api/userTotalcoinscount`,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = getToken(getState());

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),

  tagTypes: ["UserTotalCoinsCount"],

  endpoints: (builder) => ({
    getMyUserTotalCoinsCount: builder.query({
      query: () => ({
        url: "/login-user-total",
        method: "GET",
      }),
      transformResponse: normalizeTotalCoinsResponse,
      providesTags: [{ type: "UserTotalCoinsCount", id: "ME" }],
    }),
  }),
});

export const { useGetMyUserTotalCoinsCountQuery } = userTotalcoinscountApi;