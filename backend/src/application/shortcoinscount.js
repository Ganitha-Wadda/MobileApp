import mongoose from "mongoose";

import ShortCoinsCount from "../infastructure/schemas/shortcoinscount.js";
import Shortlesson from "../infastructure/schemas/shortzlesson.js";
import Shortsublesson from "../infastructure/schemas/shortzsublesson.js";
import Activity from "../infastructure/schemas/activity.js";
import Enrollment from "../infastructure/schemas/enrollment.js";
import Grade from "../infastructure/schemas/grade.js";

const COINS_PER_CORRECT_ACTIVITY = 5;

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(String(id || ""));
const toObjectId = (id) => new mongoose.Types.ObjectId(String(id));
const normalizeText = (value = "") => String(value ?? "").trim();
const sortByCreatedAtAsc = { createdAt: 1, _id: 1 };

const getAuthUserId = (req) =>
  req?.user?._id ??
  req?.user?.id ??
  req?.user?.userId ??
  req?.userId ??
  req?.auth?._id ??
  req?.auth?.id ??
  req?.auth?.userId ??
  null;

const normalizeGradeNumber = (value) => {
  if (typeof value === "object" && value !== null) {
    value = value.gradeId ?? value.grade ?? value.gradeNumber;
  }

  const clean = normalizeText(value);
  const match = clean.match(/\d+/);
  const gradeNumber = Number(match?.[0] ?? clean);

  return Number.isFinite(gradeNumber) ? gradeNumber : null;
};

const getUserApprovedEnrollment = async (req) => {
  const userId = getAuthUserId(req);

  if (!userId || !isValidObjectId(userId)) {
    return { errorStatus: 401, errorMessage: "Unauthorized. Please login again." };
  }

  const enrollment = await Enrollment.findOne({ userId }).lean();

  if (!enrollment || normalizeText(enrollment.status).toLowerCase() !== "approved") {
    return {
      errorStatus: 403,
      errorMessage: "Enrollment approval is required to access Shortz lessons.",
    };
  }

  return { userId: String(userId), enrollment };
};

const findGradeDocForEnrollment = async (enrollment = {}) => {
  const gradeNumber = normalizeGradeNumber(enrollment.grade);

  if (!gradeNumber) return null;

  return Grade.findOne({
    $or: [
      { gradeId: gradeNumber },
      { gradeId: String(gradeNumber) },
      { grade: gradeNumber },
      { grade: String(gradeNumber) },
      { gradeNumber },
      { gradeNumber: String(gradeNumber) },
    ],
  }).lean();
};

const getTotalShortCoinsForUser = async (userId) => {
  const result = await ShortCoinsCount.aggregate([
    { $match: { userId: toObjectId(userId) } },
    { $group: { _id: null, totalShortCoins: { $sum: "$totalShortCoins" } } },
  ]);

  return Number(result?.[0]?.totalShortCoins || 0);
};

const normalizeAttemptIds = (progressDoc = {}) =>
  Array.isArray(progressDoc.activityAttempts)
    ? progressDoc.activityAttempts.map((attempt) => String(attempt.activityId))
    : [];

const buildVideoKey = ({ shortSubLessonId, videoIndex, videoId }) => {
  const cleanVideoId = normalizeText(videoId);
  const safeIndex = Math.max(0, Number(videoIndex || 0));
  return cleanVideoId || `${shortSubLessonId || "sub"}-video-${safeIndex}`;
};

const getLinks = (subLesson = {}) =>
  Array.isArray(subLesson?.links)
    ? subLesson.links.map((link) => normalizeText(link)).filter(Boolean)
    : [];

const getWatchedVideoIndexes = (progressDoc = {}, totalVideos = 0) => {
  const indexes = new Set();

  if (Array.isArray(progressDoc?.watchedVideos)) {
    progressDoc.watchedVideos.forEach((item) => {
      const index = Number(item?.videoIndex);
      if (Number.isInteger(index) && index >= 0) indexes.add(index);
    });
  }

  if (Array.isArray(progressDoc?.watchedVideoKeys)) {
    progressDoc.watchedVideoKeys.forEach((key) => {
      const match = String(key || "").match(/-video-(\d+)$/);
      const index = Number(match?.[1]);
      if (Number.isInteger(index) && index >= 0) indexes.add(index);
    });
  }

  return Array.from(indexes)
    .filter((index) => totalVideos <= 0 || index < totalVideos)
    .sort((a, b) => a - b);
};

