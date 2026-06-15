import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  StatusBar,
} from "react-native";
import { Audio } from "expo-av";
import useT from "../app/i18n/useT";

const { width } = Dimensions.get("window");

const clickSound = require("../assets/clip5.mp3");

const years = [
  {
    year: "2015",
    subtitle: "Build your skills step by step!",
    emoji: "📋",
    starColor: "#A78BFA",
    starSize: 18,
  },
  {
    year: "2016",
    subtitle: "Challenge yourself and learn!",
    emoji: "📚",
    starColor: "#FBBF24",
    starSize: 20,
  },
  {
    year: "2017",
    subtitle: "Think smart, score better!",
    emoji: "💡",
    starColor: "#A78BFA",
    starSize: 18,
  },
  {
    year: "2018",
    subtitle: "You've got this! Keep going!",
    emoji: "🏆",
    starColor: "#F472B6",
    starSize: 20,
  },
];

const FloatingDots = () => (
  <>
    <View style={[styles.dot, { top: 18, left: 22, backgroundColor: "#F472B6", width: 9, height: 9, borderRadius: 9 }]} />
    <View style={[styles.dot, { top: 30, right: 30, backgroundColor: "#A78BFA", width: 8, height: 8, borderRadius: 8 }]} />
    <View style={[styles.dot, { top: 210, left: 12, backgroundColor: "#60A5FA", width: 7, height: 7, borderRadius: 7 }]} />
    <View style={[styles.dot, { top: 310, right: 18, backgroundColor: "#FBBF24", width: 10, height: 10, borderRadius: 10 }]} />
    <View style={[styles.dot, { top: 430, left: 20, backgroundColor: "#A78BFA", width: 8, height: 8, borderRadius: 8 }]} />
    <View style={[styles.dot, { top: 530, right: 14, backgroundColor: "#60A5FA", width: 7, height: 7, borderRadius: 7 }]} />
    <View style={[styles.dot, { top: 660, left: 28, backgroundColor: "#FBBF24", width: 9, height: 9, borderRadius: 9 }]} />
    <View style={[styles.dot, { top: 720, right: 26, backgroundColor: "#F472B6", width: 8, height: 8, borderRadius: 8 }]} />
  </>
);

const Star = ({ color, size }) => (
  <Text style={{ color, fontSize: size, lineHeight: size + 4 }}>✦</Text>
);

const PastPaperCard = ({ item, onPress, startButtonText }) => (
  <View style={styles.card}>
    <View style={styles.iconWrapper}>
      <View style={styles.iconCircle}>
        <Text style={styles.iconEmoji}>{item.emoji}</Text>
      </View>
    </View>

    <View style={styles.divider} />

    <View style={styles.cardContent}>
      <Text style={styles.yearText}>{item.year}</Text>

      <TouchableOpacity
        style={styles.startButton}
        onPress={() => onPress(item)}
        activeOpacity={0.85}
      >
        <Text style={styles.startButtonText}>{startButtonText}</Text>
      </TouchableOpacity>
    </View>

    <View style={styles.cardStar}>
      <Star color={item.starColor} size={item.starSize} />
    </View>
  </View>
);

export default function PastPaperMenu({ navigation, onSelectYear }) {
  const { t } = useT();
  const soundRef = useRef(null);

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

  const handleStart = async (item) => {
    await playClickSound();

    if (navigation) {
      navigation.navigate("paperpage", {
        pastPaperYear: item.year,
        paperTitle: `Past Paper - ${item.year}`,
      });
    }

    if (onSelectYear) {
      onSelectYear(item.year);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0F2FF" />

      <View style={styles.container}>
        <FloatingDots />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {years.map((item) => (
            <PastPaperCard
              key={item.year}
              item={item}
              onPress={handleStart}
              startButtonText={t("startPaper")}
            />
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F0F2FF",
  },
  container: {
    flex: 1,
    backgroundColor: "#F0F2FF",
    position: "relative",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
    gap: 16,
  },
  dot: {
    position: "absolute",
    zIndex: 0,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 16,
    shadowColor: "#C4C9F5",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 5,
    position: "relative",
    overflow: "hidden",
  },
  iconWrapper: {
    width: 72,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#EEF0FF",
    alignItems: "center",
    justifyContent: "center",
  },
  iconEmoji: {
    fontSize: 34,
  },
  divider: {
    width: 1.5,
    height: 70,
    backgroundColor: "#E5E7F5",
    marginHorizontal: 14,
  },
  cardContent: {
    flex: 1,
    justifyContent: "center",
  },
  yearText: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1E1B4B",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  subtitleText: {
    fontSize: 12.5,
    color: "#8B8FAD",
    fontWeight: "400",
    marginBottom: 10,
    lineHeight: 17,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#5B4FCF",
    borderRadius: 22,
    paddingVertical: 7,
    paddingHorizontal: 18,
    alignSelf: "flex-start",
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  startButtonArrow: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  cardStar: {
    position: "absolute",
    top: 14,
    right: 16,
  },
});