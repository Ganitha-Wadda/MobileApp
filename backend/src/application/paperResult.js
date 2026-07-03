import mongoose from "mongoose";
import Paper from "../infastructure/schemas/paper.js";
import Question from "../infastructure/schemas/question.js";
import PaperResult from "../infastructure/schemas/paperResult.js";

const COINS_PER_CORRECT_ANSWER = 5;

const isValidId = (id) => mongoose.Types.ObjectId.isValid(String(id || ""));

const toObjectId = (id) => new mongoose.Types.ObjectId(String(id));

const getUserId = (req) => {
  const id = req.user?.id || req.user?._id || req.user?.userId;
  return isValidId(id) ? String(id) : "";
};

const uniqSortedIndexes = (value) =>
  [
    ...new Set(
      (Array.isArray(value) ? value : [value])
        .map(Number)
        .filter((n) => Number.isInteger(n) && n >= 0)
    ),
  ].sort((a, b) => a - b);

const sameIndexes = (a = [], b = []) => {
  const x = uniqSortedIndexes(a);
  const y = uniqSortedIndexes(b);

  if (x.length !== y.length) return false;

  return x.every((value, index) => value === y[index]);
};

const secondsUntil = (date) => {
  const end = new Date(date).getTime();
  return Math.max(Math.ceil((end - Date.now()) / 1000), 0);
};

const parsePaperDurationSeconds = (timeValue) => {
  const raw = String(timeValue || "").trim().toLowerCase();

  if (!raw) return 30 * 60;

  if (/^\d{1,2}:\d{1,2}(:\d{1,2})?$/.test(raw)) {
    const parts = raw.split(":").map((part) => Number(part));

    if (parts.length === 3) {
      const [hours, minutes, seconds] = parts;
      return Math.max(hours * 3600 + minutes * 60 + seconds, 1);
    }

    const [minutes, seconds] = parts;
    return Math.max(minutes * 60 + seconds, 1);
  }

  const hourMatch = raw.match(/(\d+(?:\.\d+)?)\s*(h|hr|hrs|hour|hours)/);
  const minuteMatch = raw.match(/(\d+(?:\.\d+)?)\s*(m|min|mins|minute|minutes)/);
  const secondMatch = raw.match(/(\d+(?:\.\d+)?)\s*(s|sec|secs|second|seconds)/);

  let total = 0;

  if (hourMatch) total += Number(hourMatch[1]) * 3600;
  if (minuteMatch) total += Number(minuteMatch[1]) * 60;
  if (secondMatch) total += Number(secondMatch[1]);

  if (total > 0) return Math.max(Math.round(total), 1);

  const onlyNumber = Number(raw.replace(/[^0-9.]/g, ""));

  if (Number.isFinite(onlyNumber) && onlyNumber > 0) {
    return Math.max(Math.round(onlyNumber * 60), 1);
  }

  return 30 * 60;
};

const getQuestionTextByIndexes = (answers = [], indexes = []) =>
  uniqSortedIndexes(indexes)
    .map((index) => answers[index])
    .filter((answer) => answer !== undefined && answer !== null)
    .map((answer) => String(answer));

const buildQuestionResultRow = (question, selectedAnswerIndexes = []) => {
  const answers = Array.isArray(question.answers) ? question.answers : [];

  const selected = uniqSortedIndexes(selectedAnswerIndexes).filter(
    (index) => index >= 0 && index < answers.length
  );

  const correct = uniqSortedIndexes(question.correctAnswerIndexes).filter(
    (index) => index >= 0 && index < answers.length
  );

  const isAttempted = selected.length > 0;
  const isCorrect = isAttempted && sameIndexes(selected, correct);
  const status = !isAttempted ? "not_attempted" : isCorrect ? "correct" : "wrong";
  const coinsEarned = isCorrect ? COINS_PER_CORRECT_ANSWER : 0;

  return {
    questionId: question._id,
    questionNumber: Number(question.questionNumber || 0),
    lessonName: String(question.lessonName || ""),
    question: String(question.question || ""),
    answerOptions: answers.map((answer) => String(answer || "")),
    selectedAnswerIndexes: selected,
    selectedAnswerTexts: getQuestionTextByIndexes(answers, selected),
    correctAnswerIndexes: correct,
    correctAnswerTexts: getQuestionTextByIndexes(answers, correct),
    isAttempted,
    isCorrect,
    status,
    coinsEarned,
    point: COINS_PER_CORRECT_ANSWER,
    explanationText: String(question.explanationText || ""),
    explanationVideoUrl: String(question.explanationVideoUrl || ""),
    answeredAt: isAttempted ? new Date() : null,
  };
};

