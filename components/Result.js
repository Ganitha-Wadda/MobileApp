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

const RESULT_IMAGE =
  "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

function FloatingBubble({ style, size = 8 }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.55)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1.35,
            duration: 1000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.55,
            duration: 1000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, [scale, opacity]);

  return (
    <Animated.View
      style={[
        styles.bubble,
        style,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity,
          transform: [{ scale }],
        },
      ]}
    />
  );
}

export default function Resultsection({ navigation }) {
  const rotate = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 7000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -5,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [rotate, floatAnim]);

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <LinearGradient
      colors={["#6D28D9", "#4C1D95", "#2E1065"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.wrapper}
    >
      <View style={styles.lightCircleOne} />
      <View style={styles.lightCircleTwo} />
      <View style={styles.lineOne} />
      <View style={styles.lineTwo} />

      <FloatingBubble style={{ top: 12, left: "44%" }} size={7} />
      <FloatingBubble style={{ bottom: 14, left: "58%" }} size={5} />
      <FloatingBubble style={{ top: 18, right: 18 }} size={6} />

      <View style={styles.textBlock}>
        <Text style={styles.smallText}>Check Your Score</Text>
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

      <Animated.View
        style={[
          styles.imageBox,
          {
            transform: [{ translateY: floatAnim }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.networkRing,
            {
              transform: [{ rotate: spin }],
            },
          ]}
        />

        <View style={styles.nodeTop} />
        <View style={styles.nodeRight} />
        <View style={styles.nodeBottom} />

        <Image
          source={{ uri: RESULT_IMAGE }}
          style={styles.resultImage}
          resizeMode="contain"
        />
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    height: 96,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
    position: "relative",
    paddingHorizontal: 18,
    paddingVertical: 10,
  },

  lightCircleOne: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(168,85,247,0.35)",
    top: -55,
    right: 30,
  },

  lightCircleTwo: {
    position: "absolute",
    width: 95,
    height: 95,
    borderRadius: 48,
    backgroundColor: "rgba(236,72,153,0.22)",
    bottom: -38,
    left: 90,
  },

  lineOne: {
    position: "absolute",
    width: 120,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.16)",
    right: 15,
    top: 30,
    transform: [{ rotate: "-25deg" }],
  },

  lineTwo: {
    position: "absolute",
    width: 90,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.12)",
    right: 45,
    bottom: 24,
    transform: [{ rotate: "22deg" }],
  },

  bubble: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    zIndex: 10,
  },

  textBlock: {
    flex: 1,
    zIndex: 5,
    maxWidth: 210,
  },

  smallText: {
    fontSize: 9,
    color: "rgba(255,255,255,0.72)",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 1,
  },

  title: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 2,
  },

  subtitle: {
    fontSize: 10,
    color: "rgba(255,255,255,0.82)",
    lineHeight: 14,
    fontWeight: "600",
    marginBottom: 7,
  },

  button: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 13,
    paddingVertical: 6,
    alignSelf: "flex-start",
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 4,
  },

  buttonText: {
    color: "#4C1D95",
    fontSize: 11,
    fontWeight: "900",
  },

  imageBox: {
    width: 78,
    height: 78,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },

  networkRing: {
    position: "absolute",
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.35)",
    borderStyle: "dashed",
  },

  nodeTop: {
    position: "absolute",
    top: 5,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#FDE68A",
    zIndex: 6,
  },

  nodeRight: {
    position: "absolute",
    right: 5,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#A7F3D0",
    zIndex: 6,
  },

  nodeBottom: {
    position: "absolute",
    bottom: 6,
    left: 15,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#F9A8D4",
    zIndex: 6,
  },

  resultImage: {
    width: 56,
    height: 56,
    zIndex: 8,
  },
});