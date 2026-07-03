import express from "express";

import { getMyAvatar, saveMyAvatar } from "../application/avatar.js";
import { authenticate } from "./middlewares/authentication.js";

const router = express.Router();

router.get("/me", authenticate, getMyAvatar);
router.put("/me", authenticate, saveMyAvatar);

export default router;
