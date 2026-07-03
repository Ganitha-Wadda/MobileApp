import express from "express";
import {
  createshortsublesson,
  GetAllshortsublesson,
  getShortSubLessonsByShortLessonId,
  GetShortLessonById,
  updateShortLessonById,
  updateShortSubLessonStatus,
  deleteshortsublessonById,
} from "../application/shortzsublesson.js";

const router = express.Router();

router.post("/createshortsublesson", createshortsublesson);
router.get("/getallshortsublesson", GetAllshortsublesson);
router.get("/getbyshortlesson/:shortLessonId", getShortSubLessonsByShortLessonId);
router.get("/getshortsublesson/:id", GetShortLessonById);
router.put("/updateshortsublesson/:id", updateShortLessonById);
router.patch("/updatestatus/:id", updateShortSubLessonStatus);
router.delete("/deleteshortsublesson/:id", deleteshortsublessonById);

export default router;