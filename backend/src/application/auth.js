import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User, {
  SL_MOBILE_REGEX,
  DISTRICT_ENUMS,
} from "../infastructure/schemas/user.js";
import Grade, { ALLOWED_GRADES } from "../infastructure/schemas/grade.js";
import ClassModel from "../infastructure/schemas/class.js";

import { sendSMS } from "./smsService.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_this";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const OTP_EXPIRES_MINUTES = 5;
const OTP_RESEND_SECONDS = 60;
const OTP_MAX_ATTEMPTS = 5;

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const normalizeText = (value = "") => String(value || "").trim();

const normalizePhone = (value = "") => {
  let phone = String(value || "")
    .trim()
    .replace(/\s+/g, "")
    .replace(/-/g, "");

  if (phone.startsWith("+94")) {
    phone = "0" + phone.slice(3);
  } else if (phone.startsWith("94")) {
    phone = "0" + phone.slice(2);
  } else if (phone.startsWith("7") && phone.length === 9) {
    phone = "0" + phone;
  }

  return phone;
};

const getTokenFromRequest = (req) => {
  const authHeader = String(req.headers?.authorization || "").trim();

  if (authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7).trim();
  }

  return req.cookies?.token || "";
};

const parseBirthday = (value) => {
  if (!value) return null;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  const raw = String(value).trim();

  const dashed = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (dashed) {
    const iso = `${dashed[1]}-${dashed[2]}-${dashed[3]}T00:00:00.000Z`;
    const date = new Date(iso);
    if (!Number.isNaN(date.getTime())) return date;
  }

  const dotted = raw.match(/^(\d{4})\.(\d{2})\.(\d{2})$/);

  if (dotted) {
    const iso = `${dotted[1]}-${dotted[2]}-${dotted[3]}T00:00:00.000Z`;
    const date = new Date(iso);
    if (!Number.isNaN(date.getTime())) return date;
  }

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;

  return date;
};

const readGradeNumber = (gradeValue) => {
  if (!gradeValue) return undefined;

  if (typeof gradeValue === "object" && !Array.isArray(gradeValue)) {
    const raw =
      gradeValue.gradeId ??
      gradeValue.gradeNumber ??
      gradeValue.grade ??
      gradeValue.value ??
      gradeValue.label ??
      gradeValue.name;

    const match = String(raw || "").match(/\d+/);
    const number = match ? Number(match[0]) : Number(raw);

    return Number.isInteger(number) ? number : undefined;
  }

  const match = String(gradeValue || "").match(/\d+/);
  const number = match ? Number(match[0]) : Number(gradeValue);

  return Number.isInteger(number) ? number : undefined;
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

const resolveActiveGradeDoc = async (gradeValue) => {
  const gradeNumber = Number(gradeValue);

  if (!ALLOWED_GRADES.includes(gradeNumber)) {
    return null;
  }

  return Grade.findOne({ gradeId: gradeNumber, isActive: true });
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

  if (user._id) {
    user.id = String(user._id);
  }

  const gradeDetails =
    user.grade && typeof user.grade === "object" && !Array.isArray(user.grade)
      ? user.grade
      : null;

  const gradeNumber = readGradeNumber(user.grade);

  if (gradeDetails) {
    user.gradeDetails = gradeDetails;
  }

  if (gradeNumber !== undefined) {
    user.grade = gradeNumber;
    user.gradeId = gradeNumber;
    user.gradeNumber = gradeNumber;
    user.gradeName = `Grade ${gradeNumber}`;
  }

  return user;
};

const createToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
    }
  );
};

const sendAuthResponse = (res, statusCode, message, userDoc) => {
  const token = createToken(userDoc);
  res.cookie("token", token, cookieOptions);

  return res.status(statusCode).json({
    message,
    token,
    accessToken: token,
    user: sanitizeUser(userDoc),
  });
};

const generateOtp = () => {
  return String(Math.floor(100000 + Math.random() * 900000));
};

const buildOtpMessage = (otp) => {
  return `Your Ganitha Wadda OTP is ${otp}. It will expire in ${OTP_EXPIRES_MINUTES} minutes. Do not share this code.`;
};

