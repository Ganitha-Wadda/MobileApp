import express from "express";
import {
  getMyShortLessonOverview,
  getMyShortSubLessonOverview,
  getMyTotalShortCoins,
  markShortVideoWatched,
  submitShortActivityAttempt,
} from "../application/shortcoinscount.js";
import { authenticate } from "./middlewares/authentication.js";

const router = express.Router();

router.get("/my-total", authenticate, getMyTotalShortCoins);
router.get("/lesson-overview", authenticate, getMyShortLessonOverview);
router.get("/sublesson-overview/:shortLessonId", authenticate, getMyShortSubLessonOverview);
router.post("/video-watched", authenticate, markShortVideoWatched);
router.post("/activity-attempt", authenticate, submitShortActivityAttempt);

export default router;
