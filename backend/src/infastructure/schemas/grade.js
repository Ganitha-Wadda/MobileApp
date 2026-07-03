import mongoose from "mongoose";

const { Schema } = mongoose;

export const ALLOWED_GRADES = [3, 4, 5];

const gradeSchema = new Schema(
  {
    gradeId: {
      type: Number,
      required: [true, "Grade is required"],
      enum: {
        values: ALLOWED_GRADES,
        message: "Grade must be only 3, 4, or 5",
      },
      unique: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Grade = mongoose.models.Grade || mongoose.model("Grade", gradeSchema);

export default Grade;

