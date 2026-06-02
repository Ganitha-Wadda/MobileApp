import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import dailyPapersImg from "../assets/dailypapers.png";
import fiveHundredPapersImg from "../assets/500papers.png";
import lessonByLessonImg from "../assets/lessonbylesson.png";
import pastPapersImg from "../assets/pastpapers.png";

const CARD_COLORS = ["#FF4757", "#FF6348", "#1E90FF", "#6C5CE7"];

const PAPERS = [
  {
    id: "daily",
    label: "Daily papers",
    image: dailyPapersImg,
    route: "DailyPapers",
  },
  {
    id: "500",
    label: "500 papers",
    image: fiveHundredPapersImg,
    route: "FiveHundredPapers",
  },
  {
    id: "lesson",
    label: "Lesson By Lesson",
    image: lessonByLessonImg,
    route: "LessonByLesson",
  },
  {
    id: "past",
    label: "Past papers",
    image: pastPapersImg,
    route: "PastPaper",
  },
];

const H_PAD = 14;
const GAP = 10;
const MAX_LAYOUT_W = 480;

export default function PaperGrid() {
  const navigation = useNavigation();
  const { width: winWidth } = useWindowDimensions();

  const layoutWidth =
    Platform.OS === "web" ? Math.min(winWidth, MAX_LAYOUT_W) : winWidth;

  const cardWidth = (layoutWidth - H_PAD * 2 - GAP) / 2;
  const cardHeight = Math.min(cardWidth * 0.78, 120);
  const imgSize = Math.min(cardHeight * 0.42, 46);

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.inner,
          {
            maxWidth: Platform.OS === "web" ? MAX_LAYOUT_W : undefined,
          },
        ]}
      >
        <Text style={styles.sectionTitle}>Papers</Text>

        <View style={styles.grid}>
          {PAPERS.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.card,
                {
                  width: cardWidth,
                  height: cardHeight,
                  backgroundColor: CARD_COLORS[index],
                },
              ]}
              onPress={() => navigation.navigate(item.route)}
              activeOpacity={0.82}
            >
              <View
                style={[
                  styles.circle,
                  {
                    width: cardWidth * 0.6,
                    height: cardWidth * 0.6,
                    borderRadius: cardWidth * 0.3,
                  },
                ]}
              />

              <Image
                source={item.image}
                style={{ width: imgSize, height: imgSize }}
                resizeMode="contain"
              />

              <Text
                style={[styles.cardLabel, { maxWidth: cardWidth - 16 }]}
                numberOfLines={2}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    backgroundColor: "#6764FF",
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 0,
  },

  inner: {
    width: "100%",
    paddingHorizontal: H_PAD,
    alignSelf: "center",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 10,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: GAP,
    overflow: "hidden",
    gap: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },

  circle: {
    position: "absolute",
    bottom: -12,
    right: -12,
    backgroundColor: "rgba(0,0,0,0.12)",
  },

  cardLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 17,
    zIndex: 2,
    ...Platform.select({
      web: {
        userSelect: "none",
        WebkitFontSmoothing: "antialiased",
      },
    }),
  },
});