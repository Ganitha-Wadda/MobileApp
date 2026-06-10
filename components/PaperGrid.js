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
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Audio } from "expo-av";

import dailyPapersImg from "../assets/dailypapers.png";
import fiveHundredPapersImg from "../assets/500papers.png";
import lessonByLessonImg from "../assets/lessonbylesson.png";
import pastPapersImg from "../assets/pastpapers.png";

import clickSound from "../assets/click4.mp3";

const CARD_COLORS = ["#FF4757", "#C748E8", "#1E90FF", "#7B68EE"];

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

const H_PAD = 16;
const GAP = 12;
const MAX_LAYOUT_W = 500;

export default function PaperGrid() {
  const navigation = useNavigation();
  const { width: winWidth } = useWindowDimensions();

  const layoutWidth =
    Platform.OS === "web" ? Math.min(winWidth, MAX_LAYOUT_W) : winWidth;

  const cardWidth = (layoutWidth - H_PAD * 2 - GAP) / 2;
  const cardHeight = Math.min(cardWidth * 0.85, 140);
  const imgSize = Math.min(cardHeight * 0.45, 50);

  const playClickSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(clickSound);
      await sound.playAsync();

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log("Sound play error:", error);
    }
  };

  const handleCardPress = async (route) => {
    await playClickSound();
    navigation.navigate(route);
  };

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
              onPress={() => handleCardPress(item.route)}
              activeOpacity={0.75}
            >
              <View
                style={[
                  styles.circle,
                  {
                    width: cardWidth * 0.65,
                    height: cardWidth * 0.65,
                    borderRadius: cardWidth * 0.325,
                  },
                ]}
              />

              <View style={styles.starContainer}>
                <MaterialCommunityIcons
                  name="star"
                  size={24}
                  color="rgba(255, 255, 255, 0.4)"
                />
              </View>

              <Image
                source={item.image}
                style={{ width: imgSize, height: imgSize }}
                resizeMode="contain"
              />

              <Text
                style={[styles.cardLabel, { maxWidth: cardWidth - 20 }]}
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
    backgroundColor: "#5024ce",
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 8,
  },

  inner: {
    width: "100%",
    paddingHorizontal: H_PAD,
    alignSelf: "center",
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 16,
    letterSpacing: 0.5,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: GAP,
    overflow: "hidden",
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    position: "relative",
  },

  circle: {
    position: "absolute",
    bottom: -18,
    right: -18,
    backgroundColor: "rgba(0, 0, 0, 0.15)",
  },

  starContainer: {
    position: "absolute",
    top: 12,
    left: 12,
    zIndex: 10,
  },

  cardLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 18,
    zIndex: 2,
    ...Platform.select({
      web: {
        userSelect: "none",
        WebkitFontSmoothing: "antialiased",
      },
    }),
  },
});