import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import classRouter from "./api/class.js";
import connectDB from "./infastructure/db.js";
import GlobalErrorHandler from "./api/middlewares/error-handling.js";
import authRouter from "./api/auth.js";
import recordingRouter from "./api/recording.js";
import userRouter from "./api/user.js";
import liveRouter from "./api/live.js";
import attemptRouter from "./api/attempt.js";
import enrollmentRouter from "./api/enrollment.js";
import paperRoutes from "./api/paper.js";
import questionRouter from "./api/question.js";
import paymentRouter from "./api/payment.js";
import uploadRouter from "./api/upload.js";
import shortlessonRoute from "./api/shortzlesson.js";
import shortsublessonRoute from "./api/shortzsublesson.js";
import activityRoutes from "./api/activity.js";
import languageRoutes from "./api/Language.js";
import gradeRouter from "./api/grade.js";
import paperResultRouter from "./api/paperResult.js";
import shortCoinsCountRouter from "./api/shortcoinscount.js";
import userTotalcoinscountRouter from "./api/userTotalcoinscount.js";
import rankRouter from "./api/rank.js";
import resultAdminStudentRouter from "./api/ResultAdminStudent.js";
import avatarRouter from "./api/avatar.js";

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
  process.env.LOCAL_WEB_URL,
  process.env.LOCAL_ADMIN_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:8081",
  "http://localhost:8082",
  "http://localhost:8083",
].filter(Boolean);

app.set("trust proxy", 1);

const corsMiddleware = cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);

    const cleanOrigin = String(origin).replace(/\/$/, "");
    const ok = allowedOrigins
      .map((o) => String(o).replace(/\/$/, ""))
      .includes(cleanOrigin);

    if (ok) return cb(null, true);

    console.log("❌ CORS blocked origin:", origin);
    return cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

app.use(corsMiddleware);
app.options(/.*/, corsMiddleware);

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/payment", paymentRouter);
app.use("/api/papers", paperRoutes);
app.use("/api/paper-results", paperResultRouter);
app.use("/api/result-admin-students", resultAdminStudentRouter);
app.use("/api/userTotalcoinscount", userTotalcoinscountRouter);
app.use("/api/rank", rankRouter);
app.use("/api/live", liveRouter);
app.use("/api/attempt", attemptRouter);
app.use("/api/enrollment", enrollmentRouter);
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/class", classRouter);
app.use("/api/recording", recordingRouter);
app.use("/api/question", questionRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/shortlesson", shortlessonRoute);
app.use("/api/shortsublesson", shortsublessonRoute);
app.use("/api/activity", activityRoutes);
app.use("/api/shortcoinscount", shortCoinsCountRouter);
app.use("/api/language", languageRoutes);
app.use("/api/grade", gradeRouter);
app.use("/api/avatar", avatarRouter);

app.get("/", (req, res) => res.send("OK"));
app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use(GlobalErrorHandler);

connectDB();

const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
  console.log("✅ Allowed origins:", allowedOrigins);
});