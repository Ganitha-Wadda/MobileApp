import express from "express";

import {
  createLiveClassAttempt,
  getMyLiveClassAttempts,
} from "../application/attempt.js";
import { authenticate } from "./middlewares/authentication.js";

const router = express.Router();

// Save logged-in user's live class attempt when Zoom button is clicked.
router.post("/", authenticate, createLiveClassAttempt);
router.post("/create", authenticate, createLiveClassAttempt);

// Logged-in user's attendance / attempts.
router.get("/", authenticate, getMyLiveClassAttempts);
router.get("/my", authenticate, getMyLiveClassAttempts);

export default router;