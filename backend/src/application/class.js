import mongoose from "mongoose";

import ClassModel, {
  ALLOWED_CLASS_GRADES,
} from "../infastructure/schemas/class.js";

const normalizeText = (value = "") => {
  return String(value || "").trim();
};

const sortTextNumber = (a, b) => {
  return String(a).localeCompare(String(b), undefined, {
    numeric: true,
    sensitivity: "base",
  });
};

const uniqueSorted = (values = []) => {
  return [...new Set(values.map((v) => normalizeText(v)).filter(Boolean))].sort(
    sortTextNumber
  );
};

const validateClassData = ({ grade, teacherName, batchnumber }) => {
  const gradeNumber = Number(grade);

  if (!ALLOWED_CLASS_GRADES.includes(gradeNumber)) {
    return "Grade must be only 3, 4, or 5";
  }

  const cleanTeacherName = normalizeText(teacherName);

  if (!cleanTeacherName) {
    return "Teacher name is required";
  }

  if (cleanTeacherName.length < 2) {
    return "Teacher name must have at least 2 characters";
  }

  if (cleanTeacherName.length > 80) {
    return "Teacher name is too long";
  }

  const cleanBatchNumber = normalizeText(batchnumber);

  if (!cleanBatchNumber) {
    return "Batch number is required";
  }

  if (cleanBatchNumber.length > 50) {
    return "Batch number is too long";
  }

  return null;
};

export const createClass = async (req, res, next) => {
  try {
    const { grade, teacherName, batchnumber } = req.body || {};

    const validationError = validateClassData({
      grade,
      teacherName,
      batchnumber,
    });

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    const createdClass = await ClassModel.create({
      grade: Number(grade),
      teacherName: normalizeText(teacherName),
      batchnumber: normalizeText(batchnumber),
    });

    return res.status(201).json({
      message: "Class created successfully",
      class: createdClass,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllClasses = async (req, res, next) => {
  try {
    const classes = await ClassModel.find({})
      .sort({ grade: 1, batchnumber: 1, createdAt: -1 })
      .lean();

    return res.status(200).json({
      count: classes.length,
      classes,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/class/options
 * Frontend signup dropdown uses this.
 * Grades and batch numbers are generated only from Class collection.
 */
export const getClassOptions = async (req, res, next) => {
  try {
    const classes = await ClassModel.find({})
      .select("grade batchnumber teacherName")
      .sort({ grade: 1, batchnumber: 1 })
      .lean();

    const gradeSet = new Set();
    const batchesByGrade = {};

    for (const item of classes) {
      const grade = Number(item.grade);
      const batchnumber = normalizeText(item.batchnumber);

      if (!Number.isInteger(grade) || !batchnumber) continue;

      gradeSet.add(grade);

      const key = String(grade);
      if (!batchesByGrade[key]) batchesByGrade[key] = [];
      batchesByGrade[key].push(batchnumber);
    }

    const grades = [...gradeSet].sort((a, b) => a - b);

    for (const key of Object.keys(batchesByGrade)) {
      batchesByGrade[key] = uniqueSorted(batchesByGrade[key]);
    }

    return res.status(200).json({
      count: classes.length,
      grades,
      batchesByGrade,
      classes,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/class/batches/:grade
 */
export const getBatchNumbersByGrade = async (req, res, next) => {
  try {
    const { grade } = req.params;
    const gradeNumber = Number(grade);

    if (!ALLOWED_CLASS_GRADES.includes(gradeNumber)) {
      return res.status(400).json({
        message: "Grade must be only 3, 4, or 5",
      });
    }

    const classes = await ClassModel.find({ grade: gradeNumber })
      .select("grade batchnumber teacherName")
      .sort({ batchnumber: 1, createdAt: -1 })
      .lean();

    const batchnumbers = uniqueSorted(classes.map((item) => item.batchnumber));

    return res.status(200).json({
      grade: gradeNumber,
      count: batchnumbers.length,
      batchnumbers,
      batches: batchnumbers,
      classes,
    });
  } catch (err) {
    next(err);
  }
};

export const getClassById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid class id",
      });
    }

    const classData = await ClassModel.findById(id).lean();

    if (!classData) {
      return res.status(404).json({
        message: "Class not found",
      });
    }

    return res.status(200).json({
      class: classData,
    });
  } catch (err) {
    next(err);
  }
};

export const getClassByGrade = async (req, res, next) => {
  try {
    const { grade } = req.params;

    const gradeNumber = Number(grade);

    if (!ALLOWED_CLASS_GRADES.includes(gradeNumber)) {
      return res.status(400).json({
        message: "Grade must be only 3, 4, or 5",
      });
    }

    const classes = await ClassModel.find({ grade: gradeNumber })
      .sort({ batchnumber: 1, createdAt: -1 })
      .lean();

    return res.status(200).json({
      count: classes.length,
      classes,
    });
  } catch (err) {
    next(err);
  }
};

export const updateClassById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid class id",
      });
    }

    const updates = { ...(req.body || {}) };

    if (typeof updates.grade !== "undefined") {
      updates.grade = Number(updates.grade);

      if (!ALLOWED_CLASS_GRADES.includes(updates.grade)) {
        return res.status(400).json({
          message: "Grade must be only 3, 4, or 5",
        });
      }
    }

    if (typeof updates.teacherName !== "undefined") {
      updates.teacherName = normalizeText(updates.teacherName);

      if (!updates.teacherName) {
        return res.status(400).json({
          message: "Teacher name is required",
        });
      }

      if (updates.teacherName.length < 2) {
        return res.status(400).json({
          message: "Teacher name must have at least 2 characters",
        });
      }

      if (updates.teacherName.length > 80) {
        return res.status(400).json({
          message: "Teacher name is too long",
        });
      }
    }

    if (typeof updates.batchnumber !== "undefined") {
      updates.batchnumber = normalizeText(updates.batchnumber);

      if (!updates.batchnumber) {
        return res.status(400).json({
          message: "Batch number is required",
        });
      }

      if (updates.batchnumber.length > 50) {
        return res.status(400).json({
          message: "Batch number is too long",
        });
      }
    }

    const updatedClass = await ClassModel.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
      context: "query",
    }).lean();

    if (!updatedClass) {
      return res.status(404).json({
        message: "Class not found",
      });
    }

    return res.status(200).json({
      message: "Class updated successfully",
      class: updatedClass,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteClassById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid class id",
      });
    }

    const deletedClass = await ClassModel.findByIdAndDelete(id).lean();

    if (!deletedClass) {
      return res.status(404).json({
        message: "Class not found",
      });
    }

    return res.status(200).json({
      message: "Class deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};