import jwt from "jsonwebtoken";
import User from "../../infastructure/schemas/user.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_this";

export const authenticate = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token ||
      req.headers?.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized. Please login first",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    let user = null;

    try {
      user = await User.findById(decoded.id)
        .select("-password")
        .populate("grade")
        .lean();
    } catch (err) {
      // Fallback for schemas that store grade as a plain number/string.
      user = await User.findById(decoded.id).select("-password").lean();
    }

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized. User not found",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        message: "Your account is inactive",
      });
    }

    req.user = {
      ...user,
      id: user._id.toString(),
      role: user.role,
    };

    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};