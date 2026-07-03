import mongoose from "mongoose";

const { Schema } = mongoose;

export const PAPER_RESULT_STATUS = ["in_progress", "completed", "expired"];
export const QUESTION_RESULT_STATUS = ["not_attempted", "correct", "wrong"];

const questionResultSchema = new Schema(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      ref: "Question",
      required: true,
      index: true,
    },

    questionNumber: {
      type: Number,
      required: true,
      min: 1,
    },

    lessonName: {
      type: String,
      default: "",
      trim: true,
    },

    question: {
      type: String,
      default: "",
      trim: true,
    },

    answerOptions: {
      type: [String],
      default: [],
    },

    selectedAnswerIndexes: {
      type: [Number],
      default: [],
    },

    selectedAnswerTexts: {
      type: [String],
      default: [],
    },

    correctAnswerIndexes: {
      type: [Number],
      default: [],
    },

    correctAnswerTexts: {
      type: [String],
      default: [],
    },

    isAttempted: {
      type: Boolean,
      default: false,
      index: true,
    },

    isCorrect: {
      type: Boolean,
      default: false,
      index: true,
    },

    status: {
      type: String,
      enum: QUESTION_RESULT_STATUS,
      default: "not_attempted",
      index: true,
    },

    coinsEarned: {
      type: Number,
      default: 0,
      min: 0,
    },

    point: {
      type: Number,
      default: 5,
      min: 0,
    },

    explanationText: {
      type: String,
      default: "",
      trim: true,
    },

    explanationVideoUrl: {
      type: String,
      default: "",
      trim: true,
    },

    answeredAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const paperResultSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    paperId: {
      type: Schema.Types.ObjectId,
      ref: "Paper",
      required: true,
      index: true,
    },

    paperSnapshot: {
      gradeId: { type: Number, default: 0 },
      paperType: { type: String, default: "", trim: true },
      paperName: { type: String, default: "", trim: true },
      paperTitle: { type: String, default: "", trim: true },
      paperSubtitle: { type: String, default: "", trim: true },
      time: { type: String, default: "", trim: true },
      questionCount: { type: Number, default: 0 },
    },

    durationSeconds: {
      type: Number,
      required: true,
      min: 1,
    },

    startedAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    submittedAt: {
      type: Date,
      default: null,
      index: true,
    },

    status: {
      type: String,
      enum: PAPER_RESULT_STATUS,
      default: "in_progress",
      index: true,
    },

    currentQuestionNumber: {
      type: Number,
      default: 1,
      min: 1,
    },

    answers: {
      type: [questionResultSchema],
      default: [],
    },

    totalQuestions: {
      type: Number,
      default: 0,
      min: 0,
    },

    attemptedCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    correctCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    wrongCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    notAttemptedCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalCoins: {
      type: Number,
      default: 0,
      min: 0,
    },

    maximumCoins: {
      type: Number,
      default: 0,
      min: 0,
    },

    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    lastActivityAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

paperResultSchema.pre("validate", function normalizePaperResult(next) {
  this.totalQuestions = Number(this.totalQuestions || this.answers?.length || 0);
  this.maximumCoins = Number(this.maximumCoins || this.totalQuestions * 5 || 0);
  this.currentQuestionNumber = Math.max(Number(this.currentQuestionNumber || 1), 1);
  this.lastActivityAt = this.lastActivityAt || new Date();

  next();
});

// One attempt only per student + paper.
// If an attempt is completed/expired, frontend must show View Review instead of Start.
paperResultSchema.index({ userId: 1, paperId: 1 }, { unique: true });
paperResultSchema.index({ userId: 1, paperId: 1, createdAt: -1 });
paperResultSchema.index({ userId: 1, status: 1, expiresAt: 1 });

const PaperResult =
  mongoose.models.PaperResult || mongoose.model("PaperResult", paperResultSchema);

export default PaperResult;
