import React, { useEffect, useRef, useCallback } from "react";
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
import { Audio } from "expo-av";

const AVATAR_URL = "https://cdn-icons-png.flaticon.com/512/6997/6997662.png";

function FloatingStar({ style, size = 13 }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1.25,
            duration: 950,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 950,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1,
            duration: 950,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.6,
            duration: 950,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    loop.start();

    return () => loop.stop();
  }, [scale, opacity]);

  return (
    <Animated.Text
      style={[
        styles.star,
        style,
        { fontSize: size, opacity, transform: [{ scale }] },
      ]}
    >
      ⭐
    </Animated.Text>
  );
}

export default function AvatarSection({ navigation }) {
  const rotate = useRef(new Animated.Value(0)).current;
  const soundRef = useRef(null);

  useEffect(() => {
    const rotateLoop = Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 6500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    rotateLoop.start();

    return () => {
      rotateLoop.stop();

      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, [rotate]);

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

  const goToAvatarPage = async () => {
    await playClickSound();
    navigation?.navigate("chooseavatarpage");
  };

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.outerWrapper}>
      <LinearGradient
        colors={["#5B4FDB", "#4535C8", "#3B2DB8"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.glowBlue} />
        <View style={styles.glowPurple} />
        <View style={styles.glowRight} />

        <FloatingStar style={{ top: 10, left: "44%" }} size={18} />
        <FloatingStar style={{ bottom: 10, right: 18 }} size={14} />

        <View style={styles.textBlock}>
          <Text style={styles.title}>My Avatar</Text>
          <Text style={styles.subtitle}>
            This is your avatar.{"\n"}Rotate and explore!
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={goToAvatarPage}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>View →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.avatarContainer}>
          <View style={styles.avatarBg} />

          <Animated.View
            style={[
              styles.orbitRing,
              { transform: [{ rotate: spin }, { scaleY: 0.52 }] },
            ]}
          />

          <View
            style={[styles.orbitDot, { top: 6, left: "50%", marginLeft: -3 }]}
          />
          <View style={[styles.orbitDot, { bottom: 8, right: 8 }]} />

          <View style={styles.avatarCircle}>
            <Image
              source={{ uri: AVATAR_URL }}
              style={styles.avatarImage}
              resizeMode="contain"
            />
          </View>
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
    height: 110,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
    paddingHorizontal: 20,
    paddingVertical: 10,
    shadowColor: "#3B2DB8",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },

  glowBlue: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(90,130,255,0.25)",
    top: -50,
    right: 80,
  },

  glowPurple: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(170,90,255,0.18)",
    bottom: -38,
    right: 20,
  },

  glowRight: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(100,80,220,0.22)",
    top: -20,
    left: "38%",
  },

  star: {
    position: "absolute",
    zIndex: 10,
  },

  textBlock: {
    zIndex: 5,
    flex: 1,
    maxWidth: 180,
  },

  title: {
    fontSize: 17,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 3,
    letterSpacing: 0.2,
  },

  subtitle: {
    fontSize: 10.5,
    color: "rgba(255,255,255,0.82)",
    lineHeight: 15,
    fontWeight: "600",
    marginBottom: 8,
  },

  button: {
    backgroundColor: "rgba(255,255,255,0.97)",
    paddingHorizontal: 18,
    paddingVertical: 6,
    alignSelf: "flex-start",
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },

  buttonText: {
    color: "#1A1A2E",
    fontSize: 12,
    fontWeight: "800",
  },

  avatarContainer: {
    width: 88,
    height: 88,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },

  avatarBg: {
    position: "absolute",
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "rgba(120,100,240,0.38)",
  },

  orbitRing: {
    position: "absolute",
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: "rgba(200,180,255,0.75)",
  },

  orbitDot: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.9)",
    shadowColor: "#FFFFFF",
    shadowOpacity: 0.9,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 4,
    elevation: 5,
    zIndex: 8,
  },

  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(100,80,220,0.45)",
    borderWidth: 2.5,
    borderColor: "rgba(200,180,255,0.6)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    zIndex: 7,
  },

  avatarImage: {
    width: 62,
    height: 62,
  },
});