import mongoose from "mongoose";

const { Schema } = mongoose;

export const ALLOWED_CLASS_GRADES = [3, 4, 5];

const classSchema = new Schema(
  {
    grade: {
      type: Number,
      required: [true, "Grade is required"],
      enum: {
        values: ALLOWED_CLASS_GRADES,
        message: "Grade must be only 3, 4, or 5",
      },
      index: true,
    },

    teacherName: {
      type: String,
      required: [true, "Teacher name is required"],
      trim: true,
      minlength: [2, "Teacher name must have at least 2 characters"],
      maxlength: [80, "Teacher name is too long"],
    },

    batchnumber: {
      type: String,
      required: [true, "Batch number is required"],
      trim: true,
      minlength: [1, "Batch number must not be empty"],
      maxlength: [50, "Batch number is too long"],
    },
  },
  { timestamps: true }
);

classSchema.index({ grade: 1, batchnumber: 1 });
classSchema.index({ grade: 1 });
classSchema.index({ batchnumber: 1 });

const ClassModel = mongoose.models.Class || mongoose.model("Class", classSchema);

export default ClassModel;
