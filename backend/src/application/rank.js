import mongoose from "mongoose";

import Rank from "../infastructure/schemas/rank.js";
import User from "../infastructure/schemas/user.js";
import Grade from "../infastructure/schemas/grade.js";
import PaperResult from "../infastructure/schemas/paperResult.js";
import ShortCoinsCount from "../infastructure/schemas/shortcoinscount.js";

const MIN_COMPLETED_PAPERS_FOR_RANK = 5;

const isValidId = (id) => mongoose.Types.ObjectId.isValid(String(id || ""));
const toObjectId = (id) => new mongoose.Types.ObjectId(String(id));

const getUserId = (req) => {
  const id =
    req?.user?.id ||
    req?.user?._id ||
    req?.user?.userId ||
    req?.userId ||
    req?.auth?.id ||
    req?.auth?._id ||
    req?.auth?.userId;

  return isValidId(id) ? String(id) : "";
};

const numberValue = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const serializeObjectId = (value) => value?.toString?.() || String(value || "");

const getAvatarFromGender = (gender = "") => {
  const clean = String(gender || "").toLowerCase().trim();

  if (clean === "female") return "👧";
  if (clean === "male") return "👦";

  return "👤";
};

const normalizeLimit = (value, fallback = 10) => {
  const limit = Number(value);

  if (!Number.isInteger(limit) || limit < 1) return fallback;

  return Math.min(limit, 10);
};

const getGradeInfoFromUser = async (user = {}) => {
  const rawGrade = user?.grade;

  if (!rawGrade) {
    return {
      gradeObjectId: null,
      gradeId: 0,
    };
  }

  if (typeof rawGrade === "object" && rawGrade !== null) {
    const rawObjectId = rawGrade?._id || rawGrade?.id || null;
    const rawGradeId =
      rawGrade?.gradeId ?? rawGrade?.grade ?? rawGrade?.gradeNumber;
    const gradeId = numberValue(rawGradeId, 0);

    if (rawObjectId && isValidId(rawObjectId)) {
      return {
        gradeObjectId: String(rawObjectId),
        gradeId,
      };
    }

    if (gradeId) {
      const gradeDoc = await Grade.findOne({ gradeId }).lean();

      return {
        gradeObjectId: gradeDoc?._id ? String(gradeDoc._id) : null,
        gradeId,
      };
    }
  }

  if (isValidId(rawGrade)) {
    const gradeDoc = await Grade.findById(rawGrade).lean();

    return {
      gradeObjectId: String(rawGrade),
      gradeId: numberValue(gradeDoc?.gradeId, 0),
    };
  }

  const gradeId = numberValue(rawGrade, 0);

  if (gradeId) {
    const gradeDoc = await Grade.findOne({ gradeId }).lean();

    return {
      gradeObjectId: gradeDoc?._id ? String(gradeDoc._id) : null,
      gradeId,
    };
  }

  return {
    gradeObjectId: null,
    gradeId: 0,
  };
};

const getLastCoinTimestampsMap = async (userIds = []) => {
  if (!userIds.length) return new Map();

  const objectIds = userIds.map(toObjectId);

  const [paperDates, activityDates] = await Promise.all([
    PaperResult.aggregate([
      {
        $match: {
          userId: { $in: objectIds },
          status: { $in: ["completed", "expired"] },
          totalCoins: { $gt: 0 },
        },
      },
      {
        $group: {
          _id: "$userId",
          latestCoinAt: {
            $max: {
              $ifNull: ["$submittedAt", "$lastActivityAt"],
            },
          },
        },
      },
    ]),

    ShortCoinsCount.aggregate([
      {
        $match: {
          userId: { $in: objectIds },
          totalShortCoins: { $gt: 0 },
        },
      },
      {
        $group: {
          _id: "$userId",
          latestCoinAt: { $max: "$updatedAt" },
        },
      },
    ]),
  ]);

  const map = new Map();

  const merge = (rows) => {
    rows.forEach((row) => {
      const uid = String(row._id);
      const ts = row.latestCoinAt
        ? new Date(row.latestCoinAt).getTime()
        : Infinity;

      const existing = map.get(uid);

      if (existing === undefined) {
        map.set(uid, ts);
      } else {
        map.set(uid, Math.max(existing, ts));
      }
    });
  };

  merge(paperDates);
  merge(activityDates);

  return map;
};

