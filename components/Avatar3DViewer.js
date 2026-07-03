import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

const COLOR_MAP = {
  skinColor: {
    Light: "#f5d0b5",
    Tanned: "#e6b78f",
    Yellow: "#f2cf97",
    Brown: "#c78f66",
    DarkBrown: "#8d5a3a",
    Black: "#5a3c2a",
  },
  hairColor: {
    Black: "#111827",
    Brown: "#6b442d",
    BrownDark: "#3f2a1d",
    Auburn: "#8a3d2b",
    Blonde: "#d8b45a",
    BlondeGolden: "#f2c14d",
    PastelPink: "#d88eb2",
  },
  clothingColor: {
    Black: "#111827",
    Blue01: "#1d4ed8",
    Blue02: "#1e3a8a",
    Heather: "#6b7280",
    PastelBlue: "#93c5fd",
    PastelGreen: "#86efac",
    Red: "#dc2626",
  },
  backgroundColor: {
    dbeafe: "#dbeafe",
    fde68a: "#fde68a",
    fecdd3: "#fecdd3",
    bbf7d0: "#bbf7d0",
    ddd6fe: "#ddd6fe",
    f5d0fe: "#f5d0fe",
  },
};

const pickColor = (mapName, key, fallback) => COLOR_MAP[mapName]?.[key] || fallback;

export default function Avatar3DViewer({ avatarConfig, style }) {
  const spin = useRef(new Animated.Value(0)).current;
  const bob = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spinLoop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 6200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    const bobLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, {
          toValue: -8,
          duration: 1100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bob, {
          toValue: 0,
          duration: 1100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    spinLoop.start();
    bobLoop.start();

    return () => {
      spinLoop.stop();
      bobLoop.stop();
    };
  }, [bob, spin]);

  const rotateY = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["-12deg", "348deg"],
  });

  const visual = useMemo(
    () => ({
      skin: pickColor("skinColor", avatarConfig?.skinColor, "#f5d0b5"),
      hair: pickColor("hairColor", avatarConfig?.hairColor, "#3f2a1d"),
      cloth: pickColor("clothingColor", avatarConfig?.clothingColor, "#1e3a8a"),
      bg: pickColor("backgroundColor", avatarConfig?.backgroundColor, "#dbeafe"),
      hasFacialHair: avatarConfig?.facialHair && avatarConfig?.facialHair !== "Blank",
      hasAccessories: avatarConfig?.accessories && avatarConfig?.accessories !== "Blank",
      isHat:
        avatarConfig?.top === "Hat" ||
        avatarConfig?.top === "Turban" ||
        avatarConfig?.top === "Hijab",
      isWink: avatarConfig?.eyes === "Wink",
      isSquint: avatarConfig?.eyes === "Squint",
      seriousFace:
        avatarConfig?.mouth === "Serious" || avatarConfig?.mouth === "Concerned",
    }),
    [avatarConfig]
  );

  return (
    <View style={[styles.viewerWrap, { backgroundColor: visual.bg }, style]}>
      <View style={styles.backGlowOne} />
      <View style={styles.backGlowTwo} />

      <View style={styles.floorShadow} />
      <View style={styles.floorRing} />

      <Animated.View
        style={[
          styles.avatarWrap,
          {
            transform: [
              { perspective: 900 },
              { translateY: bob },
              { rotateY },
            ],
          },
        ]}
      >
        <View style={[styles.body, { backgroundColor: visual.cloth }]} />

        <View style={[styles.armLeft, { backgroundColor: visual.cloth }]} />
        <View style={[styles.armRight, { backgroundColor: visual.cloth }]} />

        <View style={[styles.neck, { backgroundColor: visual.skin }]} />
        <View style={[styles.head, { backgroundColor: visual.skin }]}>
          <View style={styles.eyesRow}>
            <View
              style={[
                styles.eye,
                visual.isSquint && styles.eyeSquint,
                visual.isWink && styles.eyeWink,
              ]}
            />
            <View style={[styles.eye, visual.isSquint && styles.eyeSquint]} />
          </View>

          <View style={[styles.mouth, visual.seriousFace && styles.mouthSerious]} />

          {visual.hasAccessories ? (
            <>
              <View style={styles.glassLeft} />
              <View style={styles.glassRight} />
              <View style={styles.glassBridge} />
            </>
          ) : null}

          {visual.hasFacialHair ? <View style={[styles.beard, { backgroundColor: visual.hair }]} /> : null}
        </View>

        {visual.isHat ? (
          <View style={[styles.hat, { backgroundColor: visual.hair }]} />
        ) : (
          <View style={[styles.hairCap, { backgroundColor: visual.hair }]} />
        )}

        <View style={styles.legsRow}>
          <View style={styles.leg} />
          <View style={styles.leg} />
        </View>

        <View style={styles.shoesRow}>
          <View style={styles.shoe} />
          <View style={styles.shoe} />
        </View>
      </Animated.View>

      <View style={styles.sparkOne} />
      <View style={styles.sparkTwo} />
      <View style={styles.sparkThree} />
    </View>
  );
}

