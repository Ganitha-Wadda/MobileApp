import React, { useEffect, useRef, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSelector } from "react-redux";
import { Audio } from "expo-av";
import useT from "../app/i18n/useT";
import { useGetMyGradePapersByTypeQuery } from "../app/features/paperApi";
import { useGetLatestPaperResultByPaperQuery } from "../app/features/paperResultApi";

const { width } = Dimensions.get("window");


const getPayloadData = (response) => response?.data?.data || response?.data || response;

const getAttemptId = (attempt) => attempt?.id || attempt?._id || "";

const isCompletedAttempt = (attempt) =>
  Boolean(attempt?.status && attempt.status !== "in_progress");

const getSafeTranslation = (t, key, fallback) => {
  const value = typeof t === "function" ? t(key) : "";
  return value && value !== key ? value : fallback;
};

const getLockedText = (t) => getSafeTranslation(t, "lockedAlertTitle", "Locked");

const getPracticeLockedMessage = (t) =>
  getSafeTranslation(
    t,
    "completePracticePaperFirst",
    "Please complete the first practice paper before opening other papers."
  );

const buildReviewParams = (attempt, paperTitle, paper) => ({
  attemptId: getAttemptId(attempt),
  result: attempt,
  paperTitle:
    attempt?.paperSnapshot?.paperTitle ||
    attempt?.paperSnapshot?.paperName ||
    paperTitle,
  paper: attempt?.paperSnapshot || paper,
  totalQuestions: Number(attempt?.totalQuestions || 0),
  correctCount: Number(attempt?.correctCount || 0),
  wrongCount: Number(attempt?.wrongCount || 0),
  notAttemptedCount: Number(attempt?.notAttemptedCount || 0),
  totalCoins: Number(attempt?.totalCoins || 0),
  maximumCoins: Number(attempt?.maximumCoins || 0),
  percentage: Number(attempt?.percentage || 0),
  status: attempt?.status,
});

const getAttemptButtonText = (defaultStartText, attempt, isChecking, labels = {}) => {
  if (isChecking) return labels.checking || "Checking...";
  if (!attempt?.status) return defaultStartText || labels.start || "Start";
  if (attempt.status === "in_progress") return labels.continue || "Continue";
  return labels.viewReview || "View Review";
};


const clickSound = require("../assets/clip5.mp3");

const CARD_STYLES = [
  {
    emoji: "📋",
    starColor: "#A78BFA",
    starSize: 18,
  },
  {
    emoji: "📚",
    starColor: "#FBBF24",
    starSize: 20,
  },
  {
    emoji: "💡",
    starColor: "#A78BFA",
    starSize: 18,
  },
  {
    emoji: "🏆",
    starColor: "#F472B6",
    starSize: 20,
  },
];

const getPapersFromResponse = (response) => {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.papers)) return response.papers;
  if (Array.isArray(response)) return response;
  return [];
};

const getPaperId = (paper) => paper?.id || paper?._id || "";

const getPaperTitle = (paper, fallbackTitle = "Past Paper") =>
  String(
    paper?.paperTitle ||
      paper?.paperName ||
      paper?.year ||
      paper?.title ||
      paper?.name ||
      fallbackTitle
  ).trim();

const getPaperYear = (paper, title) => {
  const directYear = String(
    paper?.pastPaperYear ||
      paper?.paperYear ||
      paper?.year ||
      ""
  ).trim();

  if (directYear) return directYear;

  const matchedYear = String(title || "").match(/\b(19|20)\d{2}\b/);
  return matchedYear?.[0] || title;
};

const getPaperSubtitle = (paper) =>
  String(
    paper?.paperSubtitle ||
      paper?.subtitle ||
      paper?.description ||
      ""
  ).trim();

const mapBackendPapersToYears = (papers, fallbackPastPaperTitle = "Past Paper") =>
  papers.map((paper, index) => {
    const style = CARD_STYLES[index % CARD_STYLES.length];
    const title = getPaperTitle(paper, fallbackPastPaperTitle);

    return {
      id: getPaperId(paper) || String(index + 1),
      paperId: getPaperId(paper),
      year: getPaperYear(paper, title),
      title,
      subtitle: getPaperSubtitle(paper),
      emoji: style.emoji,
      starColor: style.starColor,
      starSize: style.starSize,
      rawPaper: paper,
    };
  });

const getErrorMessage = (error, token, t) => {
  if (!token) return t("pleaseLoginFirst") || "Please login first.";
  return (
    error?.data?.message ||
    error?.error ||
    error?.message ||
    t("unableToLoadPapers") ||
    "Unable to load papers."
  );
};

