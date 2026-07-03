import express from "express";

import {
  startOrResumePaperAttempt,
  savePaperQuestionAnswer,
  finishPaperAttempt,
  getPaperAttemptResult,
  getActivePaperAttemptByPaper,
  getLatestPaperResultByPaper,
  getMyPaperResults,
} from "../application/paperResult.js";
import { authenticate } from "./middlewares/authentication.js";

const router = express.Router();

// Result page list.
// GET /api/paper-results/my-results?paperType=daily%20paper&page=1&limit=10
router.get("/my-results", authenticate, getMyPaperResults);

// Student starts the paper. If an unfinished attempt exists, this resumes it.
// If time already expired while app was closed, backend finalizes and returns result.
router.post("/start-or-resume", authenticate, startOrResumePaperAttempt);

// Saves one selected answer question-by-question.
router.post("/answer", authenticate, savePaperQuestionAnswer);

// Final submit or timer-over submit.
router.patch("/finish/:attemptId", authenticate, finishPaperAttempt);
router.put("/finish/:attemptId", authenticate, finishPaperAttempt);

// Load result/review by attempt id.
router.get("/attempt/:attemptId", authenticate, getPaperAttemptResult);

// Optional helper for screens to check active paper attempt.
router.get("/paper/:paperId/active", authenticate, getActivePaperAttemptByPaper);

// Helper for paper menus to show Start / Continue / View Review.
router.get("/paper/:paperId/latest", authenticate, getLatestPaperResultByPaper);

export default router;