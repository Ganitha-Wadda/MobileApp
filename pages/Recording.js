import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Animated,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { useEnrollmentStatus }    from "../app/features/enrollmentApi.js";
import { EnrollmentModal }        from "../components/EnrollmentGate";

const ZOOM_ICON = "https://cdn-icons-png.flaticon.com/512/4401/4401470.png";

// First recording is always the demo — clearly labelled
const recordings = [
  { id: "1", title: "Recordings - 1", desc: "Free demo lesson — watch now!", isDemo: true  },
  { id: "2", title: "Recordings - 2", desc: "This is recording",              isDemo: false },
  { id: "3", title: "Recordings - 3", desc: "This is recording",              isDemo: false },
  { id: "4", title: "Recordings - 4", desc: "This is recording",              isDemo: false },
];

// ─────────────────────────────────────────────────────────────────────────────
// Animated decorative cloud (unchanged)
// ─────────────────────────────────────────────────────────────────────────────

function AnimatedCloud({ style, scale = 1, delay = 0, distance = 18 }) {
  const move  = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(move,  { toValue: distance, duration: 2600, delay, useNativeDriver: true }),
        Animated.timing(move,  { toValue: 0,         duration: 2600,        useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: -6, duration: 1800, delay, useNativeDriver: true }),
        Animated.timing(float, { toValue: 0,  duration: 1800,        useNativeDriver: true }),
      ])
    ).start();
  }, [move, float, delay, distance]);

  return (
    <Animated.View
      style={[
        styles.cloud, style,
        { transform: [{ translateX: move }, { translateY: float }, { scale }] },
      ]}
    >
      <View style={styles.cloudCircle1} />
      <View style={styles.cloudCircle2} />
      <View style={styles.cloudCircle3} />
      <View style={styles.cloudBase}    />
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Leaf decoration (unchanged)
// ─────────────────────────────────────────────────────────────────────────────

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
      <View style={styles.leafMain}   />
      <View style={styles.leafSecond} />
      <View style={styles.leafThird}  />
    </View>
  );
}

const ZoomIcon = ({ size = 26 }) => (
  <Image source={{ uri: ZOOM_ICON }} style={{ width: size, height: size }} resizeMode="contain" />
);

// ─────────────────────────────────────────────────────────────────────────────
// Recording card
// ─────────────────────────────────────────────────────────────────────────────

