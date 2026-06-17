import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../api/api";

const buildQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

export const paperApi = createApi({
  reducerPath: "paperApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api/papers`,

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

  tagTypes: ["Papers", "MyGradePapers", "Paper"],

  endpoints: (builder) => ({
    // Public/published paper list. Use this only when you want a manual gradeId filter.
    getPapersByType: builder.query({
      query: ({ paperType, gradeId, payment } = {}) => ({
        url: `/getallpaper${buildQueryString({
          paperType,
          gradeId,
          payment,
        })}`,
        method: "GET",
      }),
      providesTags: ["Papers"],
    }),

    // Logged-in user paper list. Backend reads the grade from the JWT user.
    getMyGradePapersByType: builder.query({
      query: ({ paperType, payment } = {}) => ({
        url: `/mygradepapers${buildQueryString({
          paperType,
          payment,
        })}`,
        method: "GET",
      }),
      providesTags: ["MyGradePapers"],
    }),

    getPaperById: builder.query({
      query: (id) => ({
        url: `/getpaper/${id}`,
        method: "GET",
      }),
      providesTags: ["Paper"],
    }),

    getPaperFullDetails: builder.query({
      query: (id) => ({
        url: `/paperdetails/${id}`,
        method: "GET",
      }),
      providesTags: ["Paper"],
    }),
  }),
});

export const {
  useGetPapersByTypeQuery,
  useGetMyGradePapersByTypeQuery,
  useGetPaperByIdQuery,
  useGetPaperFullDetailsQuery,
} = paperApi;
