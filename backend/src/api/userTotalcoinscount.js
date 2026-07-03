import express from "express";

import { getLoginUserTotalCoinsCount } from "../application/userTotalcoinscount.js";
import { authenticate } from "./middlewares/authentication.js";

const router = express.Router();

router.get("/login-user-total", authenticate, getLoginUserTotalCoinsCount);
router.get("/my-total", authenticate, getLoginUserTotalCoinsCount);

export default router;