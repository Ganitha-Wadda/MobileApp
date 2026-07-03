import express from "express";
import { getLanguage, updateLanguage } from "../application/Language.js";
import { authenticate } from "./middlewares/authentication.js";

const router = express.Router();

// All language routes require authentication.
router.use(authenticate);

// GET /api/language — fetch logged user's saved language.
router.get("/", getLanguage);

// PUT /api/language — save/update logged user's language.
router.put("/", updateLanguage);

// PATCH /api/language — same as PUT.
router.patch("/", updateLanguage);

export default router;