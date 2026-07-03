import mongoose from "mongoose";

import PaperResult from "../infastructure/schemas/paperResult.js";
import ShortCoinsCount from "../infastructure/schemas/shortcoinscount.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(String(id || ""));

const toObjectId = (id) => new mongoose.Types.ObjectId(String(id));

const normalizeText = (value = "") => String(value ?? "").trim();

const getUserId = (req) => {
  const id =
    req?.user?.id ||
    req?.user?._id ||
    req?.user?.userId ||
    req?.userId ||
    req?.auth?.id ||
    req?.auth?._id ||
    req?.auth?.userId;

  return isValidId(id) ? String(id) : "";
};

const numberValue = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const getEffectivePaperStatus = (paperResult = {}) => {
  const status = normalizeText(paperResult.status).toLowerCase();

  if (
    status === "in_progress" &&
    paperResult.expiresAt &&
    new Date(paperResult.expiresAt).getTime() <= Date.now()
  ) {
    return "expired";
  }

  return status || "in_progress";
};

const isFinishedPaperStatus = (status) =>
  ["completed", "expired"].includes(normalizeText(status).toLowerCase());

const getPaperTypeValue = (paperResult = {}) => {
  const snapshotType = paperResult?.paperSnapshot?.paperType;
  const populatedType = paperResult?.paperId?.paperType;

  return normalizeText(snapshotType || populatedType || "");
};

const normalizePaperCategory = (paperType = "") => {
  const clean = normalizeText(paperType)
    .toLowerCase()
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ");

  if (!clean) return "unknown";

  if (clean.includes("500") || clean.includes("five hundred")) {
    return "fiveHundredPapers";
  }

  if (clean.includes("past")) {
    return "pastPapers";
  }

  if (clean.includes("lesson")) {
    return "lessonByLesson";
  }

  if (clean.includes("daily") || clean.includes("quiz") || clean.includes("quizz")) {
    return "dailyQuiz";
  }

  return "unknown";
};

const buildEmptyPaperCounts = () => ({
  dailyQuiz: 0,
  fiveHundredPapers: 0,
  pastPapers: 0,
  lessonByLesson: 0,
  unknown: 0,
});

const getShortActivitySummary = async (userId) => {
  const progressDocs = await ShortCoinsCount.find({ userId: toObjectId(userId) })
    .select("totalShortCoins completedAt activityAttempts")
    .lean();

  let activityCoins = 0;
  let totalActivityAttemptsCount = 0;
  let correctActivityAttemptsCount = 0;
  let wrongActivityAttemptsCount = 0;
  let completedShortSubLessonsCount = 0;

  progressDocs.forEach((doc) => {
    activityCoins += numberValue(doc.totalShortCoins);

    if (doc.completedAt) {
      completedShortSubLessonsCount += 1;
    }

    const attempts = Array.isArray(doc.activityAttempts) ? doc.activityAttempts : [];

    totalActivityAttemptsCount += attempts.length;
    correctActivityAttemptsCount += attempts.filter((attempt) => attempt.isCorrect).length;
    wrongActivityAttemptsCount += attempts.filter((attempt) => !attempt.isCorrect).length;
  });

  return {
    activityCoins,
    shortActivityCoins: activityCoins,
    totalShortCoins: activityCoins,
    totalActivityAttemptsCount,
    correctActivityAttemptsCount,
    wrongActivityAttemptsCount,
    completedShortSubLessonsCount,
  };
};

const getPaperSummary = async (userId) => {
  const paperResults = await PaperResult.find({ userId: toObjectId(userId) })
    .select(
      "paperId paperSnapshot status totalCoins totalQuestions attemptedCount correctCount wrongCount notAttemptedCount expiresAt createdAt submittedAt"
    )
    .populate("paperId", "paperType")
    .lean();

  const completedPapersByCategory = buildEmptyPaperCounts();
  const allPapersByCategory = buildEmptyPaperCounts();

  let paperCoins = 0;
  let completedPaperCoins = 0;
  let totalPaperAttemptsCount = paperResults.length;
  let completedPapersCount = 0;
  let activePapersCount = 0;
  let expiredPapersCount = 0;

  let totalPaperQuestionsCount = 0;
  let attemptedPaperQuestionsCount = 0;
  let correctPaperQuestionsCount = 0;
  let wrongPaperQuestionsCount = 0;
  let notAttemptedPaperQuestionsCount = 0;

  paperResults.forEach((paperResult) => {
    const effectiveStatus = getEffectivePaperStatus(paperResult);
    const paperType = getPaperTypeValue(paperResult);
    const category = normalizePaperCategory(paperType);

    allPapersByCategory[category] += 1;

    const resultCoins = numberValue(paperResult.totalCoins);
    paperCoins += resultCoins;

    totalPaperQuestionsCount += numberValue(paperResult.totalQuestions);
    attemptedPaperQuestionsCount += numberValue(paperResult.attemptedCount);
    correctPaperQuestionsCount += numberValue(paperResult.correctCount);
    wrongPaperQuestionsCount += numberValue(paperResult.wrongCount);
    notAttemptedPaperQuestionsCount += numberValue(paperResult.notAttemptedCount);

    if (isFinishedPaperStatus(effectiveStatus)) {
      completedPapersCount += 1;
      completedPapersByCategory[category] += 1;
      completedPaperCoins += resultCoins;

      if (effectiveStatus === "expired") {
        expiredPapersCount += 1;
      }
    } else {
      activePapersCount += 1;
    }
  });

  return {
    paperCoins,
    completedPaperCoins,
    totalPaperAttemptsCount,
    completedPapersCount,
    totalCompletedPapersCount: completedPapersCount,
    activePapersCount,
    expiredPapersCount,

    completedPapersByCategory,
    allPapersByCategory,

    dailyQuizCompletedPapersCount: completedPapersByCategory.dailyQuiz,
    dailyQuizzCompletedPapersCount: completedPapersByCategory.dailyQuiz,
    fiveHundredPapersCompletedCount: completedPapersByCategory.fiveHundredPapers,
    fiveHundrandPapersCompletedCount: completedPapersByCategory.fiveHundredPapers,
    pastPapersCompletedCount: completedPapersByCategory.pastPapers,
    lessonByLessonCompletedCount: completedPapersByCategory.lessonByLesson,

    totalPaperQuestionsCount,
    attemptedPaperQuestionsCount,
    correctPaperQuestionsCount,
    wrongPaperQuestionsCount,
    notAttemptedPaperQuestionsCount,
  };
};

