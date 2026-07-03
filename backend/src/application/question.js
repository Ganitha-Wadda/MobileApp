import mongoose from "mongoose";
import Paper from "../infastructure/schemas/paper.js";
import Question from "../infastructure/schemas/question.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(String(id || ""));
const norm = (v) => String(v || "").trim();

const uniqSortedNums = (arr) =>
  [...new Set((arr || []).map(Number).filter((n) => Number.isFinite(n)))].sort((a, b) => a - b);

const getPaperProgress = async (paperId) => {
  const paper = await Paper.findById(paperId).lean();
  if (!paper) return null;

  const currentCount = await Question.countDocuments({ paperId });
  const requiredCount = Number(paper.questionCount || 0);

  return {
    paperId,
    requiredCount,
    currentCount,
    remaining: Math.max(requiredCount - currentCount, 0),
    isComplete: currentCount >= requiredCount,
    oneQuestionAnswersCount: Number(paper.oneQuestionAnswersCount || 4),
  };
};

/**
 * Checks whether an answer slot is valid.
 * A slot is valid when it has text, an image, or both.
 */
const isAnswerSlotValid = (text, imageUrl) =>
  norm(text).length > 0 || norm(imageUrl).length > 0;

const buildQuestionPatch = ({ body, paper, existing = null, requireAll = false }) => {
  const patch = {};

  if (requireAll || body.question !== undefined) {
    const question = norm(body.question);
    if (!question) return { error: "question is required" };
    patch.question = question;
  }

  if (body.lessonName !== undefined || requireAll) patch.lessonName = norm(body.lessonName);
  if (body.explanationVideoUrl !== undefined || requireAll)
    patch.explanationVideoUrl = norm(body.explanationVideoUrl);
  if (body.explanationText !== undefined || requireAll)
    patch.explanationText = norm(body.explanationText);
  if (body.imageUrl !== undefined || requireAll) patch.imageUrl = norm(body.imageUrl);

  let nextAnswers = null;
  let nextAnswerImages = null;

  if (requireAll || body.answers !== undefined) {
    if (!Array.isArray(body.answers)) return { error: "answers must be an array" };
    if (body.answers.length < 1 || body.answers.length > 6) {
      return { error: "answers must be between 1 and 6 items" };
    }

    // Preserve raw text including empty strings — image-only slots send "".
    nextAnswers = body.answers.map((a) => norm(a));

    // Align answerImages to the incoming answers array.
    const rawImages = Array.isArray(body.answerImages) ? body.answerImages : [];
    nextAnswerImages = Array.from(
      { length: nextAnswers.length },
      (_, i) => norm(rawImages[i] || "")
    );

    // Validate: every slot must have text OR an image.
    const badSlots = nextAnswers.filter(
      (text, i) => !isAnswerSlotValid(text, nextAnswerImages[i])
    );
    if (badSlots.length > 0) {
      return { error: "Each answer must have text, an image, or both" };
    }

    patch.answers = nextAnswers;
    patch.answerImages = nextAnswerImages;
  } else if (body.answerImages !== undefined) {
    // Only images updated, answers unchanged.
    const answersRef = existing?.answers || [];
    const rawImages = Array.isArray(body.answerImages) ? body.answerImages : [];
    nextAnswerImages = Array.from(
      { length: answersRef.length },
      (_, i) => norm(rawImages[i] || "")
    );
    patch.answerImages = nextAnswerImages;
  }

  // If answers changed and images weren't explicitly re-sent, re-align from existing.
  if (nextAnswers && !nextAnswerImages && existing) {
    const rawImages = Array.isArray(existing.answerImages) ? existing.answerImages : [];
    nextAnswerImages = Array.from(
      { length: nextAnswers.length },
      (_, i) => norm(rawImages[i] || "")
    );
    patch.answerImages = nextAnswerImages;
  }

  // ── correctAnswerIndexes ───────────────────────────────────────────────────
  let idxs = null;
  if (Array.isArray(body.correctAnswerIndexes)) {
    idxs = uniqSortedNums(body.correctAnswerIndexes);
  } else if (body.correctAnswerIndex !== undefined && body.correctAnswerIndex !== null) {
    idxs = uniqSortedNums([Number(body.correctAnswerIndex)]);
  } else if (requireAll) {
    idxs = [];
  }

  if (idxs !== null) {
    if (idxs.length < 1) return { error: "Select at least 1 correct answer" };

    const answersToValidate = nextAnswers || existing?.answers || [];
    const bad = idxs.some((i) => i < 0 || i >= answersToValidate.length);

    if (bad) {
      return {
        error: `correctAnswerIndexes must be between 0 and ${Math.max(
          answersToValidate.length - 1,
          0
        )}`,
      };
    }

    patch.correctAnswerIndexes = idxs;
  } else if (nextAnswers && existing) {
    const old = uniqSortedNums(existing.correctAnswerIndexes || []);
    const filtered = old.filter((i) => i >= 0 && i < nextAnswers.length);
    patch.correctAnswerIndexes = filtered.length ? filtered : [0];
  }

  // ── point ─────────────────────────────────────────────────────────────────
  if (body.point !== undefined && body.point !== null && String(body.point).trim() !== "") {
    const point = Number(body.point);
    if (!Number.isFinite(point) || point < 0) return { error: "point must be a valid number >= 0" };
    patch.point = point;
  } else if (requireAll) {
    let payType = String(paper?.payment || "free").toLowerCase();
    if (payType === "practice") payType = "practise";

    if (payType === "paid") patch.point = 8;
    else if (payType === "practise") patch.point = 0;
    else patch.point = 6;
  }

  return { patch };
};

