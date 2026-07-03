import express from "express";

import {
  getResultAdminStudents,
  getResultAdminStudentOptions,
  getResultAdminStudentById,
} from "../application/ResultAdminStudent.js";

import { authenticate } from "./middlewares/authentication.js";
import { authorize } from "./middlewares/authrization.js";

const router = express.Router();

router.get(
  "/",
  authenticate,
  authorize(["admin"]),
  getResultAdminStudents
);

router.get(
  "/options",
  authenticate,
  authorize(["admin"]),
  getResultAdminStudentOptions
);

router.get(
  "/:studentId",
  authenticate,
  authorize(["admin"]),
  getResultAdminStudentById
);

export default router;