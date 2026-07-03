import mongoose from "mongoose";
import Activity from "../infastructure/schemas/activity.js";

const toObjectId = (id) => {
  if (!id || !mongoose.Types.ObjectId.isValid(String(id))) return null;
  return new mongoose.Types.ObjectId(String(id));
};

const toMcqDocument = (q, lessonOid, subOid) => ({
  shortLessonId: lessonOid,
  shortLessonBysubId: subOid,
  question: String(q?.question || "").trim(),
  answers: Array.isArray(q?.answers) ? q.answers.map((a) => String(a)) : [],
  correctAnswerIndexes: Array.isArray(q?.correctAnswerIndexes)
    ? q.correctAnswerIndexes.map((value) => Number(value)).filter((value) => Number.isInteger(value))
    : [],
});

const addAutomaticTemplateNo = (activity, index) => {
  const plain = activity?.toObject ? activity.toObject() : activity;

  return {
    ...plain,
    templateNo: (index % 3) + 1,
  };
};

const validateQuestions = (questions) => {
  if (!Array.isArray(questions) || questions.length === 0) {
    return "At least one question is required";
  }

  for (let i = 0; i < questions.length; i += 1) {
    const q = questions[i];

    if (!String(q?.question || "").trim()) {
      return `Question ${i + 1} text is required`;
    }

    if (!Array.isArray(q?.answers) || q.answers.length < 2) {
      return `Question ${i + 1} must have at least two answers`;
    }

    if (!Array.isArray(q?.correctAnswerIndexes) || q.correctAnswerIndexes.length === 0) {
      return `Question ${i + 1} must have a correct answer index`;
    }
  }

  return "";
};

export const createactivity = async (req, res) => {
  try {
    const { shortLessonId, shortLessonBysubId, questions } = req.body;

    if (!shortLessonId || !shortLessonBysubId) {
      return res.status(400).json({
        success: false,
        message: "Lesson and sublesson are required",
      });
    }

    const lessonOid = toObjectId(shortLessonId);
    const subOid = toObjectId(shortLessonBysubId);

    if (!lessonOid || !subOid) {
      return res.status(400).json({
        success: false,
        message: "Invalid lesson or sublesson ID",
      });
    }

    const validationError = validateQuestions(questions);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const docs = questions.map((q) => toMcqDocument(q, lessonOid, subOid));
    const created = await Activity.insertMany(docs);

    return res.status(201).json({
      success: true,
      message: "Activity paper created successfully",
      data: created.map(addAutomaticTemplateNo),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const GetAllactivity = async (_req, res) => {
  try {
    const activities = await Activity.find()
      .populate("shortLessonId")
      .populate("shortLessonBysubId")
      .sort({ createdAt: -1 });

    const grouped = {};

    activities.forEach((a) => {
      const lessonId =
        a.shortLessonId?._id?.toString() || a.shortLessonId?.toString();
      const subId =
        a.shortLessonBysubId?._id?.toString() || a.shortLessonBysubId?.toString();

      const key = `${lessonId}_${subId}`;

      if (!grouped[key]) {
        grouped[key] = {
          paperId: key,
          shortLessonId: a.shortLessonId,
          shortLessonBysubId: a.shortLessonBysubId,
          questionCount: 0,
          createdAt: a.createdAt,
        };
      }

      grouped[key].questionCount += 1;
    });

    return res.status(200).json({
      success: true,
      data: Object.values(grouped),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const GetActivityPaper = async (req, res) => {
  try {
    const { lessonId, sublessonId } = req.params;

    const lessonOid = toObjectId(lessonId);
    const subOid = toObjectId(sublessonId);

    if (!lessonOid || !subOid) {
      return res.status(400).json({
        success: false,
        message: "Invalid lesson or sublesson ID",
      });
    }

    const questions = await Activity.find({
      shortLessonId: lessonOid,
      shortLessonBysubId: subOid,
    })
      .populate("shortLessonId")
      .populate("shortLessonBysubId")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      data: questions.map(addAutomaticTemplateNo),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateActivityPaper = async (req, res) => {
  try {
    const { lessonId, sublessonId } = req.params;
    const { questions } = req.body;

    const lessonOid = toObjectId(lessonId);
    const subOid = toObjectId(sublessonId);

    if (!lessonOid || !subOid) {
      return res.status(400).json({
        success: false,
        message: "Invalid lesson or sublesson ID",
      });
    }

    const validationError = validateQuestions(questions);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    await Activity.deleteMany({
      shortLessonId: lessonOid,
      shortLessonBysubId: subOid,
    });

    const docs = questions.map((q) => toMcqDocument(q, lessonOid, subOid));
    const updated = await Activity.insertMany(docs);

    return res.status(200).json({
      success: true,
      message: "Activity paper updated successfully",
      data: updated.map(addAutomaticTemplateNo),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteActivityPaper = async (req, res) => {
  try {
    const { lessonId, sublessonId } = req.params;

    const lessonOid = toObjectId(lessonId);
    const subOid = toObjectId(sublessonId);

    if (!lessonOid || !subOid) {
      return res.status(400).json({
        success: false,
        message: "Invalid lesson or sublesson ID",
      });
    }

    const result = await Activity.deleteMany({
      shortLessonId: lessonOid,
      shortLessonBysubId: subOid,
    });

    return res.status(200).json({
      success: true,
      message: "Full activity paper deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