export const getLoginUserTotalCoinsCount = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login again.",
        data: {
          totalCoins: 0,
          paperCoins: 0,
          activityCoins: 0,
          completedPapersCount: 0,
        },
      });
    }

    const [paperSummary, activitySummary] = await Promise.all([
      getPaperSummary(userId),
      getShortActivitySummary(userId),
    ]);

    const totalCoins =
      numberValue(paperSummary.paperCoins) + numberValue(activitySummary.activityCoins);

    const data = {
      userId,
      totalCoins,

      paperCoins: paperSummary.paperCoins,
      completedPaperCoins: paperSummary.completedPaperCoins,

      activityCoins: activitySummary.activityCoins,
      shortActivityCoins: activitySummary.shortActivityCoins,
      totalShortCoins: activitySummary.totalShortCoins,

      completedPapersCount: paperSummary.completedPapersCount,
      totalCompletedPapersCount: paperSummary.totalCompletedPapersCount,

      totalPaperAttemptsCount: paperSummary.totalPaperAttemptsCount,
      activePapersCount: paperSummary.activePapersCount,
      expiredPapersCount: paperSummary.expiredPapersCount,

      completedPapersByCategory: paperSummary.completedPapersByCategory,
      allPapersByCategory: paperSummary.allPapersByCategory,

      dailyQuizCompletedPapersCount: paperSummary.dailyQuizCompletedPapersCount,
      dailyQuizzCompletedPapersCount: paperSummary.dailyQuizzCompletedPapersCount,
      fiveHundredPapersCompletedCount: paperSummary.fiveHundredPapersCompletedCount,
      fiveHundrandPapersCompletedCount: paperSummary.fiveHundrandPapersCompletedCount,
      pastPapersCompletedCount: paperSummary.pastPapersCompletedCount,
      lessonByLessonCompletedCount: paperSummary.lessonByLessonCompletedCount,

      totalActivityAttemptsCount: activitySummary.totalActivityAttemptsCount,
      correctActivityAttemptsCount: activitySummary.correctActivityAttemptsCount,
      wrongActivityAttemptsCount: activitySummary.wrongActivityAttemptsCount,
      completedShortSubLessonsCount: activitySummary.completedShortSubLessonsCount,

      totalPaperQuestionsCount: paperSummary.totalPaperQuestionsCount,
      attemptedPaperQuestionsCount: paperSummary.attemptedPaperQuestionsCount,
      correctPaperQuestionsCount: paperSummary.correctPaperQuestionsCount,
      wrongPaperQuestionsCount: paperSummary.wrongPaperQuestionsCount,
      notAttemptedPaperQuestionsCount: paperSummary.notAttemptedPaperQuestionsCount,
    };

    return res.status(200).json({
      success: true,
      message: "Login user total coins count loaded successfully",
      data,

      totalCoins: data.totalCoins,
      paperCoins: data.paperCoins,
      activityCoins: data.activityCoins,
      shortActivityCoins: data.shortActivityCoins,
      totalShortCoins: data.totalShortCoins,
      completedPapersCount: data.completedPapersCount,
      totalCompletedPapersCount: data.totalCompletedPapersCount,
      completedPapersByCategory: data.completedPapersByCategory,
    });
  } catch (error) {
    console.error("getLoginUserTotalCoinsCount error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get login user total coins count",
      data: {
        totalCoins: 0,
        paperCoins: 0,
        activityCoins: 0,
        completedPapersCount: 0,
      },
    });
  }
};