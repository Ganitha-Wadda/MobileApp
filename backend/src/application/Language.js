import LanguageModel from "../infastructure/schemas/Language.js";

const ALLOWED_LANGUAGES = ["en", "si"];
const DEFAULT_LANGUAGE = "si";

const normalizeLanguage = (value) =>
  String(value || "")
    .toLowerCase()
    .trim();

// GET /api/language — returns current language for the authenticated user
export const getLanguage = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const record = await LanguageModel.findOne({ userId }).lean();
    const language = record?.language || DEFAULT_LANGUAGE;

    return res.status(200).json({ language });
  } catch (err) {
    next(err);
  }
};

// PUT /api/language — create or update language preference
export const updateLanguage = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const cleanLang = normalizeLanguage(req.body?.language);

    if (!cleanLang) {
      return res.status(400).json({ message: "Language is required" });
    }

    if (!ALLOWED_LANGUAGES.includes(cleanLang)) {
      return res.status(400).json({ message: "Language must be 'en' or 'si'" });
    }

    const updated = await LanguageModel.findOneAndUpdate(
      { userId },
      { $set: { userId, language: cleanLang } },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    ).lean();

    return res.status(200).json({
      message: "Language updated successfully",
      language: updated.language,
    });
  } catch (err) {
    next(err);
  }
};