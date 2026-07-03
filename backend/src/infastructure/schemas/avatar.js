import mongoose from "mongoose";

const { Schema } = mongoose;

const avatarSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    // Appearance config. Keys/values are whitelisted in application/avatar.js
    // before writing, so Mixed is safe here.
    config: {
      type: Schema.Types.Mixed,
      required: true,
    },

    // Gamification fields (Phase 2 — XP is only ever granted server-side).
    level: {
      type: Number,
      default: 1,
      min: 1,
    },

    xp: {
      type: Number,
      default: 0,
      min: 0,
    },

    unlockedItemIds: {
      type: [String],
      default: [],
    },

    currentMood: {
      type: String,
      default: "happy",
      maxlength: 30,
    },

    thumbnailUrl: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const Avatar = mongoose.models.Avatar || mongoose.model("Avatar", avatarSchema);

export default Avatar;
