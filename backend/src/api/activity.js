import express from "express";
import {
  createactivity,
  GetAllactivity,
  GetActivityPaper,
  updateActivityPaper,
  deleteActivityPaper,
} from "../application/activity.js";

const router = express.Router();

router.post("/createactivity", createactivity);
router.get("/GetAllactivity", GetAllactivity);
router.get("/paper/:lessonId/:sublessonId", GetActivityPaper);
router.put("/paper/:lessonId/:sublessonId", updateActivityPaper);
router.delete("/paper/:lessonId/:sublessonId", deleteActivityPaper);

export default router;