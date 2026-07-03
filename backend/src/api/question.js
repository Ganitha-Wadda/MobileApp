import express from "express";
import { authenticate } from "./middlewares/authentication.js";
import { authorize } from "./middlewares/authrization.js";
import { 
  createQuestion, 
  getQuestionsByPaper, 
  updateQuestionById 
} from "../application/question.js";

const router = express.Router();

// ============================================================
// ROUTES FOR QUESTION MANAGEMENT
// ============================================================

/**
 * POST /api/question
 * Create a new question for a paper
 * Auth: Required (admin only)
 */
router.post(
  "/",
  authenticate,
  authorize(["admin"]),
  createQuestion
);

/**
 * GET /api/question/paper/:paperId
 * Get all questions for a specific paper
 * Auth: Required (admin only)
 */
router.get(
  "/paper/:paperId",
  authenticate,
  authorize(["admin"]),
  getQuestionsByPaper
);

/**
 * PATCH /api/question/:questionId
 * Update an existing question
 * Auth: Required (admin only)
 */
router.patch(
  "/:questionId",
  authenticate,
  authorize(["admin"]),
  updateQuestionById
);

export default router;