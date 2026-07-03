import mongoose from "mongoose";

const { Schema } = mongoose;

const shortActivityAttemptSchema = new Schema(
  {
    activityId: {
      type: Schema.Types.ObjectId,
      ref: "Activity",
      required: true,
    },
    selectedAnswerIndexes: {
      type: [Number],
      default: [],
    },
    isCorrect: {
      type: Boolean,
      required: true,
      default: false,
    },
    earnedCoins: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    attemptedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const watchedVideoSchema = new Schema(
  {
    videoKey: {
      type: String,
      required: true,
      trim: true,
    },
    videoIndex: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    watchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const shortCoinsCountSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    shortLessonId: {
      type: Schema.Types.ObjectId,
      ref: "Shortlesson",
      required: true,
      index: true,
    },
    shortSubLessonId: {
      type: Schema.Types.ObjectId,
      ref: "Shortsublesson",
      required: true,
      index: true,
    },
    watchedVideoKeys: {
      type: [String],
      default: [],
    },
    watchedVideos: {
      type: [watchedVideoSchema],
      default: [],
    },
    activityAttempts: {
      type: [shortActivityAttemptSchema],
      default: [],
    },
    totalShortCoins: {
      type: Number,
      default: 0,
      min: 0,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

shortCoinsCountSchema.index(
  { userId: 1, shortLessonId: 1, shortSubLessonId: 1 },
  { unique: true }
);
shortCoinsCountSchema.index({ userId: 1, shortLessonId: 1 });

const ShortCoinsCount =
  mongoose.models.ShortCoinsCount ||
  mongoose.model("ShortCoinsCount", shortCoinsCountSchema);

export default ShortCoinsCount;