const getPaperCoinsMap = async (userIds = []) => {
  if (!userIds.length) return new Map();

  const result = await PaperResult.aggregate([
    {
      $match: {
        userId: {
          $in: userIds.map(toObjectId),
        },
        status: {
          $in: ["completed", "expired"],
        },
      },
    },
    {
      $group: {
        _id: "$userId",
        paperCoins: {
          $sum: {
            $ifNull: ["$totalCoins", 0],
          },
        },
        completedPapersCount: {
          $sum: 1,
        },
      },
    },
  ]);

  const map = new Map();

  result.forEach((item) => {
    map.set(String(item._id), {
      paperCoins: numberValue(item.paperCoins),
      completedPapersCount: numberValue(item.completedPapersCount),
    });
  });

  return map;
};

const getActivityCoinsMap = async (userIds = []) => {
  if (!userIds.length) return new Map();

  const result = await ShortCoinsCount.aggregate([
    {
      $match: {
        userId: {
          $in: userIds.map(toObjectId),
        },
      },
    },
    {
      $group: {
        _id: "$userId",
        activityCoins: {
          $sum: {
            $ifNull: ["$totalShortCoins", 0],
          },
        },
      },
    },
  ]);

  const map = new Map();

  result.forEach((item) => {
    map.set(String(item._id), numberValue(item.activityCoins));
  });

  return map;
};

const buildGradeRanking = async ({ gradeObjectId, gradeId = 0 }) => {
  if (!gradeObjectId || !isValidId(gradeObjectId)) {
    return {
      allRows: [],
      rankedRows: [],
      eligibleUserIds: [],
      ineligibleUserIds: [],
    };
  }

  const users = await User.find({
    grade: toObjectId(gradeObjectId),
    role: "student",
    isActive: { $ne: false },
  })
    .select("_id name gender grade role isActive createdAt")
    .populate("grade", "gradeId isActive")
    .lean();

  const userIds = users.map((user) => String(user._id));

  const [paperCoinsMap, activityCoinsMap, lastCoinTimestampsMap] =
    await Promise.all([
      getPaperCoinsMap(userIds),
      getActivityCoinsMap(userIds),
      getLastCoinTimestampsMap(userIds),
    ]);

  const allRows = users.map((user) => {
    const userId = String(user._id);
    const paperSummary = paperCoinsMap.get(userId) || {};
    const paperCoins = numberValue(paperSummary.paperCoins);
    const activityCoins = numberValue(activityCoinsMap.get(userId));
    const completedPapersCount = numberValue(
      paperSummary.completedPapersCount
    );

    const isEligibleForRank =
      completedPapersCount >= MIN_COMPLETED_PAPERS_FOR_RANK;

    const totalCoins = isEligibleForRank ? paperCoins + activityCoins : 0;
    const gender = String(user.gender || "").toLowerCase().trim();

    const lastCoinAt =
      totalCoins > 0
        ? lastCoinTimestampsMap.get(userId) ?? Infinity
        : Infinity;

    const accountCreatedAt = user.createdAt
      ? new Date(user.createdAt).getTime()
      : Infinity;

    return {
      userId,
      name: user.name || "Student",
      gender,
      avatar: getAvatarFromGender(gender),
      grade: serializeObjectId(gradeObjectId),
      gradeId: numberValue(user?.grade?.gradeId, gradeId),
      paperCoins,
      activityCoins: isEligibleForRank ? activityCoins : 0,
      totalCoins,
      completedPapersCount,
      isEligibleForRank,
      createdAt: user.createdAt || null,
      _lastCoinAt: lastCoinAt,
      _accountCreatedAt: accountCreatedAt,
    };
  });

  const eligibleRows = allRows.filter((row) => row.isEligibleForRank);
  const ineligibleRows = allRows.filter((row) => !row.isEligibleForRank);

  eligibleRows.sort((a, b) => {
    if (b.totalCoins !== a.totalCoins) return b.totalCoins - a.totalCoins;

    if (a._lastCoinAt !== b._lastCoinAt) {
      return a._lastCoinAt - b._lastCoinAt;
    }

    if (a._accountCreatedAt !== b._accountCreatedAt) {
      return a._accountCreatedAt - b._accountCreatedAt;
    }

    return String(a.userId).localeCompare(String(b.userId));
  });

  const totalStudentsInGrade = eligibleRows.length;

  const rankedRows = eligibleRows.map((row, index) => {
    const { _lastCoinAt, _accountCreatedAt, ...rest } = row;

    return {
      ...rest,
      rank: index + 1,
      totalStudentsInGrade,
      calculatedAt: new Date(),
    };
  });

  return {
    allRows,
    rankedRows,
    eligibleUserIds: eligibleRows.map((row) => row.userId),
    ineligibleUserIds: ineligibleRows.map((row) => row.userId),
  };
};

