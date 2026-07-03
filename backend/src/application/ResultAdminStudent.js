import mongoose from "mongoose";

import ResultAdminStudent from "../infastructure/schemas/ResultAdminStudent.js";
import User from "../infastructure/schemas/user.js";
import ClassModel from "../infastructure/schemas/class.js";
import Enrollment from "../infastructure/schemas/enrollment.js";
import PaperResult from "../infastructure/schemas/paperResult.js";
import Rank from "../infastructure/schemas/rank.js";

const RESULT_STATUSES = ["completed", "expired"];

const PAPER_TYPE_LABELS = {
  "daily paper": "Daily Paper",
  "500 paper": "500 Paper",
  "lesson by lesson": "Lesson By Lesson",
  pastpapers: "Past Papers",
};

const PAPER_TYPE_ALIASES = {
  daily: "daily paper",
  daliy: "daily paper",
  "daily paper": "daily paper",
  dailyPaper: "daily paper",
  daily_paper: "daily paper",

  fivehundred: "500 paper",
  fivehundredpaper: "500 paper",
  fivehundrad: "500 paper",
  fivehumdrad: "500 paper",
  "five hundred": "500 paper",
  "five hundred paper": "500 paper",
  "500": "500 paper",
  "500 paper": "500 paper",
  fiveHundredPaper: "500 paper",
  five_hundred_paper: "500 paper",

  lesson: "lesson by lesson",
  lessonbylesson: "lesson by lesson",
  "lesson by lesson": "lesson by lesson",
  lesson_by_lesson: "lesson by lesson",

  past: "pastpapers",
  pastpaper: "pastpapers",
  pastpapers: "pastpapers",
  "past paper": "pastpapers",
  "past papers": "pastpapers",
};

const getText = (value = "") => String(value || "").trim();

const getObjectIdString = (value) => {
  if (!value) return "";

  if (typeof value === "object") {
    if (value._id) return String(value._id);
    if (value.id) return String(value.id);
  }

  return String(value);
};

const parseNumber = (value) => {
  const match = String(value || "").match(/\d+/);
  return match ? Number(match[0]) : 0;
};

const normalizePaperType = (value = "") => {
  const clean = getText(value).toLowerCase();
  if (!clean) return "";

  const compact = clean.replace(/[\s_-]+/g, "");

  return PAPER_TYPE_ALIASES[clean] || PAPER_TYPE_ALIASES[compact] || clean;
};

const getPaperTypeLabel = (value = "") => {
  const normalized = normalizePaperType(value);
  return PAPER_TYPE_LABELS[normalized] || getText(value) || "-";
};

const getGradeNumber = (grade) => {
  if (grade === null || grade === undefined) return 0;

  if (typeof grade === "number") return grade;

  if (typeof grade === "object") {
    if (grade.gradeId !== undefined && grade.gradeId !== null) {
      return Number(grade.gradeId) || 0;
    }

    if (grade.grade !== undefined && grade.grade !== null) {
      return Number(grade.grade) || parseNumber(grade.grade);
    }

    if (grade.name) return parseNumber(grade.name);
    if (grade.title) return parseNumber(grade.title);
    if (grade.label) return parseNumber(grade.label);
  }

  return parseNumber(grade);
};

const getGradeLabel = (grade) => {
  const gradeNumber = getGradeNumber(grade);
  return gradeNumber ? `Grade ${gradeNumber}` : "";
};

const makeClassKey = (grade, batchNumber) =>
  `${Number(grade) || 0}__${getText(batchNumber).toLowerCase()}`;

const getClassName = (classDoc, grade, batchNumber) => {
  if (!classDoc) {
    const g = Number(grade) || "";
    const b = getText(batchNumber);
    return g && b ? `Grade ${g} - ${b}` : b || "";
  }

  return getText(
    classDoc.className ||
      classDoc.classname ||
      classDoc.name ||
      classDoc.title ||
      classDoc.teacherName ||
      classDoc.teacher ||
      ""
  );
};

const getEnrollmentClassName = (enrollment) =>
  getText(
    enrollment?.className ||
      enrollment?.classname ||
      enrollment?.classTitle ||
      enrollment?.class ||
      enrollment?.teacherName ||
      ""
  );

const getEnrollmentClassId = (enrollment) =>
  enrollment?.classId || enrollment?.class || enrollment?.class_id || null;

