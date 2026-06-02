import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");

const lessons = [
  { id: 1, title: "1. Chakkre" },
  { id: 2, title: "2. Ganaka ramu" },
  { id: 3, title: "3. Mulika ganitha sankalapa" },
  { id: 4, title: "4. Walakulu sankalpa" },
];

function DotDecor({ style }) {
  return <View style={[styles.dotDecor, style]} />;
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
      <View style={styles.leafLine} />
      <View style={[styles.leafSmallLine, styles.leafSmallLineOne]} />
      <View style={[styles.leafSmallLine, styles.leafSmallLineTwo]} />
    </View>
  );
}

export default function ShortzMenu({ navigation }) {
  const handleViewPress = (lesson) => {
    navigation.navigate("ViewShortLessons", {
      lessonId: lesson.id,
      lessonTitle: lesson.title,
    });
  };

  return (
    <View style={styles.wrapper}>
      <DotDecor style={{ width: 8, height: 8, top: "12%", left: "8%" }} />
      <DotDecor style={{ width: 5, height: 5, top: "18%", left: "14%" }} />
      <DotDecor style={{ width: 7, height: 7, top: "15%", right: "10%" }} />
      <DotDecor style={{ width: 4, height: 4, top: "22%", right: "17%" }} />
      <DotDecor style={{ width: 6, height: 6, bottom: "30%", left: "20%" }} />
      <DotDecor style={{ width: 5, height: 5, bottom: "35%", right: "18%" }} />

      <View style={styles.titleRow}>
        <View style={styles.titleDot} />
        <Text style={styles.spark}>✦</Text>
        <Text style={styles.title}>10 Min lessons</Text>
        <Text style={styles.spark}>✦</Text>
        <View style={styles.titleDot} />
      </View>

      <View style={styles.list}>
        {lessons.map((lesson, index) => (
          <View
            key={lesson.id}
            style={[
              styles.card,
              index === lessons.length - 1 && styles.lastCard,
            ]}
          >
            <View style={styles.numberBox}>
              <Text style={styles.numberText}>{lesson.id}</Text>
            </View>

            <Text style={styles.lessonLabel}>{lesson.title}</Text>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.viewButton}
              onPress={() => handleViewPress(lesson)}
            >
              <Text style={styles.viewButtonText}>View</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <LeafDecor side="left" />
      <LeafDecor side="right" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    minHeight: 620,
    backgroundColor: "#EEEAF8",
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 30,
    position: "relative",
    overflow: "hidden",
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },

  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#1A1760",
    letterSpacing: -0.5,
    marginHorizontal: 10,
  },

  spark: {
    color: "#F5B829",
    fontSize: 26,
    fontWeight: "900",
  },

  titleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#A89CD8",
    marginHorizontal: 6,
  },

  list: {
    width: "100%",
    maxWidth: 420,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#6450C8",
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 16,
    elevation: 3,
  },

  lastCard: {
    marginBottom: 0,
  },

  numberBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#ECE8F8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },

  numberText: {
    fontSize: 20,
    fontWeight: "900",
    color: "#5B4FCF",
  },

  lessonLabel: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: "#1A1760",
    lineHeight: 22,
  },

  viewButton: {
    backgroundColor: "#5B4FCF",
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 26,
    shadowColor: "#5B4FCF",
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 14,
    elevation: 4,
  },

  viewButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },

  dotDecor: {
    position: "absolute",
    borderRadius: 50,
    backgroundColor: "#B0A0E8",
    opacity: 0.45,
  },

  leafWrapper: {
    position: "absolute",
    bottom: -5,
    width: 110,
    height: 130,
    opacity: 0.55,
  },

  leafLeft: {
    left: -10,
  },

  leafRight: {
    right: -10,
  },

  leafFlip: {
    transform: [{ scaleX: -1 }],
  },

  leafMain: {
    position: "absolute",
    left: 18,
    bottom: 8,
    width: 72,
    height: 112,
    backgroundColor: "#8B7FE8",
    borderTopLeftRadius: 55,
    borderTopRightRadius: 35,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 60,
    transform: [{ rotate: "22deg" }],
  },

  leafLine: {
    position: "absolute",
    left: 50,
    bottom: 14,
    width: 2,
    height: 100,
    backgroundColor: "#6E60D0",
    borderRadius: 2,
    transform: [{ rotate: "15deg" }],
  },

  leafSmallLine: {
    position: "absolute",
    width: 2,
    height: 44,
    backgroundColor: "#6E60D0",
    borderRadius: 2,
    opacity: 0.5,
  },

  leafSmallLineOne: {
    left: 58,
    bottom: 38,
    transform: [{ rotate: "-35deg" }],
  },

  leafSmallLineTwo: {
    left: 42,
    bottom: 48,
    transform: [{ rotate: "35deg" }],
  },
});