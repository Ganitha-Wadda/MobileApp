import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { useSelector } from "react-redux";
import { BASE_URL } from "../api/api";
import { selectAuthToken } from "./authSlice";

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

const normalizeGradeParam = (grade) => {
  if (grade === null || grade === undefined) return "";

  if (typeof grade === "number") return String(grade);

  if (typeof grade === "string") {
    const match = grade.match(/\d+/);
    return match?.[0] ?? grade.trim();
  }

  if (typeof grade === "object") {
    const value = grade.gradeId ?? grade.grade ?? grade.gradeNumber ?? "";
    return normalizeGradeParam(value);
  }

  return "";
};

const normalizeBatchValue = (value) =>
  String(value ?? "")
    .trim()
    .replace(/\s+/g, " ");

const getClassBatchNumber = (item = {}) =>
  normalizeBatchValue(
    item?.batchnumber ??
      item?.batchNumber ??
      item?.batchNo ??
      item?.batch ??
      item?.batch_number ??
      ""
  );

const sortTextNumber = (a, b) =>
  String(a).localeCompare(String(b), undefined, {
    numeric: true,
    sensitivity: "base",
  });

const uniqueSortedBatches = (values = []) =>
  [...new Set(values.map(normalizeBatchValue).filter(Boolean))].sort(
    sortTextNumber
  );

const extractAvailableBatches = (payload = {}, grade = "") => {
  const gradeKey = normalizeGradeParam(grade);
  const root = payload?.data ?? payload;

  const directList = Array.isArray(payload)
    ? payload
    : Array.isArray(root)
    ? root
    : null;

  const batchesByGrade =
    root?.batchesByGrade ??
    root?.batchNumbersByGrade ??
    payload?.batchesByGrade ??
    payload?.batchNumbersByGrade ??
    {};

  const possibleLists = [
    directList,
    root?.batches,
    root?.batchnumbers,
    root?.batchNumbers,
    root?.availableBatches,
    root?.data?.batches,
    root?.data?.batchnumbers,
    root?.data?.batchNumbers,
    root?.data?.availableBatches,
    batchesByGrade?.[gradeKey],
    batchesByGrade?.[Number(gradeKey)],
  ];

  for (const list of possibleLists) {
    if (Array.isArray(list) && list.length > 0) {
      return uniqueSortedBatches(list);
    }
  }

  const classes =
    [root?.classes, root?.data?.classes, payload?.classes].find((list) =>
      Array.isArray(list)
    ) ?? [];

  return uniqueSortedBatches(classes.map(getClassBatchNumber));
};

export const enrollmentApi = createApi({
  reducerPath: "enrollmentApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api/enrollment`,
    credentials: "include",

    prepareHeaders: (headers, { getState }) => {
      const token = selectAuthToken(getState());

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

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
      async queryFn(grade, _queryApi, _extraOptions, baseQuery) {
        const gradeValue = normalizeGradeParam(grade);

        if (!gradeValue) {
          return {
            data: {
              grade: "",
              count: 0,
              batches: [],
              batchnumbers: [],
              availableBatches: [],
            },
          };
        }

        const enrollmentBatchResult = await baseQuery(`/batches/${gradeValue}`);

        if (!enrollmentBatchResult.error) {
          const batches = extractAvailableBatches(
            enrollmentBatchResult.data,
            gradeValue
          );

          return {
            data: {
              ...(enrollmentBatchResult.data || {}),
              grade: gradeValue,
              count: batches.length,
              batches,
              batchnumbers: batches,
              availableBatches: batches,
            },
          };
        }

        const classBatchResult = await baseQuery({
          url: `${BASE_URL}/api/class/batches/${gradeValue}`,
          method: "GET",
        });

        if (!classBatchResult.error) {
          const batches = extractAvailableBatches(
            classBatchResult.data,
            gradeValue
          );

          return {
            data: {
              ...(classBatchResult.data || {}),
              grade: gradeValue,
              count: batches.length,
              batches,
              batchnumbers: batches,
              availableBatches: batches,
            },
          };
        }

        const classOptionsResult = await baseQuery({
          url: `${BASE_URL}/api/class/options`,
          method: "GET",
        });

        if (!classOptionsResult.error) {
          const batches = extractAvailableBatches(
            classOptionsResult.data,
            gradeValue
          );

          return {
            data: {
              ...(classOptionsResult.data || {}),
              grade: gradeValue,
              count: batches.length,
              batches,
              batchnumbers: batches,
              availableBatches: batches,
            },
          };
        }

        return {
          error:
            enrollmentBatchResult.error ||
            classBatchResult.error ||
            classOptionsResult.error,
        };
      },

      providesTags: (_result, _error, grade) => [
        {
          type: "EnrollmentBatches",
          id: normalizeGradeParam(grade) || "none",
        },
      ],
    }),

    submitEnrollment: builder.mutation({
      query: (body) => ({
        url: "/submit",
        method: "POST",
        body: {
          ...body,
          grade: Number(body?.grade),
          batchnumber: String(
            body?.batchnumber ?? body?.batchNumber ?? body?.batch ?? ""
          ).trim(),
        },
      }),

      invalidatesTags: [{ type: "Enrollment", id: "ME" }],
    }),

    getAllEnrollments: builder.query({
      query: () => "/",
      providesTags: ["Enrollment"],
    }),

    approveEnrollment: builder.mutation({
      query: (id) => ({
        url: `/${id}/approve`,
        method: "PUT",
      }),

      invalidatesTags: ["Enrollment", { type: "Enrollment", id: "ME" }],
    }),

    rejectEnrollment: builder.mutation({
      query: (id) => ({
        url: `/${id}/reject`,
        method: "PUT",
      }),

      invalidatesTags: ["Enrollment", { type: "Enrollment", id: "ME" }],
    }),

    deleteEnrollment: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),

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
  const token = useSelector(selectAuthToken);
  const { skip, ...restOptions } = options || {};

  const result = useGetMyEnrollmentStatusQuery(undefined, {
    pollingInterval: 30_000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
    ...restOptions,
    skip: Boolean(skip || !token),
  });

  const data = result.data ?? {};
  const status = token ? normalizeStatus(data?.status) : "not_logged_in";
  const unlocked = Boolean(data?.unlocked || status === "approved");
  const enrolledGrade = extractGrade(data);
  const enrolledBatchNumber = extractBatchNumber(data);

  const safeRefetch = () => {
    if (!token || result.isUninitialized) return undefined;
    return result.refetch?.();
  };

  return {
    ...result,
    refetch: safeRefetch,
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
    isNotLoggedIn: status === "not_logged_in",
    hasToken: Boolean(token),
  };
}