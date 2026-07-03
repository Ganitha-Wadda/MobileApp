import express from "express";

import {
  getLoggedUserRank,
  getMyGradeLeaderboard,
} from "../application/rank.js";
import { authenticate } from "./middlewares/authentication.js";

const router = express.Router();

router.get("/my-rank", authenticate, getLoggedUserRank);
router.get("/leaderboard", authenticate, getMyGradeLeaderboard);

export default router;