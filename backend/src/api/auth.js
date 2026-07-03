import express from "express";

import {
  signup,
  signin,
  logout,
  currentUser,
  updateCurrentUserProfile,
  verifySignupOtp,
  resendSignupOtp,
  forgotPasswordSendOtp,
  forgotPasswordVerifyOtp,
  forgotPasswordReset,
  forgotPasswordResendOtp,
} from "../application/auth.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/verify-signup-otp", verifySignupOtp);
router.post("/resend-signup-otp", resendSignupOtp);
router.post("/signin", signin);
router.post("/logout", logout);
router.get("/current", currentUser);

// Logged user profile update. Uses only the logged-in user's token.
// Grade can only be changed to an existing active backend Grade.
router.patch("/profile", updateCurrentUserProfile);
router.put("/profile", updateCurrentUserProfile);

// Forgot password routes
router.post("/forgot-password/send-otp", forgotPasswordSendOtp);
router.post("/forgot-password/verify-otp", forgotPasswordVerifyOtp);
router.post("/forgot-password/reset", forgotPasswordReset);
router.post("/forgot-password/resend-otp", forgotPasswordResendOtp);

export default router;
