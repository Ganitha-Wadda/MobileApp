import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../api/api";

const getToken = (state) =>
  state?.auth?.token ??
  state?.auth?.accessToken ??
  state?.user?.token ??
  null;

const normalizeStatus = (value) =>
  String(value ?? "not_enrolled").trim().toLowerCase();

const extractGrade = (payload = {}) => {
  const enrollment = payload?.enrollment ?? {};
  const value =
    payload?.enrolledGrade ??
    payload?.grade ??
    enrollment?.grade?.gradeId ??
    enrollment?.grade?.grade ??
    enrollment?.gradeId ??
    enrollment?.grade ??
    "";

  if (typeof value === "number") return String(value);
  if (typeof value === "string") {
    const match = value.match(/\d+/);
    return match?.[0] ?? value.trim();
  }

  return "";
};

const extractBatchNumber = (payload = {}) => {
  const enrollment = payload?.enrollment ?? {};
  return String(
    payload?.enrolledBatchNumber ??
      payload?.batchnumber ??
      payload?.batchNumber ??
      payload?.batchNo ??
      payload?.batch ??
      payload?.batch_number ??
      enrollment?.batchnumber ??
      enrollment?.batchNumber ??
      enrollment?.batchNo ??
      enrollment?.batch ??
      enrollment?.batch_number ??
      ""
  ).trim();
};

export const enrollmentApi = createApi({
  reducerPath: "enrollmentApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api/enrollment`,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = getToken(getState());
      if (token) headers.set("Authorization", `Bearer ${token}`);
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),

  tagTypes: ["Enrollment", "EnrollmentBatches"],

  endpoints: (builder) => ({
    getMyEnrollmentStatus: builder.query({
      query: () => "/my-status",
      providesTags: [{ type: "Enrollment", id: "ME" }],
    }),

    getAvailableBatchesByGrade: builder.query({
      query: (grade) => `/batches/${grade}`,
      providesTags: (_result, _error, grade) => [
        { type: "EnrollmentBatches", id: String(grade || "none") },
      ],
    }),

    submitEnrollment: builder.mutation({
      query: (body) => ({
        url: "/submit",
        method: "POST",
        body: {
          ...body,
          grade: Number(body?.grade),
          batchnumber: String(body?.batchnumber ?? body?.batchNumber ?? "").trim(),
        },
      }),
      invalidatesTags: [{ type: "Enrollment", id: "ME" }],
    }),

    getAllEnrollments: builder.query({
      query: () => "/",
      providesTags: ["Enrollment"],
    }),

    approveEnrollment: builder.mutation({
      query: (id) => ({ url: `/${id}/approve`, method: "PUT" }),
      invalidatesTags: ["Enrollment", { type: "Enrollment", id: "ME" }],
    }),

    rejectEnrollment: builder.mutation({
      query: (id) => ({ url: `/${id}/reject`, method: "PUT" }),
      invalidatesTags: ["Enrollment", { type: "Enrollment", id: "ME" }],
    }),

    deleteEnrollment: builder.mutation({
      query: (id) => ({ url: `/${id}`, method: "DELETE" }),
      invalidatesTags: ["Enrollment", { type: "Enrollment", id: "ME" }],
    }),
  }),
});

export const {
  useGetMyEnrollmentStatusQuery,
  useGetAvailableBatchesByGradeQuery,
  useSubmitEnrollmentMutation,
  useGetAllEnrollmentsQuery,
  useApproveEnrollmentMutation,
  useRejectEnrollmentMutation,
  useDeleteEnrollmentMutation,
} = enrollmentApi;

export function useEnrollmentStatus(options = {}) {
  const result = useGetMyEnrollmentStatusQuery(undefined, {
    pollingInterval: 30_000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
    ...options,
  });

  const data = result.data ?? {};
  const status = normalizeStatus(data?.status);
  const unlocked = Boolean(data?.unlocked || status === "approved");
  const enrolledGrade = extractGrade(data);
  const enrolledBatchNumber = extractBatchNumber(data);

  return {
    ...result,
    status,
    enrollment: data?.enrollment ?? null,
    unlocked,
    enrolledGrade,
    enrolledBatchNumber,
    batchnumber: enrolledBatchNumber,
    isApproved: unlocked,
    canAccessLive: Boolean(data?.canAccessLive || unlocked),
    canAccessRecording: Boolean(data?.canAccessRecording || unlocked),
    canAccessShortz: Boolean(data?.canAccessShortz || unlocked),
    isPending: status === "pending",
    isRejected: status === "rejected",
    isNotEnrolled: status === "not_enrolled",
  };
}
