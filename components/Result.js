import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";

const RESULT_IMAGE = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

/* ── Pulsing colored dot ── */
function PulseDot({ style, color = "#FFFFFF", size = 8 }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale,   { toValue: 1.4,  duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 1,    duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale,   { toValue: 1,   duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.6, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, [scale, opacity]);

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity,
          transform: [{ scale }],
          zIndex: 10,
        },
        style,
      ]}
    />
  );
}

/* ── Paper plane SVG ── */
function PaperPlane({ size = 44 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Main body */}
      <Path d="M4 32 L60 8 L44 56 L32 40 Z" fill="#B39DDB" opacity="0.85" />
      {/* Bottom fold */}
      <Path d="M32 40 L38 52 L44 56 Z" fill="#9575CD" />
      {/* Wing crease */}
      <Path d="M32 40 L60 8" stroke="#D1C4E9" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
    </Svg>
  );
}

/* ══ Main component ══ */
export default function Resultsection({ navigation }) {
  const rotate   = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -6,  duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0,   duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, [rotate, floatAnim]);

  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return (
    /* Outer padded wrapper → gives the card margin from screen edges */
    <View style={styles.outerWrapper}>
      <LinearGradient
        colors={["#3D2BAA", "#2D1F8E", "#1E1272"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* ── Background decoration ── */}
        {/* Large glow top-right */}
        <View style={styles.glowTopRight} />
        {/* Medium glow bottom-left */}
        <View style={styles.glowBottomLeft} />
        {/* Small scattered glow dots */}
        <View style={[styles.glowDot, { top: 22, left: "42%", width: 10, height: 10, borderRadius: 5, backgroundColor: "rgba(180,120,255,0.55)" }]} />
        <View style={[styles.glowDot, { bottom: 18, left: "32%", width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(180,120,255,0.45)" }]} />

        {/* ── Dashed orbit path (behind avatar) ── */}
        <View style={styles.orbitContainer}>
          <Animated.View style={[styles.orbitRing, { transform: [{ rotate: spin }] }]} />
          {/* Colored orbit dots matching image */}
          <PulseDot color="#FFD740" size={9}  style={{ top: 2,  right: "46%" }} />
          <PulseDot color="#E040FB" size={8}  style={{ top: 14, right: 0 }} />
          <PulseDot color="#00E5FF" size={9}  style={{ bottom: 0, left: "50%" }} />
          <PulseDot color="#FF4081" size={8}  style={{ bottom: 18, right: 8 }} />
          <PulseDot color="#69F0AE" size={7}  style={{ top: "40%", left: 0 }} />

          {/* Avatar circle */}
          <Animated.View style={[styles.avatarFloat, { transform: [{ translateY: floatAnim }] }]}>
            <View style={styles.avatarCircle}>
              <Image source={{ uri: RESULT_IMAGE }} style={styles.avatarImage} resizeMode="contain" />
            </View>
          </Animated.View>
        </View>

        {/* ── Paper plane (middle decoration) ── */}
        <View style={styles.planeWrap}>
          <PaperPlane size={38} />
        </View>

        {/* ── Left text block ── */}
        <View style={styles.textBlock}>
          <Text style={styles.smallLabel}>CHECK YOUR SCORE</Text>
          <Text style={styles.title}>View Result</Text>
          <Text style={styles.subtitle}>See your latest marks and progress</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation?.navigate("resultpage")}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>View Result →</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    width: "100%",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#5024ce",
  },

  card: {
    width: "100%",
    height: 148,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
    paddingLeft: 20,
    paddingRight: 0,
    paddingVertical: 14,
    /* Shadow */
    shadowColor: "#1E1272",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 12,
  },

  /* Glow blobs */
  glowTopRight: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(130,80,255,0.28)",
    top: -60,
    right: 60,
  },
  glowBottomLeft: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(236,72,200,0.18)",
    bottom: -44,
    left: 100,
  },
  glowDot: {
    position: "absolute",
    zIndex: 2,
  },

  /* Text side */
  textBlock: {
    flex: 1,
    zIndex: 5,
    maxWidth: 200,
  },

  smallLabel: {
    fontSize: 9,
    color: "#FFD740",
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },

  title: {
    fontSize: 22,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 3,
    letterSpacing: 0.2,
  },

  subtitle: {
    fontSize: 11,
    color: "rgba(255,255,255,0.80)",
    lineHeight: 15,
    fontWeight: "500",
    marginBottom: 10,
  },

  button: {
    backgroundColor: "rgba(255,255,255,0.97)",
    paddingHorizontal: 16,
    paddingVertical: 7,
    alignSelf: "flex-start",
    borderRadius: 30,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 4,
  },

  buttonText: {
    color: "#2D1F8E",
    fontSize: 12,
    fontWeight: "900",
  },

  /* Paper plane */
  planeWrap: {
    position: "absolute",
    left: "40%",
    top: "35%",
    zIndex: 4,
    opacity: 0.85,
  },

  /* Orbit + avatar right side */
  orbitContainer: {
    width: 130,
    height: 130,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
    position: "relative",
    marginRight: 8,
  },

  orbitRing: {
    position: "absolute",
    width: 118,
    height: 118,
    borderRadius: 59,
    borderWidth: 1.5,
    borderColor: "rgba(200,180,255,0.5)",
    borderStyle: "dashed",
  },

  avatarFloat: {
    zIndex: 8,
  },

  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(100,140,220,0.55)",
    borderWidth: 3,
    borderColor: "rgba(200,200,255,0.55)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  avatarImage: {
    width: 72,
    height: 72,
  },
});