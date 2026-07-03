import mongoose from "mongoose";
import LiveClass from "../infastructure/schemas/live.js";
import ClassModel from "../infastructure/schemas/class.js";
import Enrollment from "../infastructure/schemas/enrollment.js";

const normalizeText = (value = "") => String(value ?? "").trim();

const parseDate = (value) => {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const normalizeLinks = (links) => {
  if (!links) return [];

  let arr = [];

  if (Array.isArray(links)) {
    arr = links;
  } else if (typeof links === "string") {
    arr = links.split(/[\n,]/).map((l) => l.trim());
  }

  return arr.map((l) => normalizeText(l)).filter(Boolean);
};

const isValidUrl = (url = "") => {
  const cleanUrl = normalizeText(url);

  if (!cleanUrl) return false;

  try {
    const parsed = new URL(cleanUrl);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
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
  null;

const getEnrollmentBatchNumber = (enrollment) =>
  enrollment?.batchnumber ??
  enrollment?.batchNumber ??
  enrollment?.batchNo ??
  enrollment?.batch ??
  enrollment?.batch_number ??
  "";

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

const validateLiveClassData = async ({ classId, title, date, links }) => {
  if (!classId) return "Class ID is required";

  if (!mongoose.Types.ObjectId.isValid(classId)) {
    return "Invalid class ID";
  }

  const existingClass = await ClassModel.findById(classId).lean();

  if (!existingClass) return "Class not found";

  const cleanTitle = normalizeText(title);

  if (!cleanTitle) return "Live class title is required";
  if (cleanTitle.length < 2) return "Title must have at least 2 characters";
  if (cleanTitle.length > 150) return "Title is too long";

  const cleanDate = parseDate(date);

  if (!cleanDate) {
    return "Please enter a valid live class date and time";
  }

  const cleanLinks = normalizeLinks(links);

  if (cleanLinks.length === 0) {
    return "At least one live class link is required";
  }

  const invalidLink = cleanLinks.find((link) => !isValidUrl(link));

  if (invalidLink) return `Invalid link: "${invalidLink}"`;

  return null;
};

export const createLiveClass = async (req, res, next) => {
  try {
    const { classId, title, date, links } = req.body ?? {};

    const validationError = await validateLiveClassData({
      classId,
      title,
      date,
      links,
    });

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const createdLiveClass = await LiveClass.create({
      classId,
      title: normalizeText(title),
      date: parseDate(date),
      links: normalizeLinks(links),
    });

    const liveClass = await LiveClass.findById(createdLiveClass._id)
      .populate("classId", "grade teacherName batchnumber batchNumber batchNo batch batch_number")
      .lean();

    return res.status(201).json({
      message: "Live class created successfully",
      liveClass,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllLiveClasses = async (_req, res, next) => {
  try {
    const liveClasses = await LiveClass.find({})
      .populate("classId", "grade teacherName batchnumber batchNumber batchNo batch batch_number")
      .sort({ date: -1, createdAt: -1 })
      .lean();

    return res.status(200).json({
      count: liveClasses.length,
      liveClasses,
    });
  } catch (err) {
    next(err);
  }
};

export const getLiveClassById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid live class ID" });
    }

    const liveClass = await LiveClass.findById(id)
      .populate("classId", "grade teacherName batchnumber batchNumber batchNo batch batch_number")
      .lean();

    if (!liveClass) {
      return res.status(404).json({ message: "Live class not found" });
    }

    return res.status(200).json({ liveClass });
  } catch (err) {
    next(err);
  }
};

export const updateLiveClassById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid live class ID" });
    }

    const updates = { ...(req.body ?? {}) };

    if (typeof updates.classId !== "undefined") {
      if (!mongoose.Types.ObjectId.isValid(updates.classId)) {
        return res.status(400).json({ message: "Invalid class ID" });
      }

      const existingClass = await ClassModel.findById(updates.classId).lean();

      if (!existingClass) {
        return res.status(404).json({ message: "Class not found" });
      }
    }

    if (typeof updates.title !== "undefined") {
      updates.title = normalizeText(updates.title);

      if (!updates.title) {
        return res.status(400).json({ message: "Live class title is required" });
      }

      if (updates.title.length < 2) {
        return res.status(400).json({
          message: "Title must have at least 2 characters",
        });
      }

      if (updates.title.length > 150) {
        return res.status(400).json({ message: "Title is too long" });
      }
    }

    if (typeof updates.date !== "undefined") {
      updates.date = parseDate(updates.date);

      if (!updates.date) {
        return res.status(400).json({
          message: "Please enter a valid live class date and time",
        });
      }
    }

    if (typeof updates.links !== "undefined") {
      updates.links = normalizeLinks(updates.links);

      if (updates.links.length === 0) {
        return res.status(400).json({
          message: "At least one live class link is required",
        });
      }

      const invalidLink = updates.links.find((link) => !isValidUrl(link));

      if (invalidLink) {
        return res.status(400).json({
          message: `Invalid link: "${invalidLink}"`,
        });
      }
    }

    const updatedLiveClass = await LiveClass.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
      context: "query",
    })
      .populate("classId", "grade teacherName batchnumber batchNumber batchNo batch batch_number")
      .lean();

    if (!updatedLiveClass) {
      return res.status(404).json({ message: "Live class not found" });
    }

    return res.status(200).json({
      message: "Live class updated successfully",
      liveClass: updatedLiveClass,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteLiveClassById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid live class ID" });
    }

    const deletedLiveClass = await LiveClass.findByIdAndDelete(id).lean();

    if (!deletedLiveClass) {
      return res.status(404).json({ message: "Live class not found" });
    }

    return res.status(200).json({
      message: "Live class deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const getActiveLiveClassesByGradeAndBatch = async (req, res, next) => {
  try {
    let rawGrade = req.query?.grade ?? req.params?.grade;

    let rawBatchNumber =
      req.query?.batchnumber ??
      req.query?.batchNumber ??
      req.query?.batchNo ??
      req.query?.batch ??
      req.query?.batch_number ??
      req.params?.batchnumber ??
      req.params?.batchNumber ??
      req.params?.batchNo ??
      req.params?.batch ??
      req.params?.batch_number;

    const userId = getAuthUserId(req);

    if (!rawGrade || !rawBatchNumber) {
      const enrollment = await getApprovedEnrollment(userId);

      rawGrade = rawGrade ?? enrollment?.grade;

      rawBatchNumber =
        rawBatchNumber ??
        getEnrollmentBatchNumber(enrollment);
    }

    const gradeNum = Number(rawGrade);
    const batchnumber = normalizeText(rawBatchNumber);

    const ALLOWED_GRADES = [3, 4, 5];

    if (!ALLOWED_GRADES.includes(gradeNum)) {
      return res.status(400).json({
        message: "Invalid grade. Must be 3, 4, or 5.",
      });
    }

    if (!batchnumber) {
      return res.status(400).json({
        message: "Batch number is required.",
      });
    }

    const matchingClasses = await ClassModel.find({
      grade: gradeNum,
      ...buildClassBatchQuery(batchnumber),
    })
      .select("_id grade teacherName batchnumber batchNumber batchNo batch batch_number")
      .lean();

    if (matchingClasses.length === 0) {
      return res.status(200).json({
        count: 0,
        liveClasses: [],
        message: "No class found for this grade and batch number.",
      });
    }

    const classIds = matchingClasses.map((c) => c._id);

    const now = new Date();

    /**
     * Important fix:
     * Old code used maxDate = now + 3 hours.
     * Because of that, tomorrow / next week scheduled live classes did not show.
     *
     * This keeps already-started live classes visible for 10 hours
     * and also shows all upcoming scheduled live classes.
     */
    const visibleFrom = new Date(now.getTime() - 10 * 60 * 60 * 1000);

    const liveClasses = await LiveClass.find({
      classId: { $in: classIds },
      date: { $gte: visibleFrom },
    })
      .populate("classId", "grade teacherName batchnumber batchNumber batchNo batch batch_number")
      .sort({ date: 1, createdAt: -1 })
      .lean();

    return res.status(200).json({
      count: liveClasses.length,
      liveClasses,
    });
  } catch (err) {
    next(err);
  }
};