const saveRankSnapshots = async (rankedRows = []) => {
  if (!rankedRows.length) return;

  const bulkOps = rankedRows.map((row) => ({
    updateOne: {
      filter: {
        userId: toObjectId(row.userId),
      },
      update: {
        $set: {
          userId: toObjectId(row.userId),
          grade: toObjectId(row.grade),
          gradeId: row.gradeId,
          name: row.name,
          gender: row.gender,
          avatar: row.avatar,
          paperCoins: row.paperCoins,
          activityCoins: row.activityCoins,
          totalCoins: row.totalCoins,
          completedPapersCount: row.completedPapersCount,
          isEligibleForRank: true,
          rank: row.rank,
          totalStudentsInGrade: row.totalStudentsInGrade,
          calculatedAt: row.calculatedAt,
        },
      },
      upsert: true,
    },
  }));

  await Rank.bulkWrite(bulkOps, { ordered: false });
};

const deleteIneligibleRankSnapshots = async ({
  gradeObjectId,
  ineligibleUserIds = [],
}) => {
  if (!gradeObjectId || !isValidId(gradeObjectId)) return;
  if (!ineligibleUserIds.length) return;

  await Rank.deleteMany({
    grade: toObjectId(gradeObjectId),
    userId: {
      $in: ineligibleUserIds.map(toObjectId),
    },
  });
};

const getEligibilityMessage = () =>
  `Complete at least ${MIN_COMPLETED_PAPERS_FOR_RANK} papers to become eligible for rank.`;

const serializeRankRow = (row = {}, isLoggedUser = false) => {
  const completedPapersCount = numberValue(row.completedPapersCount);
  const isEligibleForRank =
    Boolean(row.isEligibleForRank) ||
    completedPapersCount >= MIN_COMPLETED_PAPERS_FOR_RANK;

  return {
    userId: String(row.userId || ""),
    name: row.name || "Student",
    gender: row.gender || "",
    avatar: row.avatar || getAvatarFromGender(row.gender),
    grade: String(row.grade || ""),
    gradeId: numberValue(row.gradeId),
    rank: isEligibleForRank ? numberValue(row.rank) : 0,
    totalCoins: isEligibleForRank ? numberValue(row.totalCoins) : 0,
    paperCoins: numberValue(row.paperCoins),
    activityCoins: isEligibleForRank ? numberValue(row.activityCoins) : 0,
    completedPapersCount,
    isEligibleForRank,
    requiredCompletedPapersForRank: MIN_COMPLETED_PAPERS_FOR_RANK,
    remainingPapersForRank: Math.max(
      MIN_COMPLETED_PAPERS_FOR_RANK - completedPapersCount,
      0
    ),
    rankEligibilityMessage: isEligibleForRank ? "" : getEligibilityMessage(),
    totalStudentsInGrade: numberValue(row.totalStudentsInGrade),
    calculatedAt: row.calculatedAt || null,
    isLoggedUser,
    isUser: isLoggedUser,
  };
};

