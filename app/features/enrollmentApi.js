import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../api/api";

export const enrollmentApi = createApi({
  reducerPath: "enrollmentApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api/enrollment`,

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

  tagTypes: ["Enrollment"],

  endpoints: (builder) => ({
    // ── Student ───────────────────────────────────────────────────────────
    getMyEnrollmentStatus: builder.query({
      query: ()     => "/my-status",
      providesTags: ["Enrollment"],
    }),

    submitEnrollment: builder.mutation({
      query: (body) => ({ url: "/submit", method: "POST", body }),
      invalidatesTags: ["Enrollment"],
    }),

    // ── Admin ─────────────────────────────────────────────────────────────
    getAllEnrollments: builder.query({
      query: ()   => "/",
      providesTags: ["Enrollment"],
    }),

    approveEnrollment: builder.mutation({
      query: (id) => ({ url: `/${id}/approve`, method: "PUT" }),
      invalidatesTags: ["Enrollment"],
    }),

    rejectEnrollment: builder.mutation({
      query: (id) => ({ url: `/${id}/reject`,  method: "PUT" }),
      invalidatesTags: ["Enrollment"],
    }),

    deleteEnrollment: builder.mutation({
      query: (id) => ({ url: `/${id}`,         method: "DELETE" }),
      invalidatesTags: ["Enrollment"],
    }),
  }),
});

export const {
  useGetMyEnrollmentStatusQuery,
  useSubmitEnrollmentMutation,
  useGetAllEnrollmentsQuery,
  useApproveEnrollmentMutation,
  useRejectEnrollmentMutation,
  useDeleteEnrollmentMutation,
} = enrollmentApi;

// ── Convenience hook used in Live / Recording / ShortVideo screens ────────
export function useEnrollmentStatus() {
  const result = useGetMyEnrollmentStatusQuery(undefined, {
    // Auto-refresh every 30 s so status update after admin approval is reflected
    pollingInterval: 30_000,
  });

  const status = result.data?.status ?? "not_enrolled";

  return {
    ...result,
    status,
    isApproved:   status === "approved",
    isPending:    status === "pending",
    isRejected:   status === "rejected",
    isNotEnrolled: status === "not_enrolled",
  };
}