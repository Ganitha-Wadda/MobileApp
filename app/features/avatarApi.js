import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../api/api";

export const avatarApi = createApi({
  reducerPath: "avatarApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api/avatar`,

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

  tagTypes: ["Avatar"],

  endpoints: (builder) => ({
    getMyAvatar: builder.query({
      query: () => ({
        url: "/me",
        method: "GET",
      }),
      providesTags: ["Avatar"],
    }),

    saveMyAvatar: builder.mutation({
      query: (config) => ({
        url: "/me",
        method: "PUT",
        body: { config },
      }),
      invalidatesTags: ["Avatar"],
    }),
  }),
});

export const { useGetMyAvatarQuery, useSaveMyAvatarMutation } = avatarApi;
