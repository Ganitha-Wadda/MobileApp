import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import User, {
  SL_MOBILE_REGEX,
  DISTRICT_ENUMS,
} from "../infastructure/schemas/user.js";
import Grade, { ALLOWED_GRADES } from "../infastructure/schemas/grade.js";
import ClassModel from "../infastructure/schemas/class.js";
import Attempt from "../infastructure/schemas/attempt.js";

/* ─── Helpers ─── */

const normalizeText = (value = "") => String(value || "").trim();

const normalizePhone = (value = "") => {
  let phone = String(value || "")
    .trim()
    .replace(/\s+/g, "")
    .replace(/-/g, "");

  if (phone.startsWith("+94")) phone = "0" + phone.slice(3);
  else if (phone.startsWith("94")) phone = "0" + phone.slice(2);
  else if (phone.startsWith("7") && phone.length === 9) phone = "0" + phone;

  return phone;
};

const parseBirthday = (value) => {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;

  const raw = String(value).trim();

  const dashed = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dashed) {
    const date = new Date(`${dashed[1]}-${dashed[2]}-${dashed[3]}T00:00:00.000Z`);
    if (!Number.isNaN(date.getTime())) return date;
  }

  const dotted = raw.match(/^(\d{4})\.(\d{2})\.(\d{2})$/);
  if (dotted) {
    const date = new Date(`${dotted[1]}-${dotted[2]}-${dotted[3]}T00:00:00.000Z`);
    if (!Number.isNaN(date.getTime())) return date;
  }

  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
};

const resolveGradeDoc = async (gradeValue) => {
  const gradeNumber = Number(gradeValue);

  if (!ALLOWED_GRADES.includes(gradeNumber)) {
    return null;
  }

  let gradeDoc = await Grade.findOne({ gradeId: gradeNumber });

  if (!gradeDoc) {
    gradeDoc = await Grade.create({ gradeId: gradeNumber, isActive: true });
  }

  return gradeDoc;
};

const getGradeNumberFromUser = (user) => {
  if (!user) return null;

  if (typeof user.grade === "number") return user.grade;

  if (user.grade?.gradeId !== undefined && user.grade?.gradeId !== null) {
    return Number(user.grade.gradeId);
  }

  return null;
};

const checkClassBatchAvailable = async ({ grade, batchnumber }) => {
  const gradeNumber = Number(grade);
  const cleanBatchNumber = normalizeText(batchnumber);

  if (!Number.isInteger(gradeNumber) || !cleanBatchNumber) {
    return null;
  }

  return ClassModel.findOne({
    grade: gradeNumber,
    batchnumber: cleanBatchNumber,
  }).lean();
};

const sanitizeUser = (userDoc) => {
  if (!userDoc) return null;

  const user = userDoc.toObject ? userDoc.toObject() : { ...userDoc };

  delete user.password;
  delete user.otpCodeHash;
  delete user.otpExpiresAt;
  delete user.otpLastSentAt;
  delete user.otpAttemptCount;

  return user;
};

/* ─── FIX: attach student wise total live attendance count ─── */
/*
  Attendance count = total live classes attended by the student.
  attemptSchema has unique index { userId, liveClassId }, so each live class
  counts once per student. Re-clicking Zoom only increases clickCount and does
  not increase attendance sessions.
*/
const attachLiveAttendanceCounts = async (users = []) => {
  if (!Array.isArray(users) || users.length === 0) {
    return users;
  }

  const userObjectIds = users
    .map((user) => {
      const id = String(user?._id || "").trim();

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
      }

      return new mongoose.Types.ObjectId(id);
    })
    .filter(Boolean);

  if (userObjectIds.length === 0) {
    return users.map((user) => ({
      ...user,
      liveAttendanceCount: 0,
      attendanceCount: 0,
      totalLiveAttendanceCount: 0,
    }));
  }

  const attendanceCounts = await Attempt.aggregate([
    {
      $match: {
        userId: { $in: userObjectIds },
      },
    },
    {
      $group: {
        _id: "$userId",
        liveAttendanceCount: { $sum: 1 },
      },
    },
  ]);

  const countMap = new Map(
    attendanceCounts.map((item) => [
      String(item._id),
      Number(item.liveAttendanceCount || 0),
    ])
  );

  return users.map((user) => {
    const count = countMap.get(String(user._id)) || 0;

    return {
      ...user,
      liveAttendanceCount: count,
      attendanceCount: count,
      totalLiveAttendanceCount: count,
    };
  });
};

/* ─── Validation ─── */

