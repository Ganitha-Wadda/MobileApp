import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

// ─── Paper data ───────────────────────────────────────────────────────────────
const PAPERS = [
  {
    id: "1",
    title: "Paper - 1",
    subtitle: "Build your skills step by step!",
    icon: "📋",
    iconBg: ["#E8E4FF", "#D4CEFF"],
    starColor: "#8B7CF8",
  },
  {
    id: "2",
    title: "Paper - 2",
    subtitle: "Challenge yourself and learn!",
    icon: "📚",
    iconBg: ["#FFF3D4", "#FFE8A0"],
    starColor: "#F5A623",
  },
  {
    id: "3",
    title: "Paper - 3",
    subtitle: "Think smart, score better!",
    icon: "💡",
    iconBg: ["#E8F4FF", "#D0EAFF"],
    starColor: "#5BC8FF",
  },
  {
    id: "4",
    title: "Paper - 4",
    subtitle: "You've got this! Keep going!",
    icon: "🏆",
    iconBg: ["#FFF0E8", "#FFE0CC"],
    starColor: "#FF6EB4",
  },
];

// ─── Floating sparkle dot ─────────────────────────────────────────────────────
const SparkDot = ({ style, delay = 0, color = "#E0D8FF" }) => {
  const scaleAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.4,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();

    return () => loop.stop();
  }, [delay, scaleAnim]);

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: color,
        },
        style,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    />
  );
};

// ─── Floating decorative star ────────────────────────────────────────────────
const DecoStar = ({
  style,
  size = 22,
  color = "#8B7CF8",
  delay = 0,
  filled = true,
}) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(filled ? 0.85 : 0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(floatAnim, {
            toValue: -8,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: filled ? 0.85 : 0.4,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    loop.start();

    return () => loop.stop();
  }, [delay, filled, floatAnim, opacityAnim]);

  return (
    <Animated.Text
      style={[
        {
          position: "absolute",
          fontSize: size,
          color,
        },
        style,
        {
          opacity: opacityAnim,
          transform: [{ translateY: floatAnim }],
        },
      ]}
    >
      {filled ? "★" : "☆"}
    </Animated.Text>
  );
};

