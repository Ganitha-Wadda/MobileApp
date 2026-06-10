import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import Svg, {
  Ellipse,
  Circle,
  Polygon,
  Polyline,
  Rect,
  G,
} from "react-native-svg";

function CoinIcon() {
  const bounce = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, {
          toValue: -4,
          duration: 700,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bounce, {
          toValue: 0,
          duration: 700,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View style={{ transform: [{ translateY: bounce }] }}>
      <Svg width={40} height={34} viewBox="0 0 54 46">
        <Ellipse cx="27" cy="43" rx="14" ry="3" fill="rgba(0,0,0,0.22)" />
        <Circle cx="31" cy="22" r="13" fill="#B87200" />
        <Circle cx="31" cy="22" r="11.5" fill="#F5B820" />
        <Circle cx="23" cy="25" r="13" fill="#A06000" />
        <Circle cx="23" cy="25" r="11.5" fill="#FBCA30" />
        <Circle cx="27" cy="20" r="15" fill="#8A5200" />
        <Circle cx="27" cy="20" r="14" fill="#FFD740" />
        <Circle cx="27" cy="20" r="12" fill="#FFE060" />
        <Circle cx="27" cy="20" r="10" fill="#FFF080" />
        <Circle
          cx="27"
          cy="20"
          r="14"
          fill="none"
          stroke="#F5B820"
          strokeWidth="1.5"
        />
        <Ellipse cx="21" cy="15" rx="3.5" ry="2" fill="rgba(255,255,255,0.5)" />
      </Svg>

      <Animated.View style={[styles.starOverlay, { transform: [{ rotate }] }]}>
        <Svg width={14} height={14} viewBox="0 0 20 20">
          <Polygon
            points="10,1 12.2,7.5 19,7.5 13.5,11.5 15.8,18 10,14 4.2,18 6.5,11.5 1,7.5 7.8,7.5"
            fill="#FFD700"
            opacity="0.95"
          />
        </Svg>
      </Animated.View>
    </Animated.View>
  );
}

function MedalIcon() {
  const swing = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(swing, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(swing, {
          toValue: -1,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const rotate = swing.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-7deg", "7deg"],
  });

  return (
    <Animated.View style={{ transform: [{ rotate }] }}>
      <Svg width={34} height={40} viewBox="0 0 46 54">
        <Polygon points="12,2 20,2 23,20 15,20" fill="#EF4444" />
        <Polygon points="12,2 20,2 17,11 12,15" fill="#DC2626" />
        <Polygon points="26,2 34,2 31,20 23,20" fill="#EF4444" />
        <Polygon points="26,2 34,2 29,15 26,11" fill="#DC2626" />
        <Circle cx="23" cy="37" r="15.5" fill="#FFB020" opacity={0.6} />
        <Circle cx="23" cy="37" r="15" fill="#F59E0B" />
        <Circle cx="23" cy="37" r="13" fill="#FCD34D" />
        <Circle cx="23" cy="37" r="11" fill="#FEF08A" />
        <Polygon
          points="23,28 25.2,34.5 32,34.5 26.5,38.5 28.8,45 23,41 17.2,45 19.5,38.5 14,34.5 20.8,34.5"
          fill="#F59E0B"
          stroke="#D97706"
          strokeWidth="0.5"
        />
        <Ellipse cx="16" cy="30" rx="3" ry="1.8" fill="rgba(255,255,255,0.55)" />
      </Svg>
    </Animated.View>
  );
}

function PapersIcon() {
  const bob = useRef(new Animated.Value(0)).current;
  const check = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bob, {
          toValue: -4,
          duration: 800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bob, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.timing(check, {
      toValue: 1,
      duration: 800,
      delay: 600,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, []);

  const strokeDash = check.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  return (
    <Animated.View style={{ transform: [{ translateY: bob }] }}>
      <Svg width={38} height={38} viewBox="0 0 50 50">
        <Ellipse cx="24" cy="47" rx="12" ry="2.5" fill="rgba(0,0,0,0.2)" />
        <Rect x="11" y="7" width="26" height="34" rx="4" fill="#BFDBFE" />
        <Rect x="14" y="4" width="26" height="34" rx="4" fill="#93C5FD" />
        <Rect
          x="8"
          y="10"
          width="28"
          height="34"
          rx="4"
          fill="white"
          stroke="#BFDBFE"
          strokeWidth="1"
        />
        <Rect x="16" y="7" width="12" height="7" rx="2.5" fill="#3B82F6" />
        <Rect x="19" y="5" width="6" height="5" rx="2" fill="#1D4ED8" />
        <Rect x="13" y="21" width="17" height="2.5" rx="1.2" fill="#CBD5E8" />
        <Rect x="13" y="26" width="13" height="2.5" rx="1.2" fill="#CBD5E8" />
        <Rect x="13" y="31" width="17" height="2.5" rx="1.2" fill="#CBD5E8" />
        <Rect x="13" y="36" width="10" height="2.5" rx="1.2" fill="#CBD5E8" />
        <Circle cx="30" cy="36" r="9" fill="#16A34A" />
        <Circle cx="30" cy="36" r="7.5" fill="#22C55E" />
        <Polyline
          points="26,36 29,39.5 35,30.5"
          stroke="white"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          strokeDasharray="20"
          strokeDashoffset={strokeDash}
        />
        <G rotation="40" origin="36,12">
          <Rect x="34" y="4" width="5" height="16" rx="1.5" fill="#FDE047" />
          <Polygon points="34,20 39,20 36.5,25" fill="#FBBF24" />
          <Rect x="34" y="4" width="5" height="4" rx="1" fill="#FB923C" />
        </G>
      </Svg>
    </Animated.View>
  );
}

function Sparkles({ color }) {
  const dots = [
    { top: "5%", left: "8%", size: 5, delay: 0 },
    { top: "15%", right: "10%", size: 4, delay: 500 },
    { top: "65%", left: "6%", size: 4, delay: 1100 },
    { top: "70%", right: "8%", size: 5, delay: 800 },
    { top: "35%", left: "48%", size: 4, delay: 1600 },
  ];

  return (
    <>
      {dots.map((d, i) => (
        <SparkDot key={i} {...d} color={color} index={i} />
      ))}
    </>
  );
}

function SparkDot({ top, left, right, size, delay, color, index }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.delay(300 + index * 200),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, []);

  const opacity = anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1, 0],
  });

  const scale = anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1.3, 0.2],
  });

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <Animated.View
      style={{
        position: "absolute",
        top,
        left,
        right,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity,
        transform: [{ scale }, { translateY }],
      }}
    />
  );
}

