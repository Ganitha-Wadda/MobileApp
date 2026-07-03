import mongoose from "mongoose";
import Enrollment, {
  ALLOWED_ENROLLMENT_GRADES,
} from "../infastructure/schemas/enrollment.js";
import ClassModel from "../infastructure/schemas/class.js";

const normalizeText = (value = "") => String(value ?? "").trim();

const sortTextNumber = (a, b) =>
  String(a).localeCompare(String(b), undefined, {
    numeric: true,
    sensitivity: "base",
  });

const uniqueSorted = (values = []) =>
  [...new Set(values.map((value) => normalizeText(value)).filter(Boolean))].sort(
    sortTextNumber
  );

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

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(String(id));

const normalizeGrade = (grade) => {
  if (typeof grade === "object" && grade !== null) {
    grade = grade.gradeId ?? grade.grade ?? grade.gradeNumber;
  }

  const clean = normalizeText(grade);
  const match = clean.match(/\d+/);
  const gradeNumber = Number(match?.[0] ?? clean);

  if (!ALLOWED_ENROLLMENT_GRADES.includes(gradeNumber)) return null;
  return gradeNumber;
};

const getEnrollmentBatchNumber = (enrollment = {}) =>
  normalizeText(
    enrollment?.batchnumber ??
      enrollment?.batchNumber ??
      enrollment?.batchNo ??
      enrollment?.batch ??
      enrollment?.batch_number ??
      ""
  );

const getClassBatchNumber = (classItem = {}) =>
  normalizeText(
    classItem?.batchnumber ??
      classItem?.batchNumber ??
      classItem?.batchNo ??
      classItem?.batch ??
      classItem?.batch_number ??
      ""
  );

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

const buildClassGradeQuery = (gradeNumber) => ({
  $or: [
    { grade: gradeNumber },
    { grade: String(gradeNumber) },
    { gradeId: gradeNumber },
    { gradeId: String(gradeNumber) },
    { gradeNumber },
    { gradeNumber: String(gradeNumber) },
    { "grade.gradeId": gradeNumber },
    { "grade.gradeId": String(gradeNumber) },
    { "grade.grade": gradeNumber },
    { "grade.grade": String(gradeNumber) },
  ],
});

const buildClassGradeBatchQuery = (gradeNumber, batchnumber) => ({
  $and: [buildClassGradeQuery(gradeNumber), buildClassBatchQuery(batchnumber)],
});

