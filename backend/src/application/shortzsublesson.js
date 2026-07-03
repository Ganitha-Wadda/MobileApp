import mongoose from "mongoose";
import Shortsublesson from "../infastructure/schemas/shortzsublesson.js";
import Shortlesson from "../infastructure/schemas/shortzlesson.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(String(id || ""));

const toObjectId = (id) => new mongoose.Types.ObjectId(String(id));

/* ─────────────────────────────────────────────
   CREATE
───────────────────────────────────────────── */
export const createshortsublesson = async (req, res) => {
  try {
    const { shortLessonId, title, links } = req.body;

    if (!shortLessonId) {
      return res.status(400).json({
        success: false,
        message: "Short lesson ID is required",
      });
    }

    if (!isValidId(shortLessonId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid short lesson ID",
      });
    }

    const shortLessonExists = await Shortlesson.findById(shortLessonId);

    if (!shortLessonExists) {
      return res.status(404).json({
        success: false,
        message: "Short lesson not found",
      });
    }

    const cleanTitle = String(title || "").trim();

    if (!cleanTitle) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    if (!Array.isArray(links) || links.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one link is required",
      });
    }

    const cleanLinks = links
      .map((link) => String(link || "").trim())
      .filter(Boolean);

    if (cleanLinks.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one valid link is required",
      });
    }

    const shortsublesson = await Shortsublesson.create({
      shortLessonId: toObjectId(shortLessonId),
      title: cleanTitle,
      links: cleanLinks,
      status: "editing",
    });

    const populated = await Shortsublesson.findById(shortsublesson._id).populate({
      path: "shortLessonId",
      populate: { path: "gradeId" },
    });

    res.status(201).json({
      success: true,
      message: "Short sub lesson created successfully",
      shortsublesson: populated,
      data: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create short sub lesson",
    });
  }
};

/* ─────────────────────────────────────────────
   GET ALL
───────────────────────────────────────────── */
export const GetAllshortsublesson = async (req, res) => {
  try {
    const shortsublessons = await Shortsublesson.find()
      .populate({ path: "shortLessonId", populate: { path: "gradeId" } })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: shortsublessons.length,
      data: shortsublessons,
      shortsublessons,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get short sub lessons",
    });
  }
};

/* ─────────────────────────────────────────────
   GET RELATED SUB LESSONS BY SHORT LESSON ID
   Student app will use this endpoint.
───────────────────────────────────────────── */
export const getShortSubLessonsByShortLessonId = async (req, res) => {
  try {
    const { shortLessonId } = req.params;
    const { status } = req.query;

    if (!shortLessonId) {
      return res.status(400).json({
        success: false,
        message: "Short lesson ID is required",
        data: [],
        shortsublessons: [],
      });
    }

    if (!isValidId(shortLessonId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid short lesson ID",
        data: [],
        shortsublessons: [],
      });
    }

    const filter = {
      shortLessonId: toObjectId(shortLessonId),
    };

    if (status === "all") {
      // admin/debug usage
    } else if (status && ["editing", "published"].includes(status)) {
      filter.status = status;
    } else {
      filter.status = "published";
    }

    const shortsublessons = await Shortsublesson.find(filter)
      .populate({ path: "shortLessonId", populate: { path: "gradeId" } })
      .sort({ createdAt: 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: shortsublessons.length,
      data: shortsublessons,
      shortsublessons,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error.message || "Failed to get related short sub lessons",
      data: [],
      shortsublessons: [],
    });
  }
};

/* ─────────────────────────────────────────────
   GET BY ID
───────────────────────────────────────────── */
export const GetShortLessonById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid short sub lesson ID",
      });
    }

    const shortsublesson = await Shortsublesson.findById(id).populate({
      path: "shortLessonId",
      populate: { path: "gradeId" },
    });

    if (!shortsublesson) {
      return res.status(404).json({
        success: false,
        message: "Short sub lesson not found",
      });
    }

    res.status(200).json({
      success: true,
      shortsublesson,
      data: shortsublesson,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get short sub lesson",
    });
  }
};

/* ─────────────────────────────────────────────
   UPDATE
───────────────────────────────────────────── */
export const updateShortLessonById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid short sub lesson ID",
      });
    }

    const existing = await Shortsublesson.findById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Short sub lesson not found",
      });
    }

    if (existing.status === "published") {
      return res.status(403).json({
        success: false,
        message:
          "This sub lesson is published. Switch it to Editing status before making changes.",
      });
    }

    const patch = { ...req.body };

    if (patch.shortLessonId !== undefined) {
      if (!isValidId(patch.shortLessonId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid short lesson ID",
        });
      }

      const shortLessonExists = await Shortlesson.findById(patch.shortLessonId);

      if (!shortLessonExists) {
        return res.status(404).json({
          success: false,
          message: "Short lesson not found",
        });
      }

      patch.shortLessonId = toObjectId(patch.shortLessonId);
    }

    if (patch.title !== undefined) {
      patch.title = String(patch.title || "").trim();

      if (!patch.title) {
        return res.status(400).json({
          success: false,
          message: "Title is required",
        });
      }
    }

    if (patch.links !== undefined) {
      if (!Array.isArray(patch.links) || patch.links.length === 0) {
        return res.status(400).json({
          success: false,
          message: "At least one link is required",
        });
      }

      patch.links = patch.links
        .map((link) => String(link || "").trim())
        .filter(Boolean);

      if (patch.links.length === 0) {
        return res.status(400).json({
          success: false,
          message: "At least one valid link is required",
        });
      }
    }

    const shortsublesson = await Shortsublesson.findByIdAndUpdate(id, patch, {
      new: true,
      runValidators: true,
    }).populate({ path: "shortLessonId", populate: { path: "gradeId" } });

    res.status(200).json({
      success: true,
      message: "Short sub lesson updated successfully",
      shortsublesson,
      data: shortsublesson,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update short sub lesson",
    });
  }
};

/* ─────────────────────────────────────────────
   UPDATE STATUS
───────────────────────────────────────────── */
export const updateShortSubLessonStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid short sub lesson ID",
      });
    }

    if (!status || !["editing", "published"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'editing' or 'published'",
      });
    }

    const shortsublesson = await Shortsublesson.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate({ path: "shortLessonId", populate: { path: "gradeId" } });

    if (!shortsublesson) {
      return res.status(404).json({
        success: false,
        message: "Short sub lesson not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `Status updated to '${status}'`,
      shortsublesson,
      data: shortsublesson,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update status",
    });
  }
};

/* ─────────────────────────────────────────────
   DELETE
───────────────────────────────────────────── */
export const deleteshortsublessonById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid short sub lesson ID",
      });
    }

    const shortsublesson = await Shortsublesson.findByIdAndDelete(id);

    if (!shortsublesson) {
      return res.status(404).json({
        success: false,
        message: "Short sub lesson not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Short sub lesson deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete short sub lesson",
    });
  }
};