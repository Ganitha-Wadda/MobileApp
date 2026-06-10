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
    subtitle: "Start your journey — first steps!",
    icon: "📄",
    iconBg: ["#E0EEFF", "#C8DEFF"],
    starColor: "#3B82F6",
    badgeColor: "#3B82F6",
    route: "paperpage",
  },
  {
    id: "2",
    title: "Paper - 2",
    subtitle: "Keep going — build momentum!",
    icon: "📑",
    iconBg: ["#E8F5FF", "#C8EAFF"],
    starColor: "#F59E0B",
    badgeColor: "#F59E0B",
    route: "paperpage",
  },
  {
    id: "3",
    title: "Paper - 3",
    subtitle: "Push harder — you are improving!",
    icon: "🗒️",
    iconBg: ["#EEF9FF", "#D0F0FF"],
    starColor: "#06B6D4",
    badgeColor: "#06B6D4",
    route: "paperpage",
  },
  {
    id: "4",
    title: "Paper - 4",
    subtitle: "Halfway there — stay focused!",
    icon: "📝",
    iconBg: ["#F0EEFF", "#DDD5FF"],
    starColor: "#8B5CF6",
    badgeColor: "#8B5CF6",
    route: "paperpage",
  },
  {
    id: "5",
    title: "Paper - 5",
    subtitle: "Almost there — final push!",
    icon: "📃",
    iconBg: ["#FFF0E8", "#FFE0CC"],
    starColor: "#F97316",
    badgeColor: "#F97316",
    route: "paperpage",
  },
  {
    id: "6",
    title: "Paper - 6",
    subtitle: "Master every question!",
    icon: "🗂️",
    iconBg: ["#F0FFF4", "#CCFCE8"],
    starColor: "#10B981",
    badgeColor: "#10B981",
    route: "paperpage",
  },
  {
    id: "7",
    title: "Paper - 7",
    subtitle: "Review, revise, repeat!",
    icon: "📋",
    iconBg: ["#FFF8E0", "#FFEEA0"],
    starColor: "#EAB308",
    badgeColor: "#EAB308",
    route: "paperpage",
  },
  {
    id: "8",
    title: "Paper - 8",
    subtitle: "Sharpen your exam technique!",
    icon: "📊",
    iconBg: ["#F5E8FF", "#E8D0FF"],
    starColor: "#A855F7",
    badgeColor: "#A855F7",
    route: "paperpage",
  },
];