const createNotAttemptedRow = (question) => buildQuestionResultRow(question, []);

const getPaperAndQuestions = async (paperId) => {
  const paper = await Paper.findById(paperId).lean();

  if (!paper || paper.isActive === false || paper.isPublished === false) {
    return { error: "Paper not found or not published" };
  }

  const questions = await Question.find({
    paperId: toObjectId(paperId),
    isActive: true,
  })
    .sort({ questionNumber: 1 })
    .lean();

  if (questions.length === 0) {
    return { error: "This paper does not have active questions yet" };
  }

  return { paper, questions };
};

const recalculateResultSummary = (attempt) => {
  const answers = Array.isArray(attempt.answers) ? attempt.answers : [];
  const totalQuestions = Number(attempt.totalQuestions || answers.length || 0);

  const attemptedCount = answers.filter((answer) => answer.isAttempted).length;
  const correctCount = answers.filter((answer) => answer.status === "correct").length;
  const wrongCount = answers.filter((answer) => answer.status === "wrong").length;
  const notAttemptedCount = Math.max(totalQuestions - attemptedCount, 0);

  const totalCoins = answers.reduce(
    (sum, answer) => sum + Number(answer.coinsEarned || 0),
    0
  );

  attempt.totalQuestions = totalQuestions;
  attempt.attemptedCount = attemptedCount;
  attempt.correctCount = correctCount;
  attempt.wrongCount = wrongCount;
  attempt.notAttemptedCount = notAttemptedCount;
  attempt.totalCoins = totalCoins;
  attempt.maximumCoins = totalQuestions * COINS_PER_CORRECT_ANSWER;
  attempt.percentage =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  attempt.lastActivityAt = new Date();

  return attempt;
};

const serializeAnswer = (answer, includeCorrect = false) => ({
  questionId: answer.questionId?.toString?.() || String(answer.questionId || ""),
  questionNumber: Number(answer.questionNumber || 0),
  lessonName: answer.lessonName || "",
  question: answer.question || "",
  answers: Array.isArray(answer.answerOptions) ? answer.answerOptions : [],
  answerOptions: Array.isArray(answer.answerOptions) ? answer.answerOptions : [],
  selectedAnswerIndexes: Array.isArray(answer.selectedAnswerIndexes)
    ? answer.selectedAnswerIndexes
    : [],
  selectedIndexes: Array.isArray(answer.selectedAnswerIndexes)
    ? answer.selectedAnswerIndexes
    : [],
  selectedAnswerTexts: Array.isArray(answer.selectedAnswerTexts)
    ? answer.selectedAnswerTexts
    : [],
  selectedAnswers: Array.isArray(answer.selectedAnswerTexts)
    ? answer.selectedAnswerTexts
    : [],
  correctAnswerIndexes: includeCorrect
    ? Array.isArray(answer.correctAnswerIndexes)
      ? answer.correctAnswerIndexes
      : []
    : [],
  correctAnswers: includeCorrect
    ? Array.isArray(answer.correctAnswerTexts)
      ? answer.correctAnswerTexts
      : []
    : [],
  correctAnswerTexts: includeCorrect
    ? Array.isArray(answer.correctAnswerTexts)
      ? answer.correctAnswerTexts
      : []
    : [],
  isAttempted: Boolean(answer.isAttempted),
  isCorrect: Boolean(answer.isCorrect),
  status: answer.status || "not_attempted",
  coinsEarned: Number(answer.coinsEarned || 0),
  point: Number(answer.point || COINS_PER_CORRECT_ANSWER),
  explanationText: answer.explanationText || "",
  explanationVideoUrl: answer.explanationVideoUrl || "",
  answeredAt: answer.answeredAt || null,
});

