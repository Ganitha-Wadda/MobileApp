import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../api/api";

const getToken = (state) =>
  state?.auth?.token ??
  state?.auth?.accessToken ??
  state?.user?.token ??
  null;

export const paperResultApi = createApi({
  reducerPath: "paperResultApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api/paper-results`,
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

  tagTypes: ["PaperResult", "MyPaperResults"],

  endpoints: (builder) => ({
    getMyPaperResults: builder.query({
      query: ({ paperType = "daily paper", page = 1, limit = 10 } = {}) => ({
        url: "/my-results",
        method: "GET",
        params: {
          paperType,
          page,
          limit,
        },
      }),
      providesTags: (_result, _error, arg) => [
        {
          type: "MyPaperResults",
          id: `${arg?.paperType || "all"}-${arg?.page || 1}`,
        },
      ],
    }),

    startOrResumePaperAttempt: builder.mutation({
      query: ({ paperId }) => ({
        url: "/start-or-resume",
        method: "POST",
        body: {
          paperId,
        },
      }),
      invalidatesTags: ["PaperResult", "MyPaperResults"],
    }),

    savePaperQuestionAnswer: builder.mutation({
      query: (body) => ({
        url: "/answer",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PaperResult"],
    }),

    finishPaperAttempt: builder.mutation({
      query: ({ attemptId, expired = false }) => ({
        url: `/finish/${attemptId}`,
        method: "PATCH",
        body: {
          expired,
        },
      }),
      invalidatesTags: ["PaperResult", "MyPaperResults"],
    }),

    getPaperAttemptResult: builder.query({
      query: (attemptId) => ({
        url: `/attempt/${attemptId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, attemptId) => [
        {
          type: "PaperResult",
          id: attemptId,
        },
      ],
    }),

    getActivePaperAttemptByPaper: builder.query({
      query: (paperId) => ({
        url: `/paper/${paperId}/active`,
        method: "GET",
      }),
      providesTags: (_result, _error, paperId) => [
        {
          type: "PaperResult",
          id: `active-${paperId}`,
        },
      ],
    }),

    getLatestPaperResultByPaper: builder.query({
      query: (paperId) => ({
        url: `/paper/${paperId}/latest`,
        method: "GET",
      }),
      providesTags: (_result, _error, paperId) => [
        {
          type: "PaperResult",
          id: `latest-${paperId}`,
        },
      ],
    }),
  }),
});

export const {
  useGetMyPaperResultsQuery,
  useStartOrResumePaperAttemptMutation,
  useSavePaperQuestionAnswerMutation,
  useFinishPaperAttemptMutation,
  useGetPaperAttemptResultQuery,
  useGetActivePaperAttemptByPaperQuery,
  useGetLatestPaperResultByPaperQuery,
} = paperResultApi;