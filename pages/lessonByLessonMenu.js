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

const { width, height } = Dimensions.get("window");

const clickSound = require("../assets/clip5.mp3");

const LESSONS = [
  {
    id: "1",
    title: "Chakkre",
    subtitle: "Build your understanding step by step!",
    emoji: "🎡",
    iconBg: ["#E8E4FF", "#D9D0FF"],
    starColor: "#A78BFA",
  },
  {
    id: "2",
    title: "Ganaka Ramu",
    subtitle: "Challenge yourself and learn!",
    emoji: "👦",
    iconBg: ["#FFF3E0", "#FFE0B2"],
    starColor: "#FBBF24",
  },
  {
    id: "3",
    title: "Muilka Ganitha Sankalapa",
    subtitle: "Think smart, solve better!",
    emoji: "💡",
    iconBg: ["#FFF8D0", "#FFF3A3"],
    starColor: "#60A5FA",
  },
  {
    id: "4",
    title: "Walakulu Samklpa",
    subtitle: "You've got this! Keep going!",
    emoji: "🏆",
    iconBg: ["#E3F2FD", "#CFEAFF"],
    starColor: "#F472B6",
  },
];

const FloatingDot = ({ style, color = "#A78BFA", delay = 0, size = 8 }) => {
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1.25,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.85,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 0.5,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.45,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.floatingDot,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
        style,
      ]}
    />
  );
};

const FloatingStar = ({ style, color = "#C8BFFF", size = 18, delay = 0 }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(floatAnim, {
            toValue: -8,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.7,
            duration: 900,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.35,
            duration: 900,
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
        styles.floatingStar,
        {
          color,
          fontSize: size,
          opacity: opacityAnim,
          transform: [{ translateY: floatAnim }],
        },
        style,
      ]}
    >
      ☆
    </Animated.Text>
  );
};

const LessonCard = ({ lesson, index, navigation, playClickSound }) => {
  const slideAnim = useRef(new Animated.Value(45)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(1)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 520,
        delay: index * 120,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 520,
        delay: index * 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleStart = async () => {
    await playClickSound();

    navigation.navigate("paperpage", {
      lessonId: lesson.id,
      lessonTitle: lesson.title,
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
        onPress={handleStart}
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
          colors={lesson.iconBg}
          style={styles.iconBox}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.iconEmoji}>{lesson.emoji}</Text>
        </LinearGradient>

        <View style={styles.textBlock}>
          <Text style={styles.lessonTitle} numberOfLines={1}>
            {lesson.title}
          </Text>

          <Text style={styles.lessonSubtitle} numberOfLines={2}>
            {lesson.subtitle}
          </Text>

          <Animated.View style={{ transform: [{ scale: btnScale }] }}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={handleStart}
              onPressIn={() =>
                Animated.spring(btnScale, {
                  toValue: 0.94,
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
                colors={["#7C5CFC", "#9B7DFF"]}
                style={styles.startButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.startText}>Start</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <Text style={[styles.cardStar, { color: lesson.starColor }]}>★</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function LessonByLessonMenu({ navigation }) {
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
      <StatusBar barStyle="dark-content" backgroundColor="#F5F0FF" />

      <LinearGradient
        colors={["#F5F0FF", "#EEF6FF", "#F0F8FF"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <FloatingDot style={{ top: height * 0.06, left: width * 0.08 }} color="#F472B6" size={9} />
      <FloatingDot style={{ top: height * 0.04, right: width * 0.1 }} color="#60A5FA" delay={300} />
      <FloatingDot style={{ top: height * 0.28, left: width * 0.04 }} color="#A78BFA" delay={150} />
      <FloatingDot style={{ top: height * 0.22, right: width * 0.06 }} color="#FBBF24" delay={500} size={10} />
      <FloatingDot style={{ top: height * 0.55, left: width * 0.06 }} color="#34D399" delay={200} />
      <FloatingDot style={{ top: height * 0.5, right: width * 0.08 }} color="#F472B6" delay={700} size={7} />
      <FloatingDot style={{ top: height * 0.78, left: width * 0.05 }} color="#60A5FA" delay={400} size={9} />
      <FloatingDot style={{ top: height * 0.76, right: width * 0.08 }} color="#A78BFA" delay={100} />
      <FloatingDot style={{ top: height * 0.92, left: width * 0.1 }} color="#FBBF24" delay={600} size={7} />
      <FloatingDot style={{ top: height * 0.9, right: width * 0.15 }} color="#F472B6" delay={350} size={9} />

      <FloatingStar style={{ top: height * 0.12, left: width * 0.03 }} />
      <FloatingStar style={{ top: height * 0.37, right: width * 0.03 }} color="#BBD7FF" size={20} delay={300} />
      <FloatingStar style={{ top: height * 0.66, left: width * 0.03 }} color="#FFD6F0" delay={500} />
      <FloatingStar style={{ top: height * 0.84, right: width * 0.04 }} size={22} delay={700} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {LESSONS.map((lesson, index) => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            index={index}
            navigation={navigation}
            playClickSound={playClickSound}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F0FF",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: "#7864C8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    borderWidth: 1.5,
    borderColor: "#F0EEFF",
    overflow: "hidden",
  },
  cardInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 18,
    position: "relative",
  },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    shadowColor: "#A08CF0",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 10,
    elevation: 3,
  },
  iconEmoji: {
    fontSize: 38,
  },
  textBlock: {
    flex: 1,
    paddingRight: 18,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1A1040",
    marginBottom: 4,
  },
  lessonSubtitle: {
    fontSize: 12.5,
    color: "#9B8EC4",
    marginBottom: 12,
    lineHeight: 18,
  },
  startButton: {
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    borderRadius: 30,
    paddingVertical: 8,
    paddingHorizontal: 20,
    shadowColor: "#7C5CFC",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 5,
  },
  startText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  cardStar: {
    position: "absolute",
    top: 14,
    right: 14,
    fontSize: 22,
    fontWeight: "900",
  },
  floatingDot: {
    position: "absolute",
    zIndex: 0,
  },
  floatingStar: {
    position: "absolute",
    zIndex: 0,
    fontWeight: "900",
  },
});