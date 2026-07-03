import express from "express";

import {
  createRecording,
  getAllRecordings,
  getDemoRecordings,
  getRecordingById,
  updateRecordingById,
  deleteRecordingById,
  getMyRecordings,
  getRecordingsByGradeAndBatch,
} from "../application/recording.js";
import { authenticate } from "./middlewares/authentication.js";

const router = express.Router();

router.post("/create", createRecording);

// Public demo lesson. Keep before "/:id".
router.get("/demo", getDemoRecordings);

// App side: approved user grade + batch related recordings.
// Backend gets approved enrollment from logged-in user token.
// Important: keep this before "/:id".
router.get("/my-recordings", authenticate, getMyRecordings);

// Optional direct grade + batch endpoint
// Example: /api/recording/by-grade-batch?grade=3&batchnumber=Batch%201
// Important: keep this before "/:id".
router.get("/by-grade-batch", getRecordingsByGradeAndBatch);

router.get("/", getAllRecordings);

router.get("/:id", getRecordingById);

router.put("/:id", updateRecordingById);

router.patch("/:id", updateRecordingById);

router.delete("/:id", deleteRecordingById);

export default router;
