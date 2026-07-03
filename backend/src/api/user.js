import express from "express";

import {
  createUser,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  toggleUserActive,
} from "../application/user.js";
import { authenticate } from "./middlewares/authentication.js";
import { authorize } from "./middlewares/authrization.js";

const router = express.Router();

// ── Public ──────────────────────────────────────────────────────────────────
router.post("/create", createUser);

// ── Admin only ──────────────────────────────────────────────────────────────
router.get("/", authenticate, authorize(["admin"]), getAllUsers);

router.get("/:id", authenticate, authorize(["admin"]), getUserById);

router.put("/:id", authenticate, authorize(["admin"]), updateUserById);

router.patch("/:id/toggle-active", authenticate, authorize(["admin"]), toggleUserActive);

router.patch("/:id", authenticate, authorize(["admin"]), updateUserById);

router.delete("/:id", authenticate, authorize(["admin"]), deleteUserById);

export default router;