function StatCard({ label, value, icon, sparkleColor, delay = 0 }) {
  const pop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(pop, {
      toValue: 1,
      delay,
      friction: 6,
      tension: 120,
      useNativeDriver: true,
    }).start();
  }, []);

  const scale = pop.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  return (
    <Animated.View
      style={[
        styles.card,
        {
          transform: [{ scale }],
          opacity: pop,
        },
      ]}
    >
      <Sparkles color={sparkleColor} />
      <Text style={styles.cardLabel}>{label}</Text>
      <View style={styles.iconWrap}>{icon}</View>
      <Text style={styles.cardValue}>{value}</Text>
    </Animated.View>
  );
}

export default function Hero() {
  return (
    <View style={styles.container}>
      <StatCard
        label="Coins"
        value={20}
        icon={<CoinIcon />}
        sparkleColor="#FFD700"
        delay={60}
      />

      <StatCard
        label="Rank"
        value={1}
        icon={<MedalIcon />}
        sparkleColor="#FFB020"
        delay={180}
      />

      <StatCard
        label="Completed Papers"
        value={1}
        icon={<PapersIcon />}
        sparkleColor="#B8A0FF"
        delay={300}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "stretch",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#5024ce",
  },

  card: {
    flex: 1,
    height: 130,
    backgroundColor: "#5650D8",
    borderRadius: 16,
    borderWidth: 1.3,
    borderColor: "rgba(255, 255, 255, 0.22)",
    paddingVertical: 9,
    paddingHorizontal: 7,
    alignItems: "center",
    gap: 2,
    overflow: "hidden",
    position: "relative",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 6,
  },

  cardLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: 0.3,
    opacity: 0.98,
  },

  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
    height: 42,
  },

  cardValue: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
    letterSpacing: 0.6,
  },

  starOverlay: {
    position: "absolute",
    top: 6,
    left: 10,
    width: 14,
    height: 14,
  },
});