// ─── Paper card ───────────────────────────────────────────────────────────────
const PaperCard = ({ item, index, navigation }) => {
  const slideAnim = useRef(new Animated.Value(40)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay: index * 120,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, index, slideAnim]);

  const handlePressIn = () => {
    Animated.spring(btnScale, {
      toValue: 0.93,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(btnScale, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    navigation.navigate("paperpage", {
      paperId: item.id,
      paperTitle: item.title,
    });
  };

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {/* Icon circle */}
      <LinearGradient
        colors={item.iconBg}
        style={styles.iconCircle}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.iconEmoji}>{item.icon}</Text>
      </LinearGradient>

      {/* Text block */}
      <View style={styles.cardTextBlock}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardSubtitle}>{item.subtitle}</Text>

        {/* Start button */}
        <Animated.View style={{ transform: [{ scale: btnScale }] }}>
          <TouchableOpacity
            activeOpacity={1}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
          >
            <LinearGradient
              colors={["#6B5BF5", "#4F3FE8"]}
              style={styles.startBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.startBtnText}>Start</Text>
              <Text style={styles.startBtnArrow}>→</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Top-right colored star */}
      <Text style={[styles.cardStar, { color: item.starColor }]}>★</Text>
    </Animated.View>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function DailyQuizzmenu({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ECEEFF" />

      {/* Soft lavender background gradient */}
      <LinearGradient
        colors={["#ECEEFF", "#F0EEFF", "#E8ECFF"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Background scattered sparkle dots */}
      <SparkDot
        style={{ top: height * 0.05, left: width * 0.06 }}
        delay={0}
        color="#D0CAFF"
      />
      <SparkDot
        style={{ top: height * 0.09, right: width * 0.07 }}
        delay={300}
        color="#FFD6F0"
      />
      <SparkDot
        style={{ top: height * 0.18, left: width * 0.1 }}
        delay={150}
        color="#D0CAFF"
      />
      <SparkDot
        style={{ top: height * 0.3, right: width * 0.05 }}
        delay={500}
        color="#FFE0A0"
      />
      <SparkDot
        style={{ top: height * 0.45, left: width * 0.04 }}
        delay={200}
        color="#D0CAFF"
      />
      <SparkDot
        style={{ top: height * 0.55, right: width * 0.06 }}
        delay={700}
        color="#FFD6F0"
      />
      <SparkDot
        style={{ top: height * 0.68, left: width * 0.07 }}
        delay={400}
        color="#D0CAFF"
      />
      <SparkDot
        style={{ top: height * 0.78, right: width * 0.08 }}
        delay={100}
        color="#FFE0A0"
      />
      <SparkDot
        style={{ top: height * 0.88, left: width * 0.12 }}
        delay={600}
        color="#D0CAFF"
      />

      {/* Background floating decorative stars */}
      <DecoStar
        style={{ top: height * 0.07, left: width * 0.03 }}
        size={14}
        color="#C8BFFF"
        delay={0}
        filled={false}
      />
      <DecoStar
        style={{ top: height * 0.22, left: width * 0.02 }}
        size={20}
        color="#C8BFFF"
        delay={400}
        filled={false}
      />
      <DecoStar
        style={{ top: height * 0.4, left: width * 0.03 }}
        size={16}
        color="#C8BFFF"
        delay={200}
        filled={false}
      />
      <DecoStar
        style={{ top: height * 0.58, left: width * 0.02 }}
        size={22}
        color="#C8BFFF"
        delay={600}
        filled={false}
      />
      <DecoStar
        style={{ top: height * 0.74, left: width * 0.04 }}
        size={14}
        color="#C8BFFF"
        delay={300}
        filled={false}
      />

      <DecoStar
        style={{ top: height * 0.12, right: width * 0.03 }}
        size={18}
        color="#C8BFFF"
        delay={100}
        filled={false}
      />
      <DecoStar
        style={{ top: height * 0.28, right: width * 0.02 }}
        size={14}
        color="#C8BFFF"
        delay={500}
        filled={false}
      />
      <DecoStar
        style={{ top: height * 0.48, right: width * 0.03 }}
        size={20}
        color="#C8BFFF"
        delay={250}
        filled={false}
      />
      <DecoStar
        style={{ top: height * 0.65, right: width * 0.02 }}
        size={16}
        color="#C8BFFF"
        delay={700}
        filled={false}
      />
      <DecoStar
        style={{ top: height * 0.82, right: width * 0.04 }}
        size={22}
        color="#C8BFFF"
        delay={350}
        filled={false}
      />

      {/* Scrollable paper list */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {PAPERS.map((item, index) => (
          <PaperCard
            key={item.id}
            item={item}
            index={index}
            navigation={navigation}
          />
        ))}
      </ScrollView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ECEEFF",
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 36,
    gap: 16,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 18,
    shadowColor: "#7B6FCC",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 5,
    position: "relative",
    overflow: "hidden",
  },

  iconCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    flexShrink: 0,
  },

  iconEmoji: {
    fontSize: 38,
  },

  cardTextBlock: {
    flex: 1,
    gap: 4,
  },

  cardTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#1A1A2E",
    letterSpacing: 0.2,
    marginBottom: 2,
  },

  cardSubtitle: {
    fontSize: 13,
    color: "#7E7EA0",
    fontWeight: "400",
    lineHeight: 18,
    marginBottom: 10,
  },

  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 50,
    gap: 8,
    alignSelf: "flex-start",
    shadowColor: "#4F3FE8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },

  startBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  startBtnArrow: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  cardStar: {
    position: "absolute",
    top: 14,
    right: 16,
    fontSize: 20,
  },
});