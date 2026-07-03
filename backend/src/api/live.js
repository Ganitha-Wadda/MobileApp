import express from "express";

import {
  createLiveClass,
  getAllLiveClasses,
  getLiveClassById,
  updateLiveClassById,
  deleteLiveClassById,
  getActiveLiveClassesByGradeAndBatch,
} from "../application/live.js";
import { authenticate } from "./middlewares/authentication.js";

const router = express.Router();

// ── Active live classes for logged-in student's grade + batch number ───────
// IMPORTANT: must be declared BEFORE GET /:id so "active" is not matched as ID.
//
// Student app usage:
//   GET /api/live/active?grade=3&batchnumber=BATCH01
//
// The controller also falls back to the approved enrollment of the logged-in
// user if grade/batchnumber are not passed from the app.
router.get("/active", authenticate, getActiveLiveClassesByGradeAndBatch);
router.get("/active/:grade/:batchnumber", authenticate, getActiveLiveClassesByGradeAndBatch);
router.get("/active/:grade", authenticate, getActiveLiveClassesByGradeAndBatch);

// ── Existing admin/general routes unchanged ────────────────────────────────
router.post("/create", createLiveClass);
router.post("/", createLiveClass);

router.get("/", getAllLiveClasses);
router.get("/:id", getLiveClassById);

router.put("/:id", updateLiveClassById);
router.patch("/:id", updateLiveClassById);

router.delete("/:id", deleteLiveClassById);

export default router;
