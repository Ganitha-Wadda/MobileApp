import mongoose from "mongoose";

import Recording from "../infastructure/schemas/recording.js";
import ClassModel from "../infastructure/schemas/class.js";
import Enrollment from "../infastructure/schemas/enrollment.js";

const normalizeText = (value = "") => {
  return String(value ?? "").trim();
};

const parseDate = (value) => {
  if (!value) return null;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

const isValidYoutubeUrl = (url = "") => {
  const cleanUrl = String(url || "").trim();

  if (!cleanUrl) return false;

  try {
    const parsedUrl = new URL(cleanUrl);
    const hostname = parsedUrl.hostname.toLowerCase();

    return (
      hostname === "youtube.com" ||
      hostname === "www.youtube.com" ||
      hostname === "youtu.be" ||
      hostname === "m.youtube.com"
    );
  } catch {
    return false;
  }
};

const escapeRegExp = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getAuthUserId = (req) =>
  req?.user?._id ??
  req?.user?.id ??
  req?.user?.userId ??
  req?.userId ??
  req?.auth?._id ??
  req?.auth?.id ??
  req?.auth?.userId ??
  req?.query?.userId ??
  req?.body?.userId ??
  req?.headers?.["x-user-id"] ??
  null;

const getEnrollmentBatchNumber = (enrollment) =>
  enrollment?.batchnumber ??
  enrollment?.batchNumber ??
  enrollment?.batchNo ??
  enrollment?.batch ??
  enrollment?.batch_number ??
  "";

const parseGradeNumber = (value) => {
  if (typeof value === "object" && value !== null) {
    value = value.gradeId ?? value.grade ?? value.gradeNumber;
  }

  if (typeof value === "number") return value;

  const clean = normalizeText(value);
  const match = clean.match(/\d+/);

  if (!match) return Number(clean);

  return Number(match[0]);
};

const buildBatchRegex = (batchValue = "") => {
  const cleanBatch = normalizeText(batchValue);

  return new RegExp(
    `^\\s*${escapeRegExp(cleanBatch).replace(/\s+/g, "\\s*")}\\s*$`,
    "i"
  );
};

const buildBatchCandidates = (batchValue = "") => {
  const cleanBatch = normalizeText(batchValue);
  const withoutBatchWord = cleanBatch.replace(/^batch\s*/i, "").trim();

  return Array.from(
    new Set(
      [
        cleanBatch,
        withoutBatchWord,
        withoutBatchWord ? `Batch ${withoutBatchWord}` : "",
        withoutBatchWord ? `batch ${withoutBatchWord}` : "",
      ].filter(Boolean)
    )
  );
};

const buildClassBatchQuery = (batchnumber) => {
  const batchCandidates = buildBatchCandidates(batchnumber);
  const batchRegexList = batchCandidates.map((batch) => buildBatchRegex(batch));

  return {
    $or: [
      ...batchRegexList.map((regex) => ({ batchnumber: { $regex: regex } })),
      ...batchRegexList.map((regex) => ({ batchNumber: { $regex: regex } })),
      ...batchRegexList.map((regex) => ({ batchNo: { $regex: regex } })),
      ...batchRegexList.map((regex) => ({ batch: { $regex: regex } })),
      ...batchRegexList.map((regex) => ({ batch_number: { $regex: regex } })),
    ],
  };
};

const buildClassGradeQuery = (gradeNum) => ({
  $or: [
    { grade: gradeNum },
    { grade: String(gradeNum) },
    { gradeId: gradeNum },
    { gradeId: String(gradeNum) },
    { gradeNumber: gradeNum },
    { gradeNumber: String(gradeNum) },
    { "grade.gradeId": gradeNum },
    { "grade.gradeId": String(gradeNum) },
    { "grade.grade": gradeNum },
    { "grade.grade": String(gradeNum) },
  ],
});

const buildClassGradeBatchQuery = (gradeNum, batchnumber) => ({
  $and: [buildClassGradeQuery(gradeNum), buildClassBatchQuery(batchnumber)],
});

const getApprovedEnrollment = async (userId) => {
  if (!userId) return null;

  const stringUserId = String(userId);

  if (!mongoose.Types.ObjectId.isValid(stringUserId)) return null;

  const objectUserId = new mongoose.Types.ObjectId(stringUserId);

  return Enrollment.findOne({
    status: { $regex: /^approved$/i },
    $or: [
      { userId: objectUserId },
      { userId: stringUserId },
      { studentId: objectUserId },
      { studentId: stringUserId },
      { user: objectUserId },
      { user: stringUserId },
    ],
  })
    .sort({ updatedAt: -1, createdAt: -1 })
    .lean();
};

const validateRecordingData = async ({ classId, title, date, youtubeUrl }) => {
  if (!classId) {
    return "Class ID is required";
  }

  if (!mongoose.Types.ObjectId.isValid(classId)) {
    return "Invalid class ID";
  }

  const existingClass = await ClassModel.findById(classId).lean();

  if (!existingClass) {
    return "Class not found";
  }

  const cleanTitle = normalizeText(title);

  if (!cleanTitle) {
    return "Recording title is required";
  }

  if (cleanTitle.length < 2) {
    return "Title must have at least 2 characters";
  }

  if (cleanTitle.length > 150) {
    return "Title is too long";
  }

  const cleanDate = parseDate(date);

  if (!cleanDate) {
    return "Please enter a valid recording date";
  }

  if (!youtubeUrl) {
    return "YouTube URL is required";
  }

  if (!isValidYoutubeUrl(youtubeUrl)) {
    return "Please enter a valid YouTube URL";
  }

  return null;
};

const findRecordingsForGradeAndBatch = async ({ grade, batchnumber }) => {
  const gradeNum = parseGradeNumber(grade);
  const cleanBatchNumber = normalizeText(batchnumber);
  const ALLOWED_GRADES = [3, 4, 5];

  if (!ALLOWED_GRADES.includes(gradeNum)) {
    return {
      status: 400,
      body: {
        message: "Invalid grade. Must be 3, 4, or 5.",
      },
    };
  }

  if (!cleanBatchNumber) {
    return {
      status: 400,
      body: {
        message: "Batch number is required.",
      },
    };
  }

  const matchingClasses = await ClassModel.find(
    buildClassGradeBatchQuery(gradeNum, cleanBatchNumber)
  )
    .select(
      "_id grade teacherName batchnumber batchNumber batchNo batch batch_number"
    )
    .lean();

  if (matchingClasses.length === 0) {
    return {
      status: 200,
      body: {
        count: 0,
        recordings: [],
        grade: gradeNum,
        batchnumber: cleanBatchNumber,
        message: "No class found for this grade and batch number.",
      },
    };
  }

  const classIds = matchingClasses.map((c) => c._id);

  const recordings = await Recording.find({
    classId: { $in: classIds },
  })
    .populate(
      "classId",
      "grade teacherName batchnumber batchNumber batchNo batch batch_number"
    )
    .sort({ date: -1, createdAt: -1 })
    .lean();

  return {
    status: 200,
    body: {
      count: recordings.length,
      recordings,
      grade: gradeNum,
      batchnumber: cleanBatchNumber,
      classes: matchingClasses,
    },
  };
};

export const createRecording = async (req, res, next) => {
  try {
    const { classId, title, date, youtubeUrl } = req.body || {};

    const validationError = await validateRecordingData({
      classId,
      title,
      date,
      youtubeUrl,
    });

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    const createdRecording = await Recording.create({
      classId,
      title: normalizeText(title),
      date: parseDate(date),
      youtubeUrl: normalizeText(youtubeUrl),
    });

    const recording = await Recording.findById(createdRecording._id)
      .populate(
        "classId",
        "grade teacherName batchnumber batchNumber batchNo batch batch_number"
      )
      .lean();

    return res.status(201).json({
      message: "Recording created successfully",
      recording,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllRecordings = async (_req, res, next) => {
  try {
    const recordings = await Recording.find({})
      .populate(
        "classId",
        "grade teacherName batchnumber batchNumber batchNo batch batch_number"
      )
      .sort({ date: -1, createdAt: -1 })
      .lean();

    return res.status(200).json({
      count: recordings.length,
      recordings,
    });
  } catch (err) {
    next(err);
  }
};

export const getDemoRecordings = async (_req, res, next) => {
  try {
    const demoTitleRegex = /(demo|free|sample|trial)/i;

    let recordings = await Recording.find({ title: { $regex: demoTitleRegex } })
      .populate(
        "classId",
        "grade teacherName batchnumber batchNumber batchNo batch batch_number"
      )
      .sort({ createdAt: 1, date: 1 })
      .limit(1)
      .lean();

    // Fallback: if admin has not named a recording as demo/free, first uploaded recording is the demo.
    if (recordings.length === 0) {
      recordings = await Recording.find({})
        .populate(
          "classId",
          "grade teacherName batchnumber batchNumber batchNo batch batch_number"
        )
        .sort({ createdAt: 1, date: 1 })
        .limit(1)
        .lean();
    }

    const demoRecordings = recordings.map((recording) => ({
      ...recording,
      isDemo: true,
    }));

    return res.status(200).json({
      count: demoRecordings.length,
      recordings: demoRecordings,
    });
  } catch (err) {
    next(err);
  }
};

export const getRecordingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid recording ID",
      });
    }

    const recording = await Recording.findById(id)
      .populate(
        "classId",
        "grade teacherName batchnumber batchNumber batchNo batch batch_number"
      )
      .lean();

    if (!recording) {
      return res.status(404).json({
        message: "Recording not found",
      });
    }

    return res.status(200).json({
      recording,
    });
  } catch (err) {
    next(err);
  }
};