// ─── Floating sparkle dot ─────────────────────────────────────────────────────
const SparkDot = ({ style, delay = 0, color = "#B8D4FF" }) => {
  const scaleAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(scaleAnim, {
          toValue: 1.3,
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
  color = "#93C5FD",
  delay = 0,
  filled = false,
}) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(filled ? 0.85 : 0.35)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(floatAnim, {
            toValue: -9,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: filled ? 1 : 0.6,
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
            toValue: filled ? 0.85 : 0.35,
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

// ─── Number badge ─────────────────────────────────────────────────────────────
const NumberBadge = ({ number, color }) => {
  return (
    <View
      style={[
        styles.numberBadge,
        {
          backgroundColor: `${color}22`,
          borderColor: `${color}55`,
        },
      ]}
    >
      <Text style={[styles.numberBadgeText, { color }]}>{number}</Text>
    </View>
  );
};

// ─── Paper card ───────────────────────────────────────────────────────────────
const PaperCard = ({ item, index, navigation }) => {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;
  const cardScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 520,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 520,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, index, slideAnim]);

  const handleBtnPressIn = () => {
    Animated.spring(btnScale, {
      toValue: 0.93,
      useNativeDriver: true,
    }).start();
  };

  const handleBtnPressOut = () => {
    Animated.spring(btnScale, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  const handleCardPressIn = () => {
    Animated.spring(cardScale, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handleCardPressOut = () => {
    Animated.spring(cardScale, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    navigation.navigate(item.route, {
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
          transform: [{ translateY: slideAnim }, { scale: cardScale }],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handleCardPressIn}
        onPressOut={handleCardPressOut}
        onPress={handlePress}
        style={styles.cardInner}
      >
        {/* Left icon */}
        <LinearGradient
          colors={item.iconBg}
          style={styles.iconCircle}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.iconEmoji}>{item.icon}</Text>
        </LinearGradient>

        {/* Text and button */}
        <View style={styles.cardTextBlock}>
          <View style={styles.titleRow}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <NumberBadge number={`#${item.id}`} color={item.badgeColor} />
          </View>

          <Text style={styles.cardSubtitle}>{item.subtitle}</Text>

          <Animated.View style={{ transform: [{ scale: btnScale }] }}>
            <TouchableOpacity
              activeOpacity={1}
              onPressIn={handleBtnPressIn}
              onPressOut={handleBtnPressOut}
              onPress={handlePress}
            >
              <LinearGradient
                colors={["#2563EB", "#1D4ED8"]}
                style={styles.startBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.startBtnText}>Start</Text>

                
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <Text style={[styles.cardStar, { color: item.starColor }]}>★</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Header progress bar ──────────────────────────────────────────────────────
const ProgressHeader = () => {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: 0.016,
      duration: 1000,
      delay: 400,
      useNativeDriver: false,
    }).start();
  }, [progressAnim]);

  const barWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.headerBox}>
      <View style={styles.headerTopRow}>
        <Text style={styles.headerTitle}>500 Papers</Text>

        <View style={styles.headerCountBadge}>
          <Text style={styles.headerCountText}>8 / 500</Text>
        </View>
      </View>

      <Text style={styles.headerSubtitle}>
        Complete all papers to master every topic
      </Text>

      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, { width: barWidth }]} />
      </View>

      <Text style={styles.progressLabel}>1.6% complete</Text>
    </View>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function FiveHundredPaperMenu({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E6EEFF" />

      <LinearGradient
        colors={["#E6EEFF", "#EEF3FF", "#E8F0FF"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <SparkDot
        style={{ top: height * 0.05, left: width * 0.06 }}
        delay={0}
        color="#B8D4FF"
      />
      <SparkDot
        style={{ top: height * 0.1, right: width * 0.07 }}
        delay={300}
        color="#FFD9A8"
      />
      <SparkDot
        style={{ top: height * 0.19, left: width * 0.1 }}
        delay={150}
        color="#B8D4FF"
      />
      <SparkDot
        style={{ top: height * 0.32, right: width * 0.05 }}
        delay={500}
        color="#A8F0D8"
      />
      <SparkDot
        style={{ top: height * 0.46, left: width * 0.04 }}
        delay={200}
        color="#B8D4FF"
      />
      <SparkDot
        style={{ top: height * 0.57, right: width * 0.06 }}
        delay={700}
        color="#FFD9A8"
      />
      <SparkDot
        style={{ top: height * 0.69, left: width * 0.07 }}
        delay={400}
        color="#B8D4FF"
      />
      <SparkDot
        style={{ top: height * 0.79, right: width * 0.08 }}
        delay={100}
        color="#A8F0D8"
      />
      <SparkDot
        style={{ top: height * 0.89, left: width * 0.12 }}
        delay={600}
        color="#B8D4FF"
      />

      <DecoStar
        style={{ top: height * 0.08, left: width * 0.02 }}
        size={14}
        color="#93C5FD"
        delay={0}
        filled={false}
      />
      <DecoStar
        style={{ top: height * 0.23, left: width * 0.02 }}
        size={20}
        color="#93C5FD"
        delay={400}
        filled={false}
      />
      <DecoStar
        style={{ top: height * 0.41, left: width * 0.02 }}
        size={16}
        color="#93C5FD"
        delay={200}
        filled={false}
      />
      <DecoStar
        style={{ top: height * 0.59, left: width * 0.02 }}
        size={22}
        color="#93C5FD"
        delay={600}
        filled={false}
      />
      <DecoStar
        style={{ top: height * 0.75, left: width * 0.03 }}
        size={14}
        color="#93C5FD"
        delay={300}
        filled={false}
      />

      <DecoStar
        style={{ top: height * 0.13, right: width * 0.02 }}
        size={18}
        color="#93C5FD"
        delay={100}
        filled={false}
      />
      <DecoStar
        style={{ top: height * 0.29, right: width * 0.02 }}
        size={14}
        color="#93C5FD"
        delay={500}
        filled={false}
      />
      <DecoStar
        style={{ top: height * 0.49, right: width * 0.02 }}
        size={20}
        color="#93C5FD"
        delay={250}
        filled={false}
      />
      <DecoStar
        style={{ top: height * 0.66, right: width * 0.02 }}
        size={16}
        color="#93C5FD"
        delay={700}
        filled={false}
      />
      <DecoStar
        style={{ top: height * 0.83, right: width * 0.03 }}
        size={22}
        color="#93C5FD"
        delay={350}
        filled={false}
      />

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
    backgroundColor: "#E6EEFF",
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 40,
    gap: 14,
  },

  headerBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 4,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.09,
    shadowRadius: 18,
    elevation: 4,
  },

  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1E3A6E",
    letterSpacing: 0.2,
  },

  headerCountBadge: {
    backgroundColor: "#EFF6FF",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },

  headerCountText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2563EB",
  },

  headerSubtitle: {
    fontSize: 12.5,
    color: "#6B87A8",
    marginBottom: 12,
    lineHeight: 18,
  },

  progressTrack: {
    width: "100%",
    height: 8,
    backgroundColor: "#E8F0FF",
    borderRadius: 4,
    overflow: "hidden",
  },

  progressFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2563EB",
  },

  progressLabel: {
    fontSize: 11,
    color: "#93A8C4",
    marginTop: 6,
    textAlign: "right",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.09,
    shadowRadius: 18,
    elevation: 4,
    overflow: "hidden",
  },

  cardInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 18,
    position: "relative",
  },

  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    flexShrink: 0,
  },

  iconEmoji: {
    fontSize: 36,
  },

  cardTextBlock: {
    flex: 1,
    gap: 3,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 3,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1A2850",
    letterSpacing: 0.2,
  },

  cardSubtitle: {
    fontSize: 12.5,
    color: "#7E94B8",
    fontWeight: "400",
    lineHeight: 18,
    marginBottom: 10,
  },

  numberBadge: {
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
  },

  numberBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },

  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 50,
    gap: 6,
    alignSelf: "flex-start",
    shadowColor: "#1D4ED8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 5,
  },

  startBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.4,
  },

  arrowBubble: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },

  startBtnArrow: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    marginTop: -1,
  },

  cardStar: {
    position: "absolute",
    top: 14,
    right: 16,
    fontSize: 20,
  },

  footer: {
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 4,
  },

  footerText: {
    fontSize: 13,
    color: "#93A8C4",
    fontWeight: "500",
  },
});