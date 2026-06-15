import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Audio } from "expo-av";
import useT from "../app/i18n/useT";

const { width, height } = Dimensions.get("window");

const playClickSound = async () => {
  try {
    const { sound } = await Audio.Sound.createAsync(
      require("../assets/click4.mp3")
    );

    await sound.playAsync();

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (error) {
    console.log("Click sound error:", error);
  }
};

const FloatingStar = ({ style, size = 16, color = "#FFD700", delay = 0 }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(floatAnim, {
            toValue: -10,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
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
            toValue: 0.6,
            duration: 900,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    floatLoop.start();
    return () => floatLoop.stop();
  }, []);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ translateY: floatAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <Text style={{ fontSize: size, color }}>★</Text>
    </Animated.View>
  );
};

const SparkDot = ({ style, delay = 0 }) => {
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.5,
          duration: 1000,
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
          transform: [{ scale: scaleAnim }],
        },
      ]}
    />
  );
};

const MathTile = ({ symbol, bgColor, textColor = "#fff", style, delay = 0 }) => {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(bounceAnim, {
            toValue: -8,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["-5deg", "5deg"],
  });

  return (
    <Animated.View
      style={[
        styles.mathTile,
        {
          backgroundColor: bgColor,
          transform: [{ translateY: bounceAnim }, { rotate }],
        },
        style,
      ]}
    >
      <Text style={[styles.mathTileText, { color: textColor }]}>{symbol}</Text>
    </Animated.View>
  );
};