export const updateRecordingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid recording ID",
      });
    }

    const updates = { ...(req.body || {}) };

    if (typeof updates.classId !== "undefined") {
      if (!mongoose.Types.ObjectId.isValid(updates.classId)) {
        return res.status(400).json({
          message: "Invalid class ID",
        });
      }

      const existingClass = await ClassModel.findById(updates.classId).lean();

      if (!existingClass) {
        return res.status(404).json({
          message: "Class not found",
        });
      }
    }

    if (typeof updates.title !== "undefined") {
      updates.title = normalizeText(updates.title);

      if (!updates.title) {
        return res.status(400).json({
          message: "Recording title is required",
        });
      }

      if (updates.title.length < 2) {
        return res.status(400).json({
          message: "Title must have at least 2 characters",
        });
      }

      if (updates.title.length > 150) {
        return res.status(400).json({
          message: "Title is too long",
        });
      }
    }

    if (typeof updates.date !== "undefined") {
      updates.date = parseDate(updates.date);

      if (!updates.date) {
        return res.status(400).json({
          message: "Please enter a valid recording date",
        });
      }
    }

    if (typeof updates.youtubeUrl !== "undefined") {
      updates.youtubeUrl = normalizeText(updates.youtubeUrl);

      if (!updates.youtubeUrl) {
        return res.status(400).json({
          message: "YouTube URL is required",
        });
      }

      if (!isValidYoutubeUrl(updates.youtubeUrl)) {
        return res.status(400).json({
          message: "Please enter a valid YouTube URL",
        });
      }
    }

    const updatedRecording = await Recording.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
      context: "query",
    })
      .populate(
        "classId",
        "grade teacherName batchnumber batchNumber batchNo batch batch_number"
      )
      .lean();

    if (!updatedRecording) {
      return res.status(404).json({
        message: "Recording not found",
      });
    }

    return res.status(200).json({
      message: "Recording updated successfully",
      recording: updatedRecording,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteRecordingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid recording ID",
      });
    }

    const deletedRecording = await Recording.findByIdAndDelete(id).lean();

    if (!deletedRecording) {
      return res.status(404).json({
        message: "Recording not found",
      });
    }

    return res.status(200).json({
      message: "Recording deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const getMyRecordings = async (req, res, next) => {
  try {
    const userId = getAuthUserId(req);
    const approvedEnrollment = await getApprovedEnrollment(userId);

    if (!approvedEnrollment) {
      return res.status(403).json({
        count: 0,
        recordings: [],
        message: "Enrollment approval required to access recordings.",
      });
    }

    const result = await findRecordingsForGradeAndBatch({
      grade: approvedEnrollment.grade,
      batchnumber: getEnrollmentBatchNumber(approvedEnrollment),
    });

    return res.status(result.status).json({
      ...result.body,
      enrollment: approvedEnrollment,
    });
  } catch (err) {
    next(err);
  }
};

export const getRecordingsByGradeAndBatch = async (req, res, next) => {
  try {
    const rawGrade =
      req.query?.grade ??
      req.params?.grade ??
      req.body?.grade;

    const rawBatchNumber =
      req.query?.batchnumber ??
      req.query?.batchNumber ??
      req.query?.batchNo ??
      req.query?.batch ??
      req.query?.batch_number ??
      req.params?.batchnumber ??
      req.params?.batchNumber ??
      req.params?.batchNo ??
      req.params?.batch ??
      req.params?.batch_number ??
      req.body?.batchnumber ??
      req.body?.batchNumber ??
      req.body?.batchNo ??
      req.body?.batch ??
      req.body?.batch_number;

    const result = await findRecordingsForGradeAndBatch({
      grade: rawGrade,
      batchnumber: rawBatchNumber,
    });

    return res.status(result.status).json(result.body);
  } catch (err) {
    next(err);
  }
};