const setOtpForUser = async (user) => {
  const otp = generateOtp();

  user.otpCodeHash = await bcrypt.hash(otp, 10);
  user.otpExpiresAt = new Date(Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000);
  user.otpLastSentAt = new Date();
  user.otpAttemptCount = 0;

  return otp;
};

const sendOtpToUser = async (user) => {
  const otp = await setOtpForUser(user);

  await user.save();
  await sendSMS(user.phonenumber, buildOtpMessage(otp));
};

const validateSignupData = async ({
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
}) => {
  const cleanName = normalizeText(name);

  if (!cleanName) return "Name is required";

  if (cleanName.length < 2) {
    return "Name must have at least 2 characters";
  }

  if (cleanName.length > 50) {
    return "Name must be short. Maximum 50 characters allowed";
  }

  const cleanPhone = normalizePhone(phonenumber);

  if (!cleanPhone) return "Mobile number is required";

  if (!SL_MOBILE_REGEX.test(cleanPhone)) {
    return "Please enter a valid Sri Lankan mobile number. Example: 0771234567";
  }

  if (!birthday) return "Birthday is required";

  const birthdayDate = parseBirthday(birthday);

  if (!birthdayDate) return "Please enter a valid birthday";

  if (birthdayDate > new Date()) {
    return "Birthday cannot be a future date";
  }

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

  if (cleanAddress.length < 3) {
    return "Address must have at least 3 characters";
  }

  const cleanGender = normalizeText(gender).toLowerCase();

  if (!cleanGender) return "Gender is required";

  if (!["male", "female"].includes(cleanGender)) {
    return "Gender must be male or female";
  }

  if (!password) return "Password is required";

  if (String(password).length < 6) {
    return "Password must have at least 6 characters";
  }

  if (!confirmPassword) return "Confirm password is required";

  if (String(confirmPassword).length < 6) {
    return "Confirm password must have at least 6 characters";
  }

  if (String(password) !== String(confirmPassword)) {
    return "Password and confirm password do not match";
  }

  return null;
};

export const signup = async (req, res, next) => {
  let createdNewUser = null;

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
      address,
      gender,
    } = req.body || {};

    const validationError = await validateSignupData({
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
    }).select(
      "+password +otpCodeHash +otpExpiresAt +otpLastSentAt +otpAttemptCount"
    );

    if (existingUser && existingUser.isVerified) {
      return res.status(409).json({
        message: "User already exists with this mobile number",
      });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);

    let user = existingUser;

    if (!user) {
      user = await User.create({
        name: normalizeText(name),
        phonenumber: cleanPhone,
        birthday: parseBirthday(birthday),
        grade: gradeDoc._id,
        batchnumber: normalizeText(batchnumber),
        password: hashedPassword,
        district: normalizeText(district),
        address: normalizeText(address),
        gender: normalizeText(gender).toLowerCase(),
        role: "student",
        isVerified: false,
        verifiedAt: null,
      });

      createdNewUser = user;
    } else {
      user.name = normalizeText(name);
      user.birthday = parseBirthday(birthday);
      user.grade = gradeDoc._id;
      user.batchnumber = normalizeText(batchnumber);
      user.password = hashedPassword;
      user.district = normalizeText(district);
      user.address = normalizeText(address);
      user.gender = normalizeText(gender).toLowerCase();
      user.role = "student";
      user.isVerified = false;
      user.verifiedAt = null;
    }

    await sendOtpToUser(user);

    return res.status(201).json({
      message: "Signup successful. OTP sent to your mobile number.",
      requiresOtp: true,
      phonenumber: cleanPhone,
    });
  } catch (err) {
    if (createdNewUser?._id) {
      await User.findByIdAndDelete(createdNewUser._id).catch(() => {});
    }

    if (err?.code === 11000) {
      return res.status(409).json({
        message: "This mobile number already exists",
      });
    }

    next(err);
  }
};

