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

const AVATAR_URL = "https://cdn-icons-png.flaticon.com/512/6997/6997662.png";

function FloatingStar({ style, size = 13 }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1.2,
            duration: 900,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 900,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1,
            duration: 900,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.7,
            duration: 900,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, [scale, opacity]);

  return (
    <Animated.Text
      style={[
        styles.star,
        style,
        {
          fontSize: size,
          opacity,
          transform: [{ scale }],
        },
      ]}
    >
      ⭐
    </Animated.Text>
  );
}

function OrbitDot({ style }) {
  return <View style={[styles.orbitDot, style]} />;
}

export default function AvatarSection({ navigation }) {
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 6500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [rotate]);

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <LinearGradient
      colors={["#4B3FE4", "#3F35D4", "#3730C8"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.wrapper}
    >
      <View style={styles.glowBlue} />
      <View style={styles.glowPurple} />

      <FloatingStar style={{ top: 6, left: "48%" }} size={14} />
      <FloatingStar style={{ bottom: 6, right: 12 }} size={11} />

      <View style={styles.textBlock}>
        <Text style={styles.title}>My Avatar</Text>
        <Text style={styles.subtitle}>
          This is your avatar.{"\n"}Rotate and explore!
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation?.navigate("chooseavatarpage")}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>View →</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.avatarContainer}>
        <Animated.View
          style={[
            styles.orbitRing,
            {
              transform: [{ rotate: spin }, { scaleY: 0.5 }],
            },
          ]}
        />

        <OrbitDot style={{ top: 8, left: "50%", marginLeft: -3 }} />
        <OrbitDot style={{ bottom: 10, right: 12 }} />

        <Image
          source={{ uri: AVATAR_URL }}
          style={styles.avatarImage}
          resizeMode="contain"
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    height: 88,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
    position: "relative",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 0,
  },

  glowBlue: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(80,120,255,0.28)",
    top: -40,
    right: 60,
  },

  glowPurple: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(160,80,255,0.22)",
    bottom: -30,
    right: 16,
  },

  star: {
    position: "absolute",
    zIndex: 10,
  },

  textBlock: {
    zIndex: 5,
    flex: 1,
    maxWidth: 190,
  },

  title: {
    fontSize: 15,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 2,
  },

  subtitle: {
    fontSize: 10,
    color: "rgba(255,255,255,0.82)",
    lineHeight: 14,
    fontWeight: "600",
    marginBottom: 6,
  },

  button: {
    backgroundColor: "rgba(255,255,255,0.96)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: "flex-start",
    borderRadius: 0,
  },

  buttonText: {
    color: "#1A1A2E",
    fontSize: 11,
    fontWeight: "800",
  },

  avatarContainer: {
    width: 76,
    height: 76,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },

  orbitRing: {
    position: "absolute",
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: "rgba(255,160,80,0.9)",
  },

  orbitDot: {
    position: "absolute",
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "rgba(255,255,255,0.95)",
    shadowColor: "#FFFFFF",
    shadowOpacity: 0.8,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 4,
    elevation: 4,
    zIndex: 8,
  },

  avatarImage: {
    width: 62,
    height: 62,
    zIndex: 7,
  },
});