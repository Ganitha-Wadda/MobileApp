import express from "express";
import {
  submitEnrollment,
  getMyEnrollmentStatus,
  getAvailableBatchesByGrade,
  getAllEnrollments,
  approveEnrollment,
  rejectEnrollment,
  deleteEnrollment,
} from "../application/enrollment.js";
import { authenticate } from "./middlewares/authentication.js";
import { authorize } from "./middlewares/authrization.js";

const router = express.Router();

// Student routes
router.get("/batches/:grade", authenticate, getAvailableBatchesByGrade);
router.post("/submit", authenticate, submitEnrollment);
router.get("/my-status", authenticate, getMyEnrollmentStatus);

// Admin routes
router.get("/", authenticate, authorize(["admin"]), getAllEnrollments);
router.put("/:id/approve", authenticate, authorize(["admin"]), approveEnrollment);
router.put("/:id/reject", authenticate, authorize(["admin"]), rejectEnrollment);
router.delete("/:id", authenticate, authorize(["admin"]), deleteEnrollment);

export default router;
