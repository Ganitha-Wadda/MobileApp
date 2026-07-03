import mongoose from "mongoose";

const { Schema } = mongoose;

const shortsublessonSchema = new Schema(
  {
    shortLessonId: {
      type: Schema.Types.ObjectId,
      ref: "Shortlesson",
      required: [true, "Short lesson ID is required"],
    },

    title: {
      type: String,
      required: [true, "Short sub lesson title is required"],
      trim: true,
      minlength: [2, "Title must have at least 2 characters"],
      maxlength: [150, "Title is too long"],
    },

    links: {
      type: [String],
      required: [true, "At least one live class link is required"],
      validate: {
        validator: function (value) {
          return Array.isArray(value) && value.length > 0;
        },
        message: "At least one live class link is required",
      },
    },

    // ─── Publish status ───────────────────────────────────────────────────────
    status: {
      type: String,
      enum: {
        values: ["editing", "published"],
        message: "Status must be either 'editing' or 'published'",
      },
      default: "editing",
    },
  },
  { timestamps: true }
);

const Shortsublesson =
  mongoose.models.Shortsublesson ||
  mongoose.model("Shortsublesson", shortsublessonSchema);

export default Shortsublesson;