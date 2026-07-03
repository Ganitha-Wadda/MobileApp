import express from "express";
import {
  createGrade,
  getAllGrades,
  getGradeById,
  updateGrade,
  deleteGrade,
  seedGrades,
} from "../application/grade.js";

const router = express.Router();

// Seed
router.post("/seed", seedGrades);

// Create
router.post("/", createGrade);
router.post("/create", createGrade);

// Read
router.get("/", getAllGrades);
router.get("/getallgrades", getAllGrades);
router.get("/:id", getGradeById);

// Update
router.put("/:id", updateGrade);
router.patch("/:id", updateGrade);

// Delete
router.delete("/:id", deleteGrade);

export default router;
