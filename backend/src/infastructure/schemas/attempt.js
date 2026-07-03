import mongoose from "mongoose";

const { Schema } = mongoose;

const attemptSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },

    liveClassId: {
      type: Schema.Types.ObjectId,
      ref: "LiveClass",
      required: [true, "Live class ID is required"],
      index: true,
    },

    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      default: null,
      index: true,
    },

    title: {
      type: String,
      trim: true,
      default: "Live Class",
    },

    teacherName: {
      type: String,
      trim: true,
      default: "Teacher",
    },

    grade: {
      type: Number,
      default: null,
      index: true,
    },

    batchnumber: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },

    liveClassDate: {
      type: Date,
      default: null,
    },

    zoomLink: {
      type: String,
      trim: true,
      default: "",
    },

    linkIndex: {
      type: Number,
      default: 0,
    },

    firstAttemptedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    attemptedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    lastOpenedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    clickCount: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  { timestamps: true }
);

attemptSchema.index({ userId: 1, liveClassId: 1 }, { unique: true });
attemptSchema.index({ userId: 1, attemptedAt: -1 });
attemptSchema.index({ grade: 1, batchnumber: 1, attemptedAt: -1 });

const Attempt =
  mongoose.models.Attempt || mongoose.model("Attempt", attemptSchema);

export default Attempt;