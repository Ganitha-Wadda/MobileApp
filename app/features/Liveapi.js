import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../api/api"; // adjust path to match your project

export const liveApi = createApi({
  reducerPath: "liveApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api/live`,

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

  // Cache tag types — used for automatic invalidation after mutations
  tagTypes: ["LiveClass"],

  endpoints: (builder) => ({
    // ── STUDENT-FACING ────────────────────────────────────────────────────
    // Returns only the live classes that are currently in the visibility
    // window for the logged-in student's grade:
    //   classDate − 3 h  ≤  now  ≤  classDate + 10 h
    getActiveLiveClasses: builder.query({
      query: (grade) => `/active/${grade}`,
      providesTags: ["LiveClass"],
    }),

    // ── ADMIN / GENERAL ───────────────────────────────────────────────────
    getAllLiveClasses: builder.query({
      query: () => "/",
      providesTags: ["LiveClass"],
    }),

    getLiveClassById: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: "LiveClass", id }],
    }),

    createLiveClass: builder.mutation({
      query: (body) => ({
        url:    "/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["LiveClass"],
    }),

    updateLiveClass: builder.mutation({
      query: ({ id, ...body }) => ({
        url:    `/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "LiveClass", id },
        "LiveClass",
      ],
    }),

    deleteLiveClass: builder.mutation({
      query: (id) => ({
        url:    `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["LiveClass"],
    }),
  }),
});

export const {
  // Student
  useGetActiveLiveClassesQuery,
  // Admin / general
  useGetAllLiveClassesQuery,
  useGetLiveClassByIdQuery,
  useCreateLiveClassMutation,
  useUpdateLiveClassMutation,
  useDeleteLiveClassMutation,
} = liveApi;