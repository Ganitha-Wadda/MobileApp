import mongoose from "mongoose";

const { Schema } = mongoose;

export const PAPER_TYPES = [
  "daily paper",
  "500 paper",
  "lesson by lesson",
  "pastpapers",
];

export const PAPER_PAYMENT_TYPES = ["free", "paid", "practise", "practice"];

const paperSchema = new Schema(
  {
    gradeId: {
      type: Number,
      required: [true, "Grade is required"],
      validate: {
        validator: Number.isInteger,
        message: "Grade must be a valid number",
      },
      index: true,
    },

    paperType: {
      type: String,
      required: [true, "Paper type is required"],
      trim: true,
      lowercase: true,
      enum: {
        values: PAPER_TYPES,
        message: "Please select a valid paper type",
      },
      index: true,
    },

    paperName: {
      type: String,
      required: [true, "Paper name is required"],
      trim: true,
      minlength: [2, "Paper name must have at least 2 characters"],
      maxlength: [120, "Paper name is too long"],
    },

    paperTitle: {
      type: String,
      trim: true,
      default: "",
    },

    paperSubtitle: {
      type: String,
      trim: true,
      default: "",
      maxlength: [180, "Paper subtitle is too long"],
    },

    time: {
      type: String,
      required: [true, "Paper time is required"],
      trim: true,
      default: "",
    },

    questionCount: {
      type: Number,
      required: [true, "Question count is required"],
      min: [1, "Question count must be at least 1"],
      max: [200, "Question count is too high"],
    },

    oneQuestionAnswersCount: {
      type: Number,
      default: 4,
      min: 1,
      max: 6,
    },

    imageUrl: {
      type: String,
      default: "",
      trim: true,
    },

    payment: {
      type: String,
      enum: {
        values: PAPER_PAYMENT_TYPES,
        message: "Payment type must be free or paid",
      },
      default: "free",
      lowercase: true,
      trim: true,
      index: true,
    },

    amount: {
      type: Number,
      default: 0,
      min: [0, "Amount cannot be negative"],
    },

    attemptCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

paperSchema.pre("validate", function normalizePaper(next) {
  this.paperName = String(this.paperName || "").trim();
  this.paperTitle = String(this.paperTitle || this.paperName || "").trim();
  this.paperSubtitle = String(this.paperSubtitle || "").trim();
  this.paperType = String(this.paperType || "").trim().toLowerCase();
  this.payment = String(this.payment || "free").trim().toLowerCase();
  this.time = String(this.time || "").trim();
  this.imageUrl = String(this.imageUrl || "").trim();

  if (this.payment === "practice") this.payment = "practise";

  if (this.payment !== "paid") {
    this.amount = 0;
  }

  next();
});

paperSchema.index({ gradeId: 1, paperType: 1, isPublished: 1, isActive: 1 });
paperSchema.index({ gradeId: 1, paperType: 1, payment: 1, isPublished: 1, isActive: 1 });
paperSchema.index({ isPublished: 1, isActive: 1 });

const Paper = mongoose.models.Paper || mongoose.model("Paper", paperSchema);

export default Paper;
