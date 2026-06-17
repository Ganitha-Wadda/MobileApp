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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const OPTION_LABELS = ["i.", "ii.", "iii.", "iv.", "v.", "vi."];

const toArrayText = (value) =>
  Array.isArray(value) && value.length > 0 ? value.join(", ") : "—";

const getBadgeInfo = (percentage) => {
  if (percentage >= 90) return { icon: "🏅", text: "Gold Badge", subtitle: "Excellent Result" };
  if (percentage >= 70) return { icon: "🥈", text: "Silver Badge", subtitle: "Great Result" };
  if (percentage >= 50) return { icon: "🥉", text: "Bronze Badge", subtitle: "Good Result" };
  return { icon: "⭐", text: "Keep Practicing", subtitle: "Practice Result" };
};

const normalizeReviewAnswers = (params) => {
  if (Array.isArray(params?.answers)) return params.answers;
  if (Array.isArray(params?.reviewAnswers)) return params.reviewAnswers;
  return [];
};

const ReviewQuestionCard = ({ item, index, showAnswer, onToggleAnswer }) => {
  const statusText = item.isCorrect ? "Correct" : "Wrong";

  return (
    <View style={styles.questionCard}>
      <View style={styles.questionTopRow}>
        <Text style={styles.questionTitle}>
          Question - {item.questionNumber || index + 1}
        </Text>

        <View
          style={[
            styles.completedBadge,
            item.isCorrect ? styles.correctBadge : styles.wrongBadge,
          ]}
        >
          <View style={styles.completedCircle}>
            <Text
              style={[
                styles.completedTick,
                item.isCorrect ? styles.correctTick : styles.wrongTick,
              ]}
            >
              {item.isCorrect ? "✓" : "×"}
            </Text>
          </View>
          <Text style={styles.completedText}>{statusText}</Text>
        </View>
      </View>

      {!!item.lessonName && <Text style={styles.lessonNameText}>{item.lessonName}</Text>}
      <Text style={styles.questionText}>{item.question || "—"}</Text>

      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.hideAnswerBox}
        onPress={onToggleAnswer}
      >
        <Text style={styles.hideAnswerText}>
          {showAnswer ? "Hide answer" : "Show answer"}
        </Text>
        <Text style={styles.chevron}>{showAnswer ? "⌄" : "›"}</Text>
      </TouchableOpacity>

      {showAnswer && (
        <View style={styles.answerBox}>
          <Text style={styles.yourAnswerLabel}>Your answer</Text>
          <Text style={styles.yourAnswerText}>{toArrayText(item.selectedAnswers)}</Text>

          <View style={styles.answerDivider} />

          <Text style={styles.correctAnswerLabel}>Correct answer</Text>
          <Text style={styles.correctAnswerText}>{toArrayText(item.correctAnswers)}</Text>

          {Array.isArray(item.answers) && item.answers.length > 0 && (
            <>
              <View style={styles.answerDivider} />
              <Text style={styles.allAnswersLabel}>All answers</Text>
              {item.answers.map((answer, answerIndex) => {
                const isSelected = item.selectedIndexes?.includes(answerIndex);
                const isCorrect = item.correctAnswerIndexes?.includes(answerIndex);

                return (
                  <Text
                    key={`${item.questionId || index}-${answerIndex}`}
                    style={[
                      styles.allAnswerText,
                      isCorrect && styles.allAnswerCorrect,
                      isSelected && !isCorrect && styles.allAnswerWrong,
                    ]}
                  >
                    {OPTION_LABELS[answerIndex] || `${answerIndex + 1}.`} {answer}
                  </Text>
                );
              })}
            </>
          )}

          {!!item.explanationText && (
            <>
              <View style={styles.answerDivider} />
              <Text style={styles.logicLabel}>Explanation</Text>
              <Text style={styles.logicText}>{item.explanationText}</Text>
            </>
          )}
        </View>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity activeOpacity={0.85} style={styles.logicButton}>
          <Text style={styles.logicButtonText}>Explain Logic</Text>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.85} style={styles.videoButtonWrapper}>
          <LinearGradient
            colors={["#7B5CFF", "#263CFF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.videoButton}
          >
            <Text style={styles.videoButtonText}>Explain video</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function ReviewPage({ navigation, route }) {
  const [visibleAnswers, setVisibleAnswers] = useState({});
  const params = route?.params || {};

  const answers = useMemo(() => normalizeReviewAnswers(params), [params]);
  const totalQuestions = Number(params.totalQuestions || answers.length || 0);
  const correctCount = Number(
    params.correctCount ?? answers.filter((item) => item?.isCorrect).length
  );
  const percentage = Number(
    params.percentage ??
      (totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0)
  );
  const badge = getBadgeInfo(percentage);
  const paperTitle = params.paperTitle || params.paper?.paperTitle || params.paper?.paperName || "Paper";

  const isAnswerVisible = (index) => visibleAnswers[index] !== false;
  const toggleAnswer = (index) => {
    setVisibleAnswers((prev) => ({ ...prev, [index]: !isAnswerVisible(index) }));
  };

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
              {correctCount} correct / {totalQuestions} questions
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
              {paperTitle} Result
            </Text>
            <View style={styles.titleDotsWrapper}>
              <View style={styles.titleDotPurple} />
              <View style={styles.titleDotPink} />
            </View>
          </View>

          {answers.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No review answers</Text>
              <Text style={styles.emptyText}>
                Please complete a paper first, then the review will show here.
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
              />
            ))
          )}

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.doneButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.doneButtonText}>Done</Text>
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
    marginBottom: 14,
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
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: "center",

    shadowColor: "#C8C7DE",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 6,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#101943",
  },

  emptyText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8A8DA5",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 19,
  },

  questionCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
    marginBottom: 16,

    shadowColor: "#C8C7DE",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 6,
  },

  questionTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 10,
  },

  questionTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: "900",
    color: "#09091A",
    letterSpacing: 0.3,
  },

  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  correctBadge: {
    backgroundColor: "#18AF4B",
  },

  wrongBadge: {
    backgroundColor: "#D62637",
  },

  completedCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },

  completedTick: {
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 14,
  },

  correctTick: {
    color: "#18AF4B",
  },

  wrongTick: {
    color: "#D62637",
  },

  completedText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  lessonNameText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#5F6174",
    marginBottom: 8,
  },

  questionText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#050505",
    marginBottom: 20,
    letterSpacing: 0.3,
    lineHeight: 30,
  },

  hideAnswerBox: {
    height: 42,
    borderTopLeftRadius: 11,
    borderTopRightRadius: 11,
    borderWidth: 1,
    borderColor: "#E3E5F3",
    backgroundColor: "#F9FAFF",
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  hideAnswerText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#111111",
  },

  chevron: {
    fontSize: 28,
    fontWeight: "600",
    color: "#0E1742",
    marginTop: -5,
  },

  answerBox: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#ECEEF8",
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 11,
    borderBottomRightRadius: 11,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    marginBottom: 16,
  },

  yourAnswerLabel: {
    fontSize: 15,
    fontWeight: "900",
    color: "#C92333",
    letterSpacing: 0.4,
    marginBottom: 4,
  },

  yourAnswerText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#C92333",
    marginBottom: 14,
  },

  answerDivider: {
    height: 1,
    backgroundColor: "#EEF0F8",
    marginBottom: 14,
  },

  correctAnswerLabel: {
    fontSize: 15,
    fontWeight: "900",
    color: "#166B1B",
    letterSpacing: 0.4,
    marginBottom: 4,
  },

  correctAnswerText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#166B1B",
    marginBottom: 14,
  },

  allAnswersLabel: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0E1742",
    letterSpacing: 0.4,
    marginBottom: 8,
  },

  allAnswerText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#5F6174",
    marginBottom: 5,
    lineHeight: 20,
  },

  allAnswerCorrect: {
    color: "#166B1B",
  },

  allAnswerWrong: {
    color: "#C92333",
  },

  logicLabel: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0E1742",
    letterSpacing: 0.4,
    marginBottom: 4,
  },

  logicText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#5F6174",
    lineHeight: 21,
  },

  buttonRow: {
    flexDirection: "row",
    gap: 10,
  },

  logicButton: {
    flex: 1,
    height: 42,
    borderRadius: 9,
    backgroundColor: "#090E39",
    alignItems: "center",
    justifyContent: "center",
  },

  logicButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  videoButtonWrapper: {
    flex: 1,
  },

  videoButton: {
    height: 42,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },

  videoButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  doneButton: {
    backgroundColor: "#3151F5",
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    marginBottom: 8,
    shadowColor: "#3151F5",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
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
