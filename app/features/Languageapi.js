// app/features/languageApi.js

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../api/api"; // adjust path if needed

export const languageApi = createApi({
  reducerPath: "languageApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api`,

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

  tagTypes: ["Language"],

  endpoints: (builder) => ({
    // GET /api/language
    getLanguage: builder.query({
      query: () => "/language",
      providesTags: ["Language"],
    }),

    // PUT /api/language
    updateLanguage: builder.mutation({
      query: (language) => ({
        url: "/language",
        method: "PUT",
        body: { language },
      }),
      invalidatesTags: ["Language"],
    }),
  }),
});

export const {
  useGetLanguageQuery,
  useUpdateLanguageMutation,
} = languageApi;