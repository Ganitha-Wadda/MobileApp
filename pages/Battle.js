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

import bossImage from "../assets/BigBossBattle.png";
import chakkraImage from "../assets/Chakkarawdda.png";

const { width } = Dimensions.get("window");

const BATTLES = [
  {
    id: 1,
    title: "Chakkra\nWadda Battle",
    desc: "Solve multiplication challenges and win the battle!",
    image: chakkraImage,
    color: "#4FC3F7",
    route: "ChakkraWaddaRacing",
  },
  {
    id: 2,
    title: "Big Boss\nBattle",
    desc: "Defeat the big boss with your math power!",
    image: bossImage,
    color: "#7E57C2",
    route: "BossBattle",
  },
];

function AnimatedCloud({ style, scale = 1, delay = 0, distance = 18 }) {
  const move = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const moveLoop = Animated.loop(
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
    );

    const floatLoop = Animated.loop(
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
    );

    moveLoop.start();
    floatLoop.start();

    return () => {
      moveLoop.stop();
      floatLoop.stop();
    };
  }, [move, float, delay, distance]);

  return (
    <Animated.View
      style={[
        styles.cloud,
        style,
        {
          transform: [{ translateX: move }, { translateY: float }, { scale }],
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

const BattleCard = ({ battle, onPlay }) => (
  <View style={styles.card}>
    <View style={[styles.cardImageWrap, { backgroundColor: battle.color }]}>
      <Image source={battle.image} style={styles.cardImage} resizeMode="cover" />
      <View style={styles.imageBadge}>
        <Text style={styles.imageBadgeText}>BATTLE</Text>
      </View>
    </View>

    <View style={styles.cardContent}>
      <Sparkle style={{ top: 10, right: 16 }} color="#C4B5FD" size={12} />
      <Sparkle style={{ top: 40, right: 40 }} color="#DDD6FE" size={10} />
      <Sparkle style={{ bottom: 50, right: 20 }} color="#A78BFA" size={11} />

      <Text style={styles.cardTitle}>{battle.title}</Text>

      <View style={styles.descRow}>
        <Text style={styles.descStar}>⚔️</Text>
        <Text style={styles.descText}>{battle.desc}</Text>
      </View>

      <TouchableOpacity
        style={styles.playBtn}
        onPress={() => onPlay(battle.route)}
        activeOpacity={0.82}
      >
        <Text style={styles.playBtnText}>Start Battle</Text>
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

          <AnimatedCloud style={{ top: 92, left: -18 }} scale={0.85} />
          <AnimatedCloud style={{ top: 145, right: 20 }} scale={0.65} delay={300} />
          <AnimatedCloud style={{ top: 235, left: 35 }} scale={0.5} delay={600} />
          <AnimatedCloud style={{ top: 315, right: -8 }} scale={0.72} delay={900} />
          <AnimatedCloud style={{ bottom: 130, left: 32 }} scale={0.78} delay={1200} />
          <AnimatedCloud style={{ bottom: 105, right: 32 }} scale={0.68} delay={1500} />

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.titleBox}>
              <Text style={styles.titleIcon}>⚔️</Text>
              <Text style={styles.sectionTitle}>Battle Mode</Text>
              <Text style={styles.sectionSubTitle}>Choose your battle and start!</Text>
            </View>

            {BATTLES.map((battle) => (
              <BattleCard key={battle.id} battle={battle} onPlay={handlePlay} />
            ))}
          </ScrollView>

          <View style={[styles.bgCircle, styles.bgCircleLeft]} />
          <View style={[styles.bgCircle, styles.bgCircleRight]} />
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
    paddingTop: 24,
    paddingBottom: 130,
    flexGrow: 1,
  },

  titleBox: {
    alignItems: "center",
    marginBottom: 22,
  },

  titleIcon: {
    fontSize: 28,
    marginBottom: 4,
  },

  sectionTitle: {
    fontSize: 30,
    fontWeight: "900",
    color: "#07124A",
    letterSpacing: 0.3,
  },

  sectionSubTitle: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "700",
    color: "#6B5FE8",
  },

  card: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 20,
    borderWidth: 1.4,
    borderColor: "#DDD6FE",
    shadowColor: "#7C6BF2",
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    height: 205,
  },

  cardImageWrap: {
    width: width * 0.43,
    overflow: "hidden",
    position: "relative",
  },

  cardImage: {
    width: "100%",
    height: "100%",
  },

  imageBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(91,79,232,0.92)",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
  },

  imageBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
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
    marginTop: 4,
  },

  descRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    marginTop: 8,
    marginBottom: 12,
  },

  descStar: {
    fontSize: 14,
    marginRight: 5,
    marginTop: 1,
  },

  descText: {
    fontSize: 12.5,
    color: "#4B5563",
    lineHeight: 18,
    flex: 1,
    fontWeight: "600",
  },

  playBtn: {
    backgroundColor: "#5B4FE8",
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: "center",
    shadowColor: "#5B4FE8",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },

  playBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.4,
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