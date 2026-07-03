import mongoose from "mongoose";
import Paper, { PAPER_TYPES } from "../infastructure/schemas/paper.js";
import Question from "../infastructure/schemas/question.js";
import Grade from "../infastructure/schemas/grade.js";
import User from "../infastructure/schemas/user.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(String(id || ""));
const norm = (v) => String(v || "").trim();

const normalizePayment = (value) => {
  const v = String(value || "free").trim().toLowerCase();
  if (v === "practice") return "practise";
  return v;
};

const uniqSortedNums = (arr) =>
  [
    ...new Set(
      (Array.isArray(arr) ? arr : [])
        .map(Number)
        .filter((n) => Number.isInteger(n) && n >= 0)
    ),
  ].sort((a, b) => a - b);

const parseGradeId = (value) => {
  if (value === undefined || value === null || value === "") return undefined;

  if (typeof value === "object") {
    return parseGradeId(
      value.gradeId ??
        value.gradeNumber ??
        value.number ??
        value.value ??
        value.label ??
        value.name
    );
  }

  if (typeof value === "number") {
    return Number.isInteger(value) ? value : undefined;
  }

  const text = String(value).trim();

  // Accept only real grade values like "3", "4", "5", "Grade 3".
  // Do NOT pull random digits from Mongo ObjectId strings.
  if (/^[0-9]+$/.test(text)) {
    const n = Number(text);
    return Number.isInteger(n) ? n : undefined;
  }

  const gradeTextMatch = text.match(/^grade\s*([0-9]+)$/i);
  if (gradeTextMatch) {
    const n = Number(gradeTextMatch[1]);
    return Number.isInteger(n) ? n : undefined;
  }

  return undefined;
};

const getLoggedInUserGradeId = (user) => {
  const candidates = [
    user?.gradeId,
    user?.grade?.gradeId,
    user?.grade?.gradeNumber,
    user?.grade?.number,
    user?.grade?.value,
    user?.selectedGrade?.gradeId,
    user?.selectedGrade?.id,
    user?.selectedGrade?.value,
    user?.selectedGrade,
    user?.studentGrade,
    user?.classGrade,
  ];

  for (const candidate of candidates) {
    const gradeId = parseGradeId(candidate);
    if (gradeId !== undefined) return gradeId;
  }

  return undefined;
};

const getLoggedInUserId = (req) => {
  const id = req.user?.id || req.user?._id || req.user?.userId;
  return mongoose.Types.ObjectId.isValid(String(id || "")) ? String(id) : "";
};

const resolveLoggedInUserGradeId = async (req) => {
  const directGradeId = getLoggedInUserGradeId(req.user);
  if (Number.isInteger(directGradeId)) return directGradeId;

  const userId = getLoggedInUserId(req);
  if (!userId) return undefined;

  let user = null;

  try {
    user = await User.findById(userId)
      .select("grade gradeId selectedGrade studentGrade classGrade")
      .populate("grade")
      .lean();
  } catch (err) {
    // Some projects keep grade as a plain field instead of a populated ref.
    // If populate is not available, load the user again without populate.
    user = await User.findById(userId)
      .select("grade gradeId selectedGrade studentGrade classGrade")
      .lean();
  }

  const populatedGradeId = getLoggedInUserGradeId(user);
  if (Number.isInteger(populatedGradeId)) return populatedGradeId;

  // Fallback for projects where `populate('grade')` is not configured or `grade`
  // is stored as a raw Grade ObjectId.
  if (mongoose.Types.ObjectId.isValid(String(user?.grade || ""))) {
    const grade = await Grade.findById(user.grade).lean();
    const gradeId = parseGradeId(grade);
    if (Number.isInteger(gradeId)) return gradeId;
  }

  return undefined;
};

const validateGradeAvailable = async (gradeId) => {
  const parsedGradeId = parseGradeId(gradeId);

  if (!Number.isInteger(parsedGradeId)) {
    return "Grade is required";
  }

  const grade = await Grade.findOne({
    gradeId: parsedGradeId,
    isActive: true,
  }).lean();

  if (!grade) {
    return "Selected grade is not available";
  }

  return "";
};

const buildPaperFilter = ({ gradeId, paperType, payment, publishedOnly = true }) => {
  const filter = { isActive: true };

  if (publishedOnly) {
    filter.isPublished = true;
  }

  if (gradeId !== undefined && gradeId !== null && gradeId !== "") {
    const parsedGradeId = parseGradeId(gradeId);

    if (!Number.isInteger(parsedGradeId)) {
      return { error: "Grade must be a valid number" };
    }

    filter.gradeId = parsedGradeId;
  }

  if (paperType !== undefined && paperType !== null && String(paperType).trim() !== "") {
    const normalizedPaperType = norm(paperType).toLowerCase();

    if (!PAPER_TYPES.includes(normalizedPaperType)) {
      return { error: "Please select a valid paper type" };
    }

    filter.paperType = normalizedPaperType;
  }

  if (payment !== undefined && payment !== null && String(payment).trim() !== "") {
    const normalizedPayment = normalizePayment(payment);

    if (!["free", "paid", "practise"].includes(normalizedPayment)) {
      return { error: "Payment type must be free or paid" };
    }

    filter.payment = normalizedPayment;
  }

  return { filter };
};