// =======================================================
// ADMIN: CREATE QUESTION OR UPDATE SAME QUESTION NUMBER
// POST /api/question
// =======================================================
export const createQuestion = async (req, res) => {
  try {
    const { paperId, questionNumber } = req.body;

    if (!paperId || !isValidId(paperId)) {
      return res.status(400).json({ message: "Valid paperId is required" });
    }

    const qNo = Number(questionNumber);
    if (!Number.isInteger(qNo) || qNo < 1) {
      return res.status(400).json({ message: "questionNumber must be >= 1" });
    }

    const paper = await Paper.findById(paperId).lean();
    if (!paper) return res.status(404).json({ message: "Paper not found" });

    const requiredCount = Number(paper.questionCount || 0);
    if (qNo > requiredCount) {
      return res.status(400).json({
        message: `questionNumber cannot be greater than paper question count (${requiredCount})`,
      });
    }

    const existing = await Question.findOne({ paperId, questionNumber: qNo }).lean();

    if (!existing) {
      const currentCount = await Question.countDocuments({ paperId });
      if (currentCount >= requiredCount) {
        return res.status(400).json({
          message: `Question limit reached for this paper (max ${requiredCount})`,
        });
      }
    }

    const built = buildQuestionPatch({ body: req.body, paper, existing, requireAll: true });
    if (built.error) return res.status(400).json({ message: built.error });

    let doc;
    let statusCode;
    let message;

    if (existing) {
      doc = await Question.findByIdAndUpdate(
        existing._id,
        built.patch,
        { new: true, runValidators: true }
      ).lean();
      statusCode = 200;
      message = "Question updated successfully";
    } else {
      doc = await Question.create({
        paperId,
        questionNumber: qNo,
        ...built.patch,
        createdBy: req.user?.id || null,
      });
      statusCode = 201;
      message = "Question created successfully";
    }

    const progress = await getPaperProgress(paperId);

    return res.status(statusCode).json({
      message,
      question: doc,
      progress,
    });
  } catch (err) {
    console.error("createQuestion error:", err);
    if (err?.code === 11000) {
      return res.status(409).json({ message: "Duplicate questionNumber for this paper" });
    }
    return res.status(500).json({
      message: "Internal server error",
      errorName: err?.name,
      errorMessage: err?.message,
    });
  }
};

// =======================================================
// ADMIN: GET QUESTIONS BY PAPER
// GET /api/question/paper/:paperId
// =======================================================
export const getQuestionsByPaper = async (req, res) => {
  try {
    const { paperId } = req.params;
    if (!isValidId(paperId)) return res.status(400).json({ message: "Invalid paperId" });

    const paper = await Paper.findById(paperId).lean();
    if (!paper) return res.status(404).json({ message: "Paper not found" });

    const list = await Question.find({ paperId }).sort({ questionNumber: 1 }).lean();

    const normalized = list.map((q) => ({
      ...q,
      correctAnswerIndexes: Array.isArray(q.correctAnswerIndexes)
        ? uniqSortedNums(q.correctAnswerIndexes)
        : [],
      answerImages: Array.isArray(q.answerImages) ? q.answerImages : [],
    }));

    const progress = await getPaperProgress(paperId);

    return res.status(200).json({ paper, questions: normalized, progress });
  } catch (err) {
    console.error("getQuestionsByPaper error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// =======================================================
// ADMIN: UPDATE QUESTION
// PATCH /api/question/:questionId
// =======================================================
export const updateQuestionById = async (req, res) => {
  try {
    const { questionId } = req.params;
    if (!isValidId(questionId)) return res.status(400).json({ message: "Invalid questionId" });

    const existing = await Question.findById(questionId).lean();
    if (!existing) return res.status(404).json({ message: "Question not found" });

    const paper = await Paper.findById(existing.paperId).lean();
    if (!paper) return res.status(404).json({ message: "Paper not found" });

    const built = buildQuestionPatch({ body: req.body, paper, existing, requireAll: false });
    if (built.error) return res.status(400).json({ message: built.error });

    if (Object.keys(built.patch).length === 0) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    const updated = await Question.findByIdAndUpdate(questionId, built.patch, {
      new: true,
      runValidators: true,
    }).lean();

    const progress = await getPaperProgress(existing.paperId);

    return res.status(200).json({
      message: "Question updated successfully",
      question: {
        ...updated,
        correctAnswerIndexes: Array.isArray(updated.correctAnswerIndexes)
          ? uniqSortedNums(updated.correctAnswerIndexes)
          : [],
        answerImages: Array.isArray(updated.answerImages) ? updated.answerImages : [],
      },
      progress,
    });
  } catch (err) {
    console.error("updateQuestionById error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};