const LargeChar = ({ char, color, style, delay = 0 }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(floatAnim, {
          toValue: -6,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1600,
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.Text
      style={[
        styles.largeChar,
        {
          color,
          transform: [{ translateY: floatAnim }],
        },
        style,
      ]}
    >
      {char}
    </Animated.Text>
  );
};

export default function DailyQuizz({ navigation }) {
  const { t } = useT();
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const fadeInAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeInAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(buttonScaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  const handleStart = async () => {
    await playClickSound();

    if (navigation) {
      navigation.navigate("DailyQuizzMenu");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#EEF0FF" />

      <LinearGradient
        colors={["#ECEFFE", "#F5F6FF", "#EEF0FA"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <SparkDot style={{ top: height * 0.08, left: width * 0.07 }} delay={0} />
      <SparkDot style={{ top: height * 0.12, right: width * 0.08 }} delay={400} />
      <SparkDot style={{ top: height * 0.22, left: width * 0.15 }} delay={200} />
      <SparkDot style={{ top: height * 0.65, left: width * 0.06 }} delay={600} />
      <SparkDot style={{ top: height * 0.72, right: width * 0.07 }} delay={300} />
      <SparkDot style={{ top: height * 0.8, left: width * 0.2 }} delay={100} />

      <FloatingStar
        style={{ position: "absolute", top: height * 0.07, left: width * 0.06 }}
        size={20}
        color="#FFD700"
        delay={0}
      />
      <FloatingStar
        style={{ position: "absolute", top: height * 0.13, right: width * 0.05 }}
        size={14}
        color="#C8B8FF"
        delay={300}
      />
      <FloatingStar
        style={{ position: "absolute", top: height * 0.25, left: width * 0.04 }}
        size={18}
        color="#FFD700"
        delay={600}
      />
      <FloatingStar
        style={{ position: "absolute", top: height * 0.6, left: width * 0.04 }}
        size={22}
        color="#FFD700"
        delay={200}
      />
      <FloatingStar
        style={{ position: "absolute", top: height * 0.68, right: width * 0.05 }}
        size={16}
        color="#FFD700"
        delay={500}
      />
      <FloatingStar
        style={{ position: "absolute", top: height * 0.75, left: width * 0.1 }}
        size={12}
        color="#C8B8FF"
        delay={800}
      />
      <FloatingStar
        style={{ position: "absolute", top: height * 0.82, right: width * 0.1 }}
        size={18}
        color="#FFD700"
        delay={100}
      />

      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeInAnim,
            transform: [{ translateY: slideUpAnim }],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.illustrationCard,
          {
            opacity: fadeInAnim,
            transform: [{ translateY: slideUpAnim }],
          },
        ]}
      >
        <View style={styles.bookWrapper}>
          <View style={styles.bookLeft} />
          <View style={styles.bookRight} />
          <View style={styles.bookSpine} />
          <View style={styles.bookShadow} />

          <MathTile symbol="%" bgColor="#A78BFA" style={styles.tilePercent} delay={0} />
          <MathTile symbol="×" bgColor="#EF4444" style={styles.tileTimes} delay={300} />
          <MathTile symbol="=" bgColor="#EF4444" style={styles.tileEquals} delay={600} />

          <LargeChar char="1" color="#6366F1" style={styles.char1} delay={100} />
          <LargeChar char="+" color="#F59E0B" style={styles.charPlus} delay={400} />
          <LargeChar char="2" color="#6366F1" style={styles.char2} delay={200} />
        </View>
      </Animated.View>

      <Animated.View
        style={[
          styles.textSection,
          {
            opacity: fadeInAnim,
            transform: [{ translateY: slideUpAnim }],
          },
        ]}
      >
        <Text style={styles.titleText}>{t("dailyMathsQuiz")}</Text>
        <Text style={styles.subtitleText}>{t("sharpenYourSkills")}</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.buttonWrapper,
          {
            opacity: fadeInAnim,
            transform: [{ translateY: slideUpAnim }, { scale: buttonScaleAnim }],
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handleStart}
        >
          <LinearGradient
            colors={["#7C6EF5", "#5B4FE8"]}
            style={styles.startButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.startButtonText}>{t("start")}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF0FF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 28,
    marginTop: -20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#2D2D6B",
    letterSpacing: 0.3,
    marginHorizontal: 6,
  },
  headerStarLeft: { fontSize: 20 },
  headerStarRight: { fontSize: 20 },
  illustrationCard: {
    width: width * 0.72,
    height: width * 0.72,
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 24,
  },
  bookWrapper: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
    position: "relative",
  },
  bookLeft: {
    position: "absolute",
    bottom: 8,
    left: "8%",
    width: "42%",
    height: "38%",
    backgroundColor: "#7C6EF5",
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 6,
    transform: [{ skewY: "-2deg" }],
  },
  bookRight: {
    position: "absolute",
    bottom: 8,
    right: "8%",
    width: "42%",
    height: "38%",
    backgroundColor: "#9B8FF7",
    borderTopRightRadius: 10,
    borderBottomRightRadius: 6,
    transform: [{ skewY: "2deg" }],
  },
  bookSpine: {
    position: "absolute",
    bottom: 8,
    alignSelf: "center",
    width: "5%",
    height: "37%",
    backgroundColor: "#5B4FE8",
    borderRadius: 3,
  },
  bookShadow: {
    position: "absolute",
    bottom: 0,
    alignSelf: "center",
    width: "85%",
    height: 14,
    backgroundColor: "rgba(91, 79, 232, 0.18)",
    borderRadius: 50,
  },
  mathTile: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 5,
  },
  mathTileText: {
    fontSize: 20,
    fontWeight: "900",
    color: "#fff",
  },
  tilePercent: {
    top: "10%",
    left: "8%",
    transform: [{ rotate: "-15deg" }],
  },
  tileTimes: {
    top: "5%",
    right: "12%",
    transform: [{ rotate: "12deg" }],
  },
  tileEquals: {
    top: "32%",
    right: "5%",
    transform: [{ rotate: "8deg" }],
  },
  largeChar: {
    position: "absolute",
    fontSize: 64,
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.12)",
    textShadowOffset: { width: 2, height: 4 },
    textShadowRadius: 6,
  },
  char1: { top: "22%", left: "18%" },
  charPlus: { top: "18%", alignSelf: "center", left: "40%" },
  char2: { top: "22%", right: "15%" },
  sparkDot: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#C8B8FF",
  },
  textSection: {
    alignItems: "center",
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  titleText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1E1B4B",
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  subtitleText: {
    fontSize: 14.5,
    color: "#7E7E9A",
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "400",
  },
  buttonWrapper: {
    width: width * 0.55,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 50,
    shadowColor: "#5B4FE8",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.38,
    shadowRadius: 16,
    elevation: 8,
    gap: 10,
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  arrowText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginTop: -2,
  },
});