const serializeAttempt = (attemptDoc, options = {}) => {
  const attempt = attemptDoc?.toObject ? attemptDoc.toObject() : { ...attemptDoc };
  const includeCorrect = options.includeCorrect || attempt.status !== "in_progress";

  return {
    ...attempt,
    id: attempt._id?.toString?.() || attempt.id,
    _id: attempt._id?.toString?.() || attempt._id,
    userId: attempt.userId?.toString?.() || attempt.userId,
    paperId:
      attempt.paperId?._id?.toString?.() ||
      attempt.paperId?.toString?.() ||
      attempt.paperId,
    status: attempt.status || "in_progress",
    remainingSeconds:
      attempt.status === "in_progress" ? secondsUntil(attempt.expiresAt) : 0,
    answers: Array.isArray(attempt.answers)
      ? attempt.answers
          .slice()
          .sort(
            (a, b) =>
              Number(a.questionNumber || 0) - Number(b.questionNumber || 0)
          )
          .map((answer) => serializeAnswer(answer, includeCorrect))
      : [],
  };
};

const serializeResultListItem = (attemptDoc) => {
  const attempt = attemptDoc?.toObject ? attemptDoc.toObject() : { ...attemptDoc };
  const paper = attempt.paperId && typeof attempt.paperId === "object" ? attempt.paperId : null;
  const snapshot = attempt.paperSnapshot || {};

  const paperId =
    paper?._id?.toString?.() || attempt.paperId?.toString?.() || "";

  const paperName =
    snapshot.paperName ||
    snapshot.paperTitle ||
    paper?.paperName ||
    paper?.paperTitle ||
    "Untitled paper";

  const totalQuestions = Number(
    attempt.totalQuestions || snapshot.questionCount || paper?.questionCount || 0
  );

  const correctCount = Number(attempt.correctCount || 0);

  const totalCoins = Number(attempt.totalCoins || 0);
  const maximumCoins = Number(
    attempt.maximumCoins || totalQuestions * COINS_PER_CORRECT_ANSWER || 0
  );

  return {
    id: attempt._id?.toString?.() || "",
    _id: attempt._id?.toString?.() || "",
    attemptId: attempt._id?.toString?.() || "",
    paperId,
    paperName,
    name: paperName,
    paperType: snapshot.paperType || paper?.paperType || "",

    // IMPORTANT:
    // 4/5 means 4 correct answers from 5 total questions.
    // This is NOT coins and NOT attempted count.
    marks: `${correctCount}/${totalQuestions}`,

    correctCount,
    totalQuestions,
    wrongCount: Number(attempt.wrongCount || 0),
    notAttemptedCount: Number(attempt.notAttemptedCount || 0),
    attemptedCount: Number(attempt.attemptedCount || 0),

    // Coins still come from backend, but Result page does not show them as Marks.
    totalCoins,
    maximumCoins,

    percentage: Number(attempt.percentage || 0),
    status: attempt.status || "",
    submittedAt: attempt.submittedAt || null,
    startedAt: attempt.startedAt || null,
    createdAt: attempt.createdAt || null,
  };
};

const normalizePaperTypeFilter = (value = "") => {
  const raw = String(value || "").trim().toLowerCase();

  if (!raw || raw === "all" || raw === "all results") return "";

  const compact = raw.replace(/[\s_-]+/g, "");

  if (
    raw === "daily paper" ||
    raw === "daily papers" ||
    compact === "dailypaper" ||
    compact === "dailypapers"
  ) {
    return "daily paper";
  }

  if (
    raw === "500 paper" ||
    raw === "500 papers" ||
    raw === "fivehundredpapers" ||
    raw === "five hundred papers" ||
    raw === "five hundred paper" ||
    compact === "500paper" ||
    compact === "500papers" ||
    compact === "fivehundredpaper" ||
    compact === "fivehundredpapers"
  ) {
    return "500 paper";
  }

  if (
    raw === "pastpapers" ||
    raw === "past papers" ||
    raw === "past paper" ||
    compact === "pastpapers" ||
    compact === "pastpaper"
  ) {
    return "pastpapers";
  }

  if (
    raw === "lesson by lesson" ||
    raw === "lesson by lesson papers" ||
    raw === "lesson by lesson paper" ||
    compact === "lessonbylesson" ||
    compact === "lessonbylessonpapers" ||
    compact === "lessonbylessonpaper"
  ) {
    return "lesson by lesson";
  }

  return raw;
};

