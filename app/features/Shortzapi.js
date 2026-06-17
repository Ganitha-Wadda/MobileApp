import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../api/api";

const getList = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.questions)) return response.questions;
  if (Array.isArray(response?.activities)) return response.activities;
  if (Array.isArray(response?.paper)) return response.paper;
  if (Array.isArray(response?.shortlessons)) return response.shortlessons;
  if (Array.isArray(response?.shortsublessons)) return response.shortsublessons;
  return [];
};

export const shortzApi = createApi({
  reducerPath: "shortzApi",

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

  tagTypes: [
    "ShortLessons",
    "MyShortLessons",
    "ShortSubLessons",
    "RelatedShortSubLessons",
    "Activities",
  ],

  endpoints: (builder) => ({
    getMyShortLessons: builder.query({
      query: () => ({
        url: "/shortlesson/myshortlessons",
        method: "GET",
      }),
      transformResponse: getList,
      providesTags: ["MyShortLessons"],
    }),

    getAllShortLessons: builder.query({
      query: (gradeId) => ({
        url: "/shortlesson/getallshortlesson",
        method: "GET",
        params: gradeId ? { gradeId } : undefined,
      }),
      transformResponse: getList,
      providesTags: ["ShortLessons"],
    }),

    getShortLessonById: builder.query({
      query: (id) => ({
        url: `/shortlesson/getshortlesson/${id}`,
        method: "GET",
      }),
      providesTags: ["ShortLessons"],
    }),

    createShortLesson: builder.mutation({
      query: (body) => ({
        url: "/shortlesson/createshortlesson",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ShortLessons", "MyShortLessons"],
    }),

    updateShortLesson: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/shortlesson/updateshortlesson/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["ShortLessons", "MyShortLessons"],
    }),

    deleteShortLesson: builder.mutation({
      query: (id) => ({
        url: `/shortlesson/deleteshortlesson/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ShortLessons", "MyShortLessons"],
    }),

    getShortSubLessonsByShortLessonId: builder.query({
      query: (shortLessonId) => ({
        url: `/shortsublesson/getbyshortlesson/${shortLessonId}`,
        method: "GET",
        params: {
          status: "published",
        },
      }),
      transformResponse: getList,
      providesTags: ["RelatedShortSubLessons"],
    }),

    getAllShortSubLessons: builder.query({
      query: () => ({
        url: "/shortsublesson/getallshortsublesson",
        method: "GET",
      }),
      transformResponse: getList,
      providesTags: ["ShortSubLessons"],
    }),

    getShortSubLessonById: builder.query({
      query: (id) => ({
        url: `/shortsublesson/getshortsublesson/${id}`,
        method: "GET",
      }),
      providesTags: ["ShortSubLessons"],
    }),

    createShortSubLesson: builder.mutation({
      query: (body) => ({
        url: "/shortsublesson/createshortsublesson",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ShortSubLessons", "RelatedShortSubLessons"],
    }),

    updateShortSubLesson: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/shortsublesson/updateshortsublesson/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["ShortSubLessons", "RelatedShortSubLessons"],
    }),

    updateShortSubLessonStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/shortsublesson/updatestatus/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["ShortSubLessons", "RelatedShortSubLessons"],
    }),

    deleteShortSubLesson: builder.mutation({
      query: (id) => ({
        url: `/shortsublesson/deleteshortsublesson/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ShortSubLessons", "RelatedShortSubLessons"],
    }),

    getActivityPaper: builder.query({
      query: ({ lessonId, subLessonId }) => ({
        url: `/activity/paper/${lessonId}/${subLessonId}`,
        method: "GET",
      }),
      transformResponse: getList,
      providesTags: (_result, _error, arg) => [
        { type: "Activities", id: `${arg?.lessonId || ""}_${arg?.subLessonId || ""}` },
      ],
    }),
  }),
});

export const {
  useGetMyShortLessonsQuery,
  useGetAllShortLessonsQuery,
  useGetShortLessonByIdQuery,
  useCreateShortLessonMutation,
  useUpdateShortLessonMutation,
  useDeleteShortLessonMutation,

  useGetShortSubLessonsByShortLessonIdQuery,
  useGetAllShortSubLessonsQuery,
  useGetShortSubLessonByIdQuery,
  useCreateShortSubLessonMutation,
  useUpdateShortSubLessonMutation,
  useUpdateShortSubLessonStatusMutation,
  useDeleteShortSubLessonMutation,

  useGetActivityPaperQuery,
} = shortzApi;
