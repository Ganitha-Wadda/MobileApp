import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../api/api";

const getToken = (state) =>
  state?.auth?.token ??
  state?.auth?.accessToken ??
  state?.user?.token ??
  null;

const sortTextNumber = (a, b) => {
  return String(a).localeCompare(String(b), undefined, {
    numeric: true,
    sensitivity: "base",
  });
};

const uniqueSorted = (values = []) => {
  return [
    ...new Set(
      values
        .map((value) => String(value || "").trim())
        .filter(Boolean)
    ),
  ].sort(sortTextNumber);
};

const normalizeClassOptions = (response = {}) => {
  const classes = response?.classes || response?.data || [];

  /**
   * Backend already returns:
   * {
   *   grades: ["3", "4", "5"],
   *   batchesByGrade: {
   *     "3": ["2026", "2027"]
   *   },
   *   classes: []
   * }
   */
  if (Array.isArray(response?.grades) && response?.batchesByGrade) {
    return {
      grades: uniqueSorted(response.grades),
      batchesByGrade: Object.fromEntries(
        Object.entries(response.batchesByGrade).map(([grade, batches]) => [
          String(grade),
          uniqueSorted(batches),
        ])
      ),
      classes,
    };
  }

  /**
   * Fallback: build grade and batchnumber options from class list.
   */
  const gradeSet = new Set();
  const batchesByGrade = {};

  for (const classItem of classes) {
    const grade = String(classItem?.grade ?? "").trim();
    const batchnumber = String(classItem?.batchnumber ?? "").trim();

    if (!grade || !batchnumber) continue;

    gradeSet.add(grade);

    if (!batchesByGrade[grade]) {
      batchesByGrade[grade] = [];
    }

    batchesByGrade[grade].push(batchnumber);
  }

  const grades = [...gradeSet].sort((a, b) => Number(a) - Number(b));

  for (const grade of Object.keys(batchesByGrade)) {
    batchesByGrade[grade] = uniqueSorted(batchesByGrade[grade]);
  }

  return {
    grades,
    batchesByGrade,
    classes,
  };
};

export const classApi = createApi({
  reducerPath: "classApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api/class`,
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

  tagTypes: ["Class", "ClassOptions"],

  endpoints: (builder) => ({
    getAllClasses: builder.query({
      query: () => ({
        url: "/",
        method: "GET",
      }),

      transformResponse: (response) => {
        return response?.classes || response?.data || [];
      },

      providesTags: ["Class"],
    }),

    getClassOptions: builder.query({
      query: () => ({
        url: "/options",
        method: "GET",
      }),

      transformResponse: normalizeClassOptions,

      providesTags: ["ClassOptions"],
    }),

    getBatchNumbersByGrade: builder.query({
      query: (grade) => ({
        url: `/batches/${grade}`,
        method: "GET",
      }),

      transformResponse: (response) => {
        return uniqueSorted(
          response?.batchnumbers ||
            response?.batchNumbers ||
            response?.batches ||
            response?.data ||
            []
        );
      },

      providesTags: (_result, _error, grade) => [
        {
          type: "ClassOptions",
          id: String(grade || "none"),
        },
      ],
    }),
  }),
});

export const {
  useGetAllClassesQuery,
  useGetClassOptionsQuery,
  useGetBatchNumbersByGradeQuery,
} = classApi;