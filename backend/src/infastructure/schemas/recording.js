import mongoose from "mongoose";

const { Schema } = mongoose;

const recordingSchema = new Schema(
  {
    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: [true, "Class ID is required"],
    },

    title: {
      type: String,
      required: [true, "Recording title is required"],
      trim: true,
      minlength: [2, "Title must have at least 2 characters"],
      maxlength: [150, "Title is too long"],
    },

    date: {
      type: Date,
      required: [true, "Recording date is required"],
    },

    youtubeUrl: {
      type: String,
      required: [true, "YouTube URL is required"],
      trim: true,
    },
  },
  { timestamps: true }
);

const Recording =
  mongoose.models.Recording || mongoose.model("Recording", recordingSchema);

export default Recording;