import mongoose from "mongoose";

const { Schema } = mongoose;

const questionSchema = new Schema(
  {
    paperId: {
      type: Schema.Types.ObjectId,
      ref: "Paper",
      required: true,
      index: true,
    },

    questionNumber: {
      type: Number,
      required: true,
      min: 1,
      index: true,
    },

    lessonName: {
      type: String,
      default: "",
      trim: true,
    },

    question: {
      type: String,
      required: true,
      trim: true,
    },

    // Each slot can be a text string, empty string (image-only), or both.
    answers: {
      type: [String],
      required: true,
      default: [],
    },

    // Optional image URL per answer — index matches answers array.
    // Empty string means no image for that answer.
    answerImages: {
      type: [String],
      default: [],
    },

    correctAnswerIndexes: {
      type: [Number],
      required: true,
      default: [],
    },

    point: {
      type: Number,
      default: 5,
      min: 0,
    },

    explanationVideoUrl: {
      type: String,
      default: "",
      trim: true,
    },

    explanationText: {
      type: String,
      default: "",
      trim: true,
    },

    imageUrl: {
      type: String,
      default: "",
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

questionSchema.pre("validate", function normalizeQuestion(next) {
  this.lessonName = String(this.lessonName || "").trim();
  this.question = String(this.question || "").trim();
  this.explanationVideoUrl = String(this.explanationVideoUrl || "").trim();
  this.explanationText = String(this.explanationText || "").trim();
  this.imageUrl = String(this.imageUrl || "").trim();

  // Normalize answers — keep empty strings for image-only slots.
  // An answer slot is valid if it has text OR a corresponding answerImage.
  this.answers = Array.isArray(this.answers)
    ? this.answers.map((answer) => String(answer || "").trim())
    : [];

  // Normalize answerImages to match answers length; pad/trim with empty strings.
  const answersLen = this.answers.length;
  const rawImages = Array.isArray(this.answerImages) ? this.answerImages : [];
  this.answerImages = Array.from(
    { length: answersLen },
    (_, i) => String(rawImages[i] || "").trim()
  );

  const maxIndex = this.answers.length - 1;
  this.correctAnswerIndexes = Array.isArray(this.correctAnswerIndexes)
    ? [
        ...new Set(
          this.correctAnswerIndexes
            .map(Number)
            .filter(Number.isFinite)
            .filter((index) => index >= 0 && index <= maxIndex)
        ),
      ].sort((a, b) => a - b)
    : [];

  next();
});

// An answer slot is valid if it has text OR an image (or both).
questionSchema.path("answers").validate(function validateAnswers(answers) {
  if (!Array.isArray(answers)) return false;
  if (answers.length < 1 || answers.length > 6) return false;

  const images = Array.isArray(this.answerImages) ? this.answerImages : [];
  // Each slot must have at least text or an image.
  return answers.every(
    (text, i) => String(text || "").trim().length > 0 || String(images[i] || "").trim().length > 0
  );
}, "Each answer must have text or an image");

questionSchema.path("correctAnswerIndexes").validate(function validateCorrectAnswers(indexes) {
  return Array.isArray(indexes) && indexes.length >= 1;
}, "Please select at least one correct answer");

questionSchema.index(
  { paperId: 1, questionNumber: 1 },
  { unique: true }
);

const Question =
  mongoose.models.Question || mongoose.model("Question", questionSchema);

export default Question;