const styles = StyleSheet.create({
  viewerWrap: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
  },
  backGlowOne: {
    position: "absolute",
    top: -30,
    left: -20,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.32)",
  },
  backGlowTwo: {
    position: "absolute",
    right: -20,
    bottom: 20,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(56,189,248,0.25)",
  },
  floorShadow: {
    position: "absolute",
    bottom: 18,
    alignSelf: "center",
    width: 190,
    height: 28,
    borderRadius: 20,
    backgroundColor: "rgba(15,23,42,0.18)",
  },
  floorRing: {
    position: "absolute",
    bottom: 22,
    alignSelf: "center",
    width: 210,
    height: 34,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
  },
  avatarWrap: {
    width: 210,
    height: 235,
    alignSelf: "center",
    marginTop: 10,
    alignItems: "center",
  },
  body: {
    position: "absolute",
    top: 92,
    width: 108,
    height: 92,
    borderRadius: 30,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.24,
    shadowRadius: 8,
    elevation: 4,
  },
  armLeft: {
    position: "absolute",
    top: 96,
    left: 34,
    width: 22,
    height: 72,
    borderRadius: 16,
    transform: [{ rotate: "18deg" }],
  },
  armRight: {
    position: "absolute",
    top: 96,
    right: 34,
    width: 22,
    height: 72,
    borderRadius: 16,
    transform: [{ rotate: "-18deg" }],
  },
  neck: {
    position: "absolute",
    top: 74,
    width: 24,
    height: 24,
    borderRadius: 10,
  },
  head: {
    position: "absolute",
    top: 22,
    width: 98,
    height: 98,
    borderRadius: 52,
    alignItems: "center",
  },
  hairCap: {
    position: "absolute",
    top: 14,
    width: 102,
    height: 52,
    borderTopLeftRadius: 54,
    borderTopRightRadius: 54,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  hat: {
    position: "absolute",
    top: 6,
    width: 112,
    height: 30,
    borderRadius: 24,
  },
  eyesRow: {
    marginTop: 34,
    width: 62,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  eye: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#0f172a",
  },
  eyeWink: {
    height: 3,
    marginTop: 4,
  },
  eyeSquint: {
    height: 4,
    marginTop: 3,
  },
  mouth: {
    marginTop: 14,
    width: 24,
    height: 12,
    borderBottomWidth: 3,
    borderColor: "#7f1d1d",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  mouthSerious: {
    width: 18,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  glassLeft: {
    position: "absolute",
    top: 33,
    left: 18,
    width: 22,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#0f172a",
  },
  glassRight: {
    position: "absolute",
    top: 33,
    right: 18,
    width: 22,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#0f172a",
  },
  glassBridge: {
    position: "absolute",
    top: 38,
    width: 10,
    height: 2,
    backgroundColor: "#0f172a",
  },
  beard: {
    position: "absolute",
    bottom: 6,
    width: 56,
    height: 26,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    opacity: 0.92,
  },
  legsRow: {
    position: "absolute",
    top: 176,
    width: 72,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  leg: {
    width: 24,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#334155",
  },
  shoesRow: {
    position: "absolute",
    top: 214,
    width: 80,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  shoe: {
    width: 30,
    height: 12,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  sparkOne: {
    position: "absolute",
    top: 20,
    right: 26,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#facc15",
  },
  sparkTwo: {
    position: "absolute",
    top: 52,
    left: 28,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ffffff",
  },
  sparkThree: {
    position: "absolute",
    bottom: 84,
    right: 44,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#38bdf8",
  },
});
