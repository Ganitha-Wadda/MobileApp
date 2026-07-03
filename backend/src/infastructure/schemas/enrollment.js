import mongoose from "mongoose";

const { Schema } = mongoose;

export const ENROLLMENT_STATUSES = ["pending", "approved", "rejected"];
export const ALLOWED_ENROLLMENT_GRADES = [3, 4, 5];

const enrollmentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },

    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name is too long"],
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      minlength: [6, "Phone number too short"],
      maxlength: [20, "Phone number is too long"],
    },

    grade: {
      type: Number,
      required: [true, "Grade is required"],
      enum: {
        values: ALLOWED_ENROLLMENT_GRADES,
        message: "Grade must be only 3, 4, or 5",
      },
      index: true,
    },

    batchnumber: {
      type: String,
      required: [true, "Batch number is required"],
      trim: true,
      minlength: [1, "Batch number must not be empty"],
      maxlength: [50, "Batch number is too long"],
      index: true,
    },

    status: {
      type: String,
      enum: {
        values: ENROLLMENT_STATUSES,
        message: "Status must be pending, approved, or rejected",
      },
      default: "pending",
      index: true,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    rejectedAt: {
      type: Date,
      default: null,
    },

    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    rejectedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

// One enrollment per user. Admin can approve/reject the same request.
enrollmentSchema.index({ userId: 1 }, { unique: true });
enrollmentSchema.index({ grade: 1, batchnumber: 1, status: 1 });

const Enrollment =
  mongoose.models.Enrollment || mongoose.model("Enrollment", enrollmentSchema);

export default Enrollment;
