import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import useT from "../app/i18n/useT";

const { width, height } = Dimensions.get("window");

const isSmallScreen = width < 380;

function AnimatedCloud({ style, scale = 1, delay = 0, distance = 18 }) {
  const move = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(move, {
          toValue: distance,
          duration: 2600,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(move, {
          toValue: 0,
          duration: 2600,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: -6,
          duration: 1800,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [move, float, delay, distance]);

  return (
    <Animated.View
      style={[
        styles.cloud,
        style,
        {
          transform: [
            { translateX: move },
            { translateY: float },
            { scale },
          ],
        },
      ]}
    >
      <View style={styles.cloudCircle1} />
      <View style={styles.cloudCircle2} />
      <View style={styles.cloudCircle3} />
      <View style={styles.cloudBase} />
    </Animated.View>
  );
}

function LeafDecor({ side = "left" }) {
  return (
    <View
      pointerEvents="none"
      style={[
        styles.leafWrapper,
        side === "left" ? styles.leafLeft : styles.leafRight,
        side === "right" && styles.leafFlip,
      ]}
    >
      <View style={styles.leafMain} />
      <View style={styles.leafSecond} />
      <View style={styles.leafThird} />
    </View>
  );
}

const Star = ({ size = 16, style }) => {
  return (
    <Text
      style={[
        {
          fontSize: size,
          color: "#FFD740",
          position: "absolute",
          fontWeight: "900",
        },
        style,
      ]}
    >
      ★
    </Text>
  );
};

const ArrowButton = ({ title, onPress }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.viewButton}
      onPress={onPress}
    >
      <Text style={styles.viewButtonText}>{title}</Text>

      <View style={styles.arrowCircle}>
        <Text style={styles.arrowText}>→</Text>
      </View>
    </TouchableOpacity>
  );
};

const ResultIllustration = () => {
  return (
    <View style={styles.illustrationBox}>
      <View style={styles.reportPaper}>
        <View style={styles.paperFold} />

        <Text style={styles.reportTitle}>Report Card</Text>

        <View style={styles.gradeCircle}>
          <Text style={styles.gradeText}>A+</Text>
        </View>

        <View style={styles.reportLineRow}>
          <View style={styles.checkBox}>
            <Text style={styles.smallCheck}>✓</Text>
          </View>
          <View style={styles.reportLine} />
        </View>

        <View style={styles.reportLineRow}>
          <View style={styles.checkBox}>
            <Text style={styles.smallCheck}>✓</Text>
          </View>
          <View style={styles.reportLine} />
        </View>

        <View style={styles.reportLineRow}>
          <View style={styles.checkBox}>
            <Text style={styles.smallCheck}>✓</Text>
          </View>
          <View style={styles.reportLine} />
        </View>
      </View>

      <View style={styles.booksStack}>
        <View style={styles.bookOne} />
        <View style={styles.bookTwo} />
      </View>

      <View style={styles.badgeStarBox}>
        <Text style={styles.badgeStar}>★</Text>

        <View style={styles.ribbonRow}>
          <View style={styles.ribbon} />
          <View style={styles.ribbon} />
        </View>
      </View>
    </View>
  );
};

const AttendanceIllustration = () => {
  return (
    <View style={styles.illustrationBox}>
      <View style={styles.bigCalendar}>
        <View style={styles.bigCalendarHeader}>
          <View style={styles.ring} />
          <View style={styles.ring} />
        </View>

        <View style={styles.bigCalendarBody}>
          <View style={styles.calCell}>
            <Text style={styles.calText}>✓</Text>
          </View>

          <View style={styles.calCell}>
            <Text style={styles.calTextLight}>✓</Text>
          </View>

          <View style={styles.calCell}>
            <Text style={styles.calText}>✓</Text>
          </View>

          <View style={styles.calCell}>
            <Text style={styles.starCell}>★</Text>
          </View>

          <View style={styles.calCell}>
            <Text style={styles.calTextLight}>✓</Text>
          </View>

          <View style={styles.calCell}>
            <Text style={styles.calText}>✓</Text>
          </View>

          <View style={styles.calCell}>
            <Text style={styles.starCell}>★</Text>
          </View>

          <View style={styles.calCell}>
            <Text style={styles.calTextLight}>✓</Text>
          </View>
        </View>
      </View>

      <View style={styles.greenCheckBadge}>
        <Text style={styles.greenCheckText}>✓</Text>
      </View>
    </View>
  );
};

export default function ParentPage({ navigation }) {
  const { t } = useT();

  return (
    <LinearGradient
      colors={["#FAF9FF", "#F3F0FF", "#ECE8FF"]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAF9FF" />

        <View style={styles.root}>
          <Text style={[styles.sparkSmall, { top: 36, left: "18%" }]}>•</Text>
          <Text style={[styles.spark, { top: 34, left: "22%" }]}>✦</Text>
          <Text style={[styles.spark, { top: 34, right: "21%" }]}>✦</Text>
          <Text style={[styles.sparkSmall, { top: 31, right: "16%" }]}>•</Text>

          <AnimatedCloud style={{ top: 92, left: -18 }} scale={0.85} delay={0} />
          <AnimatedCloud style={{ top: 145, right: 20 }} scale={0.65} delay={300} />
          <AnimatedCloud style={{ top: 235, left: 35 }} scale={0.5} delay={600} />
          <AnimatedCloud style={{ top: 315, right: -8 }} scale={0.72} delay={900} />
          <AnimatedCloud style={{ bottom: 130, left: 32 }} scale={0.78} delay={1200} />
          <AnimatedCloud style={{ bottom: 105, right: 32 }} scale={0.68} delay={1500} />
          <AnimatedCloud style={{ bottom: 65, left: -8 }} scale={0.5} delay={1800} />
          <AnimatedCloud style={{ bottom: 42, right: -2 }} scale={0.55} delay={2100} />

          <View style={styles.mainWrapper}>
            <View style={styles.titleArea}>
              <Text style={styles.pageTitle}>{t("parentDashboard")}</Text>
            </View>

            <View style={styles.cardsArea}>
              <TouchableOpacity
                activeOpacity={0.95}
                style={[styles.card, styles.resultCard]}
                onPress={() => navigation.navigate("result")}
              >
                <Star size={18} style={{ top: 16, left: "38%" }} />
                <Star size={11} style={{ top: 13, right: "28%", opacity: 0.7 }} />
                <Star size={15} style={{ top: 58, right: 30 }} />

                <ResultIllustration />

                <View style={styles.cardContent}>
                  <Text style={styles.cardLabel}>{t("result")}</Text>
                  <Text style={styles.cardSubtitle}>{t("viewAcademicResults")}</Text>

                  <ArrowButton
                    title={t("viewResult")}
                    onPress={() => navigation.navigate("result")}
                  />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.95}
                style={[styles.card, styles.attendanceCard]}
                onPress={() => navigation.navigate("attendance")}
              >
                <Star size={18} style={{ top: 16, left: "42%" }} />
                <Star size={11} style={{ top: 15, right: "25%", opacity: 0.7 }} />
                <Star size={15} style={{ top: 60, right: 30 }} />

                <AttendanceIllustration />

                <View style={styles.cardContent}>
                  <Text style={styles.cardLabel}>{t("attendance")}</Text>
                  <Text style={styles.cardSubtitle}>{t("trackSchoolAttendance")}</Text>

                  <ArrowButton
                    title={t("viewAttendance")}
                    onPress={() => navigation.navigate("attendance")}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.bgCircle, styles.bgCircleLeft]} />
          <View style={[styles.bgCircle, styles.bgCircleRight]} />
          <Text style={[styles.softDot, { bottom: 38, left: "28%" }]}>✦</Text>
          <Text style={[styles.softDot, { bottom: 46, right: "17%" }]}>✦</Text>
          <LeafDecor side="left" />
          <LeafDecor side="right" />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const cardHeight = isSmallScreen ? 190 : 205;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
  },

  root: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },

  mainWrapper: {
    flex: 1,
    width: "100%",
    minHeight: height - 165,
    backgroundColor: "transparent",
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 90,
    zIndex: 5,
  },

  titleArea: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  pageTitle: {
    fontSize: isSmallScreen ? 20 : 22,
    fontWeight: "900",
    color: "#07124A",
    textAlign: "center",
  },

  cardsArea: {
    flex: 1,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    justifyContent: "center",
  },

  card: {
    width: "100%",
    height: cardHeight,
    borderRadius: 22,
    overflow: "hidden",
    position: "relative",
    shadowColor: "#5050B4",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 22,
    elevation: 7,
  },

  resultCard: {
    backgroundColor: "#6D28D9",
    marginBottom: isSmallScreen ? 18 : 22,
  },

  attendanceCard: {
    backgroundColor: "#1565C0",
  },

  illustrationBox: {
    position: "absolute",
    right: 14,
    top: 14,
    width: isSmallScreen ? 118 : 140,
    height: isSmallScreen ? 125 : 145,
    zIndex: 2,
  },

  reportPaper: {
    position: "absolute",
    right: 0,
    top: 0,
    width: isSmallScreen ? 78 : 92,
    height: isSmallScreen ? 104 : 124,
    backgroundColor: "#FFFFFF",
    borderRadius: 9,
    alignItems: "center",
    paddingTop: 9,
    paddingHorizontal: 7,
    shadowColor: "#000",
    shadowOffset: { width: -3, height: 5 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 4,
  },

  paperFold: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 18,
    height: 18,
    backgroundColor: "#E3E4F5",
    borderBottomLeftRadius: 8,
  },

  reportTitle: {
    fontSize: isSmallScreen ? 6.5 : 7.5,
    fontWeight: "900",
    color: "#5C6BC0",
    textTransform: "uppercase",
    marginBottom: 6,
  },

  gradeCircle: {
    width: isSmallScreen ? 32 : 38,
    height: isSmallScreen ? 32 : 38,
    borderRadius: 25,
    borderWidth: 2.3,
    borderColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },

  gradeText: {
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: "900",
    color: "#7C3AED",
  },

  reportLineRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },

  checkBox: {
    width: 11,
    height: 11,
    borderRadius: 3,
    backgroundColor: "#E8F5E9",
    borderWidth: 1,
    borderColor: "#66BB6A",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
  },

  smallCheck: {
    fontSize: 7,
    color: "#43A047",
    fontWeight: "900",
  },

  reportLine: {
    flex: 1,
    height: 5,
    borderRadius: 4,
    backgroundColor: "#E8E8F0",
  },

  booksStack: {
    position: "absolute",
    right: 5,
    bottom: 14,
    zIndex: 3,
    alignItems: "flex-end",
  },

  bookOne: {
    width: isSmallScreen ? 45 : 56,
    height: 11,
    borderRadius: 4,
    backgroundColor: "#7986CB",
    marginBottom: 3,
  },

  bookTwo: {
    width: isSmallScreen ? 52 : 64,
    height: 11,
    borderRadius: 4,
    backgroundColor: "#FFA726",
  },

  badgeStarBox: {
    position: "absolute",
    left: 4,
    bottom: 24,
    alignItems: "center",
    zIndex: 5,
  },

  badgeStar: {
    fontSize: isSmallScreen ? 32 : 38,
    color: "#FFC107",
    fontWeight: "900",
  },

  ribbonRow: {
    flexDirection: "row",
    marginTop: -6,
  },

  ribbon: {
    width: 8,
    height: 12,
    backgroundColor: "#E53935",
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    marginHorizontal: 2,
  },

  bigCalendar: {
    position: "absolute",
    right: 0,
    top: 0,
    width: isSmallScreen ? 100 : 115,
    height: isSmallScreen ? 100 : 115,
    backgroundColor: "#FFFFFF",
    borderRadius: 11,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: -3, height: 5 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 5,
  },

  bigCalendarHeader: {
    height: isSmallScreen ? 22 : 25,
    backgroundColor: "#3949AB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  ring: {
    width: 10,
    height: 14,
    borderWidth: 2.4,
    borderColor: "#90A4AE",
    borderRadius: 7,
    marginHorizontal: 7,
    marginTop: -12,
  },

  bigCalendarBody: {
    flex: 1,
    backgroundColor: "#F0F2FF",
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 6,
  },

  calCell: {
    width: "25%",
    height: "50%",
    padding: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  calText: {
    color: "#43A047",
    fontSize: isSmallScreen ? 10 : 11,
    fontWeight: "900",
    backgroundColor: "#FFFFFF",
    width: "100%",
    height: "100%",
    textAlign: "center",
    textAlignVertical: "center",
    borderRadius: 4,
  },

  calTextLight: {
    color: "#A5D6A7",
    fontSize: isSmallScreen ? 10 : 11,
    fontWeight: "900",
    backgroundColor: "#FFFFFF",
    width: "100%",
    height: "100%",
    textAlign: "center",
    textAlignVertical: "center",
    borderRadius: 4,
  },

  starCell: {
    color: "#FFC107",
    fontSize: isSmallScreen ? 10 : 11,
    fontWeight: "900",
    backgroundColor: "#FFFFFF",
    width: "100%",
    height: "100%",
    textAlign: "center",
    textAlignVertical: "center",
    borderRadius: 4,
  },

  greenCheckBadge: {
    position: "absolute",
    left: 7,
    bottom: 28,
    width: isSmallScreen ? 34 : 40,
    height: isSmallScreen ? 34 : 40,
    borderRadius: 25,
    backgroundColor: "#43A047",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },

  greenCheckText: {
    color: "#FFFFFF",
    fontSize: isSmallScreen ? 19 : 21,
    fontWeight: "900",
  },

  cardContent: {
    position: "absolute",
    left: 20,
    bottom: 18,
    zIndex: 5,
  },

  cardLabel: {
    fontSize: isSmallScreen ? 24 : 28,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 3,
  },

  cardSubtitle: {
    fontSize: isSmallScreen ? 11.5 : 12.5,
    fontWeight: "600",
    color: "rgba(255,255,255,0.85)",
    marginBottom: 12,
  },

  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(20, 30, 100, 0.55)",
    borderRadius: 50,
    paddingVertical: 8,
    paddingLeft: 15,
    paddingRight: 8,
  },

  viewButtonText: {
    color: "#FFFFFF",
    fontSize: isSmallScreen ? 11.5 : 12.5,
    fontWeight: "900",
    marginRight: 8,
  },

  arrowCircle: {
    width: 23,
    height: 23,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  arrowText: {
    color: "#3A3D6B",
    fontSize: 13,
    fontWeight: "900",
  },

  spark: {
    position: "absolute",
    fontSize: 15,
    color: "#FFC84D",
    fontWeight: "900",
    zIndex: 2,
  },

  sparkSmall: {
    position: "absolute",
    fontSize: 18,
    color: "#B9AFF7",
    zIndex: 2,
  },

  softDot: {
    position: "absolute",
    color: "#D6CDFC",
    fontSize: 14,
    zIndex: 2,
  },

  cloud: {
    position: "absolute",
    width: 58,
    height: 30,
    opacity: 0.8,
    zIndex: 1,
  },

  cloudCircle1: {
    position: "absolute",
    left: 4,
    bottom: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },

  cloudCircle2: {
    position: "absolute",
    left: 18,
    bottom: 8,
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
  },

  cloudCircle3: {
    position: "absolute",
    right: 4,
    bottom: 4,
    width: 21,
    height: 21,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
  },

  cloudBase: {
    position: "absolute",
    left: 5,
    right: 4,
    bottom: 3,
    height: 13,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
  },

  bgCircle: {
    position: "absolute",
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: "rgba(214,205,252,0.55)",
    bottom: -20,
    zIndex: 0,
  },

  bgCircleLeft: {
    left: 39,
  },

  bgCircleRight: {
    right: 32,
  },

  leafWrapper: {
    position: "absolute",
    bottom: -8,
    width: 86,
    height: 95,
    zIndex: 2,
  },

  leafLeft: {
    left: -4,
  },

  leafRight: {
    right: -4,
  },

  leafFlip: {
    transform: [{ scaleX: -1 }],
  },

  leafMain: {
    position: "absolute",
    left: 12,
    bottom: 0,
    width: 25,
    height: 65,
    backgroundColor: "#9E94F4",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 35,
    transform: [{ rotate: "28deg" }],
  },

  leafSecond: {
    position: "absolute",
    left: 36,
    bottom: -4,
    width: 22,
    height: 58,
    backgroundColor: "#B7AFFA",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 32,
    transform: [{ rotate: "10deg" }],
  },

  leafThird: {
    position: "absolute",
    left: 2,
    bottom: -5,
    width: 20,
    height: 50,
    backgroundColor: "#8175E8",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 15,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 28,
    transform: [{ rotate: "50deg" }],
  },
});