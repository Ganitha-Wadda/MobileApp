import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../api/api";

export const gradeApi = createApi({
  reducerPath: "gradeApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api/grade`,

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

  tagTypes: ["Grade"],

  endpoints: (builder) => ({
    // GET /api/grade?isActive=true
    // Profile dropdown must use this endpoint so it shows backend available grades only.
    getActiveGrades: builder.query({
      query: () => ({
        url: "/?isActive=true",
        method: "GET",
      }),
      transformResponse: (response) => {
        const grades = response?.grades || response?.data || [];
        return grades
          .filter((grade) => grade?.isActive !== false)
          .sort((a, b) => Number(a?.gradeId || 0) - Number(b?.gradeId || 0));
      },
      providesTags: ["Grade"],
    }),
  }),
});

export const { useGetActiveGradesQuery } = gradeApi;