const StateBox = ({ loading, title, message, onRetry, retryText = "Tap to retry" }) => (
  <TouchableOpacity
    activeOpacity={onRetry ? 0.85 : 1}
    onPress={onRetry}
    disabled={!onRetry || loading}
    style={styles.stateBox}
  >
    {loading && <ActivityIndicator size="small" />}
    <Text style={styles.stateTitle}>{title}</Text>
    {!!message && <Text style={styles.stateText}>{message}</Text>}
    {!!onRetry && !loading && <Text style={styles.retryText}>{retryText}</Text>}
  </TouchableOpacity>
);

const FloatingDots = () => (
  <>
    <View style={[styles.dot, { top: 18, left: 22, backgroundColor: "#F472B6", width: 9, height: 9, borderRadius: 9 }]} />
    <View style={[styles.dot, { top: 30, right: 30, backgroundColor: "#A78BFA", width: 8, height: 8, borderRadius: 8 }]} />
    <View style={[styles.dot, { top: 210, left: 12, backgroundColor: "#60A5FA", width: 7, height: 7, borderRadius: 7 }]} />
    <View style={[styles.dot, { top: 310, right: 18, backgroundColor: "#FBBF24", width: 10, height: 10, borderRadius: 10 }]} />
    <View style={[styles.dot, { top: 430, left: 20, backgroundColor: "#A78BFA", width: 8, height: 8, borderRadius: 8 }]} />
    <View style={[styles.dot, { top: 530, right: 14, backgroundColor: "#60A5FA", width: 7, height: 7, borderRadius: 7 }]} />
    <View style={[styles.dot, { top: 660, left: 28, backgroundColor: "#FBBF24", width: 9, height: 9, borderRadius: 9 }]} />
    <View style={[styles.dot, { top: 720, right: 26, backgroundColor: "#F472B6", width: 8, height: 8, borderRadius: 8 }]} />
  </>
);

const Star = ({ color, size }) => (
  <Text style={{ color, fontSize: size, lineHeight: size + 4 }}>✦</Text>
);

const PastPaperCard = ({ item, index, onPress, startButtonText, token, t, locked, onAttemptStatusResolved }) => {
  const { data: latestResultResponse, isFetching: isCheckingAttempt } =
    useGetLatestPaperResultByPaperQuery(item.paperId, {
      skip: !token || !item.paperId,
      refetchOnFocus: true,
      refetchOnReconnect: true,
      refetchOnMountOrArgChange: true,
    });

  const latestAttempt = getPayloadData(latestResultResponse);
  const buttonText = locked
    ? getLockedText(t)
    : getAttemptButtonText(startButtonText, latestAttempt, isCheckingAttempt, {
        checking: t("checking"),
        continue: t("continue"),
        viewReview: t("viewReview"),
      });

  useEffect(() => {
    if (!isCheckingAttempt) {
      onAttemptStatusResolved?.(item.paperId, latestAttempt);
    }
  }, [isCheckingAttempt, item.paperId, latestAttempt, onAttemptStatusResolved]);

  return (
  <View style={[styles.card, locked && styles.cardLocked]}>
    <View style={styles.iconWrapper}>
      <View style={styles.iconCircle}>
        <Text style={styles.iconEmoji}>{item.emoji}</Text>
      </View>
    </View>

    <View style={styles.divider} />

    <View style={styles.cardContent}>
      <Text style={styles.yearText} numberOfLines={1}>
        {item.year}
      </Text>

      {!!item.subtitle && (
        <Text style={styles.subtitleText} numberOfLines={2}>
          {item.subtitle}
        </Text>
      )}

      <TouchableOpacity
        style={styles.startButton}
        onPress={() => onPress(item, latestAttempt, locked, index)}
        activeOpacity={0.85}
      >
        <Text style={styles.startButtonText}>{buttonText}</Text>
      </TouchableOpacity>
    </View>

    <View style={styles.cardStar}>
      <Star color={item.starColor} size={item.starSize} />
    </View>
  </View>
  );
};

