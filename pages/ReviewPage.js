import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Dimensions,
  Platform,
  ActivityIndicator,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useGetPaperAttemptResultQuery } from "../app/features/paperResultApi";
import CrossWebView from "../components/CrossWebView";
import useT from "../app/i18n/useT";

const { width } = Dimensions.get("window");

const toArrayText = (value) =>
  Array.isArray(value) && value.length > 0 ? value.join(", ") : "—";

const getYouTubeId = (url = "") => {
  const text = String(url || "").trim();
  if (!text) return "";

  const shortMatch = text.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/);
  if (shortMatch?.[1]) return shortMatch[1];

  const watchMatch = text.match(/[?&]v=([A-Za-z0-9_-]{6,})/);
  if (watchMatch?.[1]) return watchMatch[1];

  const embedMatch = text.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{6,})/);
  if (embedMatch?.[1]) return embedMatch[1];

  const shortsMatch = text.match(/youtube\.com\/shorts\/([A-Za-z0-9_-]{6,})/);
  if (shortsMatch?.[1]) return shortsMatch[1];

  return "";
};

const buildYouTubeHtml = (url = "") => {
  const videoId = getYouTubeId(url);
  const src = videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0`
    : String(url || "").trim();

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
        <style>
          html, body { margin: 0; padding: 0; background: #000; height: 100%; overflow: hidden; }
          iframe { width: 100%; height: 100%; border: 0; }
        </style>
      </head>
      <body>
        <iframe src="${src}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
      </body>
    </html>`;
};

const getBadgeInfo = (percentage, t) => {
  if (percentage >= 90) {
    return { icon: "🏅", text: t("goldBadge"), subtitle: t("excellentResult") };
  }

  if (percentage >= 70) {
    return { icon: "🥈", text: t("silverBadge"), subtitle: t("greatResult") };
  }

  if (percentage >= 50) {
    return { icon: "🥉", text: t("bronzeBadge"), subtitle: t("goodResult") };
  }

  return { icon: "⭐", text: t("keepPracticing"), subtitle: t("practiceResult") };
};

const getPayloadData = (response) =>
  response?.data?.data || response?.data || response?.result || response;

const normalizeAnswer = (item = {}) => {
  const isAttempted =
    item.isAttempted === true ||
    item.status === "correct" ||
    item.status === "wrong";

  const isCorrect = item.isCorrect === true || item.status === "correct";

  const status =
    item.status ||
    (!isAttempted ? "not_attempted" : isCorrect ? "correct" : "wrong");

  return {
    questionId: item.questionId || item._id || item.id,
    questionNumber: Number(item.questionNumber || 0),
    lessonName: item.lessonName || "",
    question: item.question || "",
    answers: item.answers || item.answerOptions || [],
    selectedIndexes: item.selectedIndexes || item.selectedAnswerIndexes || [],
    selectedAnswers: item.selectedAnswers || item.selectedAnswerTexts || [],
    correctAnswerIndexes: item.correctAnswerIndexes || [],
    correctAnswers: item.correctAnswers || item.correctAnswerTexts || [],
    isAttempted,
    isCorrect,
    status,
    coinsEarned: Number(item.coinsEarned || 0),
    explanationText: item.explanationText || item.explainLogic || item.explanation || "",
    explanationVideoUrl:
      item.explanationVideoUrl || item.explainVideoUrl || item.videoUrl || "",
  };
};

const normalizeReviewAnswers = (params, result) => {
  if (Array.isArray(params?.answers)) return params.answers.map(normalizeAnswer);
  if (Array.isArray(params?.reviewAnswers)) {
    return params.reviewAnswers.map(normalizeAnswer);
  }

  if (Array.isArray(result?.answers)) return result.answers.map(normalizeAnswer);
  if (Array.isArray(result?.reviewAnswers)) {
    return result.reviewAnswers.map(normalizeAnswer);
  }

  return [];
};

const getQuestionStatusInfo = (item, t) => {
  if (item.status === "not_attempted" || item.isAttempted === false) {
    return {
      text: t("notMarked"),
      mark: "!",
      badgeStyle: styles.notAttemptedBadge,
      tickStyle: styles.notAttemptedTick,
    };
  }

  if (item.isCorrect || item.status === "correct") {
    return {
      text: t("correct"),
      mark: "✓",
      badgeStyle: styles.correctBadge,
      tickStyle: styles.correctTick,
    };
  }

  return {
    text: t("wrong"),
    mark: "×",
    badgeStyle: styles.wrongBadge,
    tickStyle: styles.wrongTick,
  };
};