const selectedIndexesFromBody = (body = {}) => {
  const raw =
    body.selectedAnswerIndexes ??
    body.selectedIndexes ??
    body.selectedAnswers ??
    (body.selectedAnswerIndex !== undefined ? [body.selectedAnswerIndex] : []);

  const values = Array.isArray(raw) ? raw : [raw];

  return Array.from(
    new Set(
      values
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value >= 0)
    )
  ).sort((a, b) => a - b);
};

const areIndexSetsEqual = (a = [], b = []) => {
  const left = Array.from(new Set(a.map(Number))).sort((x, y) => x - y);
  const right = Array.from(new Set(b.map(Number))).sort((x, y) => x - y);

  if (left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
};

const serializeProgressDoc = (doc = null) => {
  if (!doc) {
    return {
      watchedVideoKeys: [],
      watchedVideos: [],
      watchedVideoIndexes: [],
      attemptedActivityIds: [],
      activityAttempts: [],
      totalShortCoins: 0,
      isCompleted: false,
      completedAt: null,
    };
  }

  const plain = doc?.toObject ? doc.toObject() : doc;
  const watchedVideoKeys = Array.isArray(plain?.watchedVideoKeys)
    ? plain.watchedVideoKeys.map(String)
    : [];

  return {
    _id: plain?._id ? String(plain._id) : undefined,
    watchedVideoKeys,
    watchedVideos: Array.isArray(plain?.watchedVideos) ? plain.watchedVideos : [],
    watchedVideoIndexes: getWatchedVideoIndexes(plain),
    attemptedActivityIds: normalizeAttemptIds(plain),
    activityAttempts: Array.isArray(plain?.activityAttempts) ? plain.activityAttempts : [],
    totalShortCoins: Number(plain?.totalShortCoins || 0),
    isCompleted: Boolean(plain?.completedAt),
    completedAt: plain?.completedAt || null,
  };
};

const buildSubLessonProgressPayload = ({ progressDoc = null, subLesson = {}, activities = [] }) => {
  const base = serializeProgressDoc(progressDoc);
  const links = getLinks(subLesson);
  const totalVideos = Math.max(links.length, 1);
  const watchedVideoIndexes = getWatchedVideoIndexes(progressDoc || {}, totalVideos);
  const watchedVideoKeys = Array.isArray(base.watchedVideoKeys) ? base.watchedVideoKeys : [];

  const activityIds = Array.isArray(activities)
    ? activities.map((item) => String(item?._id || item?.id || "")).filter(Boolean)
    : [];
  const attemptedSet = new Set(base.attemptedActivityIds.map(String));
  const attemptedActivityCount = activityIds.filter((id) => attemptedSet.has(String(id))).length;
  const activityCount = activityIds.length;
  const activitiesCompleted = activityCount === 0 || attemptedActivityCount >= activityCount;

  const watchedCount = watchedVideoIndexes.length;
  const allVideosWatched = links.length === 0 || watchedCount >= links.length;
  const computedCompleted = allVideosWatched && activitiesCompleted;

  let currentVideoIndex = 0;

  if (computedCompleted) {
    currentVideoIndex = Math.max(totalVideos - 1, 0);
  } else if (watchedCount === 0) {
    currentVideoIndex = 0;
  } else if (!activitiesCompleted) {
    currentVideoIndex = Math.max(0, Math.min(watchedVideoIndexes[watchedVideoIndexes.length - 1], totalVideos - 1));
  } else {
    currentVideoIndex = Math.max(0, Math.min(watchedCount, totalVideos - 1));
  }

  const lastUnlockedVideoIndex = currentVideoIndex;
  const needsActivitiesBeforeNext = watchedCount > 0 && !activitiesCompleted;
  const nextLockedReason = needsActivitiesBeforeNext
    ? "Please complete all activities, then you can watch the next video."
    : "";

  return {
    ...base,
    watchedVideoIndexes,
    watchedCount,
    totalVideos: links.length,
    activityIds,
    activityCount,
    attemptedActivityCount,
    activitiesCompleted,
    isCompleted: computedCompleted || Boolean(base.completedAt),
    currentVideoIndex,
    lastUnlockedVideoIndex,
    needsActivitiesBeforeNext,
    nextLockedReason,
  };
};

const getOrCreateProgressDoc = async ({ userId, shortLessonId, shortSubLessonId }) => {
  let progress = await ShortCoinsCount.findOne({
    userId: toObjectId(userId),
    shortLessonId: toObjectId(shortLessonId),
    shortSubLessonId: toObjectId(shortSubLessonId),
  });

  if (!progress) {
    progress = await ShortCoinsCount.create({
      userId: toObjectId(userId),
      shortLessonId: toObjectId(shortLessonId),
      shortSubLessonId: toObjectId(shortSubLessonId),
    });
  }

  return progress;
};

const refreshSubLessonCompletion = async (progress) => {
  if (!progress) return progress;

  const [subLesson, activities] = await Promise.all([
    Shortsublesson.findById(progress.shortSubLessonId).lean(),
    Activity.find({
      shortLessonId: progress.shortLessonId,
      shortLessonBysubId: progress.shortSubLessonId,
    })
      .select("_id")
      .lean(),
  ]);

  if (!subLesson) return progress;

  const payload = buildSubLessonProgressPayload({ progressDoc: progress, subLesson, activities });

  if (payload.isCompleted && !progress.completedAt) {
    progress.completedAt = new Date();
    await progress.save();
  }

  return progress;
};

const getActivitiesGroupedBySubLesson = async (shortLessonId) => {
  const activities = await Activity.find({ shortLessonId: toObjectId(shortLessonId) })
    .select("_id shortLessonBysubId")
    .lean();

  const grouped = new Map();

  activities.forEach((activity) => {
    const key = String(activity.shortLessonBysubId);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(activity);
  });

  return grouped;
};

const getLessonCompletionData = async ({ userId, lesson }) => {
  const subLessons = await Shortsublesson.find({
    shortLessonId: lesson._id,
    status: "published",
  })
    .sort(sortByCreatedAtAsc)
    .lean();

  const [progressDocs, activitiesBySubId] = await Promise.all([
    ShortCoinsCount.find({
      userId: toObjectId(userId),
      shortLessonId: lesson._id,
    }).lean(),
    getActivitiesGroupedBySubLesson(lesson._id),
  ]);

  const rawProgressBySubId = new Map(
    progressDocs.map((doc) => [String(doc.shortSubLessonId), doc])
  );

  const progressBySubId = new Map();
  let completedSubLessonsCount = 0;

  subLessons.forEach((subLesson) => {
    const subId = String(subLesson._id);
    const payload = buildSubLessonProgressPayload({
      progressDoc: rawProgressBySubId.get(subId),
      subLesson,
      activities: activitiesBySubId.get(subId) || [],
    });

    progressBySubId.set(subId, payload);
    if (payload.isCompleted) completedSubLessonsCount += 1;
  });

  return {
    totalSubLessonsCount: subLessons.length,
    completedSubLessonsCount,
    isCompleted: subLessons.length > 0 && completedSubLessonsCount >= subLessons.length,
    progressBySubId,
  };
};

export const getMyTotalShortCoins = async (req, res) => {
  try {
    const access = await getUserApprovedEnrollment(req);
    if (access.errorStatus) {
      return res.status(access.errorStatus).json({
        success: false,
        message: access.errorMessage,
        totalShortCoins: 0,
      });
    }

    const totalShortCoins = await getTotalShortCoinsForUser(access.userId);

    return res.status(200).json({
      success: true,
      totalShortCoins,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get short coins",
      totalShortCoins: 0,
    });
  }
};

export const getMyShortLessonOverview = async (req, res) => {
  try {
    const access = await getUserApprovedEnrollment(req);
    if (access.errorStatus) {
      return res.status(access.errorStatus).json({
        success: false,
        message: access.errorMessage,
        data: [],
        totalShortCoins: 0,
      });
    }

    const gradeDoc = await findGradeDocForEnrollment(access.enrollment);
    const filter = gradeDoc?._id ? { gradeId: gradeDoc._id } : {};
    const lessons = await Shortlesson.find(filter).sort(sortByCreatedAtAsc).lean();
    const totalShortCoins = await getTotalShortCoinsForUser(access.userId);

    let previousLessonCompleted = true;
    const overview = [];

    for (const lesson of lessons) {
      const completion = await getLessonCompletionData({
        userId: access.userId,
        lesson,
      });

      const item = {
        ...lesson,
        _id: String(lesson._id),
        isUnlocked: previousLessonCompleted,
        isLocked: !previousLessonCompleted,
        isCompleted: completion.isCompleted,
        totalSubLessonsCount: completion.totalSubLessonsCount,
        completedSubLessonsCount: completion.completedSubLessonsCount,
        totalShortCoins,
      };

      overview.push(item);
      previousLessonCompleted = completion.isCompleted;
    }

    return res.status(200).json({
      success: true,
      count: overview.length,
      data: overview,
      shortlessons: overview,
      totalShortCoins,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get Shortz lesson overview",
      data: [],
      totalShortCoins: 0,
    });
  }
};

export const getMyShortSubLessonOverview = async (req, res) => {
  try {
    const access = await getUserApprovedEnrollment(req);
    if (access.errorStatus) {
      return res.status(access.errorStatus).json({
        success: false,
        message: access.errorMessage,
        data: [],
        totalShortCoins: 0,
      });
    }

    const { shortLessonId } = req.params;

    if (!isValidObjectId(shortLessonId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid short lesson ID",
        data: [],
        totalShortCoins: 0,
      });
    }

    const lesson = await Shortlesson.findById(shortLessonId).lean();
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Short lesson not found",
        data: [],
        totalShortCoins: 0,
      });
    }

    const subLessons = await Shortsublesson.find({
      shortLessonId: toObjectId(shortLessonId),
      status: "published",
    })
      .sort(sortByCreatedAtAsc)
      .lean();

    const [progressDocs, activitiesBySubId] = await Promise.all([
      ShortCoinsCount.find({
        userId: toObjectId(access.userId),
        shortLessonId: toObjectId(shortLessonId),
      }).lean(),
      getActivitiesGroupedBySubLesson(shortLessonId),
    ]);

    const rawProgressBySubId = new Map(
      progressDocs.map((doc) => [String(doc.shortSubLessonId), doc])
    );

    let previousCompleted = true;
    const data = subLessons.map((subLesson, index) => {
      const subId = String(subLesson._id);
      const progress = buildSubLessonProgressPayload({
        progressDoc: rawProgressBySubId.get(subId),
        subLesson,
        activities: activitiesBySubId.get(subId) || [],
      });
      const isUnlocked = index === 0 || previousCompleted;

      const item = {
        ...subLesson,
        _id: subId,
        shortLessonId: String(subLesson.shortLessonId),
        isUnlocked,
        isLocked: !isUnlocked,
        isCompleted: progress.isCompleted,
        progress,
      };

      previousCompleted = progress.isCompleted;
      return item;
    });

    const totalShortCoins = await getTotalShortCoinsForUser(access.userId);

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
      shortsublessons: data,
      totalShortCoins,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get Shortz sub lesson overview",
      data: [],
      totalShortCoins: 0,
    });
  }
};