const RecordingCard = ({ item, isApproved, onPress }) => {
  const locked = !item.isDemo && !isApproved;

  return (
    <TouchableOpacity
      style={[styles.card, locked && styles.cardLocked]}
      onPress={() => onPress(item)}
      activeOpacity={locked ? 0.7 : 0.85}
    >
      {/* Icon box */}
      <View style={[styles.iconBox, locked && styles.iconBoxLocked]}>
        {locked ? (
          <Text style={styles.lockIcon}>🔒</Text>
        ) : (
          <ZoomIcon size={28} />
        )}
      </View>

      {/* Text */}
      <View style={styles.textBlock}>
        <View style={styles.titleRow}>
          <Text
            style={[styles.cardTitle, locked && styles.cardTitleLocked]}
            numberOfLines={1}
          >
            {locked ? "Enroll to Access" : item.title}
          </Text>
          {item.isDemo && (
            <View style={styles.demoBadge}>
              <Text style={styles.demoBadgeText}>FREE DEMO</Text>
            </View>
          )}
        </View>
        <Text style={[styles.cardDesc, locked && styles.cardDescLocked]} numberOfLines={1}>
          {locked ? "Approve enrollment to unlock this recording" : item.desc}
        </Text>
      </View>

      {/* Action button */}
      <TouchableOpacity
        style={[styles.viewBtn, locked && styles.viewBtnLocked]}
        onPress={() => onPress(item)}
        activeOpacity={0.85}
      >
        <Text style={styles.viewBtnText}>{locked ? "Unlock" : "View"}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────────────────────────────

export default function Recording({ navigation }) {
  const { isApproved } = useEnrollmentStatus();
  const [modalVisible, setModalVisible] = useState(false);

  const handlePress = (item) => {
    if (!item.isDemo && !isApproved) {
      // Locked — open enrollment modal
      setModalVisible(true);
      return;
    }
    // Approved or demo — navigate to recording view
    navigation.navigate("viewrecording", { recordingId: item.id });
  };

  return (
    <LinearGradient
      colors={["#FAF9FF", "#F3F0FF", "#ECE8FF"]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAF9FF" />

        <View style={styles.root}>
          {/* Sparkles */}
          <Text style={[styles.sparkSmall, { top: 36, left: "18%" }]}>•</Text>
          <Text style={[styles.spark,      { top: 34, left: "22%" }]}>✦</Text>
          <Text style={[styles.spark,      { top: 34, right: "21%" }]}>✦</Text>
          <Text style={[styles.sparkSmall, { top: 31, right: "16%" }]}>•</Text>

          {/* Animated clouds */}
          <AnimatedCloud style={{ top: 92,     left:  -18 }} scale={0.85} delay={0}    />
          <AnimatedCloud style={{ top: 145,    right:  20 }} scale={0.65} delay={300}  />
          <AnimatedCloud style={{ top: 235,    left:   35 }} scale={0.5}  delay={600}  />
          <AnimatedCloud style={{ top: 315,    right:  -8 }} scale={0.72} delay={900}  />
          <AnimatedCloud style={{ bottom: 130, left:   32 }} scale={0.78} delay={1200} />
          <AnimatedCloud style={{ bottom: 105, right:  32 }} scale={0.68} delay={1500} />
          <AnimatedCloud style={{ bottom: 65,  left:   -8 }} scale={0.5}  delay={1800} />
          <AnimatedCloud style={{ bottom: 42,  right:  -2 }} scale={0.55} delay={2100} />

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.pageTitle}>Recordings</Text>
            {/* Enrollment status pill */}
            {isApproved ? (
              <View style={styles.statusPill}>
                <Text style={styles.statusPillText}>✅ Full Access</Text>
              </View>
            ) : (
              <View style={[styles.statusPill, styles.statusPillPending]}>
                <Text style={[styles.statusPillText, styles.statusPillTextPending]}>
                  🔒 Demo Mode
                </Text>
              </View>
            )}
          </View>

          {/* Cards */}
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
          >
            {recordings.map((item) => (
              <RecordingCard
                key={item.id}
                item={item}
                isApproved={isApproved}
                onPress={handlePress}
              />
            ))}

            {/* Enroll CTA banner (shown when not approved) */}
            {!isApproved && (
              <TouchableOpacity
                style={styles.enrollBanner}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={["#7C3AED", "#5B21B6"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.enrollBannerInner}
                >
                  <Text style={styles.enrollBannerEmoji}>🎓</Text>
                  <View style={styles.enrollBannerText}>
                    <Text style={styles.enrollBannerTitle}>Unlock All Recordings</Text>
                    <Text style={styles.enrollBannerSub}>
                      Enroll now and get full access once approved.
                    </Text>
                  </View>
                  <Text style={styles.enrollBannerArrow}>›</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </ScrollView>

          {/* Decorative */}
          <View style={[styles.bgCircle, styles.bgCircleLeft]}  />
          <View style={[styles.bgCircle, styles.bgCircleRight]} />
          <Text style={[styles.softDot, { bottom: 38, left: "28%" }]}>✦</Text>
          <Text style={[styles.softDot, { bottom: 46, right: "17%" }]}>✦</Text>
          <LeafDecor side="left"  />
          <LeafDecor side="right" />
        </View>
      </SafeAreaView>

      {/* Enrollment Modal — slides up when locked content is tapped */}
      <EnrollmentModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </LinearGradient>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  gradient:  { flex: 1 },
  safeArea:  { flex: 1 },

  root: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },

  titleContainer: {
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 26,
    paddingBottom: 14,
    alignItems: "center",
    zIndex: 5,
  },

  pageTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#07124A",
    textAlign: "center",
    marginBottom: 8,
  },

  statusPill: {
    backgroundColor: "#D1FAE5",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.3)",
  },
  statusPillPending: {
    backgroundColor: "#EDE9FE",
    borderColor: "rgba(109,40,217,0.3)",
  },
  statusPillText: {
    fontSize: 11.5,
    fontWeight: "800",
    color: "#065F46",
  },
  statusPillTextPending: {
    color: "#6D28D9",
  },

  scrollArea: { flex: 1, zIndex: 5 },

  container: {
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 130,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 11,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ECE8FF",
    shadowColor: "#A39BF5",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },

  cardLocked: {
    opacity: 0.72,
    backgroundColor: "rgba(237,233,254,0.6)",
    borderColor: "rgba(109,40,217,0.15)",
  },

  iconBox: {
    width: 42, height: 42,
    borderRadius: 12,
    backgroundColor: "#ECE6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  iconBoxLocked: {
    backgroundColor: "#F5F3FF",
  },

  lockIcon: { fontSize: 20 },

  textBlock: { flex: 1, paddingRight: 8 },

  titleRow: { flexDirection: "row", alignItems: "center", marginBottom: 3, flexWrap: "wrap" },

  cardTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#07124A",
    marginRight: 6,
  },

  cardTitleLocked: { color: "#6D28D9" },

  demoBadge: {
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "#FCD34D",
  },

  demoBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#92400E",
    letterSpacing: 0.4,
  },

  cardDesc: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "600",
  },

  cardDescLocked: { color: "#A78BFA" },

  viewBtn: {
    width: 83, height: 36,
    borderRadius: 12,
    backgroundColor: "#6547F5",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6547F5",
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },

  viewBtnLocked: {
    backgroundColor: "#7C3AED",
  },

  viewBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },

  // Enroll CTA banner
  enrollBanner: {
    borderRadius: 18,
    overflow: "hidden",
    marginTop: 6,
    marginBottom: 4,
    shadowColor: "#5B21B6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },

  enrollBannerInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 18,
  },

  enrollBannerEmoji: { fontSize: 28, marginRight: 14 },

  enrollBannerText: { flex: 1 },

  enrollBannerTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 3,
  },

  enrollBannerSub: {
    fontSize: 11.5,
    color: "rgba(255,255,255,0.82)",
    fontWeight: "600",
  },

  enrollBannerArrow: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "300",
  },

  // Sparkles / decoratives
  spark:      { position: "absolute", fontSize: 15, color: "#FFC84D", fontWeight: "900", zIndex: 2 },
  sparkSmall: { position: "absolute", fontSize: 18, color: "#B9AFF7", zIndex: 2 },
  softDot:    { position: "absolute", color: "#D6CDFC", fontSize: 14, zIndex: 2 },

  cloud: { position: "absolute", width: 58, height: 30, opacity: 0.8, zIndex: 1 },
  cloudCircle1: { position: "absolute", left: 4,  bottom: 4, width: 20, height: 20, borderRadius: 10, backgroundColor: "#FFFFFF" },
  cloudCircle2: { position: "absolute", left: 18, bottom: 8, width: 27, height: 27, borderRadius: 14, backgroundColor: "#FFFFFF" },
  cloudCircle3: { position: "absolute", right: 4, bottom: 4, width: 21, height: 21, borderRadius: 11, backgroundColor: "#FFFFFF" },
  cloudBase:    { position: "absolute", left: 5, right: 4, bottom: 3, height: 13, borderRadius: 8, backgroundColor: "#FFFFFF" },

  bgCircle:      { position: "absolute", width: 86, height: 86, borderRadius: 43, backgroundColor: "rgba(214,205,252,0.55)", bottom: -20, zIndex: 0 },
  bgCircleLeft:  { left: 39 },
  bgCircleRight: { right: 32 },

  leafWrapper: { position: "absolute", bottom: -8, width: 86, height: 95, zIndex: 2 },
  leafLeft:    { left: -4 },
  leafRight:   { right: -4 },
  leafFlip:    { transform: [{ scaleX: -1 }] },
  leafMain:    { position: "absolute", left: 12, bottom: 0, width: 25, height: 65, backgroundColor: "#9E94F4", borderTopLeftRadius: 30, borderTopRightRadius: 20, borderBottomLeftRadius: 10, borderBottomRightRadius: 35, transform: [{ rotate: "28deg" }] },
  leafSecond:  { position: "absolute", left: 36, bottom: -4, width: 22, height: 58, backgroundColor: "#B7AFFA", borderTopLeftRadius: 26, borderTopRightRadius: 18, borderBottomLeftRadius: 10, borderBottomRightRadius: 32, transform: [{ rotate: "10deg" }] },
  leafThird:   { position: "absolute", left: 2, bottom: -5, width: 20, height: 50, backgroundColor: "#8175E8", borderTopLeftRadius: 24, borderTopRightRadius: 15, borderBottomLeftRadius: 8, borderBottomRightRadius: 28, transform: [{ rotate: "50deg" }] },
});