const ReviewQuestionCard = ({
  item,
  index,
  showAnswer,
  onToggleAnswer,
  onShowLogic,
  onShowVideo,
  t,
}) => {
  const statusInfo = getQuestionStatusInfo(item, t);
  const hasLogic = String(item.explanationText || "").trim().length > 0;
  const hasVideo = String(item.explanationVideoUrl || "").trim().length > 0;

  return (
    <View style={styles.questionCard}>
      <View style={styles.questionTopRow}>
        <Text style={styles.questionTitle}>
          {`${t("questionDash")} ${item.questionNumber || index + 1}`}
        </Text>

        <View style={[styles.completedBadge, statusInfo.badgeStyle]}>
          <View style={styles.completedCircle}>
            <Text style={[styles.completedTick, statusInfo.tickStyle]}>
              {statusInfo.mark}
            </Text>
          </View>
          <Text style={styles.completedText}>{statusInfo.text}</Text>
        </View>
      </View>

      {!!item.lessonName && (
        <Text style={styles.lessonNameText}>{item.lessonName}</Text>
      )}

      <Text style={styles.questionText}>{item.question || "—"}</Text>

      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.hideAnswerBox}
        onPress={onToggleAnswer}
      >
        <Text style={styles.hideAnswerText}>
          {showAnswer ? t("hideAnswer") : t("showAnswer")}
        </Text>
        <Text style={styles.chevron}>{showAnswer ? "⌄" : "›"}</Text>
      </TouchableOpacity>

      {showAnswer && (
        <View style={styles.answerBox}>
          <Text style={styles.yourAnswerLabel}>{t("yourAnswer")}</Text>
          <Text style={styles.yourAnswerText}>
            {item.status === "not_attempted" || item.isAttempted === false
              ? t("notMarked")
              : toArrayText(item.selectedAnswers)}
          </Text>

          <View style={styles.answerDivider} />

          <Text style={styles.correctAnswerLabel}>{t("correctAnswer")}</Text>
          <Text style={styles.correctAnswerText}>
            {toArrayText(item.correctAnswers)}
          </Text>

          <View style={styles.answerDivider} />

          <Text style={styles.coinText}>
            {t("coinsEarned")}: {Number(item.coinsEarned || 0)}
          </Text>
        </View>
      )}

      {(hasLogic || hasVideo) && (
        <View style={styles.buttonRow}>
          {hasLogic && (
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.logicButton}
              onPress={() => onShowLogic(item)}
            >
              <Text style={styles.logicButtonText}>{t("explainLogic")}</Text>
            </TouchableOpacity>
          )}

          {hasVideo && (
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.videoButtonWrapper}
              onPress={() => onShowVideo(item)}
            >
              <LinearGradient
                colors={["#7B5CFF", "#263CFF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.videoButton}
              >
                <Text style={styles.videoButtonText}>{t("explainVideo")}</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

export default function ReviewPage({ navigation, route }) {
  const { t } = useT();
  const [visibleAnswers, setVisibleAnswers] = useState({});
  const [logicItem, setLogicItem] = useState(null);
  const [videoItem, setVideoItem] = useState(null);

  const params = route?.params || {};
  const attemptId =
    params.attemptId ||
    params.result?.attemptId ||
    params.result?.id ||
    params.result?._id ||
    "";

  const {
    data: fetchedResult,
    isLoading,
    isFetching,
    isError,
  } = useGetPaperAttemptResultQuery(attemptId, {
    skip: !attemptId || Array.isArray(params.answers) || !!params.result,
  });

  const result = params.result || getPayloadData(fetchedResult) || null;

  const answers = useMemo(
    () => normalizeReviewAnswers(params, result),
    [params, result]
  );

  const totalQuestions = Number(
    params.totalQuestions || result?.totalQuestions || answers.length || 0
  );

  const correctCount = Number(
    params.correctCount ??
      result?.correctCount ??
      answers.filter((item) => item?.isCorrect || item?.status === "correct").length
  );

  const wrongCount = Number(
    params.wrongCount ??
      result?.wrongCount ??
      answers.filter((item) => item?.status === "wrong").length
  );

  const notAttemptedCount = Number(
    params.notAttemptedCount ??
      result?.notAttemptedCount ??
      answers.filter(
        (item) => item?.status === "not_attempted" || item?.isAttempted === false
      ).length
  );

  const totalCoins = Number(params.totalCoins ?? result?.totalCoins ?? 0);
  const maximumCoins = Number(
    params.maximumCoins ?? result?.maximumCoins ?? totalQuestions * 5
  );

  const percentage = Number(
    params.percentage ??
      result?.percentage ??
      (totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0)
  );

  const badge = getBadgeInfo(percentage, t);

  const paperTitle =
    params.paperTitle ||
    result?.paperSnapshot?.paperTitle ||
    result?.paperSnapshot?.paperName ||
    params.paper?.paperTitle ||
    params.paper?.paperName ||
    t("paper") || "Paper";

  const isAnswerVisible = (index) => visibleAnswers[index] !== false;

  const toggleAnswer = (index) => {
    setVisibleAnswers((prev) => ({
      ...prev,
      [index]: !isAnswerVisible(index),
    }));
  };

  if (isLoading || isFetching) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F7FF" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>{t("loadingResult")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError && !result) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F7FF" />
        <View style={styles.loadingContainer}>
          <Text style={styles.emptyTitle}>{t("resultNotFound")}</Text>
          <Text style={styles.emptyText}>
            {t("completePaperFirstReview")}
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.doneButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.doneButtonText}>{t("goBack")}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F7FF" />

      <View style={styles.mainContainer}>
        <View style={[styles.bgDot, styles.bgDotOne]} />
        <View style={[styles.bgDot, styles.bgDotTwo]} />
        <View style={[styles.bgDot, styles.bgDotThree]} />
        <View style={[styles.bgDot, styles.bgDotFour]} />

        <Text style={[styles.bgStar, styles.bgStarOne]}>✦</Text>
        <Text style={[styles.bgStar, styles.bgStarTwo]}>✦</Text>
        <Text style={[styles.bgStar, styles.bgStarThree]}>✦</Text>
        <Text style={[styles.bgStar, styles.bgStarFour]}>✦</Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.resultCard}>
            <View style={[styles.smallDot, styles.resultDotOne]} />
            <View style={[styles.smallDot, styles.resultDotTwo]} />
            <View style={[styles.smallDot, styles.resultDotThree]} />
            <View style={[styles.smallDot, styles.resultDotFour]} />

            <Text style={[styles.resultStar, styles.resultStarLeft]}>✦</Text>
            <Text style={[styles.resultStar, styles.resultStarRight]}>✦</Text>

            <Text style={styles.percentageText}>{percentage}%</Text>
            <Text style={styles.resultSubtitle}>{badge.subtitle}</Text>

            <Text style={styles.scoreLine}>
              {correctCount} {t("correctLower")} / {wrongCount} {t("wrongLower")} / {notAttemptedCount} {t("notMarkedLower")}
            </Text>

            <Text style={styles.coinSummaryText}>
              {t("coins")}: {totalCoins} / {maximumCoins}
            </Text>

            <View style={styles.badgePill}>
              <View style={styles.badgeCircle}>
                <Text style={styles.badgeIcon}>{badge.icon}</Text>
              </View>
              <Text style={styles.badgeText}>{badge.text}</Text>
            </View>
          </View>

          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionStar}>✦</Text>
            <Text style={styles.sectionTitle} numberOfLines={2}>
              {paperTitle} {t("result")}
            </Text>

            <View style={styles.titleDotsWrapper}>
              <View style={styles.titleDotPurple} />
              <View style={styles.titleDotPink} />
            </View>
          </View>

          {answers.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>{t("noReviewAnswers")}</Text>
              <Text style={styles.emptyText}>
                {t("completePaperFirstReview")}
              </Text>
            </View>
          ) : (
            answers.map((item, index) => (
              <ReviewQuestionCard
                key={`${item.questionId || index}`}
                item={item}
                index={index}
                showAnswer={isAnswerVisible(index)}
                onToggleAnswer={() => toggleAnswer(index)}
                onShowLogic={setLogicItem}
                onShowVideo={setVideoItem}
                t={t}
              />
            ))
          )}

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.doneButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.doneButtonText}>{t("doneButton")}</Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.bottomDecoration}>
          <View style={[styles.cloud, styles.cloudOne]} />
          <View style={[styles.cloud, styles.cloudTwo]} />
          <View style={[styles.cloud, styles.cloudThree]} />
          <View style={[styles.cloud, styles.cloudFour]} />

          <View style={[styles.leaf, styles.leftLeafOne]} />
          <View style={[styles.leaf, styles.leftLeafTwo]} />
          <View style={[styles.leaf, styles.leftLeafThree]} />

          <View style={[styles.leaf, styles.rightLeafOne]} />
          <View style={[styles.leaf, styles.rightLeafTwo]} />
          <View style={[styles.leaf, styles.rightLeafThree]} />
        </View>

        <Modal
          visible={!!logicItem}
          transparent
          animationType="fade"
          onRequestClose={() => setLogicItem(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.logicModalCard}>
              <Text style={styles.modalTitle}>{t("explainLogic")}</Text>

              <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.logicScrollBox}
              >
                <Text style={styles.modalLogicText}>
                  {logicItem?.explanationText || ""}
                </Text>
              </ScrollView>

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.modalCloseButton}
                onPress={() => setLogicItem(null)}
              >
                <Text style={styles.modalCloseText}>{t("close")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal
          visible={!!videoItem}
          transparent
          animationType="fade"
          onRequestClose={() => setVideoItem(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.videoModalCard}>
              <View style={styles.videoModalHeader}>
                <Text style={styles.modalTitle}>{t("explainVideoTitle")}</Text>

                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.videoCloseRound}
                  onPress={() => setVideoItem(null)}
                >
                  <Text style={styles.videoCloseText}>×</Text>
                </TouchableOpacity>
              </View>

              {videoItem?.explanationVideoUrl ? (
                <CrossWebView
                  key={videoItem?.questionId || videoItem?.explanationVideoUrl}
                  style={styles.videoWebView}
                  source={{ html: buildYouTubeHtml(videoItem.explanationVideoUrl) }}
                />
              ) : null}
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F7FF",
  },

  mainContainer: {
    flex: 1,
    backgroundColor: "#F8F7FF",
    position: "relative",
    overflow: "hidden",
  },

  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: Platform.OS === "android" ? 12 : 8,
    paddingBottom: 120,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#F8F7FF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },

  loadingText: {
    color: "#101943",
    fontSize: 15,
    fontWeight: "800",
    marginTop: 12,
  },

  resultCard: {
    width: "100%",
    minHeight: 190,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 18,
    paddingBottom: 16,
    marginBottom: 26,
    position: "relative",

    shadowColor: "#C8C7DE",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 7,
  },

  percentageText: {
    fontSize: 56,
    fontWeight: "900",
    color: "#3151F5",
    letterSpacing: 2,
    lineHeight: 62,
  },

  resultSubtitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#5F6174",
    marginTop: 8,
  },

  scoreLine: {
    fontSize: 13,
    fontWeight: "800",
    color: "#8A8DA5",
    marginTop: 5,
    marginBottom: 4,
  },

  coinSummaryText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#3151F5",
    marginBottom: 12,
  },

  badgePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingVertical: 8,
    paddingHorizontal: 18,
    minWidth: 175,
    justifyContent: "center",

    borderWidth: 1,
    borderColor: "#ECECF5",

    shadowColor: "#C8C7DE",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  },

  badgeCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF0C7",
    marginRight: 12,
  },

  badgeIcon: {
    fontSize: 22,
  },

  badgeText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#666579",
  },

  resultStar: {
    position: "absolute",
    fontSize: 22,
    color: "#F6C342",
    fontWeight: "900",
  },

  resultStarLeft: {
    top: 49,
    left: width * 0.24,
  },

  resultStarRight: {
    top: 49,
    right: width * 0.24,
  },

  smallDot: {
    position: "absolute",
    width: 5,
    height: 5,
    borderRadius: 3,
  },

  resultDotOne: {
    top: 46,
    left: width * 0.21,
    backgroundColor: "#B8B1FF",
  },

  resultDotTwo: {
    top: 58,
    left: width * 0.225,
    backgroundColor: "#8FD0FF",
  },

  resultDotThree: {
    top: 46,
    right: width * 0.21,
    backgroundColor: "#B8B1FF",
  },

  resultDotFour: {
    top: 58,
    right: width * 0.225,
    backgroundColor: "#8FD0FF",
  },

  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    paddingHorizontal: 8,
  },

  sectionStar: {
    fontSize: 21,
    color: "#F6C342",
    fontWeight: "900",
    marginRight: 12,
  },

  sectionTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "900",
    color: "#101943",
    letterSpacing: 0.2,
  },

  titleDotsWrapper: {
    marginLeft: 7,
    marginTop: -10,
  },

  titleDotPurple: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#B8B1FF",
    marginBottom: 8,
  },

  titleDotPink: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FFC7DD",
    marginLeft: 8,
  },

  emptyCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 18,
    marginTop: 4,
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#C8C7DE",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 4,
  },

  emptyTitle: {
    color: "#101943",
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
  },

  emptyText: {
    color: "#8A8DA5",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 20,
    marginTop: 8,
  },

  questionCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 14,
    marginBottom: 16,

    shadowColor: "#C8C7DE",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 5,
  },

  questionTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 9,
  },

  questionTitle: {
    flex: 1,
    color: "#3151F5",
    fontSize: 15,
    fontWeight: "900",
    paddingRight: 8,
  },

  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 50,
    paddingVertical: 5,
    paddingHorizontal: 9,
  },

  correctBadge: {
    backgroundColor: "#E8FFF2",
  },

  wrongBadge: {
    backgroundColor: "#FFECEC",
  },

  notAttemptedBadge: {
    backgroundColor: "#FFF7E5",
  },

  completedCircle: {
    width: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },

  completedTick: {
    fontSize: 13,
    fontWeight: "900",
    lineHeight: 16,
  },

  correctTick: {
    color: "#16A34A",
  },

  wrongTick: {
    color: "#EF4444",
  },

  notAttemptedTick: {
    color: "#F59E0B",
  },

  completedText: {
    color: "#5F6174",
    fontSize: 11,
    fontWeight: "900",
  },

  lessonNameText: {
    color: "#8A8DA5",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
  },

  questionText: {
    color: "#101943",
    fontSize: 15.5,
    fontWeight: "800",
    lineHeight: 23,
    marginBottom: 12,
  },

  hideAnswerBox: {
    backgroundColor: "#F7F7FF",
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  hideAnswerText: {
    color: "#3151F5",
    fontSize: 13,
    fontWeight: "900",
  },

  chevron: {
    color: "#3151F5",
    fontSize: 20,
    fontWeight: "900",
    marginTop: -2,
  },

  answerBox: {
    marginTop: 12,
    backgroundColor: "#FBFBFF",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ECECF5",
  },

  yourAnswerLabel: {
    color: "#8A8DA5",
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 4,
  },

  yourAnswerText: {
    color: "#101943",
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20,
  },

  answerDivider: {
    height: 1,
    backgroundColor: "#ECECF5",
    marginVertical: 10,
  },

  correctAnswerLabel: {
    color: "#16A34A",
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 4,
  },

  correctAnswerText: {
    color: "#101943",
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20,
  },

  coinText: {
    color: "#3151F5",
    fontSize: 13,
    fontWeight: "900",
  },

  allAnswersLabel: {
    color: "#8A8DA5",
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 6,
  },

  allAnswerText: {
    color: "#5F6174",
    fontSize: 13.2,
    fontWeight: "700",
    lineHeight: 20,
    marginBottom: 4,
  },

  allAnswerCorrect: {
    color: "#16A34A",
    fontWeight: "900",
  },

  allAnswerWrong: {
    color: "#EF4444",
    fontWeight: "900",
  },

  logicLabel: {
    color: "#8A8DA5",
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 4,
  },

  logicText: {
    color: "#5F6174",
    fontSize: 13.5,
    fontWeight: "700",
    lineHeight: 20,
  },

  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
  },

  logicButton: {
    flex: 1,
    borderRadius: 50,
    paddingVertical: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7F7FF",
  },

  logicButtonText: {
    color: "#3151F5",
    fontSize: 12.5,
    fontWeight: "900",
  },

  videoButtonWrapper: {
    flex: 1,
    borderRadius: 50,
    overflow: "hidden",
  },

  videoButton: {
    borderRadius: 50,
    paddingVertical: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  videoButtonText: {
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: "900",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(16, 25, 67, 0.55)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },

  logicModalCard: {
    width: "100%",
    maxHeight: "78%",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,

    shadowColor: "#101943",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 8,
  },

  videoModalCard: {
    width: "100%",
    height: width * 0.68,
    backgroundColor: "#000000",
    borderRadius: 22,
    overflow: "hidden",

    shadowColor: "#101943",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 8,
  },

  videoModalHeader: {
    height: 48,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
  },

  modalTitle: {
    color: "#101943",
    fontSize: 17,
    fontWeight: "900",
  },

  logicScrollBox: {
    marginTop: 12,
    maxHeight: 360,
  },

  modalLogicText: {
    color: "#5F6174",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 22,
  },

  modalCloseButton: {
    marginTop: 16,
    borderRadius: 50,
    backgroundColor: "#3151F5",
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  modalCloseText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },

  videoCloseRound: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F7F7FF",
    alignItems: "center",
    justifyContent: "center",
  },

  videoCloseText: {
    color: "#3151F5",
    fontSize: 23,
    fontWeight: "900",
    marginTop: -2,
  },

  videoWebView: {
    flex: 1,
    backgroundColor: "#000000",
  },

  doneButton: {
    marginTop: 10,
    marginHorizontal: 20,
    borderRadius: 50,
    backgroundColor: "#3151F5",
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  doneButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },

  bgDot: {
    position: "absolute",
    borderRadius: 50,
    zIndex: 0,
  },

  bgDotOne: {
    top: 220,
    left: 25,
    width: 5,
    height: 5,
    backgroundColor: "#9ED4FF",
  },

  bgDotTwo: {
    top: 345,
    right: 8,
    width: 7,
    height: 7,
    backgroundColor: "#CAB2FF",
  },

  bgDotThree: {
    bottom: 72,
    right: 15,
    width: 12,
    height: 12,
    backgroundColor: "#E7DAFF",
  },

  bgDotFour: {
    bottom: 34,
    left: 100,
    width: 8,
    height: 8,
    backgroundColor: "#EFEAFF",
  },

  bgStar: {
    position: "absolute",
    fontWeight: "900",
    zIndex: 0,
  },

  bgStarOne: {
    top: 225,
    left: 23,
    fontSize: 21,
    color: "#F6C342",
  },

  bgStarTwo: {
    bottom: 70,
    right: 76,
    fontSize: 17,
    color: "#D8D0FF",
  },

  bgStarThree: {
    bottom: 38,
    left: 175,
    fontSize: 14,
    color: "#DDD5FF",
  },

  bgStarFour: {
    bottom: 23,
    right: 135,
    fontSize: 12,
    color: "#E3DDFF",
  },

  bottomDecoration: {
    position: "absolute",
    width: "100%",
    height: 78,
    left: 0,
    right: 0,
    bottom: -14,
    zIndex: 0,
  },

  cloud: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    borderRadius: 100,
    opacity: 0.95,
  },

  cloudOne: {
    width: 90,
    height: 50,
    left: 60,
    bottom: -8,
  },

  cloudTwo: {
    width: 75,
    height: 48,
    left: 105,
    bottom: 20,
  },

  cloudThree: {
    width: 95,
    height: 55,
    right: 70,
    bottom: -6,
  },

  cloudFour: {
    width: 65,
    height: 42,
    right: 110,
    bottom: 17,
  },

  leaf: {
    position: "absolute",
    width: 22,
    height: 58,
    borderRadius: 20,
    backgroundColor: "#B8AFFA",
    opacity: 0.75,
  },

  leftLeafOne: {
    left: 8,
    bottom: -10,
    transform: [{ rotate: "-12deg" }],
  },

  leftLeafTwo: {
    left: 30,
    bottom: -8,
    transform: [{ rotate: "28deg" }],
  },

  leftLeafThree: {
    left: 48,
    bottom: 0,
    transform: [{ rotate: "42deg" }],
  },

  rightLeafOne: {
    right: 8,
    bottom: -10,
    transform: [{ rotate: "12deg" }],
  },

  rightLeafTwo: {
    right: 32,
    bottom: -6,
    transform: [{ rotate: "-28deg" }],
  },

  rightLeafThree: {
    right: 50,
    bottom: 0,
    transform: [{ rotate: "-42deg" }],
  },
});
