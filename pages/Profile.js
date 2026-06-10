import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  StatusBar,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

const PURPLE = "#6c5ce7";
const LIGHT_BG = "#f0eeff";

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

const Star = ({ size = 16, color = "#a78bfa", style }) => (
  <Text style={[{ fontSize: size, color, position: "absolute" }, style]}>
    ★
  </Text>
);

const ProfileField = ({ icon, label, value }) => (
  <View style={styles.fieldRow}>
    <View style={styles.fieldIconWrap}>
      <Text style={styles.fieldIcon}>{icon}</Text>
    </View>

    <Text style={styles.fieldLabel}>{label}</Text>

    <View style={styles.fieldValueWrap}>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  </View>
);

export default function Profile({ navigation }) {
  return (
    <LinearGradient
      colors={["#FAF9FF", "#F3F0FF", "#ECE8FF"]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
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
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.avatarCard}>
              <Star size={18} color="#f6c90e" style={{ top: 18, left: 22 }} />
              <Star size={13} color="#a78bfa" style={{ top: 12, left: 60 }} />
              <Star size={22} color="#f6c90e" style={{ top: 28, right: 30 }} />
              <Star size={14} color="#a78bfa" style={{ top: 14, right: 70 }} />
              <Star size={12} color="#60a5fa" style={{ top: 55, right: 18 }} />
              <Star size={10} color="#f472b6" style={{ bottom: 60, left: 18 }} />
              <Star size={16} color="#a78bfa" style={{ bottom: 55, right: 22 }} />
              <Star size={12} color="#60a5fa" style={{ top: 40, left: 14 }} />

              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: "#f6c90e",
                    top: 65,
                    right: 44,
                    width: 8,
                    height: 8,
                  },
                ]}
              />
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: "#f472b6",
                    top: 80,
                    left: 34,
                    width: 7,
                    height: 7,
                  },
                ]}
              />
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: "#60a5fa",
                    bottom: 70,
                    right: 50,
                    width: 9,
                    height: 9,
                  },
                ]}
              />

              <View style={styles.glowPlatformOuter}>
                <View style={styles.glowPlatformInner} />
              </View>

              <Image
                source={{ uri: "https://i.imgur.com/0y8Ftya.png" }}
                style={styles.avatarImage}
                resizeMode="contain"
              />

              <TouchableOpacity style={styles.viewAvatarBtn} activeOpacity={0.85}>
                <Text style={styles.viewAvatarIcon}>👤</Text>
                <Text style={styles.viewAvatarText}>View Avatar</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.profileCard}>
              <View style={styles.profileHeader}>
                <View style={styles.profileTitleRow}>
                  <View style={styles.profileIconBox}>
                    <Text style={styles.profileIconText}>👤</Text>
                  </View>
                  <Text style={styles.profileTitle}>Profile</Text>
                </View>

                <Text style={styles.headerStar}>★</Text>
              </View>

              <View style={styles.divider} />

              <ProfileField icon="👤" label="Name" value="Saman Ekanayake" />
              <View style={styles.fieldDivider} />

              <ProfileField icon="🎓" label="Grade" value="3" />
              <View style={styles.fieldDivider} />

              <ProfileField icon="📍" label="District" value="Kandy" />
              <View style={styles.fieldDivider} />

              <ProfileField icon="👥" label="Gender" value="Male" />

              <TouchableOpacity style={styles.updateBtn} activeOpacity={0.85}>
                <Text style={styles.updateIcon}>✏️</Text>
                <Text style={styles.updateText}>Update</Text>
              </TouchableOpacity>
            </View>
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
  gradient: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },

  root: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },

  scrollArea: {
    flex: 1,
    zIndex: 5,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 130,
    gap: 16,
  },

  avatarCard: {
    backgroundColor: "rgba(245,243,255,0.94)",
    borderRadius: 24,
    paddingTop: 20,
    paddingBottom: 24,
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
    minHeight: 300,
    shadowColor: "#A39BF5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#ECE8FF",
  },

  dot: {
    position: "absolute",
    borderRadius: 99,
  },

  glowPlatformOuter: {
    width: 200,
    height: 60,
    borderRadius: 100,
    backgroundColor: "rgba(168, 139, 250, 0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    borderWidth: 2,
    borderColor: "rgba(192, 132, 252, 0.25)",
  },

  glowPlatformInner: {
    width: 130,
    height: 36,
    borderRadius: 100,
    backgroundColor: "rgba(236, 72, 153, 0.12)",
    borderWidth: 1.5,
    borderColor: "rgba(236, 72, 153, 0.3)",
  },

  avatarImage: {
    width: 200,
    height: 200,
    marginTop: -80,
    zIndex: 2,
  },

  viewAvatarBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PURPLE,
    borderRadius: 30,
    paddingVertical: 11,
    paddingHorizontal: 28,
    marginTop: 8,
    gap: 8,
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },

  viewAvatarIcon: {
    fontSize: 16,
  },

  viewAvatarText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  profileCard: {
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
    shadowColor: "#A39BF5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#ECE8FF",
  },

  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  profileTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  profileIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: LIGHT_BG,
    alignItems: "center",
    justifyContent: "center",
  },

  profileIconText: {
    fontSize: 18,
  },

  profileTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#07124A",
    letterSpacing: 0.1,
  },

  headerStar: {
    fontSize: 22,
    color: "#f6c90e",
  },

  divider: {
    height: 1,
    backgroundColor: "#eeebff",
    marginBottom: 6,
  },

  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    gap: 12,
  },

  fieldIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: LIGHT_BG,
    alignItems: "center",
    justifyContent: "center",
  },

  fieldIcon: {
    fontSize: 16,
  },

  fieldLabel: {
    width: 68,
    fontSize: 13,
    fontWeight: "600",
    color: "#888",
  },

  fieldValueWrap: {
    flex: 1,
    backgroundColor: "#f7f5ff",
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },

  fieldValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a3e",
  },

  fieldDivider: {
    height: 1,
    backgroundColor: "#f0eeff",
    marginLeft: 46,
  },

  updateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PURPLE,
    borderRadius: 30,
    paddingVertical: 13,
    marginTop: 20,
    gap: 8,
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },

  updateIcon: {
    fontSize: 15,
  },

  updateText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
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