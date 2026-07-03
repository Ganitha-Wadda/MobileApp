import express from "express";

import {
  createClass,
  getAllClasses,
  getClassOptions,
  getBatchNumbersByGrade,
  getClassById,
  getClassByGrade,
  updateClassById,
  deleteClassById,
} from "../application/class.js";

const router = express.Router();

// Create
router.post("/", createClass);
router.post("/create", createClass);

// Read
router.get("/", getAllClasses);

// Important: keep these before "/:id"
router.get("/options", getClassOptions);
router.get("/batches/:grade", getBatchNumbersByGrade);
router.get("/grade/:grade", getClassByGrade);
router.get("/:id", getClassById);

// Update
router.put("/:id", updateClassById);
router.patch("/:id", updateClassById);

// Delete
router.delete("/:id", deleteClassById);

export default router;