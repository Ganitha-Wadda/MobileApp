import mongoose from "mongoose";

const { Schema } = mongoose;

const rankSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    grade: {
      type: Schema.Types.ObjectId,
      ref: "Grade",
      required: true,
      index: true,
    },

    gradeId: {
      type: Number,
      default: 0,
      index: true,
    },

    name: {
      type: String,
      default: "",
      trim: true,
    },

    gender: {
      type: String,
      default: "",
      trim: true,
    },

    avatar: {
      type: String,
      default: "👤",
      trim: true,
    },

    paperCoins: {
      type: Number,
      default: 0,
      min: 0,
    },

    activityCoins: {
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

    completedPapersCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    isEligibleForRank: {
      type: Boolean,
      default: false,
      index: true,
    },

    rank: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },

    totalStudentsInGrade: {
      type: Number,
      default: 0,
      min: 0,
    },

    calculatedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

rankSchema.index({ grade: 1, rank: 1 });
rankSchema.index({ grade: 1, isEligibleForRank: 1, rank: 1 });
rankSchema.index({ grade: 1, totalCoins: -1, rank: 1 });
rankSchema.index({ gradeId: 1, totalCoins: -1, rank: 1 });

const Rank = mongoose.models.Rank || mongoose.model("Rank", rankSchema);

export default Rank;