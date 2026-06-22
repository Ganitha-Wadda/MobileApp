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
    emoji: "🎡",
    iconBg: ["#E8E4FF", "#D9D0FF"],
    starColor: "#A78BFA",
  },
  {
    emoji: "👦",
    iconBg: ["#FFF3E0", "#FFE0B2"],
    starColor: "#FBBF24",
  },
  {
    emoji: "💡",
    iconBg: ["#FFF8D0", "#FFF3A3"],
    starColor: "#60A5FA",
  },
  {
    emoji: "🏆",
    iconBg: ["#E3F2FD", "#CFEAFF"],
    starColor: "#F472B6",
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

const getPaperTitle = (paper, fallbackTitle = "Lesson") =>
  String(
    paper?.paperTitle ||
      paper?.paperName ||
      paper?.lessonTitle ||
      paper?.lessonName ||
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

const mapBackendPapersToLessons = (papers, fallbackLessonTitle = "Lesson") =>
  papers.map((paper, index) => {
    const style = CARD_STYLES[index % CARD_STYLES.length];

    return {
      id: getPaperId(paper) || String(index + 1),
      paperId: getPaperId(paper),
      title: getPaperTitle(paper, fallbackLessonTitle),
      subtitle: getPaperSubtitle(paper),
      emoji: style.emoji,
      iconBg: style.iconBg,
      starColor: style.starColor,
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

const FloatingDot = ({ style, color = "#A78BFA", delay = 0, size = 8 }) => {
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1.25,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.85,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 0.5,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.45,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.floatingDot,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
        style,
      ]}
    />
  );
};

const FloatingStar = ({ style, color = "#C8BFFF", size = 18, delay = 0 }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(floatAnim, {
            toValue: -8,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.7,
            duration: 900,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.35,
            duration: 900,
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
        styles.floatingStar,
        {
          color,
          fontSize: size,
          opacity: opacityAnim,
          transform: [{ translateY: floatAnim }],
        },
        style,
      ]}
    >
      ☆
    </Animated.Text>
  );
};

const LessonCard = ({ lesson, index, navigation, playClickSound, startText, token, t, locked, onAttemptStatusResolved }) => {
  const slideAnim = useRef(new Animated.Value(45)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(1)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

  const { data: latestResultResponse, isFetching: isCheckingAttempt } =
    useGetLatestPaperResultByPaperQuery(lesson.paperId, {
      skip: !token || !lesson.paperId,
      refetchOnFocus: true,
      refetchOnReconnect: true,
      refetchOnMountOrArgChange: true,
    });

  const latestAttempt = getPayloadData(latestResultResponse);
  const buttonText = locked
    ? getLockedText(t)
    : getAttemptButtonText(startText, latestAttempt, isCheckingAttempt, {
        checking: t("checking"),
        continue: t("continue"),
        viewReview: t("viewReview"),
      });

  useEffect(() => {
    if (!isCheckingAttempt) {
      onAttemptStatusResolved?.(lesson.paperId, latestAttempt);
    }
  }, [isCheckingAttempt, lesson.paperId, latestAttempt, onAttemptStatusResolved]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 520,
        delay: index * 120,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 520,
        delay: index * 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleStart = async () => {
    await playClickSound();

    if (locked) {
      Alert.alert(getLockedText(t), getPracticeLockedMessage(t));
      return;
    }

    if (latestAttempt?.status && latestAttempt.status !== "in_progress") {
      navigation.navigate("reviewpage", buildReviewParams(latestAttempt, lesson.title, lesson.rawPaper));
      return;
    }

    navigation.navigate("paperpage", {
      paperId: lesson.paperId,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      paperTitle: lesson.title,
      paperType: "lesson by lesson",
      isPracticePaper: index === 0,
      paper: lesson.rawPaper,
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
        onPress={handleStart}
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
          colors={lesson.iconBg}
          style={styles.iconBox}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.iconEmoji}>{lesson.emoji}</Text>
        </LinearGradient>

        <View style={styles.textBlock}>
          <Text style={styles.lessonTitle} numberOfLines={2}>
            {lesson.title}
          </Text>

          {!!lesson.subtitle && (
            <Text style={styles.lessonSubtitle} numberOfLines={2}>
              {lesson.subtitle}
            </Text>
          )}

          <Animated.View style={{ transform: [{ scale: btnScale }] }}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={handleStart}
              onPressIn={() =>
                Animated.spring(btnScale, {
                  toValue: 0.94,
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
                colors={["#7C5CFC", "#9B7DFF"]}
                style={styles.startButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.startText}>{buttonText}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <Text style={[styles.cardStar, { color: lesson.starColor }]}>★</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function LessonByLessonMenu({ navigation }) {
  const soundRef = useRef(null);
  const { t } = useT();
  const token = useSelector((state) => state?.auth?.token);
  const [attemptByPaperId, setAttemptByPaperId] = useState({});

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetMyGradePapersByTypeQuery(
    { paperType: "lesson by lesson" },
    { skip: !token }
  );

  const backendPapers = getPapersFromResponse(data);

  const lessons = useMemo(
    () => mapBackendPapersToLessons(backendPapers, t("lesson") || "Lesson"),
    [backendPapers, t]
  );

  const firstPaperId = lessons?.[0]?.paperId || lessons?.[0]?.id || "";
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

  const isBusy = isLoading || isFetching;
  const errorMessage = error || !token ? getErrorMessage(error, token, t) : "";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F0FF" />

      <LinearGradient
        colors={["#F5F0FF", "#EEF6FF", "#F0F8FF"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <FloatingDot style={{ top: height * 0.06, left: width * 0.08 }} color="#F472B6" size={9} />
      <FloatingDot style={{ top: height * 0.04, right: width * 0.1 }} color="#60A5FA" delay={300} />
      <FloatingDot style={{ top: height * 0.28, left: width * 0.04 }} color="#A78BFA" delay={150} />
      <FloatingDot style={{ top: height * 0.22, right: width * 0.06 }} color="#FBBF24" delay={500} size={10} />
      <FloatingDot style={{ top: height * 0.55, left: width * 0.06 }} color="#34D399" delay={200} />
      <FloatingDot style={{ top: height * 0.5, right: width * 0.08 }} color="#F472B6" delay={700} size={7} />
      <FloatingDot style={{ top: height * 0.78, left: width * 0.05 }} color="#60A5FA" delay={400} size={9} />
      <FloatingDot style={{ top: height * 0.76, right: width * 0.08 }} color="#A78BFA" delay={100} />
      <FloatingDot style={{ top: height * 0.92, left: width * 0.1 }} color="#FBBF24" delay={600} size={7} />
      <FloatingDot style={{ top: height * 0.9, right: width * 0.15 }} color="#F472B6" delay={350} size={9} />

      <FloatingStar style={{ top: height * 0.12, left: width * 0.03 }} />
      <FloatingStar style={{ top: height * 0.37, right: width * 0.03 }} color="#BBD7FF" size={20} delay={300} />
      <FloatingStar style={{ top: height * 0.66, left: width * 0.03 }} color="#FFD6F0" delay={500} />
      <FloatingStar style={{ top: height * 0.84, right: width * 0.04 }} size={22} delay={700} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isBusy ? (
          <StateBox loading title={t("loadingLessonByLessonPapers")} />
        ) : errorMessage ? (
          <StateBox
            title={t("cannotLoadPapers")}
            message={errorMessage}
            onRetry={token ? refetch : undefined}
            retryText={t("tapToRetry")}
          />
        ) : lessons.length === 0 ? (
          <StateBox
            title={t("noLessonPapers")}
            message={t("noLessonByLessonPapersMessage")}
          />
        ) : (
          lessons.map((lesson, index) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              index={index}
              navigation={navigation}
              playClickSound={playClickSound}
              startText={t("start") || "Start"}
              token={token}
              t={t}
              locked={index > 0 && !practiceCompleted}
              onAttemptStatusResolved={handleAttemptStatusResolved}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F0FF",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 40,
  },
  stateBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 26,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 130,
    shadowColor: "#7864C8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    borderWidth: 1.5,
    borderColor: "#F0EEFF",
  },
  stateTitle: {
    marginTop: 8,
    color: "#1A1040",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },
  stateText: {
    marginTop: 6,
    color: "#9B8EC4",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
  retryText: {
    marginTop: 10,
    color: "#7C5CFC",
    fontSize: 13,
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: "#7864C8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    borderWidth: 1.5,
    borderColor: "#F0EEFF",
    overflow: "hidden",
  },
  cardLocked: {
    opacity: 0.58,
  },
  cardInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 18,
    position: "relative",
  },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    shadowColor: "#A08CF0",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 10,
    elevation: 3,
  },
  iconEmoji: {
    fontSize: 38,
  },
  textBlock: {
    flex: 1,
    paddingRight: 18,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1A1040",
    marginBottom: 4,
  },
  lessonSubtitle: {
    fontSize: 12.5,
    color: "#9B8EC4",
    marginBottom: 12,
    lineHeight: 18,
  },
  startButton: {
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    borderRadius: 30,
    paddingVertical: 8,
    paddingHorizontal: 20,
    shadowColor: "#7C5CFC",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 5,
  },
  startText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  cardStar: {
    position: "absolute",
    top: 14,
    right: 14,
    fontSize: 22,
    fontWeight: "900",
  },
  floatingDot: {
    position: "absolute",
    zIndex: 0,
  },
  floatingStar: {
    position: "absolute",
    zIndex: 0,
    fontWeight: "900",
  },
});
