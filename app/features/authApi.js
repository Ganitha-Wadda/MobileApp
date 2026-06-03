import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../api/api";

export const authApi = createApi({
  reducerPath: "authApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api/auth`,

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
    }),

    signout: builder.mutation({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
    }),

    // ============= FORGOT PASSWORD MUTATIONS =============
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
  useForgotPasswordSendOtpMutation,
  useForgotPasswordVerifyOtpMutation,
  useForgotPasswordResetMutation,
  useForgotPasswordResendOtpMutation,
} = authApi;