const normalizeQuestionForResponse = (questionDoc) => {
  const question = questionDoc?.toObject ? questionDoc.toObject() : { ...questionDoc };

  return {
    ...question,
    id: question._id?.toString?.() || question.id,
    paperId: question.paperId?.toString?.() || question.paperId,
    questionNumber: Number(question.questionNumber || 0),
    lessonName: question.lessonName || "",
    question: question.question || "",
    answers: Array.isArray(question.answers) ? question.answers : [],
    correctAnswerIndexes: uniqSortedNums(question.correctAnswerIndexes),
    point: Number(question.point || 0),
    explanationVideoUrl: question.explanationVideoUrl || "",
    explanationText: question.explanationText || "",
    imageUrl: question.imageUrl || "",
    isActive: question.isActive !== false,
    questionSource: "paper",
  };
};

const normalizePaperForResponse = async (paperDoc) => {
  if (!paperDoc) return null;

  const paper = paperDoc.toObject ? paperDoc.toObject() : { ...paperDoc };
  const paperId = paper._id || paper.id;

  const questionAddedCount = paperId
    ? await Question.countDocuments({ paperId, isActive: true })
    : 0;

  const requiredCount = Number(paper.questionCount || 0);
  const paperSubtitle = norm(paper.paperSubtitle);

  return {
    ...paper,
    id: paper._id?.toString?.() || paper.id,
    _id: paper._id?.toString?.() || paper._id,
    gradeId: Number(paper.gradeId || 0),
    paperTitle: paper.paperTitle || paper.paperName || "",
    paperSubtitle,
    subtitle: paperSubtitle,
    time: paper.time || "",
    payment: normalizePayment(paper.payment || "free"),
    amount: Number(paper.amount || 0),
    questionAddedCount,
    remainingQuestionCount: Math.max(requiredCount - questionAddedCount, 0),
    isQuestionComplete: questionAddedCount >= requiredCount && requiredCount > 0,
  };
};

const normalizePaperList = async (papers) =>
  Promise.all(papers.map((paper) => normalizePaperForResponse(paper)));

const validateCreatePayload = (body) => {
  const gradeId = parseGradeId(body.gradeId);
  const paperType = norm(body.paperType).toLowerCase();
  const paperName = norm(body.paperName || body.paperTitle);
  const paperSubtitle = norm(body.paperSubtitle || body.subtitle);
  const time = norm(body.time);
  const questionCount = Number(body.questionCount);
  const oneQuestionAnswersCount = Number(body.oneQuestionAnswersCount || 4);
  const payment = normalizePayment(body.payment || "free");
  const amount = Number(body.amount || 0);

  if (!Number.isInteger(gradeId)) {
    return { error: "Grade is required" };
  }

  if (!PAPER_TYPES.includes(paperType)) {
    return { error: "Please select a valid paper type" };
  }

  if (!paperName) {
    return { error: "Paper name is required" };
  }

  if (!time) {
    return { error: "Paper time is required" };
  }

  if (!Number.isInteger(questionCount) || questionCount < 1) {
    return { error: "Question count must be at least 1" };
  }

  if (
    !Number.isInteger(oneQuestionAnswersCount) ||
    oneQuestionAnswersCount < 1 ||
    oneQuestionAnswersCount > 6
  ) {
    return { error: "Answer count must be between 1 and 6" };
  }

  if (!["free", "paid", "practise"].includes(payment)) {
    return { error: "Payment type must be free or paid" };
  }

  if (payment === "paid" && (!Number.isFinite(amount) || amount <= 0)) {
    return {
      error: "Paid paper amount is required and must be greater than 0",
    };
  }

  return {
    value: {
      gradeId,
      paperType,
      paperName,
      paperTitle: paperName,
      paperSubtitle,
      time,
      questionCount,
      oneQuestionAnswersCount,
      payment,
      amount: payment === "paid" ? amount : 0,
      attemptCount: Number(body.attemptCount || 0),
      isPublished: Boolean(body.isPublished || false),
    },
  };
};