const buildIneligibleLoggedUserRank = ({
  userId,
  loginUser,
  gradeInfo,
  allRows = [],
  rankedRows = [],
}) => {
  const userRow = allRows.find((row) => String(row.userId) === String(userId));
  const completedPapersCount = numberValue(userRow?.completedPapersCount);

  return {
    userId,
    name: userRow?.name || loginUser?.name || "Student",
    gender: userRow?.gender || loginUser?.gender || "",
    avatar: userRow?.avatar || getAvatarFromGender(loginUser?.gender),
    grade: String(gradeInfo.gradeObjectId || ""),
    gradeId: gradeInfo.gradeId,
    rank: 0,
    totalCoins: 0,
    paperCoins: numberValue(userRow?.paperCoins),
    activityCoins: 0,
    completedPapersCount,
    isEligibleForRank: false,
    requiredCompletedPapersForRank: MIN_COMPLETED_PAPERS_FOR_RANK,
    remainingPapersForRank: Math.max(
      MIN_COMPLETED_PAPERS_FOR_RANK - completedPapersCount,
      0
    ),
    rankEligibilityMessage: getEligibilityMessage(),
    totalStudentsInGrade: rankedRows.length,
    calculatedAt: new Date(),
    isLoggedUser: true,
    isUser: true,
  };
};

const getLoggedUserAndRanking = async (req) => {
  const userId = getUserId(req);

  if (!userId) {
    return {
      errorStatus: 401,
      errorMessage: "Unauthorized. Please login again.",
    };
  }

  const loginUser = await User.findById(userId)
    .select("_id name gender grade role isActive createdAt")
    .populate("grade", "gradeId isActive")
    .lean();

  if (!loginUser) {
    return {
      errorStatus: 404,
      errorMessage: "Logged user not found.",
    };
  }

  const gradeInfo = await getGradeInfoFromUser(loginUser);

  if (!gradeInfo.gradeObjectId) {
    return {
      errorStatus: 400,
      errorMessage: "Logged user grade not found.",
    };
  }

  const rankingResult = await buildGradeRanking({
    gradeObjectId: gradeInfo.gradeObjectId,
    gradeId: gradeInfo.gradeId,
  });

  await Promise.all([
    saveRankSnapshots(rankingResult.rankedRows),
    deleteIneligibleRankSnapshots({
      gradeObjectId: gradeInfo.gradeObjectId,
      ineligibleUserIds: rankingResult.ineligibleUserIds,
    }),
  ]);

  const loggedUserRank = rankingResult.rankedRows.find(
    (row) => String(row.userId) === String(userId)
  );

  const loggedUserRow = rankingResult.allRows.find(
    (row) => String(row.userId) === String(userId)
  );

  const isLoggedUserEligibleForRank = Boolean(
    loggedUserRank || loggedUserRow?.isEligibleForRank
  );

  return {
    userId,
    loginUser,
    gradeInfo,
    allRows: rankingResult.allRows,
    rankedRows: rankingResult.rankedRows,
    loggedUserRank,
    loggedUserRow,
    isLoggedUserEligibleForRank,
  };
};