const validateUserCreateData = async ({
  name,
  phonenumber,
  birthday,
  grade,
  batchnumber,
  password,
  confirmPassword,
  district,
  address,
  gender,
  role,
}) => {
  const cleanName = normalizeText(name);

  if (!cleanName) return "Name is required";
  if (cleanName.length < 2) return "Name must have at least 2 characters";
  if (cleanName.length > 50) return "Name must be short. Maximum 50 characters allowed";

  const cleanPhone = normalizePhone(phonenumber);

  if (!cleanPhone) return "Mobile number is required";
  if (!SL_MOBILE_REGEX.test(cleanPhone)) {
    return "Please enter a valid Sri Lankan mobile number. Example: 0771234567";
  }

  if (!birthday) return "Birthday is required";

  const birthdayDate = parseBirthday(birthday);

  if (!birthdayDate) return "Please enter a valid birthday";
  if (birthdayDate > new Date()) return "Birthday cannot be a future date";

  const gradeNumber = Number(grade);

  if (!Number.isInteger(gradeNumber)) {
    return "Please select a valid grade";
  }

  const cleanBatchNumber = normalizeText(batchnumber);

  if (!cleanBatchNumber) {
    return "Please select a valid batch number";
  }

  const classExists = await checkClassBatchAvailable({
    grade: gradeNumber,
    batchnumber: cleanBatchNumber,
  });

  if (!classExists) {
    return "Selected grade and batch number are not available";
  }

  const cleanDistrict = normalizeText(district);

  if (!cleanDistrict) return "District is required";
  if (!DISTRICT_ENUMS.includes(cleanDistrict)) {
    return "Please select a valid Sri Lankan district";
  }

  const cleanAddress = normalizeText(address);

  if (!cleanAddress) return "Address is required";
  if (cleanAddress.length < 3) return "Address must have at least 3 characters";

  const cleanGender = normalizeText(gender).toLowerCase();

  if (!cleanGender) return "Gender is required";
  if (!["male", "female"].includes(cleanGender)) return "Gender must be male or female";

  const cleanRole = normalizeText(role || "student").toLowerCase();

  if (!["admin", "student"].includes(cleanRole)) return "Role must be only admin or student";

  if (!password) return "Password is required";
  if (String(password).length < 6) return "Password must have at least 6 characters";

  if (!confirmPassword) return "Confirm password is required";
  if (String(confirmPassword).length < 6) {
    return "Confirm password must have at least 6 characters";
  }

  if (String(password) !== String(confirmPassword)) {
    return "Password and confirm password do not match";
  }

  return null;
};

/* ─── Controllers ─── */

export const createUser = async (req, res, next) => {
  try {
    const {
      name,
      phonenumber,
      birthday,
      grade,
      batchnumber,
      password,
      confirmPassword,
      district,
      town,
      address,
      gender,
      role = "student",
    } = req.body || {};

    const validationError = await validateUserCreateData({
      name,
      phonenumber,
      birthday,
      grade,
      batchnumber,
      password,
      confirmPassword,
      district,
      address,
      gender,
      role,
    });

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    const gradeDoc = await resolveGradeDoc(grade);

    if (!gradeDoc) {
      return res.status(400).json({
        message: "Selected grade is not available",
      });
    }

    const cleanPhone = normalizePhone(phonenumber);

    const existingUser = await User.findOne({
      phonenumber: cleanPhone,
    }).lean();

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists with this mobile number",
      });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);

    const createdUser = await User.create({
      name: normalizeText(name),
      phonenumber: cleanPhone,
      birthday: parseBirthday(birthday),
      grade: gradeDoc._id,
      batchnumber: normalizeText(batchnumber),
      password: hashedPassword,
      district: normalizeText(district),
      town: town ? normalizeText(town) : null,
      address: normalizeText(address),
      gender: normalizeText(gender).toLowerCase(),
      role: normalizeText(role || "student").toLowerCase(),
    });

    return res.status(201).json({
      message: "User created successfully",
      user: sanitizeUser(createdUser),
    });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({
        message: "This mobile number already exists",
      });
    }

    next(err);
  }
};

