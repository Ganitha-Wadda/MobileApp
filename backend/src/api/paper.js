import express from "express";
import {
  createPaper,
  getAllPapers,
  getMyGradePapers,
  getAllPapersAdmin,
  getPaperById,
  getPaperFullDetails,
  updatePaperById,
  deletePaperById,
  publishPaper,
} from "../application/paper.js";
import { authenticate } from "./middlewares/authentication.js";
import { authorize } from "./middlewares/authrization.js";

const router = express.Router();

router.post("/createpaper", authenticate, authorize(["admin"]), createPaper);

// Logged-in student/user: only papers for the grade saved in their user account.
router.get("/mygradepapers", authenticate, getMyGradePapers);

// Admin: all active papers. No published filter.
router.get(
  "/getallpaper/admin",
  authenticate,
  authorize(["admin"]),
  getAllPapersAdmin
);

// Public/published papers. Can still be filtered manually by ?gradeId=&paperType=&payment=.
router.get("/getallpaper", getAllPapers);
router.get("/getpaper/:id", getPaperById);
router.get("/paperdetails/:id", getPaperFullDetails);

router.put("/updatepaper/:id", authenticate, authorize(["admin"]), updatePaperById);
router.delete("/deletepaper/:id", authenticate, authorize(["admin"]), deletePaperById);
router.patch("/publishpaper/:id", authenticate, authorize(["admin"]), publishPaper);
router.put("/publishpaper/:id", authenticate, authorize(["admin"]), publishPaper);

export default router;
