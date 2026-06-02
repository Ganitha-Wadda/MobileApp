import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Svg, {
  Circle,
  Rect,
  Path,
  Polygon,
  Text as SvgText,
} from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";

function TrophyIcon({ size = 34 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 72 72" fill="none">
      <Path
        d="M20 10 H52 V38 C52 50 44 56 36 58 C28 56 20 50 20 38 Z"
        fill="#FFD740"
        stroke="#F5A800"
        strokeWidth="2"
      />
      <Path
        d="M20 18 Q10 18 10 27 Q10 36 20 36"
        fill="none"
        stroke="#F5A800"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <Path
        d="M52 18 Q62 18 62 27 Q62 36 52 36"
        fill="none"
        stroke="#F5A800"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <Polygon
        points="36,21 38,27 44,27 39,31 41,37 36,33.5 31,37 33,31 28,27 34,27"
        fill="#FF9800"
      />
      <Rect x="32" y="58" width="8" height="6" rx="1" fill="#F5A800" />
      <Rect x="24" y="64" width="24" height="6" rx="3" fill="#FFD740" />
    </Svg>
  );
}

function BattleIcon({ size = 34 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 72 72" fill="none">
      <Circle cx="36" cy="36" r="30" fill="#FFFFFF" opacity="0.22" />
      <Path
        d="M22 51 L51 22"
        stroke="#FFFFFF"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <Path d="M50 21 L56 16 L53 27 Z" fill="#FFD740" />
      <Path
        d="M20 21 L49 50"
        stroke="#FFFFFF"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <Path d="M19 20 L14 15 L25 18 Z" fill="#FFD740" />
      <Rect
        x="17"
        y="48"
        width="13"
        height="7"
        rx="3"
        fill="#FFD740"
        transform="rotate(-45 17 48)"
      />
      <Rect
        x="44"
        y="48"
        width="13"
        height="7"
        rx="3"
        fill="#FFD740"
        transform="rotate(45 44 48)"
      />
      <SvgText
        x="36"
        y="42"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="15"
        fontWeight="900"
      >
        VS
      </SvgText>
    </Svg>
  );
}

function FloatDot({ color, style }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [anim]);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -5],
  });

  const opacity = anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.35, 1, 0.35],
  });

  return (
    <Animated.View
      style={[
        styles.floatDot,
        {
          backgroundColor: color,
          opacity,
          transform: [{ translateY }],
        },
        style,
      ]}
    />
  );
}

function AnimatedCard({ children, delay = 0, style }) {
  const scale = useRef(new Animated.Value(0.92)).current;
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
        duration: 300,
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

export default function LeaderboardBattleSection() {
  const navigation = useNavigation();

  return (
    <View style={styles.outer}>
      <View style={styles.row}>
        <AnimatedCard delay={80} style={styles.cardBox}>
          <LinearGradient
            colors={["#1976D2", "#0D47A1"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            <FloatDot color="#FFD740" style={{ top: 8, left: 10 }} />
            <FloatDot color="#FFFFFF" style={{ top: 12, right: 14 }} />

            <View style={styles.iconCenter}>
              <TrophyIcon size={34} />
            </View>

            <Text style={styles.title}>Leaderboard</Text>
            <Text style={styles.subtitle}>See how you rank.</Text>

            <TouchableOpacity
              style={styles.leaderButton}
              onPress={() => navigation.navigate("Leaderboard")}
              activeOpacity={0.85}
            >
              <Text style={styles.leaderButtonText}>View</Text>
            </TouchableOpacity>
          </LinearGradient>
        </AnimatedCard>

        <AnimatedCard delay={170} style={styles.cardBox}>
          <LinearGradient
            colors={["#EF5350", "#C62828"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            <FloatDot color="#FFD740" style={{ top: 8, left: 10 }} />
            <FloatDot color="#FFFFFF" style={{ top: 12, right: 14 }} />

            <View style={styles.iconCenter}>
              <BattleIcon size={34} />
            </View>

            <Text style={styles.title}>Battle</Text>
            <Text style={styles.subtitle}>Challenge friends.</Text>

            <TouchableOpacity
              style={styles.battleButton}
              onPress={() => navigation.navigate("game")}
              activeOpacity={0.85}
            >
              <Text style={styles.battleButtonText}>Battle Now</Text>
            </TouchableOpacity>
          </LinearGradient>
        </AnimatedCard>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: "100%",
    height: 108,
    backgroundColor: "#6764FF",
  },
  row: {
    flex: 1,
    width: "100%",
    flexDirection: "row",
  },
  cardBox: {
    flex: 1,
    height: "100%",
  },
  card: {
    flex: 1,
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 0,
  },
  iconCenter: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 1,
  },
  subtitle: {
    color: "rgba(255,255,255,0.86)",
    fontSize: 9,
    fontWeight: "600",
    lineHeight: 12,
    textAlign: "center",
    marginBottom: 5,
  },
  leaderButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 0,
  },
  leaderButtonText: {
    color: "#1565C0",
    fontSize: 11,
    fontWeight: "900",
  },
  battleButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 0,
  },
  battleButtonText: {
    color: "#D32F2F",
    fontSize: 11,
    fontWeight: "900",
  },
  floatDot: {
    position: "absolute",
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
});