export const markShortVideoWatched = async (req, res) => {
  try {
    const access = await getUserApprovedEnrollment(req);
    if (access.errorStatus) {
      return res.status(access.errorStatus).json({
        success: false,
        message: access.errorMessage,
      });
    }

    const { shortLessonId, shortSubLessonId, videoId, videoIndex = 0 } = req.body || {};
    const safeVideoIndex = Math.max(0, Number(videoIndex || 0));

    if (!isValidObjectId(shortLessonId) || !isValidObjectId(shortSubLessonId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid short lesson or sub lesson ID",
      });
    }

    const subLesson = await Shortsublesson.findOne({
      _id: toObjectId(shortSubLessonId),
      shortLessonId: toObjectId(shortLessonId),
      status: "published",
    }).lean();

    if (!subLesson) {
      return res.status(404).json({
        success: false,
        message: "Short sub lesson not found",
      });
    }

    const activities = await Activity.find({
      shortLessonId: toObjectId(shortLessonId),
      shortLessonBysubId: toObjectId(shortSubLessonId),
    })
      .select("_id")
      .lean();

    const progress = await getOrCreateProgressDoc({
      userId: access.userId,
      shortLessonId,
      shortSubLessonId,
    });

    const beforePayload = buildSubLessonProgressPayload({ progressDoc: progress, subLesson, activities });

    if (!beforePayload.isCompleted && safeVideoIndex > beforePayload.lastUnlockedVideoIndex) {
      return res.status(403).json({
        success: false,
        message:
          beforePayload.nextLockedReason ||
          "Please complete all activities, then you can watch the next video.",
        progress: beforePayload,
      });
    }

    const videoKey = buildVideoKey({ shortSubLessonId, videoIndex: safeVideoIndex, videoId });
    const alreadyWatched = progress.watchedVideoKeys.includes(videoKey);

    if (!alreadyWatched) {
      progress.watchedVideoKeys.push(videoKey);
      progress.watchedVideos.push({
        videoKey,
        videoIndex: safeVideoIndex,
        watchedAt: new Date(),
      });
      await progress.save();
    }

    await refreshSubLessonCompletion(progress);

    const totalShortCoins = await getTotalShortCoinsForUser(access.userId);
    const freshProgress = await ShortCoinsCount.findById(progress._id).lean();
    const payload = buildSubLessonProgressPayload({
      progressDoc: freshProgress || progress,
      subLesson,
      activities,
    });

    return res.status(200).json({
      success: true,
      message: alreadyWatched ? "Video already marked as watched" : "Video marked as watched",
      alreadyWatched,
      videoKey,
      progress: payload,
      totalShortCoins,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to mark video as watched",
    });
  }
};

