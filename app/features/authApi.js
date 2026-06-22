import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../api/api";
import { clearAuth, selectAuthToken, setCredentials } from "./authSlice";
import { clearUser, setUser } from "./userSlice";

const isEmptyValue = (value) => {
  if (value === undefined || value === null) return true;
  if (typeof value === "string" && value.trim() === "") return true;
  return false;
};

const isMongoId = (value) => /^[a-f\d]{24}$/i.test(String(value || "").trim());

const cleanTextValue = (value) => {
  if (isEmptyValue(value)) return undefined;
  return String(value).trim();
};

const getGradeValue = (value) => {
  if (isEmptyValue(value)) return undefined;

  if (typeof value === "object" && !Array.isArray(value)) {
    return getGradeValue(
      value.gradeId ??
        value.gradeNumber ??
        value.grade ??
        value.value ??
        value.label ??
        value.name
    );
  }

  const stringValue = String(value).trim();

  if (isMongoId(stringValue)) {
    return undefined;
  }

  const gradeMatch = stringValue.match(/\d+/);
  const gradeNumber = gradeMatch ? Number(gradeMatch[0]) : Number(stringValue);

  if (Number.isInteger(gradeNumber) && gradeNumber > 0 && gradeNumber < 20) {
    return gradeNumber;
  }

  return undefined;
};

const cleanProfilePayload = (body = {}) => {
  const payload = {};

  const name = cleanTextValue(body.name ?? body.fullname ?? body.fullName);
  const birthday = cleanTextValue(body.birthday);
  const district = cleanTextValue(body.district);
  const town = cleanTextValue(body.town);
  const address = cleanTextValue(body.address);
  const gender = cleanTextValue(body.gender);
  const batchnumber = cleanTextValue(body.batchnumber ?? body.batchNumber);

  if (name) payload.name = name;
  if (birthday) payload.birthday = birthday;
  if (district) payload.district = district;
  if (town) payload.town = town;
  if (address) payload.address = address;
  if (gender) payload.gender = gender.toLowerCase();
  if (batchnumber) payload.batchnumber = batchnumber;

  const gradeValue = getGradeValue(
    body.gradeId ??
      body.gradeNumber ??
      body.selectedGrade ??
      body.grade
  );

  if (gradeValue !== undefined) {
    payload.grade = gradeValue;
  }

  return payload;
};

export const authApi = createApi({
  reducerPath: "authApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api/auth`,
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

  tagTypes: ["CurrentUser"],

  endpoints: (builder) => ({
    signup: builder.mutation({
      query: (body) => ({
        url: "/signup",
        method: "POST",
        body,
      }),
    }),

    verifySignupOtp: builder.mutation({
      query: ({ phonenumber, code }) => ({
        url: "/verify-signup-otp",
        method: "POST",
        body: {
          phonenumber,
          code,
        },
      }),
    }),

    resendSignupOtp: builder.mutation({
      query: ({ phonenumber }) => ({
        url: "/resend-signup-otp",
        method: "POST",
        body: {
          phonenumber,
        },
      }),
    }),

    signin: builder.mutation({
      query: (body) => ({
        url: "/signin",
        method: "POST",
        body,
      }),

      invalidatesTags: ["CurrentUser"],

      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          const token = data?.token || data?.accessToken || data?.jwt || null;
          const user = data?.user || data?.profile || null;

          if (token) {
            dispatch(
              setCredentials({
                token,
                accessToken: token,
                user,
              })
            );
          }

          if (user) {
            dispatch(setUser(user));
          }
        } catch {
          // signin screen handles the visible error
        }
      },
    }),

    signout: builder.mutation({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),

      invalidatesTags: ["CurrentUser"],

      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        dispatch(clearAuth());
        dispatch(clearUser());

        dispatch(
          authApi.util.updateQueryData("getCurrentUser", undefined, () => null)
        );

        try {
          await queryFulfilled;
        } catch {
          // local logout can continue even if backend logout fails
        }
      },
    }),

    getCurrentUser: builder.query({
      query: () => ({
        url: "/current",
        method: "GET",
      }),

      providesTags: ["CurrentUser"],

      async onQueryStarted(_arg, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled;
          const user = data?.user || data || null;
          const token = selectAuthToken(getState());

          if (user && typeof user === "object") {
            dispatch(setUser(user));
            dispatch(
              setCredentials({
                token,
                accessToken: token,
                user,
              })
            );
          }
        } catch {
          // current user may fail when token is expired
        }
      },
    }),

    updateCurrentUserProfile: builder.mutation({
      query: (body) => ({
        url: "/profile",
        method: "PATCH",
        body: cleanProfilePayload(body),
      }),

      invalidatesTags: ["CurrentUser"],

      async onQueryStarted(_arg, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled;
          const user = data?.user || data || null;
          const token = selectAuthToken(getState());

          if (user && typeof user === "object") {
            dispatch(setUser(user));
            dispatch(
              setCredentials({
                token,
                accessToken: token,
                user,
              })
            );
          }
        } catch {
          // profile screen handles the visible error
        }
      },
    }),

    forgotPasswordSendOtp: builder.mutation({
      query: ({ phonenumber }) => ({
        url: "/forgot-password/send-otp",
        method: "POST",
        body: {
          phonenumber,
        },
      }),
    }),

    forgotPasswordVerifyOtp: builder.mutation({
      query: ({ phonenumber, code }) => ({
        url: "/forgot-password/verify-otp",
        method: "POST",
        body: {
          phonenumber,
          code,
        },
      }),
    }),

    forgotPasswordReset: builder.mutation({
      query: ({ phonenumber, password, confirmPassword }) => ({
        url: "/forgot-password/reset",
        method: "POST",
        body: {
          phonenumber,
          password,
          confirmPassword,
        },
      }),
    }),

    forgotPasswordResendOtp: builder.mutation({
      query: ({ phonenumber }) => ({
        url: "/forgot-password/resend-otp",
        method: "POST",
        body: {
          phonenumber,
        },
      }),
    }),
  }),
});

export const {
  useSignupMutation,
  useVerifySignupOtpMutation,
  useResendSignupOtpMutation,
  useSigninMutation,
  useSignoutMutation,
  useGetCurrentUserQuery,
  useUpdateCurrentUserProfileMutation,
  useForgotPasswordSendOtpMutation,
  useForgotPasswordVerifyOtpMutation,
  useForgotPasswordResetMutation,
  useForgotPasswordResendOtpMutation,
} = authApi;