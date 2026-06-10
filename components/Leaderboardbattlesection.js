import React, { useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Svg, { Rect, Path, Polygon } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { Audio } from "expo-av";

/* ── Trophy icon ── */
function TrophyIcon({ size = 32 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <Path d="M18 8 H62 V44 C62 58 52 66 40 68 C28 66 18 58 18 44 Z" fill="#FFD740" />
      <Path d="M24 12 Q28 10 32 12 Q28 30 26 44" fill="none" stroke="#FFE97A" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
      <Path d="M18 20 Q6 20 6 32 Q6 44 18 44" fill="none" stroke="#F5A800" strokeWidth="5" strokeLinecap="round" />
      <Path d="M62 20 Q74 20 74 32 Q74 44 62 44" fill="none" stroke="#F5A800" strokeWidth="5" strokeLinecap="round" />
      <Polygon points="40,22 42.5,29 50,29 44,33.5 46.5,40.5 40,36.5 33.5,40.5 36,33.5 30,29 37.5,29" fill="#FF8F00" />
      <Rect x="36" y="68" width="8" height="7" rx="1" fill="#F5A800" />
      <Rect x="26" y="75" width="28" height="7" rx="4" fill="#FFD740" />
    </Svg>
  );
}

/* ── Crossed swords icon ── */
function SwordsIcon({ size = 32 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <Path d="M15 15 L58 58" stroke="#D0D8E8" strokeWidth="7" strokeLinecap="round" />
      <Path d="M15 15 L58 58" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
      <Rect x="48" y="20" width="14" height="6" rx="3" fill="#E8B400" transform="rotate(45 48 20)" />
      <Path d="M14 14 L8 8 L18 12 Z" fill="#B0BAC8" />
      <Path d="M65 15 L22 58" stroke="#D0D8E8" strokeWidth="7" strokeLinecap="round" />
      <Path d="M65 15 L22 58" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
      <Rect x="18" y="20" width="14" height="6" rx="3" fill="#E8B400" transform="rotate(-45 18 20)" />
      <Path d="M66 14 L72 8 L62 12 Z" fill="#B0BAC8" />
      <Rect x="52" y="52" width="14" height="6" rx="3" fill="#C8A000" transform="rotate(45 52 52)" />
      <Rect x="14" y="52" width="14" height="6" rx="3" fill="#C8A000" transform="rotate(-45 14 52)" />
    </Svg>
  );
}

/* ── Star sparkle ── */
function StarSparkle({ size = 10, color = "rgba(255,255,255,0.55)" }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Polygon points="12,2 13.8,9 21,9.3 15.5,14 17.6,21.2 12,17.3 6.4,21.2 8.5,14 3,9.3 10.2,9" />
    </Svg>
  );
}

/* ── Floating star ── */
function FloatStar({ color, size, style }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();

    return () => loop.stop();
  }, [anim]);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -4],
  });

  const opacity = anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 1, 0.3],
  });

  return (
    <Animated.View
      style={[
        { position: "absolute", opacity, transform: [{ translateY }] },
        style,
      ]}
    >
      <StarSparkle size={size} color={color} />
    </Animated.View>
  );
}

/* ── Card entrance animation ── */
function AnimatedCard({ children, delay = 0, style }) {
  const scale = useRef(new Animated.Value(0.88)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        delay,
        friction: 7,
        tension: 120,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        delay,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scale, opacity, delay]);

  return (
    <Animated.View style={[style, { opacity, transform: [{ scale }] }]}>
      {children}
    </Animated.View>
  );
}

/* ══ Main component ══ */
export default function LeaderboardBattleSection() {
  const navigation = useNavigation();
  const soundRef = useRef(null);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const playClickSound = useCallback(async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.replayAsync();
        return;
      }

      const { sound } = await Audio.Sound.createAsync(
        require("../assets/click3.mp3")
      );

      soundRef.current = sound;
      await sound.playAsync();
    } catch (error) {
      console.log("Click sound error:", error);
    }
  }, []);

  const goToLeaderboard = async () => {
    await playClickSound();
    navigation.navigate("Leaderboard");
  };

  const goToBattle = async () => {
    await playClickSound();
    navigation.navigate("battle");
  };

  return (
    <View style={styles.outer}>
      <AnimatedCard delay={80} style={styles.cardWrapper}>
        <LinearGradient
          colors={["#7B6FE8", "#5B4FD8", "#4535C8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.glow} />
          <FloatStar color="rgba(255,255,255,0.7)" size={12} style={{ top: 6, right: 12 }} />
          <FloatStar color="rgba(255,220,100,0.8)" size={8} style={{ top: 20, right: 24 }} />
          <FloatStar color="rgba(255,255,255,0.4)" size={6} style={{ top: 8, left: 14 }} />

          <View style={styles.iconWrap}>
            <TrophyIcon size={32} />
          </View>

          <Text style={styles.cardTitle}>Leaderboard</Text>
          <Text style={styles.cardSub}>See how you rank.</Text>

          <TouchableOpacity
            style={styles.btn}
            onPress={goToLeaderboard}
            activeOpacity={0.82}
          >
            <Text style={[styles.btnText, { color: "#4535C8" }]}>View</Text>
          </TouchableOpacity>
        </LinearGradient>
      </AnimatedCard>

      <AnimatedCard delay={180} style={styles.cardWrapper}>
        <LinearGradient
          colors={["#E0469A", "#C4228A", "#A8127A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.glow} />
          <FloatStar color="rgba(255,255,255,0.7)" size={12} style={{ top: 6, right: 12 }} />
          <FloatStar color="rgba(255,220,100,0.8)" size={8} style={{ top: 20, right: 24 }} />
          <FloatStar color="rgba(255,255,255,0.4)" size={6} style={{ top: 8, left: 14 }} />

          <View style={styles.iconWrap}>
            <SwordsIcon size={32} />
          </View>

          <Text style={styles.cardTitle}>Battle</Text>
          <Text style={styles.cardSub}>Challenge friends.</Text>

          <TouchableOpacity
            style={styles.btn}
            onPress={goToBattle}
            activeOpacity={0.82}
          >
            <Text style={[styles.btnText, { color: "#C4228A" }]}>
              Battle Now
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </AnimatedCard>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: "100%",
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: "#5024ce",
  },

  cardWrapper: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },

  card: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    overflow: "hidden",
    minHeight: 130,
  },

  glow: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    top: -22,
    left: -16,
    backgroundColor: "rgba(255,255,255,0.09)",
  },

  iconWrap: {
    marginBottom: 5,
    alignItems: "center",
    justifyContent: "center",
  },

  cardTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 2,
    letterSpacing: 0.2,
  },

  cardSub: {
    color: "rgba(255,255,255,0.80)",
    fontSize: 9,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 10,
  },

  btn: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 30,
    alignItems: "center",
  },

  btnText: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
});