export default function PastPaperMenu({ navigation, onSelectYear }) {
  const { t } = useT();
  const soundRef = useRef(null);
  const token = useSelector((state) => state?.auth?.token);
  const [attemptByPaperId, setAttemptByPaperId] = useState({});

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetMyGradePapersByTypeQuery(
    { paperType: "pastpapers" },
    { skip: !token }
  );

  const backendPapers = getPapersFromResponse(data);

  const paperYears = useMemo(
    () => mapBackendPapersToYears(backendPapers, t("pastPaper") || "Past Paper"),
    [backendPapers, t]
  );

  const firstPaperId = paperYears?.[0]?.paperId || paperYears?.[0]?.id || "";
  const practiceCompleted = isCompletedAttempt(
    attemptByPaperId[String(firstPaperId || "")]
  );

  const handleAttemptStatusResolved = useCallback((paperId, latestAttempt) => {
    const key = String(paperId || "");
    if (!key) return;

    setAttemptByPaperId((prev) => {
      const previousAttempt = prev[key];
      const previousStatus = previousAttempt?.status || "";
      const nextStatus = latestAttempt?.status || "";
      const previousId = previousAttempt?.id || previousAttempt?._id || "";
      const nextId = latestAttempt?.id || latestAttempt?._id || "";

      if (previousStatus === nextStatus && previousId === nextId) return prev;

      return {
        ...prev,
        [key]: latestAttempt || null,
      };
    });
  }, []);

  useEffect(() => {
    const loadSound = async () => {
      const { sound } = await Audio.Sound.createAsync(clickSound);
      soundRef.current = sound;
    };

    loadSound();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const playClickSound = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.replayAsync();
      }
    } catch (error) {
      console.log("Sound play error:", error);
    }
  };

  const handleStart = async (item, latestAttempt = null, locked = false, index = 0) => {
    await playClickSound();

    if (locked) {
      Alert.alert(getLockedText(t), getPracticeLockedMessage(t));
      return;
    }

    if (latestAttempt?.status && latestAttempt.status !== "in_progress") {
      navigation.navigate("reviewpage", buildReviewParams(latestAttempt, item.title, item.rawPaper));
      return;
    }

    if (navigation) {
      navigation.navigate("paperpage", {
        paperId: item.paperId,
        pastPaperYear: item.year,
        paperTitle: item.title,
        paperType: "pastpapers",
        isPracticePaper: index === 0,
        paper: item.rawPaper,
      });
    }

    if (onSelectYear) {
      onSelectYear(item.year);
    }
  };

  const isBusy = isLoading || isFetching;
  const errorMessage = error || !token ? getErrorMessage(error, token, t) : "";
  const startButtonText = t("startPaper") || t("start") || "Start";

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0F2FF" />

      <View style={styles.container}>
        <FloatingDots />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {isBusy ? (
            <StateBox loading title={t("loadingPastPapers")} />
          ) : errorMessage ? (
            <StateBox
            title={t("cannotLoadPapers")}
            message={errorMessage}
            onRetry={token ? refetch : undefined}
            retryText={t("tapToRetry")}
          />
          ) : paperYears.length === 0 ? (
            <StateBox
            title={t("noPastPapers")}
            message={t("noPastPapersMessage")}
          />
          ) : (
            paperYears.map((item, index) => (
              <PastPaperCard
                key={item.id}
                item={item}
                index={index}
                onPress={handleStart}
                startButtonText={startButtonText}
                token={token}
                t={t}
                locked={index > 0 && !practiceCompleted}
                onAttemptStatusResolved={handleAttemptStatusResolved}
              />
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F0F2FF",
  },
  container: {
    flex: 1,
    backgroundColor: "#F0F2FF",
    position: "relative",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
    gap: 16,
  },
  stateBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 26,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 130,
    shadowColor: "#C4C9F5",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 5,
  },
  stateTitle: {
    marginTop: 8,
    color: "#1E1B4B",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },
  stateText: {
    marginTop: 6,
    color: "#8B8FAD",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
  retryText: {
    marginTop: 10,
    color: "#5B4FCF",
    fontSize: 13,
    fontWeight: "700",
  },
  dot: {
    position: "absolute",
    zIndex: 0,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 16,
    shadowColor: "#C4C9F5",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 5,
    position: "relative",
    overflow: "hidden",
  },
  cardLocked: {
    opacity: 0.58,
  },
  iconWrapper: {
    width: 72,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#EEF0FF",
    alignItems: "center",
    justifyContent: "center",
  },
  iconEmoji: {
    fontSize: 34,
  },
  divider: {
    width: 1.5,
    height: 70,
    backgroundColor: "#E5E7F5",
    marginHorizontal: 14,
  },
  cardContent: {
    flex: 1,
    justifyContent: "center",
  },
  yearText: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1E1B4B",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  subtitleText: {
    fontSize: 12.5,
    color: "#8B8FAD",
    fontWeight: "400",
    marginBottom: 10,
    lineHeight: 17,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#5B4FCF",
    borderRadius: 22,
    paddingVertical: 7,
    paddingHorizontal: 18,
    alignSelf: "flex-start",
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  startButtonArrow: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  cardStar: {
    position: "absolute",
    top: 14,
    right: 16,
  },
});