const getPaperTypeRegex = (paperType) => {
  if (!paperType) return null;

  if (paperType === "daily paper") {
    return /^(daily paper|daily papers)$/i;
  }

  if (paperType === "500 paper") {
    return /^(500 paper|500 papers|fivehundredpapers|five hundred paper|five hundred papers)$/i;
  }

  if (paperType === "pastpapers") {
    return /^(pastpapers|past paper|past papers)$/i;
  }

  if (paperType === "lesson by lesson") {
    return /^(lesson by lesson|lesson by lesson paper|lesson by lesson papers)$/i;
  }

  return new RegExp(`^${paperType.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
};

const finalizeAttemptDoc = async (attemptDoc, finalStatus = "completed") => {
  if (!attemptDoc) return null;

  if (attemptDoc.status !== "in_progress") {
    return attemptDoc;
  }

  const { questions, error } = await getPaperAndQuestions(String(attemptDoc.paperId));

  if (error) {
    throw new Error(error);
  }

  const existingRows = Array.isArray(attemptDoc.answers) ? attemptDoc.answers : [];

  const completedRows = questions.map((question) => {
    const found = existingRows.find(
      (row) => String(row.questionId) === String(question._id)
    );

    if (!found) return createNotAttemptedRow(question);

    return buildQuestionResultRow(question, found.selectedAnswerIndexes || []);
  });

  attemptDoc.answers = completedRows;
  attemptDoc.status = finalStatus === "expired" ? "expired" : "completed";
  attemptDoc.submittedAt = new Date();
  attemptDoc.currentQuestionNumber = Math.min(
    Number(attemptDoc.currentQuestionNumber || 1),
    Math.max(questions.length, 1)
  );

  recalculateResultSummary(attemptDoc);

  await attemptDoc.save();

  return attemptDoc;
};

const finalizeIfExpired = async (attemptDoc) => {
  if (!attemptDoc) return null;

  if (
    attemptDoc.status === "in_progress" &&
    secondsUntil(attemptDoc.expiresAt) <= 0
  ) {
    return finalizeAttemptDoc(attemptDoc, "expired");
  }

  return attemptDoc;
};

// =======================================================
// STUDENT: RESULT PAGE LIST WITH FILTER + PAGINATION
// GET /api/paper-results/my-results?paperType=daily paper&page=1&limit=10
// =======================================================
export const getMyPaperResults = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const page = Math.max(Number.parseInt(req.query?.page, 10) || 1, 1);
    const limitRaw = Number.parseInt(req.query?.limit, 10) || 10;

    // Your requirement: only 10 papers in table.
    const limit = Math.min(Math.max(limitRaw, 1), 10);
    const skip = (page - 1) * limit;

    const paperType = normalizePaperTypeFilter(req.query?.paperType);
    const paperTypeRegex = getPaperTypeRegex(paperType);

    const now = new Date();

    const expiredAttempts = await PaperResult.find({
      userId: toObjectId(userId),
      status: "in_progress",
      expiresAt: { $lte: now },
    });

    for (const attempt of expiredAttempts) {
      await finalizeIfExpired(attempt);
    }

    const query = {
      userId: toObjectId(userId),
      status: { $in: ["completed", "expired"] },
    };

    if (paperTypeRegex) {
      query["paperSnapshot.paperType"] = paperTypeRegex;
    }

    const [total, attempts] = await Promise.all([
      PaperResult.countDocuments(query),
      PaperResult.find(query)
        .populate({
          path: "paperId",
          select: "paperName paperTitle paperType gradeId questionCount time",
        })
        .sort({ submittedAt: -1, lastActivityAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    const totalPages = Math.max(Math.ceil(total / limit), 1);
    const safePage = Math.min(page, totalPages);

    const resultList = attempts.map(serializeResultListItem);

    return res.status(200).json({
      message: "Paper results loaded successfully",
      data: resultList,
      results: resultList,
      filter: {
        paperType,
      },
      pagination: {
        page: safePage,
        limit,
        total,
        totalPages,
        hasNextPage: safePage < totalPages,
        hasPreviousPage: safePage > 1,
        nextPage: safePage < totalPages ? safePage + 1 : null,
        previousPage: safePage > 1 ? safePage - 1 : null,
      },
    });
  } catch (err) {
    console.error("getMyPaperResults error:", err);

    return res.status(500).json({
      message: "Internal server error",
      errorName: err?.name,
      errorMessage: err?.message,
    });
  }
};

// =======================================================
// STUDENT: START OR RESUME ACTIVE ATTEMPT
// POST /api/paper-results/start-or-resume
// body: { paperId }
// =======================================================
export const startOrResumePaperAttempt = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { paperId } = req.body || {};

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (!isValidId(paperId)) {
      return res.status(400).json({
        message: "Valid paperId is required",
      });
    }

    let existingAttempt = await PaperResult.findOne({
      userId: toObjectId(userId),
      paperId: toObjectId(paperId),
    }).sort({ createdAt: -1 });

    if (existingAttempt) {
      existingAttempt = await finalizeIfExpired(existingAttempt);

      return res.status(200).json({
        message:
          existingAttempt.status === "in_progress"
            ? "Paper attempt resumed"
            : "You already attempted this paper. Please view your review.",
        alreadyAttempted: existingAttempt.status !== "in_progress",
        data: serializeAttempt(existingAttempt),
      });
    }

    const { paper, questions, error } = await getPaperAndQuestions(paperId);

    if (error) {
      return res.status(404).json({
        message: error,
      });
    }

    const now = new Date();
    const durationSeconds = parsePaperDurationSeconds(paper.time);
    const totalQuestions = questions.length;

    const attempt = await PaperResult.create({
      userId: toObjectId(userId),
      paperId: toObjectId(paperId),
      paperSnapshot: {
        gradeId: Number(paper.gradeId || 0),
        paperType: paper.paperType || "",
        paperName: paper.paperName || "",
        paperTitle: paper.paperTitle || paper.paperName || "",
        paperSubtitle: paper.paperSubtitle || "",
        time: paper.time || "",
        questionCount: Number(paper.questionCount || totalQuestions),
      },
      durationSeconds,
      startedAt: now,
      expiresAt: new Date(now.getTime() + durationSeconds * 1000),
      status: "in_progress",
      currentQuestionNumber: 1,
      answers: [],
      totalQuestions,
      attemptedCount: 0,
      correctCount: 0,
      wrongCount: 0,
      notAttemptedCount: totalQuestions,
      totalCoins: 0,
      maximumCoins: totalQuestions * COINS_PER_CORRECT_ANSWER,
      percentage: 0,
      lastActivityAt: now,
    });

    await Paper.findByIdAndUpdate(paperId, {
      $inc: {
        attemptCount: 1,
      },
    });

    return res.status(201).json({
      message: "Paper attempt started",
      data: serializeAttempt(attempt),
    });
  } catch (err) {
    console.error("startOrResumePaperAttempt error:", err);

    if (err?.code === 11000) {
      return res.status(409).json({
        message: "You already attempted this paper. Please view your review.",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
      errorName: err?.name,
      errorMessage: err?.message,
    });
  }
};

// =======================================================
// STUDENT: SAVE ONE QUESTION ANSWER
// POST /api/paper-results/answer
// body: { attemptId, paperId, questionId/questionNumber, selectedAnswerIndex }
// =======================================================
export const savePaperQuestionAnswer = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const {
      attemptId,
      paperId,
      questionId,
      questionNumber,
      selectedAnswerIndex,
      selectedAnswerIndexes,
    } = req.body || {};

    if (!isValidId(attemptId)) {
      return res.status(400).json({
        message: "Valid attemptId is required",
      });
    }

    const attempt = await PaperResult.findOne({
      _id: toObjectId(attemptId),
      userId: toObjectId(userId),
    });

    if (!attempt) {
      return res.status(404).json({
        message: "Paper attempt not found",
      });
    }

    const checkedAttempt = await finalizeIfExpired(attempt);

    if (checkedAttempt.status !== "in_progress") {
      return res.status(409).json({
        message: "Paper time is over. Attempt already finalized.",
        data: serializeAttempt(checkedAttempt),
      });
    }

    const attemptPaperId = String(checkedAttempt.paperId);
    const requestPaperId = isValidId(paperId) ? String(paperId) : attemptPaperId;

    if (attemptPaperId !== requestPaperId) {
      return res.status(400).json({
        message: "paperId does not match this attempt",
      });
    }

    const qFilter = {
      paperId: toObjectId(attemptPaperId),
      isActive: true,
    };

    if (isValidId(questionId)) {
      qFilter._id = toObjectId(questionId);
    } else {
      const qNo = Number(questionNumber);

      if (!Number.isInteger(qNo) || qNo < 1) {
        return res.status(400).json({
          message: "questionId or valid questionNumber is required",
        });
      }

      qFilter.questionNumber = qNo;
    }

    const question = await Question.findOne(qFilter).lean();

    if (!question) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    const qNo = Number(question.questionNumber || 0);

    if (qNo > Number(checkedAttempt.currentQuestionNumber || 1)) {
      return res.status(400).json({
        message: "You cannot skip questions. Please answer the current question first.",
        currentQuestionNumber: checkedAttempt.currentQuestionNumber,
      });
    }

    const selected =
      selectedAnswerIndexes !== undefined
        ? uniqSortedIndexes(selectedAnswerIndexes)
        : uniqSortedIndexes(selectedAnswerIndex);

    if (selected.length < 1) {
      return res.status(400).json({
        message: "Please select an answer first",
      });
    }

    const answers = Array.isArray(question.answers) ? question.answers : [];

    const badIndex = selected.some(
      (index) => index < 0 || index >= answers.length
    );

    if (badIndex) {
      return res.status(400).json({
        message: `Selected answer index must be between 0 and ${Math.max(
          answers.length - 1,
          0
        )}`,
      });
    }

    const row = buildQuestionResultRow(question, selected);

    const nextAnswers = Array.isArray(checkedAttempt.answers)
      ? [...checkedAttempt.answers]
      : [];

    const existingIndex = nextAnswers.findIndex(
      (answer) => String(answer.questionId) === String(question._id)
    );

    if (existingIndex >= 0) {
      nextAnswers[existingIndex] = row;
    } else {
      nextAnswers.push(row);
    }

    checkedAttempt.answers = nextAnswers.sort(
      (a, b) => Number(a.questionNumber || 0) - Number(b.questionNumber || 0)
    );

    if (qNo >= Number(checkedAttempt.currentQuestionNumber || 1)) {
      checkedAttempt.currentQuestionNumber = Math.min(
        qNo + 1,
        Number(checkedAttempt.totalQuestions || checkedAttempt.answers.length || qNo)
      );
    }

    recalculateResultSummary(checkedAttempt);

    await checkedAttempt.save();

    return res.status(200).json({
      message: row.isCorrect
        ? `Answer saved. Correct answer earned ${COINS_PER_CORRECT_ANSWER} coins.`
        : "Answer saved. Wrong answer earned 0 coins.",
      answer: serializeAnswer(row, false),
      data: serializeAttempt(checkedAttempt),
    });
  } catch (err) {
    console.error("savePaperQuestionAnswer error:", err);

    return res.status(500).json({
      message: "Internal server error",
      errorName: err?.name,
      errorMessage: err?.message,
    });
  }
};

// =======================================================
// STUDENT: FINISH PAPER MANUALLY OR BY TIMER
// PATCH /api/paper-results/finish/:attemptId
// body: { expired: true/false }
// =======================================================
export const finishPaperAttempt = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { attemptId } = req.params;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (!isValidId(attemptId)) {
      return res.status(400).json({
        message: "Invalid attemptId",
      });
    }

    const attempt = await PaperResult.findOne({
      _id: toObjectId(attemptId),
      userId: toObjectId(userId),
    });

    if (!attempt) {
      return res.status(404).json({
        message: "Paper attempt not found",
      });
    }

    if (attempt.status !== "in_progress") {
      return res.status(200).json({
        message: "Paper attempt already finalized",
        data: serializeAttempt(attempt),
      });
    }

    const expiredByTime =
      secondsUntil(attempt.expiresAt) <= 0 || req.body?.expired === true;

    const finalized = await finalizeAttemptDoc(
      attempt,
      expiredByTime ? "expired" : "completed"
    );

    return res.status(200).json({
      message: expiredByTime
        ? "Paper time over. Result saved."
        : "Paper completed. Result saved.",
      data: serializeAttempt(finalized),
    });
  } catch (err) {
    console.error("finishPaperAttempt error:", err);

    return res.status(500).json({
      message: "Internal server error",
      errorName: err?.name,
      errorMessage: err?.message,
    });
  }
};

// =======================================================
// STUDENT: GET ONE ATTEMPT/RESULT
// GET /api/paper-results/attempt/:attemptId
// =======================================================
export const getPaperAttemptResult = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { attemptId } = req.params;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (!isValidId(attemptId)) {
      return res.status(400).json({
        message: "Invalid attemptId",
      });
    }

    let attempt = await PaperResult.findOne({
      _id: toObjectId(attemptId),
      userId: toObjectId(userId),
    });

    if (!attempt) {
      return res.status(404).json({
        message: "Paper attempt not found",
      });
    }

    attempt = await finalizeIfExpired(attempt);

    return res.status(200).json({
      message: "Paper result loaded successfully",
      data: serializeAttempt(attempt),
    });
  } catch (err) {
    console.error("getPaperAttemptResult error:", err);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// =======================================================
// STUDENT: CHECK ACTIVE ATTEMPT BY PAPER
// GET /api/paper-results/paper/:paperId/active
// =======================================================
export const getActivePaperAttemptByPaper = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { paperId } = req.params;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (!isValidId(paperId)) {
      return res.status(400).json({
        message: "Invalid paperId",
      });
    }

    let attempt = await PaperResult.findOne({
      userId: toObjectId(userId),
      paperId: toObjectId(paperId),
      status: "in_progress",
    }).sort({ createdAt: -1 });

    if (!attempt) {
      return res.status(200).json({
        message: "No active paper attempt",
        data: null,
      });
    }

    attempt = await finalizeIfExpired(attempt);

    return res.status(200).json({
      message:
        attempt.status === "in_progress"
          ? "Active paper attempt loaded"
          : "Paper time is over. Attempt finalized.",
      data: serializeAttempt(attempt),
    });
  } catch (err) {
    console.error("getActivePaperAttemptByPaper error:", err);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// =======================================================
// STUDENT: GET LATEST ATTEMPT/RESULT BY PAPER
// GET /api/paper-results/paper/:paperId/latest
// Used by paper menus to show Start / Continue / View Review.
// =======================================================
export const getLatestPaperResultByPaper = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { paperId } = req.params;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (!isValidId(paperId)) {
      return res.status(400).json({
        message: "Invalid paperId",
      });
    }

    let attempt = await PaperResult.findOne({
      userId: toObjectId(userId),
      paperId: toObjectId(paperId),
    }).sort({ createdAt: -1 });

    if (!attempt) {
      return res.status(200).json({
        message: "No paper attempt found",
        data: null,
      });
    }

    attempt = await finalizeIfExpired(attempt);

    return res.status(200).json({
      message: "Latest paper attempt loaded",
      data: serializeAttempt(attempt),
    });
  } catch (err) {
    console.error("getLatestPaperResultByPaper error:", err);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};