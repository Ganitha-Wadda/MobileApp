import mongoose from "mongoose";

const { Schema } = mongoose;

const shortlessonSchema = new Schema(
  {
    gradeId: {
      type: Schema.Types.ObjectId,
      ref: "Grade",
      required: [true, "Grade is required"],
    },

    title: {
      type: String,
      required: [true, "Short lesson title is required"],
      trim: true,
      minlength: [2, "Title must have at least 2 characters"],
      maxlength: [200, "Title is too long"],
    },
  },
  { timestamps: true }
);

shortlessonSchema.index({ gradeId: 1 });
shortlessonSchema.index({ gradeId: 1, title: 1 });

const Shortlesson =
  mongoose.models.Shortlesson ||
  mongoose.model("Shortlesson", shortlessonSchema);

export default Shortlesson;