import mongoose from "mongoose";

const { Schema } = mongoose;

const languageSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      unique: true,
      index: true,
    },

    language: {
      type: String,
      enum: {
        values: ["en", "si"],
        message: "Language must be 'en' or 'si'",
      },
      default: "si",
      required: [true, "Language is required"],
    },
  },
  { timestamps: true }
);

const LanguageModel =
  mongoose.models.Language || mongoose.model("Language", languageSchema);

export default LanguageModel;