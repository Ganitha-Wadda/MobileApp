import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  Dimensions,
  SafeAreaView,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

// ✅ Local asset images
const chakkraImage = require("../assets/chakkra.png"); // change later if you have chakkra image
const bossImage = require("../assets/Boss.png"); // change later if you have boss battle image

const GAMES = [
  {
    id: 1,
    title: "Chakkra\nWadda Racing",
    desc: "Race, solve and win! Multiply your way to the finish line.",
    image: chakkraImage,
    color: "#4FC3F7",
    route: "ChakkraWaddaRacing",  
  },
  {
    id: 2,
    title: "Boss\nBattle",
    desc: "Face the boss, solve math challenges and be the hero!",
    image: bossImage,
    color: "#7E57C2",
    route: "BossBattle",
  },
];

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

const Sparkle = ({ style, color = "#A78BFA", size = 14 }) => (
  <Text style={[{ position: "absolute", color, fontSize: size }, style]}>
    ✦
  </Text>
);

const GameCard = ({ game, onPlay }) => (
  <View style={styles.card}>
    <View style={[styles.cardImageWrap, { backgroundColor: game.color }]}>
      <Image source={game.image} style={styles.cardImage} resizeMode="cover" />
    </View>

    <View style={styles.cardContent}>
      <Sparkle style={{ top: 10, right: 16 }} color="#C4B5FD" size={12} />
      <Sparkle style={{ top: 40, right: 40 }} color="#DDD6FE" size={10} />
      <Sparkle style={{ bottom: 50, right: 20 }} color="#A78BFA" size={11} />

      <Text style={styles.cardTitle}>{game.title}</Text>

      <View style={styles.descRow}>
        <Text style={styles.descStar}>★</Text>
        <Text style={styles.descText}>{game.desc}</Text>
      </View>

      <TouchableOpacity
        style={styles.playBtn}
        onPress={() => onPlay(game.route)}
        activeOpacity={0.82}
      >
        <Text style={styles.playBtnText}>Play </Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default function Battle({ navigation }) {
  const handlePlay = (route) => {
    navigation?.navigate?.(route);
  };

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

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.titleRow}>
              <Text style={{ fontSize: 18, marginRight: 6 }}>⭐</Text>
              <Text style={styles.sectionTitle}>Games</Text>
              <Text style={{ fontSize: 16, marginLeft: 6, color: "#A78BFA" }}>
                ★
              </Text>
            </View>

            {GAMES.map((game) => (
              <GameCard key={game.id} game={game} onPlay={handlePlay} />
            ))}
          </ScrollView>

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

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },

  root: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },

  scroll: {
    flex: 1,
    zIndex: 5,
  },

  container: {
    paddingHorizontal: 16,
    paddingTop: 26,
    paddingBottom: 130,
    flexGrow: 1,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#07124A",
    letterSpacing: 0.3,
  },

  card: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: 22,
    overflow: "hidden",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#ECE8FF",
    shadowColor: "#A39BF5",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    height: 200,
  },

  cardImageWrap: {
    width: width * 0.42,
    overflow: "hidden",
  },

  cardImage: {
    width: "100%",
    height: "100%",
  },

  cardContent: {
    flex: 1,
    padding: 14,
    justifyContent: "space-between",
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#1A1A3E",
    lineHeight: 26,
    marginBottom: 8,
    marginTop: 4,
  },

  descRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    marginBottom: 12,
  },

  descStar: {
    color: "#FBBF24",
    fontSize: 14,
    marginRight: 5,
    marginTop: 1,
  },

  descText: {
    fontSize: 12.5,
    color: "#4B5563",
    lineHeight: 18,
    flex: 1,
  },

  playBtn: {
    backgroundColor: "#5B4FE8",
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    shadowColor: "#5B4FE8",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },

  playBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
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