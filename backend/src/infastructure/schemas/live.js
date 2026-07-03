import mongoose from "mongoose";

const { Schema } = mongoose;

const liveClassSchema = new Schema(
  {
    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: [true, "Class ID is required"],
    },

    title: {
      type: String,
      required: [true, "Live class title is required"],
      trim: true,
      minlength: [2, "Title must have at least 2 characters"],
      maxlength: [150, "Title is too long"],
    },

    date: {
      type: Date,
      required: [true, "Live class date is required"],
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
  },
  { timestamps: true }
);

const LiveClass =
  mongoose.models.LiveClass || mongoose.model("LiveClass", liveClassSchema);

export default LiveClass;