export const submitShortActivityAttempt = async (req, res) => {
  try {
    const access = await getUserApprovedEnrollment(req);
    if (access.errorStatus) {
      return res.status(access.errorStatus).json({
        success: false,
        message: access.errorMessage,
      });
    }

    const { shortLessonId, shortSubLessonId, activityId, videoId, videoIndex = 0 } = req.body || {};
    const safeVideoIndex = Math.max(0, Number(videoIndex || 0));

    if (
      !isValidObjectId(shortLessonId) ||
      !isValidObjectId(shortSubLessonId) ||
      !isValidObjectId(activityId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid short lesson, sub lesson, or activity ID",
      });
    }

    const [subLesson, activity] = await Promise.all([
      Shortsublesson.findOne({
        _id: toObjectId(shortSubLessonId),
        shortLessonId: toObjectId(shortLessonId),
        status: "published",
      }).lean(),
      Activity.findOne({
        _id: toObjectId(activityId),
        shortLessonId: toObjectId(shortLessonId),
        shortLessonBysubId: toObjectId(shortSubLessonId),
      }).lean(),
    ]);

    if (!subLesson) {
      return res.status(404).json({
        success: false,
        message: "Short sub lesson not found",
      });
    }

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found for this sub lesson",
      });
    }

    const allActivities = await Activity.find({
      shortLessonId: toObjectId(shortLessonId),
      shortLessonBysubId: toObjectId(shortSubLessonId),
    })
      .select("_id")
      .lean();

    const progress = await getOrCreateProgressDoc({
      userId: access.userId,
      shortLessonId,
      shortSubLessonId,
    });

    const watchedIndexes = getWatchedVideoIndexes(progress, getLinks(subLesson).length);
    const videoKey = buildVideoKey({ shortSubLessonId, videoIndex: safeVideoIndex, videoId });
    const videoWasWatched =
      progress.watchedVideoKeys.includes(videoKey) || watchedIndexes.includes(safeVideoIndex);

    if (!videoWasWatched) {
      return res.status(403).json({
        success: false,
        message: "Please watch the video first, then complete activities.",
        progress: buildSubLessonProgressPayload({ progressDoc: progress, subLesson, activities: allActivities }),
      });
    }

    const existingAttempt = progress.activityAttempts.find(
      (attempt) => String(attempt.activityId) === String(activityId)
    );

    if (existingAttempt) {
      await refreshSubLessonCompletion(progress);
      const totalShortCoins = await getTotalShortCoinsForUser(access.userId);
      const freshProgress = await ShortCoinsCount.findById(progress._id).lean();

      return res.status(200).json({
        success: true,
        message: "This activity was already attempted. Coins are counted only once.",
        alreadyAttempted: true,
        isCorrect: Boolean(existingAttempt.isCorrect),
        earnedCoins: 0,
        originalEarnedCoins: Number(existingAttempt.earnedCoins || 0),
        progress: buildSubLessonProgressPayload({
          progressDoc: freshProgress || progress,
          subLesson,
          activities: allActivities,
        }),
        totalShortCoins,
      });
    }

    const selectedAnswerIndexes = selectedIndexesFromBody(req.body);
    const correctAnswerIndexes = Array.isArray(activity.correctAnswerIndexes)
      ? activity.correctAnswerIndexes
          .map((value) => Number(value))
          .filter((value) => Number.isInteger(value) && value >= 0)
          .sort((a, b) => a - b)
      : [];

    const isCorrect = areIndexSetsEqual(selectedAnswerIndexes, correctAnswerIndexes);
    const earnedCoins = isCorrect ? COINS_PER_CORRECT_ACTIVITY : 0;

    progress.activityAttempts.push({
      activityId: toObjectId(activityId),
      selectedAnswerIndexes,
      isCorrect,
      earnedCoins,
      attemptedAt: new Date(),
    });
    progress.totalShortCoins += earnedCoins;

    await progress.save();
    await refreshSubLessonCompletion(progress);

    const totalShortCoins = await getTotalShortCoinsForUser(access.userId);
    const freshProgress = await ShortCoinsCount.findById(progress._id).lean();

    return res.status(200).json({
      success: true,
      message: isCorrect ? "Correct answer. 5 coins earned." : "Wrong answer. 0 coins earned.",
      alreadyAttempted: false,
      isCorrect,
      earnedCoins,
      progress: buildSubLessonProgressPayload({
        progressDoc: freshProgress || progress,
        subLesson,
        activities: allActivities,
      }),
      totalShortCoins,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to submit activity attempt",
    });
  }
};