export const getLoggedUserRank = async (req, res) => {
  try {
    const result = await getLoggedUserAndRanking(req);

    if (result.errorStatus) {
      return res.status(result.errorStatus).json({
        success: false,
        message: result.errorMessage,
        data: {
          rank: 0,
          totalCoins: 0,
          paperCoins: 0,
          activityCoins: 0,
          completedPapersCount: 0,
          isEligibleForRank: false,
          requiredCompletedPapersForRank: MIN_COMPLETED_PAPERS_FOR_RANK,
          remainingPapersForRank: MIN_COMPLETED_PAPERS_FOR_RANK,
          rankEligibilityMessage: getEligibilityMessage(),
          totalStudentsInGrade: 0,
        },
      });
    }

    const data = result.loggedUserRank
      ? serializeRankRow(result.loggedUserRank, true)
      : buildIneligibleLoggedUserRank({
          userId: result.userId,
          loginUser: result.loginUser,
          gradeInfo: result.gradeInfo,
          allRows: result.allRows,
          rankedRows: result.rankedRows,
        });

    return res.status(200).json({
      success: true,
      message: data.isEligibleForRank
        ? "Logged user grade rank loaded successfully."
        : `You are not eligible for rank yet. Complete at least ${MIN_COMPLETED_PAPERS_FOR_RANK} papers.`,
      data,

      rank: data.rank,
      totalCoins: data.totalCoins,
      paperCoins: data.paperCoins,
      activityCoins: data.activityCoins,
      completedPapersCount: data.completedPapersCount,
      isEligibleForRank: data.isEligibleForRank,
      requiredCompletedPapersForRank: data.requiredCompletedPapersForRank,
      remainingPapersForRank: data.remainingPapersForRank,
      rankEligibilityMessage: data.rankEligibilityMessage,
      gradeId: data.gradeId,
      totalStudentsInGrade: data.totalStudentsInGrade,
    });
  } catch (error) {
    console.error("getLoggedUserRank error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get logged user rank.",
      data: {
        rank: 0,
        totalCoins: 0,
        paperCoins: 0,
        activityCoins: 0,
        completedPapersCount: 0,
        isEligibleForRank: false,
        requiredCompletedPapersForRank: MIN_COMPLETED_PAPERS_FOR_RANK,
        remainingPapersForRank: MIN_COMPLETED_PAPERS_FOR_RANK,
        rankEligibilityMessage: getEligibilityMessage(),
        totalStudentsInGrade: 0,
      },
    });
  }
};

export const getMyGradeLeaderboard = async (req, res) => {
  try {
    const result = await getLoggedUserAndRanking(req);

    if (result.errorStatus) {
      return res.status(result.errorStatus).json({
        success: false,
        message: result.errorMessage,
        data: [],
        leaderboard: [],
        myRank: null,
      });
    }

    const limit = normalizeLimit(req.query?.limit, 10);
    const topRows = result.rankedRows.slice(0, limit);

    const leaderboard = topRows.map((row) =>
      serializeRankRow(row, String(row.userId) === String(result.userId))
    );

    const myRank = result.loggedUserRank
      ? serializeRankRow(result.loggedUserRank, true)
      : buildIneligibleLoggedUserRank({
          userId: result.userId,
          loginUser: result.loginUser,
          gradeInfo: result.gradeInfo,
          allRows: result.allRows,
          rankedRows: result.rankedRows,
        });

    const topHasLoggedUser = leaderboard.some(
      (row) => String(row.userId) === String(result.userId)
    );

    return res.status(200).json({
      success: true,
      message: "My grade leaderboard loaded successfully.",
      data: leaderboard,
      leaderboard,

      myRank,
      topHasLoggedUser,

      isLoggedUserEligibleForRank: myRank?.isEligibleForRank || false,
      requiredCompletedPapersForRank: MIN_COMPLETED_PAPERS_FOR_RANK,
      remainingPapersForRank: myRank?.remainingPapersForRank ?? 0,
      rankEligibilityMessage:
        myRank?.rankEligibilityMessage || getEligibilityMessage(),

      grade: String(result.gradeInfo.gradeObjectId),
      gradeId: result.gradeInfo.gradeId,
      totalStudentsInGrade: result.rankedRows.length,
      eligibleStudentsInGrade: result.rankedRows.length,
      limit,
    });
  } catch (error) {
    console.error("getMyGradeLeaderboard error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get my grade leaderboard.",
      data: [],
      leaderboard: [],
      myRank: null,
    });
  }
};