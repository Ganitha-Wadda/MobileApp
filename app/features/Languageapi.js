import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../api/api";

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
    getLanguage: builder.query({
      query: () => ({
        url: "/language",
        method: "GET",
      }),
      providesTags: ["Language"],
    }),

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

export const { useGetLanguageQuery, useUpdateLanguageMutation } = languageApi;