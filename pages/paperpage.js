import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  Alert,
  BackHandler,
  Image,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

import { useGetPaperFullDetailsQuery } from "../app/features/paperApi";
import {
  useStartOrResumePaperAttemptMutation,
  useSavePaperQuestionAnswerMutation,
  useFinishPaperAttemptMutation,
} from "../app/features/paperResultApi";

const OPTION_LABELS = ["i.", "ii.", "iii.", "iv.", "v.", "vi."];

const getPayloadData = (response) => response?.data?.data || response?.data || response;

const getPaperId = (route) =>
  route?.params?.paperId ||
  route?.params?.paper?._id ||
  route?.params?.paper?.id ||
  "";

const normalizeAttemptAnswersForReview = (answers = []) =>
  answers.map((item) => ({
    questionId: item.questionId,
    questionNumber: item.questionNumber,
    lessonName: item.lessonName || "",
    question: item.question || "",
    answers: item.answers || item.answerOptions || [],
    answerImages: item.answerImages || [],
    imageUrl: item.imageUrl || "",
    selectedIndexes: item.selectedIndexes || item.selectedAnswerIndexes || [],
    selectedAnswers: item.selectedAnswers || item.selectedAnswerTexts || [],
    correctAnswerIndexes: item.correctAnswerIndexes || [],
    correctAnswers: item.correctAnswers || item.correctAnswerTexts || [],
    isAttempted: item.isAttempted === true,
    isCorrect: item.isCorrect === true,
    status: item.status || "not_attempted",
    coinsEarned: Number(item.coinsEarned || 0),
    explanationText: item.explanationText || "",
    explanationVideoUrl: item.explanationVideoUrl || "",
  }));