export const verifySignupOtp = async (req, res, next) => {
  try {
    const { phonenumber, code } = req.body || {};

    const cleanPhone = normalizePhone(phonenumber);
    const cleanCode = String(code || "").trim();

    if (!cleanPhone) {
      return res.status(400).json({
        message: "Mobile number is required",
      });
    }

    if (!SL_MOBILE_REGEX.test(cleanPhone)) {
      return res.status(400).json({
        message: "Please enter a valid Sri Lankan mobile number",
      });
    }

    if (!cleanCode || cleanCode.length !== 6) {
      return res.status(400).json({
        message: "Please enter valid 6 digit OTP",
      });
    }

    const user = await User.findOne({
      phonenumber: cleanPhone,
    })
      .select("+password +otpCodeHash +otpExpiresAt +otpAttemptCount")
      .populate("grade");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        message: "Your account is inactive. Please contact admin",
      });
    }

    if (user.isVerified) {
      return sendAuthResponse(
        res,
        200,
        "User already verified. Signed in successfully.",
        user
      );
    }

    if (!user.otpCodeHash || !user.otpExpiresAt) {
      return res.status(400).json({
        message: "OTP not found. Please resend OTP",
      });
    }

    if (new Date(user.otpExpiresAt).getTime() < Date.now()) {
      return res.status(400).json({
        message: "OTP expired. Please resend OTP",
      });
    }

    if (Number(user.otpAttemptCount || 0) >= OTP_MAX_ATTEMPTS) {
      return res.status(429).json({
        message: "Too many wrong attempts. Please resend OTP",
      });
    }

    const isOtpCorrect = await bcrypt.compare(cleanCode, user.otpCodeHash);

    if (!isOtpCorrect) {
      user.otpAttemptCount = Number(user.otpAttemptCount || 0) + 1;
      await user.save();

      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    user.isVerified = true;
    user.verifiedAt = new Date();
    user.otpCodeHash = null;
    user.otpExpiresAt = null;
    user.otpLastSentAt = null;
    user.otpAttemptCount = 0;

    await user.save();

    await user.populate("grade");

    return sendAuthResponse(
      res,
      200,
      "OTP verified successfully. Signed in successfully.",
      user
    );
  } catch (err) {
    next(err);
  }
};

export const resendSignupOtp = async (req, res, next) => {
  try {
    const { phonenumber } = req.body || {};

    const cleanPhone = normalizePhone(phonenumber);

    if (!cleanPhone) {
      return res.status(400).json({
        message: "Mobile number is required",
      });
    }

    if (!SL_MOBILE_REGEX.test(cleanPhone)) {
      return res.status(400).json({
        message: "Please enter a valid Sri Lankan mobile number",
      });
    }

    const user = await User.findOne({
      phonenumber: cleanPhone,
    }).select("+otpCodeHash +otpExpiresAt +otpLastSentAt +otpAttemptCount");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: "User already verified",
      });
    }

    if (user.otpLastSentAt) {
      const lastSent = new Date(user.otpLastSentAt).getTime();
      const waitMs = OTP_RESEND_SECONDS * 1000 - (Date.now() - lastSent);

      if (waitMs > 0) {
        return res.status(429).json({
          message: `Please wait ${Math.ceil(
            waitMs / 1000
          )} seconds before resending OTP`,
        });
      }
    }

    await sendOtpToUser(user);

    return res.status(200).json({
      message: "OTP resent successfully",
      phonenumber: cleanPhone,
    });
  } catch (err) {
    next(err);
  }
};

export const signin = async (req, res, next) => {
  try {
    const { phonenumber, password } = req.body || {};

    if (!phonenumber) {
      return res.status(400).json({
        message: "Mobile number is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        message: "Password is required",
      });
    }

    const cleanPhone = normalizePhone(phonenumber);

    if (!SL_MOBILE_REGEX.test(cleanPhone)) {
      return res.status(400).json({
        message: "Please enter a valid Sri Lankan mobile number",
      });
    }

    const user = await User.findOne({
      phonenumber: cleanPhone,
    })
      .select("+password")
      .populate("grade");

    if (!user) {
      return res.status(401).json({
        message: "Invalid mobile number or password",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        message: "Your account is inactive. Please contact admin",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your mobile number first",
        needsVerification: true,
        phonenumber: cleanPhone,
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      String(password),
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid mobile number or password",
      });
    }

    return sendAuthResponse(res, 200, "Signin successful", user);
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.status(200).json({
      message: "Logout successful",
    });
  } catch (err) {
    next(err);
  }
};