const buildRegex = (value) => {
  const clean = getText(value);
  if (!clean) return null;

  return new RegExp(clean.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
};

const normalizeFilterValue = (value) => getText(value);

const serializePaperResult = (attemptDoc) => {
  const attempt = attemptDoc?.toObject ? attemptDoc.toObject() : { ...attemptDoc };
  const paper = attempt.paperId && typeof attempt.paperId === "object" ? attempt.paperId : null;
  const snapshot = attempt.paperSnapshot || {};

  const paperName =
    snapshot.paperName ||
    snapshot.paperTitle ||
    paper?.paperName ||
    paper?.paperTitle ||
    "Untitled Paper";

  const paperType = normalizePaperType(snapshot.paperType || paper?.paperType);

  const totalQuestions = Number(
    attempt.totalQuestions || snapshot.questionCount || paper?.questionCount || 0
  );

  const correctAnswers = Number(attempt.correctCount || 0);
  const percentage =
    totalQuestions > 0
      ? Math.round((correctAnswers / totalQuestions) * 100)
      : Number(attempt.percentage || 0);

  return {
    paperResultId: attempt._id || null,
    paperId: paper?._id || attempt.paperId || null,
    paperName,
    paperType,
    paperTypeLabel: getPaperTypeLabel(paperType),
    correctAnswers,
    totalQuestions,
    wrongCount: Number(attempt.wrongCount || 0),
    notAttemptedCount: Number(attempt.notAttemptedCount || 0),
    totalCoins: Number(attempt.totalCoins || 0),
    marks: percentage,
    resultMark: `${correctAnswers}/${totalQuestions}`,
    progress: `${percentage}%`,
    status: getText(attempt.status),
    submittedAt: attempt.submittedAt || attempt.updatedAt || attempt.createdAt || null,
  };
};

const recalculateRowTotals = (row, filteredResults = []) => {
  const completedPapersCount = filteredResults.length;

  const totalCorrectAnswers = filteredResults.reduce(
    (sum, item) => sum + Number(item.correctAnswers || 0),
    0
  );

  const totalQuestions = filteredResults.reduce(
    (sum, item) => sum + Number(item.totalQuestions || 0),
    0
  );

  const totalCoins = filteredResults.reduce(
    (sum, item) => sum + Number(item.totalCoins || 0),
    0
  );

  const averageProgress =
    completedPapersCount > 0
      ? Math.round(
          filteredResults.reduce((sum, item) => sum + Number(item.marks || 0), 0) /
            completedPapersCount
        )
      : 0;

  return {
    ...row,
    completedPapersCount,
    totalCorrectAnswers,
    totalQuestions,
    totalCoins,
    averageProgress,
    results: filteredResults,
  };
};

const buildResultRows = async () => {
  const users = await User.find({ role: "student" })
    .select("name phonenumber district grade batchnumber role isActive")
    .populate("grade")
    .lean();

  const userIds = users.map((u) => u._id);

  const [classes, enrollments, ranks, attempts] = await Promise.all([
    ClassModel.find({}).lean(),

    userIds.length
      ? Enrollment.find({
          userId: { $in: userIds },
          status: "approved",
        })
          .sort({ approvedAt: -1, updatedAt: -1, createdAt: -1 })
          .lean()
      : [],

    Rank.find({ userId: { $in: userIds } }).lean(),

    userIds.length
      ? PaperResult.find({
          userId: { $in: userIds },
          status: { $in: RESULT_STATUSES },
        })
          .populate({
            path: "paperId",
            select: "paperName paperTitle paperType gradeId questionCount time",
          })
          .sort({ submittedAt: -1, updatedAt: -1, createdAt: -1 })
      : [],
  ]);

  const classMap = new Map();
  const classIdMap = new Map();

  classes.forEach((cls) => {
    classMap.set(makeClassKey(cls.grade, cls.batchnumber), cls);
    classIdMap.set(String(cls._id), cls);
  });

  const enrollmentMap = new Map();

  enrollments.forEach((enrollment) => {
    const key = String(enrollment.userId);
    if (!enrollmentMap.has(key)) enrollmentMap.set(key, enrollment);
  });

  const rankMap = new Map();

  ranks.forEach((rank) => {
    rankMap.set(String(rank.userId), rank);
  });

  const attemptsByUser = new Map();

  attempts.forEach((attempt) => {
    const userId = String(attempt.userId);
    if (!attemptsByUser.has(userId)) attemptsByUser.set(userId, []);
    attemptsByUser.get(userId).push(attempt);
  });

  let rows = users.map((user) => {
    const enrollment = enrollmentMap.get(String(user._id));

    const gradeId = getGradeNumber(enrollment?.grade || user.grade);
    const grade = getGradeLabel(gradeId);
    const batchNumber = getText(enrollment?.batchnumber || user.batchnumber);

    const enrollmentClassId = getEnrollmentClassId(enrollment);
    const classDocById = enrollmentClassId ? classIdMap.get(String(enrollmentClassId)) : null;
    const classDocByGradeBatch = classMap.get(makeClassKey(gradeId, batchNumber));
    const cls = classDocById || classDocByGradeBatch || null;

    const enrollmentClassName = getEnrollmentClassName(enrollment);
    const className = enrollmentClassName || getClassName(cls, gradeId, batchNumber);

    const userAttempts = attemptsByUser.get(String(user._id)) || [];
    const allResults = userAttempts.map(serializePaperResult);
    const rankDoc = rankMap.get(String(user._id));

    return recalculateRowTotals(
      {
        id: String(user._id),
        _id: String(user._id),
        studentId: user._id,
        studentName: getText(enrollment?.name || user.name),
        grade,
        gradeId,
        classId: cls?._id || enrollmentClassId || null,
        className,
        batchNumber,
        phoneNumber: getText(enrollment?.phone || user.phonenumber),
        district: getText(user.district),
        islandRank: Number(rankDoc?.rank || 0),
        allResults,
        allCompletedPapersCount: allResults.length,
        selectedPaperType: "",
        calculatedAt: new Date(),
      },
      allResults
    );
  });

  const rowsByGrade = new Map();

  rows.forEach((row) => {
    const key = String(row.gradeId || row.grade || "unknown");
    if (!rowsByGrade.has(key)) rowsByGrade.set(key, []);
    rowsByGrade.get(key).push(row);
  });

  rowsByGrade.forEach((gradeRows) => {
    gradeRows
      .sort((a, b) => {
        if (Number(b.totalCoins || 0) !== Number(a.totalCoins || 0)) {
          return Number(b.totalCoins || 0) - Number(a.totalCoins || 0);
        }

        if (Number(b.completedPapersCount || 0) !== Number(a.completedPapersCount || 0)) {
          return Number(b.completedPapersCount || 0) - Number(a.completedPapersCount || 0);
        }

        return String(a.studentName).localeCompare(String(b.studentName));
      })
      .forEach((row, index) => {
        if (!row.islandRank) row.islandRank = index + 1;
      });
  });

  rows.sort((a, b) => {
    if (Number(a.islandRank || 0) && Number(b.islandRank || 0)) {
      return Number(a.islandRank || 0) - Number(b.islandRank || 0);
    }

    return Number(b.totalCoins || 0) - Number(a.totalCoins || 0);
  });

  return rows;
};

const applyResultFilters = (sourceRows = [], queryParams = {}) => {
  const gradeFilter = normalizeFilterValue(queryParams.grade);
  const classNameFilter = normalizeFilterValue(queryParams.className || queryParams.classname);
  const batchFilter = normalizeFilterValue(queryParams.batchNumber || queryParams.batchnumber);
  const completedPaperCountFilter = normalizeFilterValue(
    queryParams.completedPaperCount || queryParams.completedPapersCount
  );
  const phoneFilter = normalizeFilterValue(queryParams.phoneNumber || queryParams.phonenumber);
  const districtFilter = normalizeFilterValue(queryParams.district);
  const paperTypeFilter = normalizePaperType(queryParams.paperType || queryParams.papertype);

  const gradeNumber = parseNumber(gradeFilter);
  const classRegex = buildRegex(classNameFilter);
  const batchRegex = buildRegex(batchFilter);
  const phoneRegex = buildRegex(phoneFilter);
  const districtRegex = buildRegex(districtFilter);

  let rows = sourceRows.map((row) => {
    const allResults = Array.isArray(row.allResults) ? row.allResults : row.results || [];

    const filteredResults = paperTypeFilter
      ? allResults.filter((item) => normalizePaperType(item.paperType) === paperTypeFilter)
      : allResults;

    return {
      ...recalculateRowTotals(row, filteredResults),
      allResults,
      allCompletedPapersCount: allResults.length,
      selectedPaperType: paperTypeFilter,
      selectedPaperTypeLabel: paperTypeFilter
        ? getPaperTypeLabel(paperTypeFilter)
        : "All Paper Types",
    };
  });

  if (paperTypeFilter) {
    rows = rows.filter((row) => Array.isArray(row.results) && row.results.length > 0);
  }

  if (gradeFilter) {
    rows = rows.filter((row) => {
      if (gradeNumber) return Number(row.gradeId || 0) === gradeNumber;
      return String(row.grade || "").toLowerCase() === gradeFilter.toLowerCase();
    });
  }

  if (classRegex) {
    rows = rows.filter((row) => classRegex.test(row.className || ""));
  }

  if (batchRegex) {
    rows = rows.filter((row) => batchRegex.test(row.batchNumber || ""));
  }

  if (phoneRegex) {
    rows = rows.filter((row) => phoneRegex.test(row.phoneNumber || ""));
  }

  if (districtRegex) {
    rows = rows.filter((row) => districtRegex.test(row.district || ""));
  }

  if (completedPaperCountFilter !== "") {
    const count = Number(completedPaperCountFilter);
    rows = rows.filter((row) => Number(row.completedPapersCount || 0) === count);
  }

  rows.sort((a, b) => {
    if (Number(a.islandRank || 0) && Number(b.islandRank || 0)) {
      return Number(a.islandRank || 0) - Number(b.islandRank || 0);
    }

    return Number(b.totalCoins || 0) - Number(a.totalCoins || 0);
  });

  return rows;
};

const syncResultAdminStudents = async (rows = []) => {
  if (!rows.length) return;

  await Promise.all(
    rows.map((row) =>
      ResultAdminStudent.findOneAndUpdate(
        { studentId: row.studentId },
        {
          $set: {
            studentId: row.studentId,
            studentName: row.studentName,
            grade: row.grade,
            gradeId: row.gradeId,
            classId: row.classId,
            className: row.className,
            batchNumber: row.batchNumber,
            phoneNumber: row.phoneNumber,
            district: row.district,
            islandRank: row.islandRank,
            completedPapersCount: row.allCompletedPapersCount ?? row.completedPapersCount,
            totalCorrectAnswers: row.totalCorrectAnswers,
            totalQuestions: row.totalQuestions,
            totalCoins: row.totalCoins,
            averageProgress: row.averageProgress,
            results: row.allResults || row.results,
            calculatedAt: row.calculatedAt,
          },
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      )
    )
  );
};

const buildOptionsFromRows = (rows = []) => {
  const uniqueSorted = (values) =>
    [...new Set(values.map(getText).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
    );

  const uniqueSortedNumbers = (values) =>
    [...new Set(values.map((value) => Number(value || 0)).filter((value) => value >= 0))].sort(
      (a, b) => a - b
    );

  const allResults = rows.flatMap((row) => row.allResults || row.results || []);

  return {
    grades: uniqueSorted(rows.map((row) => row.grade)),
    classes: uniqueSorted(rows.map((row) => row.className)),
    batchNumbers: uniqueSorted(rows.map((row) => row.batchNumber)),
    districts: uniqueSorted(rows.map((row) => row.district)),
    paperTypes: uniqueSorted(allResults.map((item) => normalizePaperType(item.paperType))).map(
      (paperType) => ({
        value: paperType,
        label: getPaperTypeLabel(paperType),
      })
    ),
    completedPaperCounts: uniqueSortedNumbers(rows.map((row) => row.completedPapersCount)),
  };
};

export const getResultAdminStudents = async (req, res) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limitRaw = Number.parseInt(req.query.limit, 10) || 20;
    const limit = Math.min(Math.max(limitRaw, 1), 100);

    const allRows = await buildResultRows();
    await syncResultAdminStudents(allRows);

    const rows = applyResultFilters(allRows, req.query);

    const total = rows.length;
    const totalPages = Math.max(Math.ceil(total / limit), 1);
    const safePage = Math.min(page, totalPages);
    const skip = (safePage - 1) * limit;
    const data = rows.slice(skip, skip + limit);

    return res.status(200).json({
      message: "Result admin student data loaded successfully",
      data,
      results: data,
      options: buildOptionsFromRows(rows),
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
    console.error("getResultAdminStudents error:", err);

    return res.status(500).json({
      message: "Internal server error",
      errorName: err?.name,
      errorMessage: err?.message,
    });
  }
};

export const getResultAdminStudentOptions = async (_req, res) => {
  try {
    const allRows = await buildResultRows();
    await syncResultAdminStudents(allRows);

    return res.status(200).json({
      message: "Result admin student filter options loaded successfully",
      options: buildOptionsFromRows(allRows),
    });
  } catch (err) {
    console.error("getResultAdminStudentOptions error:", err);

    return res.status(500).json({
      message: "Internal server error",
      errorName: err?.name,
      errorMessage: err?.message,
    });
  }
};

export const getResultAdminStudentById = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(String(studentId || ""))) {
      return res.status(400).json({
        message: "Invalid student id",
      });
    }

    const allRows = await buildResultRows();
    await syncResultAdminStudents(allRows);

    const rows = applyResultFilters(allRows, req.query);
    const row = rows.find(
      (item) => String(getObjectIdString(item.studentId)) === String(studentId)
    );

    if (!row) {
      return res.status(404).json({
        message: "Student result report not found",
      });
    }

    return res.status(200).json({
      message: "Student result report loaded successfully",
      data: row,
      result: row,
    });
  } catch (err) {
    console.error("getResultAdminStudentById error:", err);

    return res.status(500).json({
      message: "Internal server error",
      errorName: err?.name,
      errorMessage: err?.message,
    });
  }
};