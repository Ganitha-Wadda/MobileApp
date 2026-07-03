import express from "express";
import {
  createshortlesson,
  getAllshortlesson,
  getMyGradeShortLessons,
  getshortlessonById,
  updateshortlessonById,
  deleteshortLessonById,
} from "../application/shortzlesson.js";
import { authenticate } from "./middlewares/authentication.js";

const router = express.Router();

router.get("/myshortlessons", authenticate, getMyGradeShortLessons);

router.post("/createshortlesson", createshortlesson);
router.get("/getallshortlesson", getAllshortlesson);
router.get("/getshortlesson/:id", getshortlessonById);
router.put("/updateshortlesson/:id", updateshortlessonById);
router.delete("/deleteshortlesson/:id", deleteshortLessonById);

export default router;