import mongoose from "mongoose";
import Shortlesson from "../infastructure/schemas/shortzlesson.js";
import Grade from "../infastructure/schemas/grade.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(String(id || ""));

const toObjectId = (id) => new mongoose.Types.ObjectId(String(id));

const getLoggedUserGradeId = (user = {}) => {
  const candidates = [
    user.gradeId,
    user.grade,
    user.selectedGrade,
    user.selectedGradeId,
    user?.profile?.grade,
    user?.profile?.gradeId,
  ];

  for (const value of candidates) {
    if (!value) continue;

    const rawId =
      typeof value === "object"
        ? value._id || value.id || value.toString?.()
        : value;

    if (isValidId(rawId)) {
      return String(rawId);
    }
  }

  return null;
};

export const createshortlesson = async (req, res) => {
  try {
    const { gradeId, title } = req.body;

    if (!gradeId) {
      return res.status(400).json({
        success: false,
        message: "Grade is required",
      });
    }

    if (!isValidId(gradeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid grade ID",
      });
    }

    const gradeExists = await Grade.findById(gradeId);

    if (!gradeExists) {
      return res.status(400).json({
        success: false,
        message: "Grade not found",
      });
    }

    const cleanTitle = String(title || "").trim();

    if (!cleanTitle) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    const shortlesson = await Shortlesson.create({
      gradeId: toObjectId(gradeId),
      title: cleanTitle,
    });

    const populated = await Shortlesson.findById(shortlesson._id).populate(
      "gradeId"
    );

    return res.status(201).json({
      success: true,
      message: "Short lesson created successfully",
      shortlesson: populated,
      data: populated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create short lesson",
    });
  }
};

export const getAllshortlesson = async (req, res) => {
  try {
    const filter = {};

    if (req.query.gradeId) {
      const gradeIdParam = String(req.query.gradeId).trim();

      if (!isValidId(gradeIdParam)) {
        return res.status(400).json({
          success: false,
          message: "Invalid grade ID",
          data: [],
          shortlessons: [],
        });
      }

      filter.gradeId = toObjectId(gradeIdParam);
    }

    const shortlessons = await Shortlesson.find(filter)
      .populate("gradeId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: shortlessons.length,
      data: shortlessons,
      shortlessons,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get short lessons",
    });
  }
};

export const getMyGradeShortLessons = async (req, res) => {
  try {
    const gradeId = getLoggedUserGradeId(req.user);

    if (!gradeId) {
      return res.status(400).json({
        success: false,
        message: "Logged-in user grade not found",
        data: [],
        shortlessons: [],
      });
    }

    const shortlessons = await Shortlesson.find({
      gradeId: toObjectId(gradeId),
    })
      .select("title")
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: shortlessons.length,
      data: shortlessons,
      shortlessons,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get your short lessons",
      data: [],
      shortlessons: [],
    });
  }
};

export const getshortlessonById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid short lesson ID",
      });
    }

    const shortlesson = await Shortlesson.findById(id).populate("gradeId");

    if (!shortlesson) {
      return res.status(404).json({
        success: false,
        message: "Short lesson not found",
      });
    }

    return res.status(200).json({
      success: true,
      shortlesson,
      data: shortlesson,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get short lesson",
    });
  }
};

export const updateshortlessonById = async (req, res) => {
  try {
    const { id } = req.params;
    const { gradeId, title } = req.body;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid short lesson ID",
      });
    }

    const patch = {};

    if (gradeId !== undefined) {
      if (!isValidId(gradeId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid grade ID",
        });
      }

      const gradeExists = await Grade.findById(gradeId);

      if (!gradeExists) {
        return res.status(400).json({
          success: false,
          message: "Grade not found",
        });
      }

      patch.gradeId = toObjectId(gradeId);
    }

    if (title !== undefined) {
      const cleanTitle = String(title || "").trim();

      if (!cleanTitle) {
        return res.status(400).json({
          success: false,
          message: "Title is required",
        });
      }

      patch.title = cleanTitle;
    }

    const shortlesson = await Shortlesson.findByIdAndUpdate(id, patch, {
      new: true,
      runValidators: true,
    }).populate("gradeId");

    if (!shortlesson) {
      return res.status(404).json({
        success: false,
        message: "Short lesson not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Short lesson updated successfully",
      shortlesson,
      data: shortlesson,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update short lesson",
    });
  }
};

export const deleteshortLessonById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid short lesson ID",
      });
    }

    const shortlesson = await Shortlesson.findByIdAndDelete(id);

    if (!shortlesson) {
      return res.status(404).json({
        success: false,
        message: "Short lesson not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Short lesson deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete short lesson",
    });
  }
};