export const currentUser = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({
        message: "Not logged in",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    let user = null;

    try {
      user = await User.findById(decoded.id)
        .select("-password")
        .populate("grade")
        .lean();
    } catch {
      user = await User.findById(decoded.id).select("-password").lean();
    }

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        message: "Your account is inactive",
      });
    }

    return res.status(200).json({
      user: sanitizeUser(user),
    });
  } catch (err) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

export const updateCurrentUserProfile = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({
        message: "Not logged in",
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }

    const existingUser = await User.findById(decoded.id)
      .select("isActive grade batchnumber")
      .populate("grade")
      .lean();

    if (!existingUser) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    if (existingUser.isActive === false) {
      return res.status(403).json({
        message: "Your account is inactive",
      });
    }

    const body = req.body || {};
    const updates = {};

    if (typeof body.name !== "undefined") {
      const cleanName = normalizeText(body.name);
      if (cleanName.length < 2 || cleanName.length > 50) {
        return res.status(400).json({
          message: "Name must be between 2 and 50 characters",
        });
      }
      updates.name = cleanName;
    }

    if (typeof body.birthday !== "undefined") {
      const birthdayDate = parseBirthday(body.birthday);
      if (!birthdayDate) {
        return res.status(400).json({
          message: "Please enter a valid birthday",
        });
      }
      if (birthdayDate > new Date()) {
        return res.status(400).json({
          message: "Birthday cannot be a future date",
        });
      }
      updates.birthday = birthdayDate;
    }

    const incomingGrade =
      typeof body.grade !== "undefined"
        ? Number(body.grade)
        : Number(existingUser?.grade?.gradeId);

    const incomingBatchNumber =
      typeof body.batchnumber !== "undefined"
        ? normalizeText(body.batchnumber)
        : normalizeText(existingUser.batchnumber);

    if (
      typeof body.grade !== "undefined" ||
      typeof body.batchnumber !== "undefined"
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

      const gradeDoc = await resolveActiveGradeDoc(incomingGrade);

      if (!gradeDoc) {
        return res.status(400).json({
          message: "Please select an active grade from the available grades",
        });
      }

      updates.grade = gradeDoc._id;
      updates.batchnumber = incomingBatchNumber;
    }

    if (typeof body.district !== "undefined") {
      const cleanDistrict = normalizeText(body.district);
      if (!DISTRICT_ENUMS.includes(cleanDistrict)) {
        return res.status(400).json({
          message: "Please select a valid Sri Lankan district",
        });
      }
      updates.district = cleanDistrict;
    }

    if (typeof body.town !== "undefined") {
      updates.town = body.town ? normalizeText(body.town) : null;
    }

    if (typeof body.address !== "undefined") {
      const cleanAddress = normalizeText(body.address);
      if (cleanAddress.length < 3) {
        return res.status(400).json({
          message: "Address must have at least 3 characters",
        });
      }
      updates.address = cleanAddress;
    }

    if (typeof body.gender !== "undefined") {
      const cleanGender = normalizeText(body.gender).toLowerCase();
      if (!["male", "female"].includes(cleanGender)) {
        return res.status(400).json({
          message: "Gender must be male or female",
        });
      }
      updates.gender = cleanGender;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "Nothing to update",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(decoded.id, updates, {
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

    return res.status(200).json({
      message: "Profile updated successfully",
      user: sanitizeUser(updatedUser),
    });
  } catch (err) {
    next(err);
  }
};

export const forgotPasswordSendOtp = async (req, res, next) => {
  try {
    const { phonenumber } = req.body || {};
    const cleanPhone = normalizePhone(phonenumber);

    if (!cleanPhone) {
      return res.status(400).json({
        message: "Mobile number is required",
      });
    }

    if (!SL_MOBILE_REGEX.test(cleanPhone)) {
      return res.status(400).json({
        message: "Please enter a valid Sri Lankan mobile number",
      });
    }

    const user = await User.findOne({ phonenumber: cleanPhone }).select(
      "+otpCodeHash +otpExpiresAt +otpLastSentAt +otpAttemptCount"
    );

    if (!user) {
      return res.status(404).json({
        message: "No account found with this mobile number",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Account not verified. Please verify first.",
      });
    }

    if (user.otpLastSentAt) {
      const waitMs =
        OTP_RESEND_SECONDS * 1000 -
        (Date.now() - new Date(user.otpLastSentAt).getTime());

      if (waitMs > 0) {
        return res.status(429).json({
          message: `Please wait ${Math.ceil(
            waitMs / 1000
          )} seconds before resending OTP`,
        });
      }
    }

    await sendOtpToUser(user);

    return res.status(200).json({
      message: "OTP sent to your mobile number",
      phonenumber: cleanPhone,
    });
  } catch (err) {
    next(err);
  }
};

export const forgotPasswordVerifyOtp = async (req, res, next) => {
  try {
    const { phonenumber, code } = req.body || {};
    const cleanPhone = normalizePhone(phonenumber);
    const cleanCode = String(code || "").trim();

    if (!cleanPhone) {
      return res.status(400).json({
        message: "Mobile number is required",
      });
    }

    if (!cleanCode || cleanCode.length !== 6) {
      return res.status(400).json({
        message: "Please enter a valid 6-digit OTP",
      });
    }

    const user = await User.findOne({ phonenumber: cleanPhone }).select(
      "+otpCodeHash +otpExpiresAt +otpAttemptCount"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!user.otpCodeHash || !user.otpExpiresAt) {
      return res.status(400).json({
        message: "OTP not found. Please request a new OTP",
      });
    }

    if (new Date(user.otpExpiresAt).getTime() < Date.now()) {
      return res.status(400).json({
        message: "OTP expired. Please request a new OTP",
      });
    }

    if (Number(user.otpAttemptCount || 0) >= OTP_MAX_ATTEMPTS) {
      return res.status(429).json({
        message: "Too many wrong attempts. Please request a new OTP",
      });
    }

    const isOtpCorrect = await bcrypt.compare(cleanCode, user.otpCodeHash);

    if (!isOtpCorrect) {
      user.otpAttemptCount = Number(user.otpAttemptCount || 0) + 1;
      await user.save();

      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    user.otpCodeHash = null;
    user.otpExpiresAt = null;
    user.otpLastSentAt = null;
    user.otpAttemptCount = 0;

    await user.save();

    return res.status(200).json({
      message: "OTP verified. You can now reset your password.",
    });
  } catch (err) {
    next(err);
  }
};

export const forgotPasswordReset = async (req, res, next) => {
  try {
    const { phonenumber, password, confirmPassword } = req.body || {};
    const cleanPhone = normalizePhone(phonenumber);

    if (!cleanPhone) {
      return res.status(400).json({
        message: "Mobile number is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        message: "Password is required",
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        message: "Password must have at least 6 characters",
      });
    }

    if (!confirmPassword) {
      return res.status(400).json({
        message: "Confirm password is required",
      });
    }

    if (String(password) !== String(confirmPassword)) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    const user = await User.findOne({ phonenumber: cleanPhone }).select(
      "+password"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.password = await bcrypt.hash(String(password), 10);
    await user.save();

    return res.status(200).json({
      message: "Password reset successfully. Please sign in.",
    });
  } catch (err) {
    next(err);
  }
};

export const forgotPasswordResendOtp = async (req, res, next) => {
  try {
    const { phonenumber } = req.body || {};
    const cleanPhone = normalizePhone(phonenumber);

    if (!cleanPhone) {
      return res.status(400).json({
        message: "Mobile number is required",
      });
    }

    if (!SL_MOBILE_REGEX.test(cleanPhone)) {
      return res.status(400).json({
        message: "Please enter a valid Sri Lankan mobile number",
      });
    }

    const user = await User.findOne({ phonenumber: cleanPhone }).select(
      "+otpCodeHash +otpExpiresAt +otpLastSentAt +otpAttemptCount"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.otpLastSentAt) {
      const waitMs =
        OTP_RESEND_SECONDS * 1000 -
        (Date.now() - new Date(user.otpLastSentAt).getTime());

      if (waitMs > 0) {
        return res.status(429).json({
          message: `Please wait ${Math.ceil(
            waitMs / 1000
          )} seconds before resending OTP`,
        });
      }
    }

    await sendOtpToUser(user);

    return res.status(200).json({
      message: "OTP resent successfully",
      phonenumber: cleanPhone,
    });
  } catch (err) {
    next(err);
  }
};