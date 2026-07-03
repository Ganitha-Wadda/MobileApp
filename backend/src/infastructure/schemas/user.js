import mongoose from "mongoose";

const { Schema } = mongoose;

export const SL_MOBILE_REGEX = /^07[0-9]{8}$/;

export const DISTRICT_ENUMS = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle",
  "Gampaha", "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle",
  "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Matara", "Monaragala",
  "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura",
  "Trincomalee", "Vavuniya",
];

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must have at least 2 characters"],
      maxlength: [50, "Name must be short. Maximum 50 characters allowed"],
    },

    phonenumber: {
      type: String,
      required: [true, "Mobile number is required"],
      unique: true,
      trim: true,
      index: true,
      match: [
        SL_MOBILE_REGEX,
        "Please enter a valid Sri Lankan mobile number. Example: 0771234567",
      ],
    },

    birthday: {
      type: Date,
      required: [true, "Birthday is required"],
    },

    grade: {
      type: Schema.Types.ObjectId,
      ref: "Grade",
      required: [true, "Grade is required"],
    },

    batchnumber: {
      type: String,
      required: [true, "Batch number is required"],
      trim: true,
      minlength: [1, "Batch number must not be empty"],
      maxlength: [50, "Batch number is too long"],
      index: true,
    },

    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: {
        values: ["male", "female"],
        message: "Gender must be male or female",
      },
    },

    district: {
      type: String,
      required: [true, "District is required"],
      enum: {
        values: DISTRICT_ENUMS,
        message: "Please select a valid Sri Lankan district",
      },
    },

    town: {
      type: String,
      trim: true,
      maxlength: [100, "Town name is too long"],
      default: null,
    },

    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      minlength: [3, "Address must have at least 3 characters"],
      maxlength: [250, "Address is too long"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },

    role: {
      type: String,
      enum: ["admin", "student"],
      default: "student",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    otpCodeHash: {
      type: String,
      select: false,
      default: null,
    },

    otpExpiresAt: {
      type: Date,
      select: false,
      default: null,
    },

    otpLastSentAt: {
      type: Date,
      select: false,
      default: null,
    },

    otpAttemptCount: {
      type: Number,
      select: false,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

userSchema.index({ grade: 1, batchnumber: 1 });

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;