/**
 * GET /api/user
 * Returns all users.
 * Supports query filters:
 * phonenumber, district, grade, batchnumber
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const { phonenumber, district, grade, batchnumber } = req.query;

    const filter = {};

    if (phonenumber && String(phonenumber).trim()) {
      filter.phonenumber = {
        $regex: String(phonenumber).trim().replace(/-/g, ""),
        $options: "i",
      };
    }

    if (district && String(district).trim() && district !== "All") {
      filter.district = String(district).trim();
    }

    if (batchnumber && String(batchnumber).trim() && batchnumber !== "All") {
      filter.batchnumber = String(batchnumber).trim();
    }

    if (grade && String(grade).trim() && grade !== "All") {
      const gradeNum = Number(grade);

      if (!Number.isNaN(gradeNum)) {
        const gradeDoc = await Grade.findOne({ gradeId: gradeNum }).lean();

        filter.grade = gradeDoc ? gradeDoc._id : null;
      }
    }

    let users = await User.find(filter)
      .select("-password")
      .populate("grade")
      .sort({ createdAt: -1 })
      .lean();

    users = await attachLiveAttendanceCounts(users);

    return res.status(200).json({
      count: users.length,
      users,
    });
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid user id",
      });
    }

    const user = await User.findById(id)
      .select("-password")
      .populate("grade")
      .lean();

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const [userWithAttendance] = await attachLiveAttendanceCounts([user]);

    return res.status(200).json({
      user: userWithAttendance,
    });
  } catch (err) {
    next(err);
  }
};

export const updateUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid user id",
      });
    }

    const existingUser = await User.findById(id)
      .select("grade batchnumber")
      .populate("grade")
      .lean();

    if (!existingUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const updates = { ...(req.body || {}) };

    delete updates.confirmPassword;
    delete updates.batchYear;

    if (typeof updates.name !== "undefined") {
      updates.name = normalizeText(updates.name);

      if (updates.name.length < 2 || updates.name.length > 50) {
        return res.status(400).json({
          message: "Name must be between 2 and 50 characters",
        });
      }
    }

    if (typeof updates.phonenumber !== "undefined") {
      updates.phonenumber = normalizePhone(updates.phonenumber);

      if (!SL_MOBILE_REGEX.test(updates.phonenumber)) {
        return res.status(400).json({
          message: "Please enter a valid Sri Lankan mobile number. Example: 0771234567",
        });
      }
    }

    if (typeof updates.birthday !== "undefined") {
      updates.birthday = parseBirthday(updates.birthday);

      if (!updates.birthday) {
        return res.status(400).json({
          message: "Please enter a valid birthday",
        });
      }

      if (updates.birthday > new Date()) {
        return res.status(400).json({
          message: "Birthday cannot be a future date",
        });
      }
    }

    const incomingGrade =
      typeof updates.grade !== "undefined"
        ? Number(updates.grade)
        : getGradeNumberFromUser(existingUser);

    const incomingBatchNumber =
      typeof updates.batchnumber !== "undefined"
        ? normalizeText(updates.batchnumber)
        : normalizeText(existingUser.batchnumber);

    if (
      typeof updates.grade !== "undefined" ||
      typeof updates.batchnumber !== "undefined"
    ) {
      if (!incomingGrade || !incomingBatchNumber) {
        return res.status(400).json({
          message: "Please select grade and batch number",
        });
      }

      const classExists = await checkClassBatchAvailable({
        grade: incomingGrade,
        batchnumber: incomingBatchNumber,
      });

      if (!classExists) {
        return res.status(400).json({
          message: "Selected grade and batch number are not available",
        });
      }

      const gradeDoc = await resolveGradeDoc(incomingGrade);

      if (!gradeDoc) {
        return res.status(400).json({
          message: "Selected grade is not available",
        });
      }

      updates.grade = gradeDoc._id;
      updates.batchnumber = incomingBatchNumber;
    }

    if (typeof updates.district !== "undefined") {
      updates.district = normalizeText(updates.district);

      if (!DISTRICT_ENUMS.includes(updates.district)) {
        return res.status(400).json({
          message: "Please select a valid Sri Lankan district",
        });
      }
    }

    if (typeof updates.town !== "undefined") {
      updates.town = updates.town ? normalizeText(updates.town) : null;
    }

    if (typeof updates.address !== "undefined") {
      updates.address = normalizeText(updates.address);

      if (updates.address.length < 3) {
        return res.status(400).json({
          message: "Address must have at least 3 characters",
        });
      }
    }

    if (typeof updates.gender !== "undefined") {
      updates.gender = normalizeText(updates.gender).toLowerCase();

      if (!["male", "female"].includes(updates.gender)) {
        return res.status(400).json({
          message: "Gender must be male or female",
        });
      }
    }

    if (typeof updates.role !== "undefined") {
      updates.role = normalizeText(updates.role).toLowerCase();

      if (!["admin", "student"].includes(updates.role)) {
        return res.status(400).json({
          message: "Role must be only admin or student",
        });
      }
    }

    if (typeof req.body?.password !== "undefined" && req.body.password) {
      if (String(req.body.password).length < 6) {
        return res.status(400).json({
          message: "Password must have at least 6 characters",
        });
      }

      if (!req.body.confirmPassword) {
        return res.status(400).json({
          message: "Confirm password is required",
        });
      }

      if (String(req.body.password) !== String(req.body.confirmPassword)) {
        return res.status(400).json({
          message: "Password and confirm password do not match",
        });
      }

      updates.password = await bcrypt.hash(String(req.body.password), 10);
    } else {
      delete updates.password;
    }

    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
      context: "query",
      select: "-password",
    })
      .populate("grade")
      .lean();

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const [updatedUserWithAttendance] = await attachLiveAttendanceCounts([updatedUser]);

    return res.status(200).json({
      message: "User updated successfully",
      user: updatedUserWithAttendance,
    });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({
        message: "This mobile number already exists",
      });
    }

    next(err);
  }
};

export const deleteUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid user id",
      });
    }

    const deletedUser = await User.findByIdAndDelete(id).lean();

    if (!deletedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/user/:id/toggle-active
 * Toggles the isActive flag for a student.
 */
export const toggleUserActive = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid user id",
      });
    }

    const user = await User.findById(id).select("isActive").lean();

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { isActive: !user.isActive },
      { new: true, select: "-password" }
    )
      .populate("grade")
      .lean();

    const [updatedUserWithAttendance] = await attachLiveAttendanceCounts([updatedUser]);

    return res.status(200).json({
      message: updatedUserWithAttendance.isActive
        ? "User activated successfully"
        : "User banned successfully",
      user: updatedUserWithAttendance,
    });
  } catch (err) {
    next(err);
  }
};