import mongoose from "mongoose";
import Grade, { ALLOWED_GRADES } from "../infastructure/schemas/grade.js";

/* ── helpers ── */
const isValidGradeNumber = (val) => {
  const n = Number(val);
  return Number.isInteger(n) && ALLOWED_GRADES.includes(n);
};

/* ══════════════════════════════════════════════════
   CREATE GRADE
══════════════════════════════════════════════════ */
export const createGrade = async (req, res) => {
  try {
    const { gradeId } = req.body;

    if (gradeId === undefined || gradeId === null || gradeId === "") {
      return res.status(400).json({
        success: false,
        message: "Grade number is required",
      });
    }

    if (!isValidGradeNumber(gradeId)) {
      return res.status(400).json({
        success: false,
        message: `Grade must be one of: ${ALLOWED_GRADES.join(", ")}`,
      });
    }

    const existing = await Grade.findOne({ gradeId: Number(gradeId) });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Grade ${gradeId} already exists`,
      });
    }

    const grade = await Grade.create({ gradeId: Number(gradeId), isActive: true });

    return res.status(201).json({
      success: true,
      message: `Grade ${gradeId} created successfully`,
      data: grade,
      grade,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create grade",
    });
  }
};

/* ══════════════════════════════════════════════════
   GET ALL GRADES
══════════════════════════════════════════════════ */
export const getAllGrades = async (req, res) => {
  try {
    const filter = {};

    // optional ?isActive=true/false query param
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === "true";
    }

    const grades = await Grade.find(filter).sort({ gradeId: 1 });

    return res.status(200).json({
      success: true,
      count: grades.length,
      data: grades,
      grades,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get grades",
    });
  }
};

/* ══════════════════════════════════════════════════
   GET GRADE BY ID
══════════════════════════════════════════════════ */
export const getGradeById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid grade ID" });
    }

    const grade = await Grade.findById(id);
    if (!grade) {
      return res.status(404).json({ success: false, message: "Grade not found" });
    }

    return res.status(200).json({ success: true, data: grade, grade });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get grade",
    });
  }
};

/* ══════════════════════════════════════════════════
   UPDATE GRADE  (toggle isActive or change gradeId)
══════════════════════════════════════════════════ */
export const updateGrade = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid grade ID" });
    }

    const patch = {};

    if (req.body.gradeId !== undefined) {
      if (!isValidGradeNumber(req.body.gradeId)) {
        return res.status(400).json({
          success: false,
          message: `Grade must be one of: ${ALLOWED_GRADES.join(", ")}`,
        });
      }
      // make sure new gradeId is not taken by another doc
      const conflict = await Grade.findOne({
        gradeId: Number(req.body.gradeId),
        _id: { $ne: id },
      });
      if (conflict) {
        return res.status(409).json({
          success: false,
          message: `Grade ${req.body.gradeId} already exists`,
        });
      }
      patch.gradeId = Number(req.body.gradeId);
    }

    if (req.body.isActive !== undefined) {
      patch.isActive = Boolean(req.body.isActive);
    }

    if (Object.keys(patch).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Nothing to update. Provide gradeId or isActive.",
      });
    }

    const grade = await Grade.findByIdAndUpdate(id, patch, {
      new: true,
      runValidators: true,
    });

    if (!grade) {
      return res.status(404).json({ success: false, message: "Grade not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Grade updated successfully",
      data: grade,
      grade,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update grade",
    });
  }
};

/* ══════════════════════════════════════════════════
   DELETE GRADE
══════════════════════════════════════════════════ */
export const deleteGrade = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid grade ID" });
    }

    const grade = await Grade.findByIdAndDelete(id);
    if (!grade) {
      return res.status(404).json({ success: false, message: "Grade not found" });
    }

    return res.status(200).json({
      success: true,
      message: `Grade ${grade.gradeId} deleted successfully`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete grade",
    });
  }
};

/* ══════════════════════════════════════════════════
   SEED GRADES (upsert all allowed grades)
══════════════════════════════════════════════════ */
export const seedGrades = async (req, res) => {
  try {
    const results = [];
    for (const g of ALLOWED_GRADES) {
      const doc = await Grade.findOneAndUpdate(
        { gradeId: g },
        { gradeId: g, isActive: true },
        { upsert: true, new: true }
      );
      results.push(doc);
    }
    return res.status(200).json({
      success: true,
      message: "All grades seeded successfully",
      count: results.length,
      data: results,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to seed grades",
    });
  }
};