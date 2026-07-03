import mongoose from "mongoose";

const { Schema } = mongoose;

const resultPaperSchema = new Schema(
  {
    paperResultId: {
      type: Schema.Types.ObjectId,
      ref: "PaperResult",
      default: null,
      index: true,
    },

    paperId: {
      type: Schema.Types.ObjectId,
      ref: "Paper",
      default: null,
      index: true,
    },

    paperName: {
      type: String,
      default: "",
      trim: true,
    },

    paperType: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    correctAnswers: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalQuestions: {
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

    marks: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    resultMark: {
      type: String,
      default: "0/0",
      trim: true,
    },

    progress: {
      type: String,
      default: "0%",
      trim: true,
    },

    status: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    submittedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  { _id: false }
);

const resultAdminStudentSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    studentName: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    grade: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    gradeId: {
      type: Number,
      default: 0,
      index: true,
    },

    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      default: null,
      index: true,
    },

    className: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    batchNumber: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    phoneNumber: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    district: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    islandRank: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },

    completedPapersCount: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },

    totalCorrectAnswers: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalQuestions: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalCoins: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },

    averageProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    results: {
      type: [resultPaperSchema],
      default: [],
    },

    calculatedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

resultAdminStudentSchema.index({ gradeId: 1, islandRank: 1 });
resultAdminStudentSchema.index({ grade: 1, batchNumber: 1 });
resultAdminStudentSchema.index({ district: 1, phoneNumber: 1 });
resultAdminStudentSchema.index({ completedPapersCount: 1 });

const ResultAdminStudent =
  mongoose.models.ResultAdminStudent ||
  mongoose.model("ResultAdminStudent", resultAdminStudentSchema);

export default ResultAdminStudent;