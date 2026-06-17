import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useGetPaperFullDetailsQuery } from "../app/features/paperApi";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.9;

const OPTION_LABELS = ["i.", "ii.", "iii.", "iv.", "v.", "vi."];

const getPaperId = (value) =>
  value?.id || value?._id || value?.paperId || value?.paper?._id || value?.paper?.id || "";

const getPaperFromResponse = (response, fallbackPaper) => {
  if (response?.data?.paper) return response.data.paper;
  if (response?.data?.data?.paper) return response.data.data.paper;
  if (response?.paper) return response.paper;
  return fallbackPaper || null;
};

const getQuestionsFromResponse = (response) => {
  if (Array.isArray(response?.data?.questions)) return response.data.questions;
  if (Array.isArray(response?.data?.data?.questions)) return response.data.data.questions;
  if (Array.isArray(response?.questions)) return response.questions;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

const getPaperTitle = (paper, paramsTitle) =>
  String(
    paramsTitle ||
      paper?.paperTitle ||
      paper?.paperName ||
      paper?.title ||
      paper?.name ||
      "Paper"
  ).trim();

const getQuestionText = (question) =>
  String(question?.question || question?.questionText || question?.title || "").trim();

const getAnswers = (question) => {
  if (Array.isArray(question?.answers)) return question.answers.map((answer) => String(answer || ""));
  if (Array.isArray(question?.options)) return question.options.map((answer) => String(answer || ""));
  return [];
};

const toSortedNumberArray = (value) =>
  [...new Set((Array.isArray(value) ? value : []).map(Number).filter(Number.isInteger))].sort(
    (a, b) => a - b
  );

const areSameIndexes = (a, b) => {
  const first = toSortedNumberArray(a);
  const second = toSortedNumberArray(b);

  if (first.length !== second.length) return false;
  return first.every((value, index) => value === second[index]);
};

const buildAnswerResult = (question, selectedIndexes) => {
  const answers = getAnswers(question);
  const correctAnswerIndexes = toSortedNumberArray(question?.correctAnswerIndexes);
  const normalizedSelectedIndexes = toSortedNumberArray(selectedIndexes);

  return {
    questionId: question?.id || question?._id || String(question?.questionNumber || ""),
    questionNumber: Number(question?.questionNumber || 0),
    lessonName: question?.lessonName || "",
    question: getQuestionText(question),
    answers,
    selectedIndexes: normalizedSelectedIndexes,
    selectedAnswers: normalizedSelectedIndexes.map((index) => answers[index]).filter(Boolean),
    correctAnswerIndexes,
    correctAnswers: correctAnswerIndexes.map((index) => answers[index]).filter(Boolean),
    isCorrect: areSameIndexes(normalizedSelectedIndexes, correctAnswerIndexes),
    point: Number(question?.point || 0),
    explanationText: question?.explanationText || "",
    explanationVideoUrl: question?.explanationVideoUrl || "",
    imageUrl: question?.imageUrl || "",
  };
};

const StateCard = ({ loading, title, message, onRetry }) => (
  <View style={styles.centerContent}>
    <View style={styles.card}>
      {loading && <ActivityIndicator size="small" color="#6E46F2" />}
      <Text style={styles.stateTitle}>{title}</Text>
      {!!message && <Text style={styles.stateMessage}>{message}</Text>}
      {!!onRetry && (
        <TouchableOpacity activeOpacity={0.85} style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

export default function Paperpage({ navigation, route }) {
  const params = route?.params || {};
  const paramsPaper = params.paper || null;
  const paperId = params.paperId || getPaperId(paramsPaper);

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetPaperFullDetailsQuery(paperId, { skip: !paperId });

  const paper = useMemo(
    () => getPaperFromResponse(data, paramsPaper),
    [data, paramsPaper]
  );

  const questions = useMemo(
    () => getQuestionsFromResponse(data).filter((question) => question?.isActive !== false),
    [data]
  );

  const paperTitle = getPaperTitle(paper, params.paperTitle || params.lessonTitle || params.pastPaperYear);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndexes, setSelectedIndexes] = useState([]);
  const [submittedAnswers, setSubmittedAnswers] = useState([]);

  useEffect(() => {
    setCurrentIndex(0);
    setSelectedIndexes([]);
    setSubmittedAnswers([]);
  }, [paperId]);

  const currentQuestion = questions[currentIndex];
  const currentAnswers = getAnswers(currentQuestion);
  const correctAnswerIndexes = toSortedNumberArray(currentQuestion?.correctAnswerIndexes);
  const isMultipleAnswerQuestion = correctAnswerIndexes.length > 1;
  const isBusy = isLoading || isFetching;
  const canSubmit = !!currentQuestion && selectedIndexes.length > 0;

  const handleSelectAnswer = (index) => {
    if (isMultipleAnswerQuestion) {
      setSelectedIndexes((prev) =>
        prev.includes(index)
          ? prev.filter((item) => item !== index)
          : [...prev, index].sort((a, b) => a - b)
      );
      return;
    }

    setSelectedIndexes([index]);
  };

  const handleSubmit = () => {
    if (!canSubmit) return;

    const answerResult = buildAnswerResult(currentQuestion, selectedIndexes);
    const nextAnswers = [...submittedAnswers, answerResult];
    const isLastQuestion = currentIndex >= questions.length - 1;

    if (!isLastQuestion) {
      setSubmittedAnswers(nextAnswers);
      setCurrentIndex((prev) => prev + 1);
      setSelectedIndexes([]);
      return;
    }

    const correctCount = nextAnswers.filter((item) => item.isCorrect).length;
    const totalQuestions = questions.length;
    const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    navigation.navigate("reviewpage", {
      paperId,
      paperTitle,
      paper,
      questions,
      answers: nextAnswers,
      totalQuestions,
      correctCount,
      percentage,
    });
  };

  const renderContent = () => {
    if (!paperId) {
      return (
        <StateCard
          title="Paper not selected"
          message="Please select a paper from the paper menu again."
        />
      );
    }

    if (isBusy && questions.length === 0) {
      return <StateCard loading title="Loading questions..." />;
    }

    if (error) {
      return (
        <StateCard
          title="Cannot load this paper"
          message={error?.data?.message || error?.error || "Please try again."}
          onRetry={refetch}
        />
      );
    }

    if (questions.length === 0) {
      return (
        <StateCard
          title="No questions found"
          message="This paper has no active questions yet."
          onRetry={refetch}
        />
      );
    }

    return (
      <View style={styles.centerContent}>
        <View style={styles.progressRow}>
          <Text style={styles.progressText}>
            {currentIndex + 1} / {questions.length}
          </Text>
        </View>

        <ScrollView
          style={styles.questionScroll}
          contentContainerStyle={styles.questionScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <View style={styles.questionBadge}>
              <Text style={styles.questionBadgeText}>
                Question {currentQuestion?.questionNumber || currentIndex + 1}
              </Text>
            </View>

            {!!currentQuestion?.lessonName && (
              <Text style={styles.lessonNameText} numberOfLines={2}>
                {currentQuestion.lessonName}
              </Text>
            )}

            {!!currentQuestion?.imageUrl && (
              <Image
                source={{ uri: currentQuestion.imageUrl }}
                style={styles.questionImage}
                resizeMode="contain"
              />
            )}

            <Text style={styles.questionText}>{getQuestionText(currentQuestion)}</Text>

            <View style={styles.optionsWrapper}>
              {currentAnswers.map((answer, index) => {
                const selected = selectedIndexes.includes(index);

                return (
                  <TouchableOpacity
                    key={`${currentQuestion?.id || currentQuestion?._id || currentIndex}-${index}`}
                    activeOpacity={0.85}
                    style={[styles.optionBox, selected && styles.optionBoxSelected]}
                    onPress={() => handleSelectAnswer(index)}
                  >
                    <Text style={[styles.optionNumber, selected && styles.optionNumberSelected]}>
                      {OPTION_LABELS[index] || `${index + 1}.`}
                    </Text>
                    <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                      {answer}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {isMultipleAnswerQuestion && (
              <Text style={styles.multiAnswerHint}>Select all correct answers.</Text>
            )}

            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.submitWrapper, !canSubmit && styles.submitWrapperDisabled]}
              onPress={handleSubmit}
              disabled={!canSubmit}
            >
              <LinearGradient
                colors={canSubmit ? ["#8D4DFF", "#233BFF"] : ["#C8C8D8", "#AAAABC"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.submitButton}
              >
                <Text style={styles.submitText}>
                  {currentIndex >= questions.length - 1 ? "Finish" : "Next"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F8FF" />

      <View style={styles.container}>
        <Text style={[styles.star, styles.starOne]}>★</Text>
        <Text style={[styles.star, styles.starTwo]}>★</Text>
        <Text style={[styles.star, styles.starThree]}>★</Text>
        <Text style={[styles.star, styles.starFour]}>★</Text>

        <View style={[styles.dot, styles.dotOne]} />
        <View style={[styles.dot, styles.dotTwo]} />
        <View style={[styles.dot, styles.dotThree]} />
        <View style={[styles.dot, styles.dotFour]} />
        <View style={[styles.dot, styles.dotFive]} />
        <View style={[styles.dot, styles.dotSix]} />
        <View style={[styles.dot, styles.dotSeven]} />

        {renderContent()}

        <View style={styles.cloudArea}>
          <View style={[styles.cloudCircle, styles.cloudOne]} />
          <View style={[styles.cloudCircle, styles.cloudTwo]} />
          <View style={[styles.cloudCircle, styles.cloudThree]} />
          <View style={[styles.cloudCircle, styles.cloudFour]} />
          <View style={[styles.cloudCircle, styles.cloudFive]} />
          <View style={[styles.cloudCircle, styles.cloudSix]} />
          <View style={[styles.cloudCircle, styles.cloudSeven]} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F8FF",
  },

  container: {
    flex: 1,
    backgroundColor: "#F8F8FF",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    paddingTop: Platform.OS === "android" ? 10 : 0,
    paddingBottom: 25,
  },

  centerContent: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    flex: 1,
  },

  progressRow: {
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 22,
    shadowColor: "#C9CAD8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },

  progressText: {
    color: "#4D2DDE",
    fontSize: 14,
    fontWeight: "900",
  },

  questionScroll: {
    width: "100%",
    maxHeight: "88%",
  },

  questionScrollContent: {
    alignItems: "center",
    paddingBottom: 30,
  },

  title: {
    fontSize: 25,
    fontWeight: "900",
    color: "#101943",
    marginBottom: 14,
    letterSpacing: 0.2,
  },

  card: {
    width: CARD_WIDTH,
    minHeight: 500,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 24,

    shadowColor: "#C9CAD8",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.32,
    shadowRadius: 18,
    elevation: 8,
  },

  stateTitle: {
    color: "#101943",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 12,
    textAlign: "center",
  },

  stateMessage: {
    color: "#6D6E88",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    marginTop: 8,
    textAlign: "center",
  },

  retryButton: {
    backgroundColor: "#4D2DDE",
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginTop: 18,
  },

  retryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  questionBadge: {
    backgroundColor: "#F1ECFF",
    paddingHorizontal: 33,
    paddingVertical: 8,
    borderRadius: 18,
    marginBottom: 14,
  },

  questionBadgeText: {
    color: "#4D2DDE",
    fontSize: 13,
    fontWeight: "800",
  },

  lessonNameText: {
    color: "#6D62A8",
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 10,
  },

  questionImage: {
    width: "100%",
    height: 170,
    marginBottom: 14,
    borderRadius: 16,
    backgroundColor: "#F8F8FF",
  },

  questionText: {
    fontSize: 27,
    color: "#060B36",
    fontWeight: "900",
    marginBottom: 18,
    letterSpacing: 0.5,
    textAlign: "center",
    lineHeight: 36,
  },

  optionsWrapper: {
    width: "100%",
    gap: 11,
  },

  optionBox: {
    width: "100%",
    minHeight: 50,
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#EEF0F8",

    shadowColor: "#C7C9D8",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },

  optionBoxSelected: {
    backgroundColor: "#F1ECFF",
    borderColor: "#8D4DFF",
  },

  optionNumber: {
    fontSize: 18,
    fontWeight: "900",
    color: "#6E46F2",
    width: 36,
  },

  optionNumberSelected: {
    color: "#233BFF",
  },

  optionText: {
    flex: 1,
    fontSize: 19,
    fontWeight: "900",
    color: "#0C123D",
    lineHeight: 24,
  },

  optionTextSelected: {
    color: "#233BFF",
  },

  multiAnswerHint: {
    alignSelf: "flex-start",
    color: "#6D6E88",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 10,
  },

  submitWrapper: {
    marginTop: 18,
  },

  submitWrapperDisabled: {
    opacity: 0.75,
  },

  submitButton: {
    width: 150,
    height: 43,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#4338FF",
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },

  submitText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },

  star: {
    position: "absolute",
    fontWeight: "900",
    zIndex: 1,
  },

  starOne: {
    top: 20,
    left: 57,
    fontSize: 23,
    color: "#FFD35A",
  },

  starTwo: {
    top: 18,
    right: 78,
    fontSize: 25,
    color: "#8B5CF6",
  },

  starThree: {
    top: 77,
    left: 84,
    fontSize: 16,
    color: "#9B70FF",
  },

  starFour: {
    bottom: 35,
    left: 87,
    fontSize: 17,
    color: "#FFC8D2",
  },

  dot: {
    position: "absolute",
    borderRadius: 50,
    zIndex: 1,
  },

  dotOne: {
    top: 25,
    left: 39,
    width: 4,
    height: 4,
    backgroundColor: "#55B7FF",
  },

  dotTwo: {
    top: 31,
    right: 50,
    width: 4,
    height: 4,
    backgroundColor: "#FFD75D",
  },

  dotThree: {
    top: 84,
    left: 70,
    width: 4,
    height: 4,
    backgroundColor: "#67BFFF",
  },

  dotFour: {
    top: 83,
    right: 62,
    width: 4,
    height: 4,
    backgroundColor: "#67BFFF",
  },

  dotFive: {
    right: 9,
    bottom: 109,
    width: 6,
    height: 6,
    backgroundColor: "#C99BFF",
  },

  dotSix: {
    bottom: 27,
    left: 56,
    width: 5,
    height: 5,
    backgroundColor: "#FFD46A",
  },

  dotSeven: {
    bottom: 18,
    right: 82,
    width: 5,
    height: 5,
    backgroundColor: "#72C4FF",
  },

  cloudArea: {
    position: "absolute",
    width: "100%",
    height: 85,
    bottom: -20,
    left: 0,
    right: 0,
    zIndex: 0,
  },

  cloudCircle: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    borderRadius: 100,
  },

  cloudOne: {
    width: 80,
    height: 80,
    left: -28,
    bottom: -13,
  },

  cloudTwo: {
    width: 70,
    height: 70,
    left: 22,
    bottom: -9,
  },

  cloudThree: {
    width: 95,
    height: 95,
    left: 78,
    bottom: -35,
  },

  cloudFour: {
    width: 75,
    height: 75,
    left: 150,
    bottom: -24,
  },

  cloudFive: {
    width: 90,
    height: 90,
    right: 52,
    bottom: -34,
  },

  cloudSix: {
    width: 75,
    height: 75,
    right: 9,
    bottom: -16,
  },

  cloudSeven: {
    width: 100,
    height: 100,
    right: -48,
    bottom: -18,
  },
});
