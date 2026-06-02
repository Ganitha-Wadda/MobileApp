import React, { useState } from "react";
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

export default function ReviewPage({ navigation }) {
  const [showAnswer, setShowAnswer] = useState(true);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F7FF" />

      <View style={styles.mainContainer}>
        {/* Background decoration */}
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
          {/* Top result card */}
          <View style={styles.resultCard}>
            <View style={[styles.smallDot, styles.resultDotOne]} />
            <View style={[styles.smallDot, styles.resultDotTwo]} />
            <View style={[styles.smallDot, styles.resultDotThree]} />
            <View style={[styles.smallDot, styles.resultDotFour]} />

            <Text style={[styles.resultStar, styles.resultStarLeft]}>✦</Text>
            <Text style={[styles.resultStar, styles.resultStarRight]}>✦</Text>

            <Text style={styles.percentageText}>100%</Text>
            <Text style={styles.resultSubtitle}>Excellent Result</Text>

            <View style={styles.badgePill}>
              <View style={styles.badgeCircle}>
                <Text style={styles.badgeIcon}>🏅</Text>
              </View>
              <Text style={styles.badgeText}>Gold Badge</Text>
            </View>
          </View>

          {/* Section title */}
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionStar}>✦</Text>
            <Text style={styles.sectionTitle}>Today’s Lesson Result</Text>
            <View style={styles.titleDotsWrapper}>
              <View style={styles.titleDotPurple} />
              <View style={styles.titleDotPink} />
            </View>
          </View>

          {/* Question card */}
          <View style={styles.questionCard}>
            <View style={styles.questionTopRow}>
              <Text style={styles.questionTitle}>Question - 1</Text>

              <View style={styles.completedBadge}>
                <View style={styles.completedCircle}>
                  <Text style={styles.completedTick}>✓</Text>
                </View>
                <Text style={styles.completedText}>Completed</Text>
              </View>
            </View>

            <Text style={styles.questionText}>i. 2 x 3 ?</Text>

            {/* Hide answer dropdown */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.hideAnswerBox}
              onPress={() => setShowAnswer(!showAnswer)}
            >
              <Text style={styles.hideAnswerText}>
                {showAnswer ? "Hide answer" : "Show answer"}
              </Text>
              <Text style={styles.chevron}>{showAnswer ? "⌄" : "›"}</Text>
            </TouchableOpacity>

            {showAnswer && (
              <View style={styles.answerBox}>
                <Text style={styles.yourAnswerLabel}>Your answer</Text>
                <Text style={styles.yourAnswerText}>2</Text>

                <View style={styles.answerDivider} />

                <Text style={styles.correctAnswerLabel}>Correct answer</Text>
                <Text style={styles.correctAnswerText}>2</Text>
              </View>
            )}

            <View style={styles.buttonRow}>
              <TouchableOpacity activeOpacity={0.85} style={styles.logicButton}>
                <Text style={styles.logicButtonText}>Explain Logic</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.videoButtonWrapper}
              >
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
        </ScrollView>

        {/* Bottom flowers / cloud style decoration */}
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
    paddingBottom: 100,
  },

  resultCard: {
    width: "100%",
    minHeight: 180,
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
    marginBottom: 16,
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

  questionCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,

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
    marginBottom: 42,
  },

  questionTitle: {
    fontSize: 23,
    fontWeight: "900",
    color: "#09091A",
    letterSpacing: 0.3,
  },

  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#18AF4B",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
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
    color: "#18AF4B",
    lineHeight: 14,
  },

  completedText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  questionText: {
    fontSize: 24,
    fontWeight: "900",
    color: "#050505",
    marginBottom: 24,
    letterSpacing: 0.5,
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