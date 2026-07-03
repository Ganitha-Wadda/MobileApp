import mongoose from "mongoose";

const { Schema } = mongoose;

const ActivitySchema = new Schema(
  {
    shortLessonId: {
      type: Schema.Types.ObjectId,
      ref: "Shortlesson",
      required: true,
    },
    shortLessonBysubId: {
      type: Schema.Types.ObjectId,
      ref: "Shortsublesson",
      required: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answers: {
      type: [String],
      required: true,
      default: [],
    },
    correctAnswerIndexes: {
      type: [Number],
      required: true,
      default: [],
    },
  },
  { timestamps: true }
);

const Activity =
  mongoose.models.Activity || mongoose.model("Activity", ActivitySchema);

export default Activity;