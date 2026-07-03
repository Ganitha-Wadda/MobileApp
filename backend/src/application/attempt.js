import mongoose from "mongoose";

import Attempt from "../infastructure/schemas/attempt.js";
import LiveClass from "../infastructure/schemas/live.js";

const normalizeText = (value = "") => String(value ?? "").trim();

const getAuthUserId = (req) =>
  req?.user?._id ??
  req?.user?.id ??
  req?.user?.userId ??
  req?.userId ??
  req?.auth?._id ??
  req?.auth?.id ??
  req?.auth?.userId ??
  null;

const toObjectId = (value) => {
  const stringValue = String(value ?? "").trim();

  if (!mongoose.Types.ObjectId.isValid(stringValue)) {
    return null;
  }

  return new mongoose.Types.ObjectId(stringValue);
};

const getClassBatchNumber = (classDoc) =>
  classDoc?.batchnumber ??
  classDoc?.batchNumber ??
  classDoc?.batchNo ??
  classDoc?.batch ??
  classDoc?.batch_number ??
  "";

const getSelectedZoomLink = ({ liveClass, linkIndex, zoomLink }) => {
  const links = Array.isArray(liveClass?.links) ? liveClass.links : [];
  const cleanZoomLink = normalizeText(zoomLink);
  const indexNumber = Number(linkIndex);

  if (
    Number.isInteger(indexNumber) &&
    indexNumber >= 0 &&
    indexNumber < links.length
  ) {
    return {
      selectedLink: normalizeText(links[indexNumber]),
      selectedIndex: indexNumber,
    };
  }

  if (cleanZoomLink) {
    const foundIndex = links.findIndex((link) => normalizeText(link) === cleanZoomLink);

    if (foundIndex >= 0) {
      return {
        selectedLink: normalizeText(links[foundIndex]),
        selectedIndex: foundIndex,
      };
    }

    return {
      selectedLink: cleanZoomLink,
      selectedIndex: 0,
    };
  }

  return {
    selectedLink: normalizeText(links[0]),
    selectedIndex: 0,
  };
};

const populateAttemptQuery = (query) =>
  query
    .populate("liveClassId", "title date links classId")
    .populate("classId", "grade teacherName batchnumber batchNumber batchNo batch batch_number");

export const createLiveClassAttempt = async (req, res, next) => {
  try {
    const authUserId = getAuthUserId(req);
    const userObjectId = toObjectId(authUserId);

    if (!userObjectId) {
      return res.status(401).json({
        message: "Unauthorized. Please login again.",
      });
    }

    const { liveClassId, linkIndex = 0, zoomLink = "" } = req.body ?? {};
    const liveClassObjectId = toObjectId(liveClassId);

    if (!liveClassObjectId) {
      return res.status(400).json({
        message: "Valid live class ID is required.",
      });
    }

    const liveClass = await LiveClass.findById(liveClassObjectId)
      .populate("classId", "grade teacherName batchnumber batchNumber batchNo batch batch_number")
      .lean();

    if (!liveClass) {
      return res.status(404).json({
        message: "Live class not found.",
      });
    }

    const classDoc = liveClass.classId || {};
    const now = new Date();

    const { selectedLink, selectedIndex } = getSelectedZoomLink({
      liveClass,
      linkIndex,
      zoomLink,
    });

    let attempt;

    try {
      attempt = await Attempt.findOneAndUpdate(
        {
          userId: userObjectId,
          liveClassId: liveClassObjectId,
        },
        {
          $setOnInsert: {
            userId: userObjectId,
            liveClassId: liveClassObjectId,
            firstAttemptedAt: now,
          },
          $set: {
            classId: classDoc?._id ?? null,
            title: normalizeText(liveClass.title) || "Live Class",
            teacherName: normalizeText(classDoc?.teacherName) || "Teacher",
            grade: Number(classDoc?.grade) || null,
            batchnumber: normalizeText(getClassBatchNumber(classDoc)),
            liveClassDate: liveClass.date ?? null,
            zoomLink: selectedLink,
            linkIndex: selectedIndex,
            attemptedAt: now,
            lastOpenedAt: now,
          },
          $inc: {
            clickCount: 1,
          },
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );

      attempt = await populateAttemptQuery(Attempt.findById(attempt._id)).lean();
    } catch (err) {
      if (err?.code !== 11000) throw err;

      attempt = await Attempt.findOneAndUpdate(
        {
          userId: userObjectId,
          liveClassId: liveClassObjectId,
        },
        {
          $set: {
            classId: classDoc?._id ?? null,
            title: normalizeText(liveClass.title) || "Live Class",
            teacherName: normalizeText(classDoc?.teacherName) || "Teacher",
            grade: Number(classDoc?.grade) || null,
            batchnumber: normalizeText(getClassBatchNumber(classDoc)),
            liveClassDate: liveClass.date ?? null,
            zoomLink: selectedLink,
            linkIndex: selectedIndex,
            attemptedAt: now,
            lastOpenedAt: now,
          },
          $inc: {
            clickCount: 1,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

      attempt = await populateAttemptQuery(Attempt.findById(attempt._id)).lean();
    }

    return res.status(200).json({
      message: "Live class attempt saved successfully.",
      attempt,
    });
  } catch (err) {
    next(err);
  }
};

export const getMyLiveClassAttempts = async (req, res, next) => {
  try {
    const authUserId = getAuthUserId(req);
    const userObjectId = toObjectId(authUserId);

    if (!userObjectId) {
      return res.status(401).json({
        message: "Unauthorized. Please login again.",
      });
    }

    const attempts = await populateAttemptQuery(
      Attempt.find({ userId: userObjectId })
        .sort({ attemptedAt: -1, createdAt: -1 })
    ).lean();

    return res.status(200).json({
      count: attempts.length,
      attempts,
    });
  } catch (err) {
    next(err);
  }
};