const formatTime = (totalSeconds) => {
  const safeSeconds = Math.max(Number(totalSeconds || 0), 0);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const getSelectedAnswerIndexFromAttempt = (attempt, questionId) => {
  const row = (attempt?.answers || []).find(
    (answer) => String(answer.questionId) === String(questionId)
  );

  const selected = row?.selectedAnswerIndexes || row?.selectedIndexes || [];
  return selected.length > 0 ? Number(selected[0]) : null;
};

export default function Paperpage({ navigation, route }) {
  const paperId = getPaperId(route);

  const [attempt, setAttempt] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedByQuestionId, setSelectedByQuestionId] = useState({});
  const [screenError, setScreenError] = useState("");

  const startCalledRef = useRef(false);
  const finalizingRef = useRef(false);

  const {
    data: paperDetailsResponse,
    isLoading: isPaperLoading,
    isFetching: isPaperFetching,
    error: paperError,
  } = useGetPaperFullDetailsQuery(paperId, { skip: !paperId });

  const [startOrResumePaperAttempt, { isLoading: isStarting }] =
    useStartOrResumePaperAttemptMutation();

  const [savePaperQuestionAnswer, { isLoading: isSavingAnswer }] =
    useSavePaperQuestionAnswerMutation();

  const [finishPaperAttempt, { isLoading: isFinishing }] =
    useFinishPaperAttemptMutation();

  const paperDetails = getPayloadData(paperDetailsResponse);
  const backendPaper = paperDetails?.paper || route?.params?.paper || {};
  const questions = Array.isArray(paperDetails?.questions) ? paperDetails.questions : [];

  const paperTitle =
    route?.params?.paperTitle ||
    route?.params?.lessonTitle ||
    route?.params?.pastPaperYear ||
    backendPaper?.paperTitle ||
    backendPaper?.paperName ||
    "Paper";

  const currentQuestion = questions[currentIndex];
  const currentQuestionId = currentQuestion?.id || currentQuestion?._id || "";
  const selectedAnswerIndex = selectedByQuestionId[currentQuestionId] ?? null;
  const hasSelectedAnswer = selectedAnswerIndex !== null && selectedAnswerIndex !== undefined;

  // ✅ Question image (shown above the question text). Trimmed + falsy-safe.
  const questionImageUrl = String(currentQuestion?.imageUrl || "").trim();

  // ✅ Answer images aligned to the answers array by index. Missing/blank entries
  // simply mean "no image for that answer" — handled per-row below.
  const answerImages = Array.isArray(currentQuestion?.answerImages)
    ? currentQuestion.answerImages
    : [];

  const navigateToReview = useCallback(
    (result) => {
      const completedAttempt = result || attempt;
      const reviewAnswers = normalizeAttemptAnswersForReview(completedAttempt?.answers || []);

      navigation.replace("reviewpage", {
        attemptId: completedAttempt?.id || completedAttempt?._id,
        result: completedAttempt,
        answers: reviewAnswers,
        paperTitle:
          completedAttempt?.paperSnapshot?.paperTitle ||
          completedAttempt?.paperSnapshot?.paperName ||
          paperTitle,
        paper: completedAttempt?.paperSnapshot || backendPaper,
        totalQuestions: Number(completedAttempt?.totalQuestions || reviewAnswers.length || 0),
        correctCount: Number(completedAttempt?.correctCount || 0),
        wrongCount: Number(completedAttempt?.wrongCount || 0),
        notAttemptedCount: Number(completedAttempt?.notAttemptedCount || 0),
        totalCoins: Number(completedAttempt?.totalCoins || 0),
        maximumCoins: Number(completedAttempt?.maximumCoins || 0),
        percentage: Number(completedAttempt?.percentage || 0),
        status: completedAttempt?.status,
      });
    },
    [attempt, backendPaper, navigation, paperTitle]
  );

  useFocusEffect(
    useCallback(() => {
      const blockBack = () => {
        Alert.alert(
          "Paper is running",
          "You cannot leave the paper while attempting. Finish the paper or wait until time is over."
        );
        return true;
      };

      const subscription = BackHandler.addEventListener("hardwareBackPress", blockBack);
      return () => subscription.remove();
    }, [])
  );

  useEffect(() => {
    if (!paperId || startCalledRef.current) return;

    startCalledRef.current = true;

    const startAttempt = async () => {
      try {
        setScreenError("");

        const response = await startOrResumePaperAttempt({ paperId }).unwrap();
        const result = getPayloadData(response);

        setAttempt(result);
        setRemainingSeconds(Number(result?.remainingSeconds || 0));

        const selectedMap = {};
        (result?.answers || []).forEach((answer) => {
          const qId = answer.questionId;
          const selected = answer.selectedAnswerIndexes || answer.selectedIndexes || [];
          if (qId && selected.length > 0) {
            selectedMap[String(qId)] = Number(selected[0]);
          }
        });

        setSelectedByQuestionId(selectedMap);

        if (result?.status && result.status !== "in_progress") {
          navigateToReview(result);
          return;
        }

        const nextQuestionNumber = Number(result?.currentQuestionNumber || 1);
        setCurrentIndex(Math.max(nextQuestionNumber - 1, 0));
      } catch (error) {
        const message =
          error?.data?.message ||
          error?.error ||
          error?.message ||
          "Unable to start paper.";
        setScreenError(message);
      }
    };

    startAttempt();
  }, [navigateToReview, paperId, startOrResumePaperAttempt]);

  const finalizePaper = useCallback(
    async (expired = false) => {
      if (!attempt?.id && !attempt?._id) return;
      if (finalizingRef.current) return;

      finalizingRef.current = true;

      try {
        const response = await finishPaperAttempt({
          attemptId: attempt.id || attempt._id,
          expired,
        }).unwrap();

        const result = getPayloadData(response);
        setAttempt(result);
        navigateToReview(result);
      } catch (error) {
        const message =
          error?.data?.message ||
          error?.error ||
          error?.message ||
          "Unable to finish paper.";
        setScreenError(message);
        finalizingRef.current = false;
      }
    },
    [attempt, finishPaperAttempt, navigateToReview]
  );

  useEffect(() => {
    if (!attempt || attempt.status !== "in_progress") return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => Math.max(Number(prev || 0) - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [attempt]);

  useEffect(() => {
    if (!attempt || attempt.status !== "in_progress") return;
    if (remainingSeconds > 0) return;

    finalizePaper(true);
  }, [attempt, finalizePaper, remainingSeconds]);

  const handleSelectAnswer = async (answerIndex) => {
    if (!attempt || attempt.status !== "in_progress") return;
    if (!currentQuestion) return;
    if (isSavingAnswer || isFinishing) return;

    const qId = currentQuestion.id || currentQuestion._id;

    setSelectedByQuestionId((prev) => ({
      ...prev,
      [String(qId)]: answerIndex,
    }));

    try {
      const response = await savePaperQuestionAnswer({
        attemptId: attempt.id || attempt._id,
        paperId,
        questionId: qId,
        questionNumber: currentQuestion.questionNumber || currentIndex + 1,
        selectedAnswerIndex: answerIndex,
      }).unwrap();

      const updatedAttempt = getPayloadData(response);
      setAttempt(updatedAttempt);
      setRemainingSeconds(Number(updatedAttempt?.remainingSeconds ?? remainingSeconds));
    } catch (error) {
      const message =
        error?.data?.message ||
        error?.error ||
        error?.message ||
        "Unable to save answer.";

      Alert.alert("Answer not saved", message);

      const previousSelected = getSelectedAnswerIndexFromAttempt(attempt, qId);
      setSelectedByQuestionId((prev) => ({
        ...prev,
        [String(qId)]: previousSelected,
      }));

      if (error?.data?.data?.status && error.data.data.status !== "in_progress") {
        navigateToReview(error.data.data);
      }
    }
  };

  const handleNext = () => {
    if (!hasSelectedAnswer) {
      Alert.alert("Select answer", "Please select an answer before going next.");
      return;
    }

    if (currentIndex >= questions.length - 1) {
      finalizePaper(false);
      return;
    }

    setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1));
  };

  const isBusy = isPaperLoading || isPaperFetching || isStarting;
  const errorMessage =
    screenError ||
    paperError?.data?.message ||
    paperError?.error ||
    paperError?.message ||
    "";

  const progressText = useMemo(() => {
    const current = questions.length > 0 ? currentIndex + 1 : 0;
    return `${current} / ${questions.length}`;
  }, [currentIndex, questions.length]);

  if (!paperId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F7FF" />
        <View style={styles.centerBox}>
          <Text style={styles.errorTitle}>Paper not found</Text>
          <Text style={styles.errorText}>Missing paper id.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isBusy) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F7FF" />
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Preparing paper...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (errorMessage) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F7FF" />
        <View style={styles.centerBox}>
          <Text style={styles.errorTitle}>Cannot open paper</Text>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentQuestion) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F7FF" />
        <View style={styles.centerBox}>
          <Text style={styles.errorTitle}>No questions</Text>
          <Text style={styles.errorText}>This paper does not have questions yet.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F7FF" />

      <View style={styles.mainContainer}>
        <LinearGradient
          colors={["#F8F7FF", "#EEF3FF", "#F7F2FF"]}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.topTimerCard}>
          <View style={styles.titleBlock}>
            <Text style={styles.paperTitle} numberOfLines={1}>
              {paperTitle}
            </Text>
            <Text style={styles.progressText}>Question {progressText}</Text>
          </View>

          <View style={styles.timerPill}>
            <Text style={styles.timerLabel}>Time</Text>
            <Text style={styles.timerValue}>{formatTime(remainingSeconds)}</Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.questionCard}>
            <View style={styles.questionHeaderRow}>
              <Text style={styles.questionNumber}>
                Question - {currentQuestion.questionNumber || currentIndex + 1}
              </Text>

              <View style={styles.noSkipBadge}>
                <Text style={styles.noSkipText}>No Skip</Text>
              </View>
            </View>

            {!!currentQuestion.lessonName && (
              <Text style={styles.lessonText}>{currentQuestion.lessonName}</Text>
            )}

            <Text style={styles.questionText}>{currentQuestion.question}</Text>

            {/* ✅ Question image — capped height, full width, shown only if present */}
            {!!questionImageUrl && (
              <View style={styles.questionImageWrapper}>
                <Image
                  source={{ uri: questionImageUrl }}
                  style={styles.questionImage}
                  resizeMode="contain"
                />
              </View>
            )}

            <View style={styles.answerList}>
              {(currentQuestion.answers || []).map((answer, index) => {
                const selected = selectedAnswerIndex === index;
                const answerImageUrl = String(answerImages[index] || "").trim();

                return (
                  <TouchableOpacity
                    key={`${currentQuestionId}-${index}`}
                    activeOpacity={0.85}
                    onPress={() => handleSelectAnswer(index)}
                    disabled={isSavingAnswer || isFinishing}
                    style={[
                      styles.answerButton,
                      selected && styles.answerButtonSelected,
                    ]}
                  >
                    <View style={styles.answerTopRow}>
                      <View
                        style={[
                          styles.answerIndexCircle,
                          selected && styles.answerIndexCircleSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.answerIndexText,
                            selected && styles.answerIndexTextSelected,
                          ]}
                        >
                          {OPTION_LABELS[index] || `${index + 1}.`}
                        </Text>
                      </View>

                      <Text
                        style={[
                          styles.answerText,
                          selected && styles.answerTextSelected,
                        ]}
                      >
                        {answer}
                      </Text>
                    </View>

                    {/* ✅ Answer image — normal size, shown below the answer text */}
                    {!!answerImageUrl && (
                      <View style={styles.answerImageWrapper}>
                        <Image
                          source={{ uri: answerImageUrl }}
                          style={styles.answerImage}
                          resizeMode="contain"
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleNext}
            disabled={!hasSelectedAnswer || isSavingAnswer || isFinishing}
            style={[
              styles.nextButtonWrapper,
              (!hasSelectedAnswer || isSavingAnswer || isFinishing) && styles.nextButtonDisabled,
            ]}
          >
            <LinearGradient
              colors={
                hasSelectedAnswer
                  ? ["#7B5CFF", "#263CFF"]
                  : ["#C9C9D8", "#A7A7B8"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.nextButton}
            >
              {isSavingAnswer || isFinishing ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.nextButtonText}>
                  {currentIndex >= questions.length - 1 ? "Finish Paper" : "Next Question"}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.helpText}>
            You must answer this question before moving to the next question.
          </Text>
        </ScrollView>
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
  },

  topTimerCard: {
    marginHorizontal: 14,
    marginTop: 10,
    marginBottom: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    shadowColor: "#C8C7DE",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.24,
    shadowRadius: 15,
    elevation: 6,
  },

  titleBlock: {
    flex: 1,
    paddingRight: 12,
  },

  paperTitle: {
    color: "#101943",
    fontSize: 17,
    fontWeight: "900",
  },

  progressText: {
    color: "#8A8DA5",
    fontSize: 12.5,
    fontWeight: "700",
    marginTop: 4,
  },

  timerPill: {
    minWidth: 92,
    borderRadius: 16,
    backgroundColor: "#EEF0FF",
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: "center",
  },

  timerLabel: {
    color: "#7B5CFF",
    fontSize: 11,
    fontWeight: "800",
  },

  timerValue: {
    color: "#101943",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 1,
  },

  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 40,
  },

  questionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,

    shadowColor: "#C8C7DE",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 6,
  },

  questionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  questionNumber: {
    color: "#3151F5",
    fontSize: 15,
    fontWeight: "900",
  },

  noSkipBadge: {
    backgroundColor: "#FFF0C7",
    borderRadius: 50,
    paddingVertical: 5,
    paddingHorizontal: 11,
  },

  noSkipText: {
    color: "#A06200",
    fontSize: 11,
    fontWeight: "900",
  },

  lessonText: {
    color: "#8A8DA5",
    fontSize: 12.5,
    fontWeight: "700",
    marginBottom: 8,
  },

  questionText: {
    color: "#101943",
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 25,
    marginBottom: 18,
  },

  // ✅ Question image styles — capped at 220 so a large upload never
  // dominates the card; width fills the card and height stays proportional.
  questionImageWrapper: {
    width: "100%",
    maxHeight: 220,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#F3F3FA",
    marginBottom: 18,
  },

  questionImage: {
    width: "100%",
    height: 220,
  },

  answerList: {
    gap: 12,
  },

  answerButton: {
    backgroundColor: "#F8F8FF",
    borderWidth: 1.5,
    borderColor: "#ECECF5",
    borderRadius: 18,
    paddingVertical: 13,
    paddingHorizontal: 12,
    // ✅ Column now, so an answer image (when present) can sit BELOW the
    // text row instead of squeezed beside it as a tiny thumbnail.
    flexDirection: "column",
  },

  answerButtonSelected: {
    backgroundColor: "#EEF0FF",
    borderColor: "#7B5CFF",
  },

  // ✅ Top row keeps the circle + answer text laid out exactly as before.
  answerTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  answerIndexCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  answerIndexCircleSelected: {
    backgroundColor: "#7B5CFF",
  },

  answerIndexText: {
    color: "#7B5CFF",
    fontSize: 13,
    fontWeight: "900",
  },

  answerIndexTextSelected: {
    color: "#FFFFFF",
  },

  answerText: {
    flex: 1,
    color: "#4B4F68",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 21,
  },

  answerTextSelected: {
    color: "#101943",
  },

  // ✅ Answer image wrapper — full button width, normal viewable size
  // (same cap style as the question image), positioned below the text.
  answerImageWrapper: {
    width: "100%",
    maxHeight: 160,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#F3F3FA",
    marginTop: 12,
  },

  answerImage: {
    width: "100%",
    height: 160,
  },

  nextButtonWrapper: {
    marginTop: 22,
    borderRadius: 50,
    overflow: "hidden",
  },

  nextButtonDisabled: {
    opacity: 0.75,
  },

  nextButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 50,
  },

  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },

  helpText: {
    textAlign: "center",
    marginTop: 12,
    color: "#8A8DA5",
    fontSize: 12.5,
    fontWeight: "700",
  },

  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#F8F7FF",
  },

  loadingText: {
    marginTop: 12,
    color: "#101943",
    fontSize: 15,
    fontWeight: "800",
  },

  errorTitle: {
    color: "#101943",
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 8,
  },

  errorText: {
    color: "#8A8DA5",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 20,
  },
});