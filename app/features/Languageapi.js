import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../api/api";

const normalizeLanguage = (value) => {
  const lang =
    typeof value === "object"
      ? value?.language
      : value;

  const cleanLang = String(lang || "")
    .toLowerCase()
    .trim();

  return ["en", "si"].includes(cleanLang) ? cleanLang : "si";
};

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
      query: (language) => {
        const cleanLang = normalizeLanguage(language);

        return {
          url: "/language",
          method: "PUT",
          body: { language: cleanLang },
        };
      },

      async onQueryStarted(language, { dispatch, queryFulfilled }) {
        const cleanLang = normalizeLanguage(language);

        const patch = dispatch(
          languageApi.util.updateQueryData("getLanguage", undefined, (draft) => {
            if (draft) {
              draft.language = cleanLang;
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },

      invalidatesTags: ["Language"],
    }),
  }),
});

export const { useGetLanguageQuery, useUpdateLanguageMutation } = languageApi;