const normalizeBatchForCompare = (value = "") =>
  normalizeText(value)
    .replace(/^batch\s*/i, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const batchesMatch = (left = "", right = "") =>
  normalizeBatchForCompare(left) === normalizeBatchForCompare(right);

const getClassGradeNumber = (classItem = {}) =>
  normalizeGrade(
    classItem?.grade ??
      classItem?.gradeId ??
      classItem?.gradeNumber ??
      classItem?.grade?.gradeId ??
      classItem?.grade?.grade ??
      ""
  );

const getClassesForGrade = async (gradeNumber) => {
  const queriedClasses = await ClassModel.find(buildClassGradeQuery(gradeNumber))
    .select(
      "grade gradeId gradeNumber batchnumber batchNumber batchNo batch batch_number teacherName"
    )
    .sort({ batchnumber: 1, createdAt: -1 })
    .lean();

  if (queriedClasses.length > 0) return queriedClasses;

  const allClasses = await ClassModel.find({})
    .select(
      "grade gradeId gradeNumber batchnumber batchNumber batchNo batch batch_number teacherName"
    )
    .sort({ batchnumber: 1, createdAt: -1 })
    .lean();

  return allClasses.filter(
    (classItem) => getClassGradeNumber(classItem) === gradeNumber
  );
};

const classExistsForGradeBatch = async (gradeNumber, batchnumber) => {
  const directMatch = await ClassModel.exists(
    buildClassGradeBatchQuery(gradeNumber, batchnumber)
  );

  if (directMatch) return true;

  const classes = await getClassesForGrade(gradeNumber);

  return classes.some((classItem) =>
    batchesMatch(getClassBatchNumber(classItem), batchnumber)
  );
};

const buildAccessPayload = (enrollment) => {
  if (!enrollment) {
    return {
      status: "not_enrolled",
      enrollment: null,
      unlocked: false,
      canAccessLive: false,
      canAccessRecording: false,
      canAccessShortz: false,
      enrolledGrade: "",
      enrolledBatchNumber: "",
      batchnumber: "",
    };
  }

  const status = normalizeText(enrollment.status).toLowerCase();
  const unlocked = status === "approved";
  const enrolledGrade = normalizeGrade(enrollment.grade) || "";
  const enrolledBatchNumber = getEnrollmentBatchNumber(enrollment);

  return {
    status,
    enrollment,
    unlocked,
    canAccessLive: unlocked,
    canAccessRecording: unlocked,
    canAccessShortz: unlocked,
    enrolledGrade,
    enrolledBatchNumber,
    batchnumber: enrolledBatchNumber,
  };
};

const validateEnrollmentBody = async ({ name, phone, grade, batchnumber }) => {
  const cleanName = normalizeText(name);
  const cleanPhone = normalizeText(phone);
  const gradeNumber = normalizeGrade(grade);
  const cleanBatchNumber = normalizeText(batchnumber);

  if (!cleanName) return { message: "Name is required" };
  if (cleanName.length < 2) return { message: "Name must be at least 2 characters" };
  if (cleanName.length > 100) return { message: "Name is too long" };

  if (!cleanPhone) return { message: "Phone number is required" };
  if (cleanPhone.length < 6) return { message: "Phone number too short" };
  if (cleanPhone.length > 20) return { message: "Phone number is too long" };

  if (!gradeNumber) return { message: "Grade must be only 3, 4, or 5" };

  if (!cleanBatchNumber) return { message: "Batch number is required" };
  if (cleanBatchNumber.length > 50) return { message: "Batch number is too long" };

  const classExists = await classExistsForGradeBatch(
    gradeNumber,
    cleanBatchNumber
  );

  if (!classExists) {
    return {
      message: "Selected batch number is not available for this grade",
    };
  }

  return {
    value: {
      name: cleanName,
      phone: cleanPhone,
      grade: gradeNumber,
      batchnumber: cleanBatchNumber,
    },
  };
};

export const getAvailableBatchesByGrade = async (req, res, next) => {
  try {
    const gradeNumber = normalizeGrade(req.params.grade ?? req.query.grade);

    if (!gradeNumber) {
      return res.status(400).json({
        message: "Grade must be only 3, 4, or 5",
      });
    }

    const classes = await getClassesForGrade(gradeNumber);
    const cleanBatches = uniqueSorted(classes.map(getClassBatchNumber));

    return res.status(200).json({
      grade: gradeNumber,
      count: cleanBatches.length,
      batches: cleanBatches,
      batchnumbers: cleanBatches,
      availableBatches: cleanBatches,
      batchesByGrade: {
        [String(gradeNumber)]: cleanBatches,
      },
      classes,
    });
  } catch (err) {
    next(err);
  }
};

export const submitEnrollment = async (req, res, next) => {
  try {
    const userId = getAuthUserId(req);

    if (!userId || !isValidObjectId(userId)) {
      return res.status(401).json({
        message: "Unauthorized. Please login again.",
      });
    }

    const validation = await validateEnrollmentBody({
      name: req.body?.name,
      phone: req.body?.phone,
      grade: req.body?.grade,
      batchnumber:
        req.body?.batchnumber ?? req.body?.batchNumber ?? req.body?.batch,
    });

    if (validation.message) {
      return res.status(400).json({
        message: validation.message,
      });
    }

    const existing = await Enrollment.findOne({ userId }).lean();

    const enrollment = await Enrollment.findOneAndUpdate(
      { userId },
      {
        userId,
        ...validation.value,
        status: "pending",
        approvedAt: null,
        rejectedAt: null,
        approvedBy: null,
        rejectedBy: null,
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    ).lean();

    return res.status(existing ? 200 : 201).json({
      message: existing
        ? "Enrollment request updated. Please wait for admin approval."
        : "Enrollment request submitted. Please wait for admin approval.",
      ...buildAccessPayload(enrollment),
    });
  } catch (err) {
    next(err);
  }
};

export const getMyEnrollmentStatus = async (req, res, next) => {
  try {
    const userId = getAuthUserId(req);

    if (!userId || !isValidObjectId(userId)) {
      return res.status(401).json({
        message: "Unauthorized. Please login again.",
      });
    }

    const enrollment = await Enrollment.findOne({ userId }).lean();

    return res.status(200).json(buildAccessPayload(enrollment));
  } catch (err) {
    next(err);
  }
};

export const getAllEnrollments = async (_req, res, next) => {
  try {
    const enrollments = await Enrollment.find({})
      .populate("userId", "name email phone phonenumber grade")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      count: enrollments.length,
      enrollments,
    });
  } catch (err) {
    next(err);
  }
};

export const approveEnrollment = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid enrollment ID",
      });
    }

    const adminId = getAuthUserId(req);

    const enrollment = await Enrollment.findByIdAndUpdate(
      id,
      {
        status: "approved",
        approvedAt: new Date(),
        rejectedAt: null,
        approvedBy: adminId && isValidObjectId(adminId) ? adminId : null,
        rejectedBy: null,
      },
      {
        new: true,
        runValidators: true,
      }
    ).lean();

    if (!enrollment) {
      return res.status(404).json({
        message: "Enrollment request not found",
      });
    }

    return res.status(200).json({
      message: "Enrollment approved successfully",
      ...buildAccessPayload(enrollment),
    });
  } catch (err) {
    next(err);
  }
};

export const rejectEnrollment = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid enrollment ID",
      });
    }

    const adminId = getAuthUserId(req);

    const enrollment = await Enrollment.findByIdAndUpdate(
      id,
      {
        status: "rejected",
        rejectedAt: new Date(),
        approvedAt: null,
        rejectedBy: adminId && isValidObjectId(adminId) ? adminId : null,
        approvedBy: null,
      },
      {
        new: true,
        runValidators: true,
      }
    ).lean();

    if (!enrollment) {
      return res.status(404).json({
        message: "Enrollment request not found",
      });
    }

    return res.status(200).json({
      message: "Enrollment rejected successfully",
      ...buildAccessPayload(enrollment),
    });
  } catch (err) {
    next(err);
  }
};

export const deleteEnrollment = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid enrollment ID",
      });
    }

    const deletedEnrollment = await Enrollment.findByIdAndDelete(id).lean();

    if (!deletedEnrollment) {
      return res.status(404).json({
        message: "Enrollment request not found",
      });
    }

    return res.status(200).json({
      message: "Enrollment deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};