export const createPaper = async (req, res) => {
  try {
    const checked = validateCreatePayload(req.body || {});

    if (checked.error) {
      return res.status(400).json({ message: checked.error });
    }

    const gradeError = await validateGradeAvailable(checked.value.gradeId);

    if (gradeError) {
      return res.status(400).json({ message: gradeError });
    }

    const paper = await Paper.create({
      ...checked.value,
      createdBy: req.user?.id || null,
    });

    const data = await normalizePaperForResponse(paper);

    return res.status(201).json({
      message: "Paper created successfully",
      data,
    });
  } catch (err) {
    console.error("createPaper error:", err);

    return res.status(500).json({
      message: "Internal server error",
      errorName: err?.name,
      errorMessage: err?.message,
    });
  }
};

export const getAllPapers = async (req, res) => {
  try {
    const built = buildPaperFilter({
      gradeId: req.query.gradeId,
      paperType: req.query.paperType,
      payment: req.query.payment,
      publishedOnly: true,
    });

    if (built.error) {
      return res.status(400).json({ message: built.error });
    }

    const papers = await Paper.find(built.filter).sort({ createdAt: -1 }).lean();
    const data = await normalizePaperList(papers);

    return res.status(200).json({
      message: "Published papers loaded successfully",
      count: data.length,
      data,
    });
  } catch (err) {
    console.error("getAllPapers error:", err);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getMyGradePapers = async (req, res) => {
  try {
    const gradeId = await resolveLoggedInUserGradeId(req);

    if (!Number.isInteger(gradeId)) {
      return res.status(400).json({
        message: "Your grade is not set on your account. Please update the logged in user grade.",
      });
    }

    const gradeError = await validateGradeAvailable(gradeId);

    if (gradeError) {
      return res.status(400).json({ message: gradeError });
    }

    const built = buildPaperFilter({
      gradeId,
      paperType: req.query.paperType,
      payment: req.query.payment,
      publishedOnly: true,
    });

    if (built.error) {
      return res.status(400).json({ message: built.error });
    }

    const papers = await Paper.find(built.filter).sort({ createdAt: -1 }).lean();
    const data = await normalizePaperList(papers);

    return res.status(200).json({
      message: "Logged in user grade papers loaded successfully",
      gradeId,
      count: data.length,
      data,
    });
  } catch (err) {
    console.error("getMyGradePapers error:", err);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getAllPapersAdmin = async (req, res) => {
  try {
    const built = buildPaperFilter({
      gradeId: req.query.gradeId,
      paperType: req.query.paperType,
      payment: req.query.payment,
      publishedOnly: false,
    });

    if (built.error) {
      return res.status(400).json({ message: built.error });
    }

    const papers = await Paper.find(built.filter).sort({ createdAt: -1 }).lean();
    const data = await normalizePaperList(papers);

    return res.status(200).json({
      message: "All papers loaded successfully",
      count: data.length,
      data,
    });
  } catch (err) {
    console.error("getAllPapersAdmin error:", err);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getPaperById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: "Invalid paper id" });
    }

    const paper = await Paper.findById(id).lean();

    if (!paper || paper.isActive === false) {
      return res.status(404).json({ message: "Paper not found" });
    }

    const data = await normalizePaperForResponse(paper);

    return res.status(200).json({
      message: "Paper loaded successfully",
      data,
    });
  } catch (err) {
    console.error("getPaperById error:", err);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getPaperFullDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: "Invalid paper id" });
    }

    const paper = await Paper.findById(id).lean();

    if (!paper || paper.isActive === false) {
      return res.status(404).json({ message: "Paper not found" });
    }

    const questions = await Question.find({
      paperId: new mongoose.Types.ObjectId(String(id)),
      isActive: true,
    })
      .sort({ questionNumber: 1 })
      .lean();

    const normalizedPaper = await normalizePaperForResponse(paper);
    const normalizedQuestions = questions.map(normalizeQuestionForResponse);

    return res.status(200).json({
      message: "Paper full details loaded successfully",
      data: {
        paper: normalizedPaper,
        questions: normalizedQuestions,
      },
    });
  } catch (err) {
    console.error("getPaperFullDetails error:", err);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const updatePaperById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: "Invalid paper id" });
    }

    const existing = await Paper.findById(id);

    if (!existing || existing.isActive === false) {
      return res.status(404).json({ message: "Paper not found" });
    }

    const patch = {};

    if (req.body.gradeId !== undefined) {
      const gradeId = parseGradeId(req.body.gradeId);

      if (!Number.isInteger(gradeId)) {
        return res.status(400).json({
          message: "Grade is required",
        });
      }

      const gradeError = await validateGradeAvailable(gradeId);

      if (gradeError) {
        return res.status(400).json({ message: gradeError });
      }

      patch.gradeId = gradeId;
    }

    if (req.body.paperType !== undefined) {
      const paperType = norm(req.body.paperType).toLowerCase();

      if (!PAPER_TYPES.includes(paperType)) {
        return res.status(400).json({
          message: "Please select a valid paper type",
        });
      }

      patch.paperType = paperType;
    }

    if (req.body.paperName !== undefined || req.body.paperTitle !== undefined) {
      const paperName = norm(req.body.paperName || req.body.paperTitle);

      if (!paperName) {
        return res.status(400).json({
          message: "Paper name is required",
        });
      }

      patch.paperName = paperName;
      patch.paperTitle = paperName;
    }

    if (req.body.paperSubtitle !== undefined || req.body.subtitle !== undefined) {
      patch.paperSubtitle = norm(req.body.paperSubtitle || req.body.subtitle);
    }

    if (req.body.time !== undefined) {
      const time = norm(req.body.time);

      if (!time) {
        return res.status(400).json({
          message: "Paper time is required",
        });
      }

      patch.time = time;
    }

    if (req.body.questionCount !== undefined) {
      const questionCount = Number(req.body.questionCount);

      if (!Number.isInteger(questionCount) || questionCount < 1) {
        return res.status(400).json({
          message: "Question count must be at least 1",
        });
      }

      const currentQuestions = await Question.countDocuments({
        paperId: new mongoose.Types.ObjectId(String(id)),
        isActive: true,
      });

      if (questionCount < currentQuestions) {
        return res.status(400).json({
          message: `Cannot reduce question count below existing saved questions (${currentQuestions})`,
        });
      }

      patch.questionCount = questionCount;
    }

    if (req.body.oneQuestionAnswersCount !== undefined) {
      const count = Number(req.body.oneQuestionAnswersCount);

      if (!Number.isInteger(count) || count < 1 || count > 6) {
        return res.status(400).json({
          message: "Answer count must be between 1 and 6",
        });
      }

      patch.oneQuestionAnswersCount = count;
    }

    if (req.body.attemptCount !== undefined) {
      patch.attemptCount = Number(req.body.attemptCount || 0);
    }

    if (req.body.isPublished !== undefined) {
      patch.isPublished = Boolean(req.body.isPublished);
    }

    const nextPayment =
      req.body.payment !== undefined
        ? normalizePayment(req.body.payment)
        : normalizePayment(existing.payment);

    if (!["free", "paid", "practise"].includes(nextPayment)) {
      return res.status(400).json({
        message: "Payment type must be free or paid",
      });
    }

    if (req.body.payment !== undefined) {
      patch.payment = nextPayment;
    }

    if (req.body.amount !== undefined || req.body.payment !== undefined) {
      const nextAmount =
        req.body.amount !== undefined
          ? Number(req.body.amount || 0)
          : Number(existing.amount || 0);

      if (nextPayment === "paid") {
        if (!Number.isFinite(nextAmount) || nextAmount <= 0) {
          return res.status(400).json({
            message: "Paid paper amount is required and must be greater than 0",
          });
        }

        patch.amount = nextAmount;
      } else {
        patch.amount = 0;
      }
    }

    if (Object.keys(patch).length === 0) {
      return res.status(400).json({
        message: "Nothing to update",
      });
    }

    const updated = await Paper.findByIdAndUpdate(id, patch, {
      new: true,
      runValidators: true,
    });

    const data = await normalizePaperForResponse(updated);

    return res.status(200).json({
      message: "Paper updated successfully",
      data,
    });
  } catch (err) {
    console.error("updatePaperById error:", err);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const deletePaperById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: "Invalid paper id" });
    }

    const updated = await Paper.findByIdAndUpdate(
      id,
      {
        isActive: false,
        isPublished: false,
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Paper not found" });
    }

    return res.status(200).json({
      message: "Paper deleted successfully",
    });
  } catch (err) {
    console.error("deletePaperById error:", err);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const publishPaper = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: "Invalid paper id" });
    }

    const paper = await Paper.findById(id);

    if (!paper || paper.isActive === false) {
      return res.status(404).json({ message: "Paper not found" });
    }

    const questionCount = await Question.countDocuments({
      paperId: new mongoose.Types.ObjectId(String(id)),
      isActive: true,
    });

    if (questionCount < Number(paper.questionCount || 0)) {
      return res.status(400).json({
        message: "Cannot publish. Please complete all questions first.",
        questionCount,
        requiredCount: paper.questionCount,
        remainingQuestionCount: Number(paper.questionCount || 0) - questionCount,
      });
    }

    paper.isPublished = true;
    await paper.save();

    const data = await normalizePaperForResponse(paper);

    return res.status(200).json({
      message: "Paper published successfully",
      data,
    });
  } catch (err) {
    console.error("publishPaper error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
