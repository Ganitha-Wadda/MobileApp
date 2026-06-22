import React, { useEffect, useRef, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSelector } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";
import { Audio } from "expo-av";
import useT from "../app/i18n/useT";
import { useGetMyGradePapersByTypeQuery } from "../app/features/paperApi";
import { useGetLatestPaperResultByPaperQuery } from "../app/features/paperResultApi";

const { width, height } = Dimensions.get("window");


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
    icon: "📄",
    iconBg: ["#E0EEFF", "#C8DEFF"],
    starColor: "#3B82F6",
    badgeColor: "#3B82F6",
  },
  {
    icon: "📑",
    iconBg: ["#E8F5FF", "#C8EAFF"],
    starColor: "#F59E0B",
    badgeColor: "#F59E0B",
  },
  {
    icon: "🗒️",
    iconBg: ["#EEF9FF", "#D0F0FF"],
    starColor: "#06B6D4",
    badgeColor: "#06B6D4",
  },
  {
    icon: "📝",
    iconBg: ["#F0EEFF", "#DDD5FF"],
    starColor: "#8B5CF6",
    badgeColor: "#8B5CF6",
  },
  {
    icon: "📃",
    iconBg: ["#FFF0E8", "#FFE0CC"],
    starColor: "#F97316",
    badgeColor: "#F97316",
  },
  {
    icon: "🗂️",
    iconBg: ["#F0FFF4", "#CCFCE8"],
    starColor: "#10B981",
    badgeColor: "#10B981",
  },
  {
    icon: "📋",
    iconBg: ["#FFF8E0", "#FFEEA0"],
    starColor: "#EAB308",
    badgeColor: "#EAB308",
  },
  {
    icon: "📊",
    iconBg: ["#F5E8FF", "#E8D0FF"],
    starColor: "#A855F7",
    badgeColor: "#A855F7",
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

const getPaperTitle = (paper, fallbackTitle = "Paper") =>
  String(
    paper?.paperTitle ||
      paper?.paperName ||
      paper?.title ||
      paper?.name ||
      fallbackTitle
  ).trim();

const getPaperSubtitle = (paper) =>
  String(
    paper?.paperSubtitle ||
      paper?.subtitle ||
      paper?.description ||
      ""
  ).trim();

const mapBackendPapersToCards = (papers, fallbackPaperTitle = "Paper") =>
  papers.map((paper, index) => {
    const style = CARD_STYLES[index % CARD_STYLES.length];

    return {
      id: getPaperId(paper) || String(index + 1),
      paperId: getPaperId(paper),
      title: getPaperTitle(paper, fallbackPaperTitle),
      subtitle: getPaperSubtitle(paper),
      icon: style.icon,
      iconBg: style.iconBg,
      starColor: style.starColor,
      badgeColor: style.badgeColor,
      badgeNumber: `#${index + 1}`,
      route: "paperpage",
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

const SparkDot = ({ style, delay = 0, color = "#B8D4FF" }) => {
  const scaleAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.4,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.sparkDot,
        style,
        {
          backgroundColor: color,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    />
  );
};

const DecoStar = ({
  style,
  size = 22,
  color = "#93C5FD",
  delay = 0,
  filled = false,
}) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(filled ? 0.85 : 0.35)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(floatAnim, {
            toValue: -9,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: filled ? 1 : 0.6,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: filled ? 0.85 : 0.35,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.Text
      style={[
        styles.decoStar,
        {
          fontSize: size,
          color,
          opacity: opacityAnim,
          transform: [{ translateY: floatAnim }],
        },
        style,
      ]}
    >
      {filled ? "★" : "☆"}
    </Animated.Text>
  );
};

const NumberBadge = ({ number, color }) => (
  <View
    style={[
      styles.numberBadge,
      {
        backgroundColor: `${color}22`,
        borderColor: `${color}55`,
      },
    ]}
  >
    <Text style={[styles.numberBadgeText, { color }]}>{number}</Text>
  </View>
);

const PaperCard = ({ item, index, navigation, playClickSound, t, token, locked, onAttemptStatusResolved }) => {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;
  const cardScale = useRef(new Animated.Value(1)).current;

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
    : getAttemptButtonText(t("start") || "Start", latestAttempt, isCheckingAttempt, {
        checking: t("checking"),
        continue: t("continue"),
        viewReview: t("viewReview"),
      });

  useEffect(() => {
    if (!isCheckingAttempt) {
      onAttemptStatusResolved?.(item.paperId, latestAttempt);
    }
  }, [isCheckingAttempt, item.paperId, latestAttempt, onAttemptStatusResolved]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 520,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 520,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePress = async () => {
    await playClickSound();

    if (locked) {
      Alert.alert(getLockedText(t), getPracticeLockedMessage(t));
      return;
    }

    if (latestAttempt?.status && latestAttempt.status !== "in_progress") {
      navigation.navigate("reviewpage", buildReviewParams(latestAttempt, item.title, item.rawPaper));
      return;
    }

    navigation.navigate(item.route, {
      paperId: item.paperId,
      paperTitle: item.title,
      paperType: "500 paper",
      isPracticePaper: index === 0,
      paper: item.rawPaper,
    });
  };

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: cardScale }],
        },
        locked && styles.cardLocked,
      ]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={handlePress}
        onPressIn={() =>
          Animated.spring(cardScale, {
            toValue: 0.98,
            useNativeDriver: true,
          }).start()
        }
        onPressOut={() =>
          Animated.spring(cardScale, {
            toValue: 1,
            friction: 5,
            useNativeDriver: true,
          }).start()
        }
        style={styles.cardInner}
      >
        <LinearGradient
          colors={item.iconBg}
          style={styles.iconCircle}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.iconEmoji}>{item.icon}</Text>
        </LinearGradient>

        <View style={styles.cardTextBlock}>
          <View style={styles.titleRow}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <NumberBadge number={item.badgeNumber} color={item.badgeColor} />
          </View>

          {!!item.subtitle && (
            <Text style={styles.cardSubtitle} numberOfLines={2}>
              {item.subtitle}
            </Text>
          )}

          <Animated.View style={{ transform: [{ scale: btnScale }] }}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={handlePress}
              onPressIn={() =>
                Animated.spring(btnScale, {
                  toValue: 0.93,
                  useNativeDriver: true,
                }).start()
              }
              onPressOut={() =>
                Animated.spring(btnScale, {
                  toValue: 1,
                  friction: 4,
                  useNativeDriver: true,
                }).start()
              }
            >
              <LinearGradient
                colors={["#2563EB", "#1D4ED8"]}
                style={styles.startBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.startBtnText}>{buttonText}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <Text style={[styles.cardStar, { color: item.starColor }]}>★</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function FiveHundredPaperMenu({ navigation }) {
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
    { paperType: "500 paper" },
    { skip: !token }
  );

  const backendPapers = getPapersFromResponse(data);

  const papers = useMemo(
    () => mapBackendPapersToCards(backendPapers, t("paper") || "Paper"),
    [backendPapers, t]
  );

  const firstPaperId = papers?.[0]?.paperId || papers?.[0]?.id || "";
  const practiceCompleted = isCompletedAttempt(
    attemptByPaperId[String(firstPaperId || "")]
  );

  const completedPaperCount = papers.reduce((total, item) => {
    const attemptStatus = attemptByPaperId[String(item.paperId || item.id || "")];
    return isCompletedAttempt(attemptStatus) ? total + 1 : total;
  }, 0);

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

  const isBusy = isLoading || isFetching;
  const errorMessage = error || !token ? getErrorMessage(error, token, t) : "";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E6EEFF" />

      <LinearGradient
        colors={["#E6EEFF", "#EEF3FF", "#E8F0FF"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <SparkDot style={{ top: height * 0.05, left: width * 0.06 }} />
      <SparkDot style={{ top: height * 0.1, right: width * 0.07 }} delay={300} color="#FFD9A8" />
      <SparkDot style={{ top: height * 0.19, left: width * 0.1 }} delay={150} />
      <SparkDot style={{ top: height * 0.32, right: width * 0.05 }} delay={500} color="#A8F0D8" />
      <SparkDot style={{ top: height * 0.46, left: width * 0.04 }} delay={200} />
      <SparkDot style={{ top: height * 0.57, right: width * 0.06 }} delay={700} color="#FFD9A8" />
      <SparkDot style={{ top: height * 0.69, left: width * 0.07 }} delay={400} />
      <SparkDot style={{ top: height * 0.79, right: width * 0.08 }} delay={100} color="#A8F0D8" />
      <SparkDot style={{ top: height * 0.89, left: width * 0.12 }} delay={600} />

      <DecoStar style={{ top: height * 0.08, left: width * 0.02 }} size={14} />
      <DecoStar style={{ top: height * 0.23, left: width * 0.02 }} size={20} delay={400} />
      <DecoStar style={{ top: height * 0.41, left: width * 0.02 }} size={16} delay={200} />
      <DecoStar style={{ top: height * 0.59, left: width * 0.02 }} size={22} delay={600} />
      <DecoStar style={{ top: height * 0.75, left: width * 0.03 }} size={14} delay={300} />

      <DecoStar style={{ top: height * 0.13, right: width * 0.02 }} size={18} delay={100} />
      <DecoStar style={{ top: height * 0.29, right: width * 0.02 }} size={14} delay={500} />
      <DecoStar style={{ top: height * 0.49, right: width * 0.02 }} size={20} delay={250} />
      <DecoStar style={{ top: height * 0.66, right: width * 0.02 }} size={16} delay={700} />
      <DecoStar style={{ top: height * 0.83, right: width * 0.03 }} size={22} delay={350} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isBusy ? (
          <StateBox loading title={t("loadingFiveHundredPapers")} />
        ) : errorMessage ? (
          <StateBox
            title={t("cannotLoadPapers")}
            message={errorMessage}
            onRetry={token ? refetch : undefined}
            retryText={t("tapToRetry")}
          />
        ) : papers.length === 0 ? (
          <StateBox
            title={t("noFiveHundredPapers")}
            message={t("noFiveHundredPapersMessage")}
          />
        ) : (
          <>
            <View style={styles.progressCard}>
              <Text style={styles.progressText}>
                {completedPaperCount}/500 {t("completed") || "completed"}
              </Text>
            </View>

            {papers.map((item, index) => (
            <PaperCard
              key={item.id}
              item={item}
              index={index}
              navigation={navigation}
              playClickSound={playClickSound}
              t={t}
              token={token}
              locked={index > 0 && !practiceCompleted}
              onAttemptStatusResolved={handleAttemptStatusResolved}
            />
          ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6EEFF",
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 40,
    gap: 14,
  },
  stateBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingVertical: 26,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 130,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.09,
    shadowRadius: 18,
    elevation: 4,
  },
  stateTitle: {
    marginTop: 8,
    color: "#1A2850",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },
  stateText: {
    marginTop: 6,
    color: "#7E94B8",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
  retryText: {
    marginTop: 10,
    color: "#1D4ED8",
    fontSize: 13,
    fontWeight: "700",
  },
  sparkDot: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  decoStar: {
    position: "absolute",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.09,
    shadowRadius: 18,
    elevation: 4,
    overflow: "hidden",
  },
  cardInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 18,
    position: "relative",
  },
  cardLocked: {
    opacity: 0.58,
  },
  progressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  progressText: {
    color: "#1A2850",
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    flexShrink: 0,
  },
  iconEmoji: {
    fontSize: 36,
  },
  cardTextBlock: {
    flex: 1,
    gap: 3,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 3,
  },
  cardTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "800",
    color: "#1A2850",
  },
  cardSubtitle: {
    fontSize: 12.5,
    color: "#7E94B8",
    lineHeight: 18,
    marginBottom: 10,
  },
  numberBadge: {
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
  },
  numberBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  startBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 50,
    alignSelf: "flex-start",
    shadowColor: "#1D4ED8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 5,
  },
  startBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  cardStar: {
    position: "absolute",
    top: 14,
    right: 16,
    fontSize: 20,
  },
});
