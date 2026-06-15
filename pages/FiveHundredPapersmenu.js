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
import { Audio } from "expo-av";
import useT from "../app/i18n/useT";

const { width, height } = Dimensions.get("window");

const clickSound = require("../assets/clip5.mp3");

const PAPERS = [
  {
    id: "1",
    title: "Paper - 1",
    icon: "📄",
    iconBg: ["#E0EEFF", "#C8DEFF"],
    starColor: "#3B82F6",
    badgeColor: "#3B82F6",
    route: "paperpage",
  },
  {
    id: "2",
    title: "Paper - 2",
    icon: "📑",
    iconBg: ["#E8F5FF", "#C8EAFF"],
    starColor: "#F59E0B",
    badgeColor: "#F59E0B",
    route: "paperpage",
  },
  {
    id: "3",
    title: "Paper - 3",
    icon: "🗒️",
    iconBg: ["#EEF9FF", "#D0F0FF"],
    starColor: "#06B6D4",
    badgeColor: "#06B6D4",
    route: "paperpage",
  },
  {
    id: "4",
    title: "Paper - 4",
    icon: "📝",
    iconBg: ["#F0EEFF", "#DDD5FF"],
    starColor: "#8B5CF6",
    badgeColor: "#8B5CF6",
    route: "paperpage",
  },
  {
    id: "5",
    title: "Paper - 5",
    icon: "📃",
    iconBg: ["#FFF0E8", "#FFE0CC"],
    starColor: "#F97316",
    badgeColor: "#F97316",
    route: "paperpage",
  },
  {
    id: "6",
    title: "Paper - 6",
    icon: "🗂️",
    iconBg: ["#F0FFF4", "#CCFCE8"],
    starColor: "#10B981",
    badgeColor: "#10B981",
    route: "paperpage",
  },
  {
    id: "7",
    title: "Paper - 7",
    icon: "📋",
    iconBg: ["#FFF8E0", "#FFEEA0"],
    starColor: "#EAB308",
    badgeColor: "#EAB308",
    route: "paperpage",
  },
  {
    id: "8",
    title: "Paper - 8",
    icon: "📊",
    iconBg: ["#F5E8FF", "#E8D0FF"],
    starColor: "#A855F7",
    badgeColor: "#A855F7",
    route: "paperpage",
  },
];

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
  }, []);

  return (
    <Animated.View
      style={[
        styles.sparkDot,
        style,
        {
          backgroundColor: color,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    />
  );
};

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
  }, []);

  return (
    <Animated.Text
      style={[
        styles.decoStar,
        {
          fontSize: size,
          color,
          opacity: opacityAnim,
          transform: [{ translateY: floatAnim }],
        },
        style,
      ]}
    >
      {filled ? "★" : "☆"}
    </Animated.Text>
  );
};

const NumberBadge = ({ number, color }) => (
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

const PaperCard = ({ item, index, navigation, playClickSound, t }) => {
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
  }, []);

  const handlePress = async () => {
    await playClickSound();

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
        onPress={handlePress}
        onPressIn={() =>
          Animated.spring(cardScale, {
            toValue: 0.98,
            useNativeDriver: true,
          }).start()
        }
        onPressOut={() =>
          Animated.spring(cardScale, {
            toValue: 1,
            friction: 5,
            useNativeDriver: true,
          }).start()
        }
        style={styles.cardInner}
      >
        <LinearGradient
          colors={item.iconBg}
          style={styles.iconCircle}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.iconEmoji}>{item.icon}</Text>
        </LinearGradient>

        <View style={styles.cardTextBlock}>
          <View style={styles.titleRow}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <NumberBadge number={`#${item.id}`} color={item.badgeColor} />
          </View>

          <Animated.View style={{ transform: [{ scale: btnScale }] }}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={handlePress}
              onPressIn={() =>
                Animated.spring(btnScale, {
                  toValue: 0.93,
                  useNativeDriver: true,
                }).start()
              }
              onPressOut={() =>
                Animated.spring(btnScale, {
                  toValue: 1,
                  friction: 4,
                  useNativeDriver: true,
                }).start()
              }
            >
              <LinearGradient
                colors={["#2563EB", "#1D4ED8"]}
                style={styles.startBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.startBtnText}>{t("start")}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <Text style={[styles.cardStar, { color: item.starColor }]}>★</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function FiveHundredPaperMenu({ navigation }) {
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E6EEFF" />

      <LinearGradient
        colors={["#E6EEFF", "#EEF3FF", "#E8F0FF"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <SparkDot style={{ top: height * 0.05, left: width * 0.06 }} />
      <SparkDot style={{ top: height * 0.1, right: width * 0.07 }} delay={300} color="#FFD9A8" />
      <SparkDot style={{ top: height * 0.19, left: width * 0.1 }} delay={150} />
      <SparkDot style={{ top: height * 0.32, right: width * 0.05 }} delay={500} color="#A8F0D8" />
      <SparkDot style={{ top: height * 0.46, left: width * 0.04 }} delay={200} />
      <SparkDot style={{ top: height * 0.57, right: width * 0.06 }} delay={700} color="#FFD9A8" />
      <SparkDot style={{ top: height * 0.69, left: width * 0.07 }} delay={400} />
      <SparkDot style={{ top: height * 0.79, right: width * 0.08 }} delay={100} color="#A8F0D8" />
      <SparkDot style={{ top: height * 0.89, left: width * 0.12 }} delay={600} />

      <DecoStar style={{ top: height * 0.08, left: width * 0.02 }} size={14} />
      <DecoStar style={{ top: height * 0.23, left: width * 0.02 }} size={20} delay={400} />
      <DecoStar style={{ top: height * 0.41, left: width * 0.02 }} size={16} delay={200} />
      <DecoStar style={{ top: height * 0.59, left: width * 0.02 }} size={22} delay={600} />
      <DecoStar style={{ top: height * 0.75, left: width * 0.03 }} size={14} delay={300} />

      <DecoStar style={{ top: height * 0.13, right: width * 0.02 }} size={18} delay={100} />
      <DecoStar style={{ top: height * 0.29, right: width * 0.02 }} size={14} delay={500} />
      <DecoStar style={{ top: height * 0.49, right: width * 0.02 }} size={20} delay={250} />
      <DecoStar style={{ top: height * 0.66, right: width * 0.02 }} size={16} delay={700} />
      <DecoStar style={{ top: height * 0.83, right: width * 0.03 }} size={22} delay={350} />

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
            playClickSound={playClickSound}
            t={t}
          />
        ))}
      </ScrollView>
    </View>
  );
}

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
  sparkDot: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  decoStar: {
    position: "absolute",
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
  },
  cardSubtitle: {
    fontSize: 12.5,
    color: "#7E94B8",
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
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 50,
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
  },
  cardStar: {
    position: "absolute",
    top: 14,
    right: 16,
    fontSize: 20,
  },
});