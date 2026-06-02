import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Linking,
  StatusBar,
  Dimensions,
} from "react-native";

const { width, height } = Dimensions.get("window");

const isSmallScreen = width < 380;
const isShortScreen = height < 760;
const isVeryShortScreen = height < 700;

// ── decorative star/sparkle component ──────────────────────────────────────
const Star = ({ style, size = 18, color = "#A78BFA" }) => (
  <Text style={[{ fontSize: size, position: "absolute", color }, style]}>
    ★
  </Text>
);

const Sparkle = ({ style, size = 12, color = "#C4B5FD" }) => (
  <Text style={[{ fontSize: size, position: "absolute", color }, style]}>
    ✦
  </Text>
);

// ── pulsing LIVE dot ────────────────────────────────────────────────────────
const LiveDot = () => {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.6,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.liveDotWrapper}>
      <Animated.View
        style={[styles.liveDotRing, { transform: [{ scale: pulse }] }]}
      />
      <View style={styles.liveDot} />
    </View>
  );
};

// ── main screen ─────────────────────────────────────────────────────────────
export default function Live() {
  const cardScale = useRef(new Animated.Value(0.94)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const btnTranslate = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(cardScale, {
        toValue: 1,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(btnTranslate, {
        toValue: 0,
        friction: 7,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLink = (url) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#EDE9FE" />

      <View style={styles.container}>
        {/* header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.liveIconBg}>
              <Text style={styles.liveIconPlay}>▶</Text>

              <View style={styles.liveBadge}>
                <Text style={styles.liveBadgeText}>LIVE</Text>
              </View>
            </View>

            <View style={styles.headerTextBox}>
              <Text style={styles.headerTitle}>Today's Live Session</Text>
              <Text style={styles.headerSub}>Join your class and learn live!</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.calendarBtn} activeOpacity={0.8}>
            <Text style={styles.calendarIcon}>📅</Text>
          </TouchableOpacity>
        </View>

        {/* main card */}
        <Animated.View
          style={[
            styles.card,
            {
              transform: [{ scale: cardScale }],
              opacity: cardOpacity,
            },
          ]}
        >
          {/* floating decoration */}
          <Star
            style={{ top: isVeryShortScreen ? 16 : 20, left: 24 }}
            size={isVeryShortScreen ? 17 : 19}
            color="#7C3AED"
          />

          <Sparkle
            style={{ top: isVeryShortScreen ? 32 : 40, right: 30 }}
            size={isVeryShortScreen ? 10 : 12}
            color="#C084FC"
          />

          <Sparkle
            style={{ top: isVeryShortScreen ? 72 : 88, left: 55 }}
            size={9}
            color="#818CF8"
          />

          <Star
            style={{ top: isVeryShortScreen ? 100 : 118, right: 18 }}
            size={isVeryShortScreen ? 22 : 24}
            color="#FBBF24"
          />

          <Sparkle
            style={{ bottom: isVeryShortScreen ? 120 : 140, right: 40 }}
            size={10}
            color="#A78BFA"
          />

          <Sparkle
            style={{ bottom: isVeryShortScreen ? 160 : 185, left: 30 }}
            size={9}
            color="#C4B5FD"
          />

          {/* cloud blobs */}
          <Text
            style={[
              styles.cloud,
              {
                top: isVeryShortScreen ? 78 : 92,
                left: -10,
                fontSize: isVeryShortScreen ? 32 : 38,
              },
            ]}
          >
            ☁️
          </Text>

          <Text
            style={[
              styles.cloud,
              {
                bottom: isVeryShortScreen ? 88 : 110,
                right: -6,
                fontSize: isVeryShortScreen ? 28 : 32,
              },
            ]}
          >
            ☁️
          </Text>

          {/* LIVE NOW badge */}
          <View style={styles.liveNowBadge}>
            <LiveDot />
            <Text style={styles.liveNowText}>LIVE NOW</Text>
          </View>

          {/* class name */}
          <View style={styles.classNameRow}>
            <Text style={styles.classDecor}>≻</Text>
            <Text style={styles.className}>Chakkre</Text>
            <Text style={styles.classDecor}>≺</Text>
          </View>

          {/* avatar */}
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarRing}>
              <View style={styles.avatarInner}>
                <Image
                  source={require("F:/public_folder/Ganitha Wadda/App/assets/charithsir.png")}
                  style={styles.avatar}
                  resizeMode="cover"
                />
              </View>
            </View>

            <View style={styles.cameraBadge}>
              <Text style={styles.cameraIcon}>🎥</Text>
            </View>
          </View>

          {/* teacher info */}
          <Text style={styles.teacherName}>Charith Gimhan</Text>
          <Text style={styles.teacherRole}>Psychology consultant</Text>

          {/* divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerStar}>★</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* action buttons */}
          <Animated.View
            style={[
              styles.buttonsBlock,
              {
                transform: [{ translateY: btnTranslate }],
              },
            ]}
          >
            <TouchableOpacity
              style={[styles.linkBtn, styles.linkBtn1]}
              onPress={() => handleLink("https://zoom.us/j/your-link-1")}
              activeOpacity={0.82}
            >
              <View style={styles.btnIconCircle}>
                <Text style={styles.btnIcon}>🎥</Text>
              </View>

              <Text style={styles.linkBtnText}>Live Link 1</Text>
              <Text style={styles.linkBtnArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.linkBtn, styles.linkBtn2]}
              onPress={() => handleLink("https://zoom.us/j/your-link-2")}
              activeOpacity={0.82}
            >
              <View style={styles.btnIconCircle}>
                <Text style={styles.btnIcon}>🎥</Text>
              </View>

              <Text style={styles.linkBtnText}>Live Link 2</Text>
              <Text style={styles.linkBtnArrow}>›</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        {/* reminder strip */}
        <View style={styles.reminderStrip}>
          <View style={styles.reminderIcon}>
            <Text style={styles.reminderIconText}>🛡️</Text>
          </View>

          <View style={styles.reminderTextBox}>
            <Text style={styles.reminderTitle}>Be ready and stay on time!</Text>
            <Text style={styles.reminderSub}>
              Make sure you have a good internet connection and join a few minutes
              early.
            </Text>
          </View>

          <Text style={styles.clockIcon}>⏰</Text>
        </View>
      </View>
    </View>
  );
}

// ── styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#EDE9FE",
  },

  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "#EDE9FE",
    paddingHorizontal: isSmallScreen ? 14 : 18,
    paddingTop: isVeryShortScreen ? 8 : 12,
    paddingBottom: isVeryShortScreen ? 8 : 12,
    alignItems: "center",
    justifyContent: "center",
  },

  header: {
    width: "100%",
    maxWidth: 480,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: isVeryShortScreen ? 7 : 9,
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  liveIconBg: {
    width: isVeryShortScreen ? 38 : 42,
    height: isVeryShortScreen ? 38 : 42,
    borderRadius: 14,
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
  },

  liveIconPlay: {
    color: "#FFFFFF",
    fontSize: isVeryShortScreen ? 14 : 16,
  },

  liveBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: "#EF4444",
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },

  liveBadgeText: {
    color: "#FFFFFF",
    fontSize: 7,
    fontWeight: "800",
  },

  headerTextBox: {
    marginLeft: 10,
    flex: 1,
  },

  headerTitle: {
    fontSize: isVeryShortScreen ? 13 : 15,
    fontWeight: "800",
    color: "#1E1B4B",
  },

  headerSub: {
    fontSize: isVeryShortScreen ? 9.5 : 10.5,
    color: "#7C6FCD",
    marginTop: 1,
  },

  calendarBtn: {
    width: isVeryShortScreen ? 34 : 38,
    height: isVeryShortScreen ? 34 : 38,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#7C3AED",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
    marginLeft: 8,
  },

  calendarIcon: {
    fontSize: isVeryShortScreen ? 16 : 18,
  },

  card: {
    width: "100%",
    maxWidth: 480,
    backgroundColor: "#F5F3FF",
    borderRadius: 24,
    paddingHorizontal: isSmallScreen ? 16 : 20,
    paddingTop: isVeryShortScreen ? 10 : 13,
    paddingBottom: isVeryShortScreen ? 12 : 15,
    alignItems: "center",
    shadowColor: "#7C3AED",
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 8,
    overflow: "hidden",
  },

  cloud: {
    position: "absolute",
    opacity: 0.48,
  },

  liveNowBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EDE9FE",
    borderRadius: 20,
    paddingHorizontal: isVeryShortScreen ? 10 : 12,
    paddingVertical: isVeryShortScreen ? 3 : 4,
    borderWidth: 1,
    borderColor: "#DDD6FE",
    marginBottom: isVeryShortScreen ? 5 : 7,
  },

  liveDotWrapper: {
    width: 11,
    height: 11,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },

  liveDotRing: {
    position: "absolute",
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#FCA5A5",
    opacity: 0.45,
  },

  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#EF4444",
  },

  liveNowText: {
    fontSize: isVeryShortScreen ? 9.5 : 10.5,
    fontWeight: "700",
    color: "#374151",
    letterSpacing: 0.7,
  },

  classNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: isVeryShortScreen ? 7 : 9,
  },

  classDecor: {
    fontSize: isVeryShortScreen ? 16 : 18,
    color: "#FBBF24",
    marginHorizontal: 7,
    fontWeight: "900",
  },

  className: {
    fontSize: isVeryShortScreen ? 22 : 25,
    fontWeight: "900",
    color: "#1E1B4B",
    letterSpacing: 0.5,
  },

  avatarWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: isVeryShortScreen ? 7 : 9,
  },

  avatarRing: {
    width: isVeryShortScreen ? 102 : isShortScreen ? 112 : 125,
    height: isVeryShortScreen ? 102 : isShortScreen ? 112 : 125,
    borderRadius: isVeryShortScreen ? 51 : isShortScreen ? 56 : 63,
    borderWidth: 3,
    borderColor: "#C4B5FD",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAD4D4",
  },

  avatarInner: {
    width: isVeryShortScreen ? 94 : isShortScreen ? 104 : 116,
    height: isVeryShortScreen ? 94 : isShortScreen ? 104 : 116,
    borderRadius: isVeryShortScreen ? 47 : isShortScreen ? 52 : 58,
    overflow: "hidden",
    backgroundColor: "#FDE8E8",
  },

  avatar: {
    width: "100%",
    height: "100%",
  },

  cameraBadge: {
    position: "absolute",
    bottom: 3,
    right: 3,
    width: isVeryShortScreen ? 30 : 34,
    height: isVeryShortScreen ? 30 : 34,
    borderRadius: 18,
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4C1D95",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },

  cameraIcon: {
    fontSize: isVeryShortScreen ? 14 : 16,
  },

  teacherName: {
    fontSize: isVeryShortScreen ? 16 : 18,
    fontWeight: "800",
    color: "#1E1B4B",
    marginBottom: 2,
  },

  teacherRole: {
    fontSize: isVeryShortScreen ? 11 : 12,
    color: "#7C6FCD",
    marginBottom: isVeryShortScreen ? 7 : 9,
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: isVeryShortScreen ? 8 : 10,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#DDD6FE",
  },

  dividerStar: {
    marginHorizontal: 9,
    fontSize: isVeryShortScreen ? 13 : 15,
    color: "#FBBF24",
  },

  buttonsBlock: {
    width: "100%",
  },

  linkBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 50,
    paddingVertical: isVeryShortScreen ? 8 : 10,
    paddingHorizontal: 16,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },

  linkBtn1: {
    backgroundColor: "#EF4444",
    shadowColor: "#EF4444",
    marginBottom: isVeryShortScreen ? 7 : 9,
  },

  linkBtn2: {
    backgroundColor: "#7C3AED",
    shadowColor: "#7C3AED",
  },

  btnIconCircle: {
    width: isVeryShortScreen ? 28 : 32,
    height: isVeryShortScreen ? 28 : 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  btnIcon: {
    fontSize: isVeryShortScreen ? 13 : 15,
  },

  linkBtnText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: isVeryShortScreen ? 13 : 14,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  linkBtnArrow: {
    color: "#FFFFFF",
    fontSize: isVeryShortScreen ? 20 : 23,
    fontWeight: "300",
    lineHeight: isVeryShortScreen ? 22 : 25,
  },

  reminderStrip: {
    width: "100%",
    maxWidth: 480,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EDE9FE",
    borderRadius: 18,
    paddingVertical: isVeryShortScreen ? 8 : 10,
    paddingHorizontal: isVeryShortScreen ? 10 : 12,
    marginTop: isVeryShortScreen ? 8 : 10,
    borderWidth: 1,
    borderColor: "#DDD6FE",
  },

  reminderIcon: {
    width: isVeryShortScreen ? 32 : 36,
    height: isVeryShortScreen ? 32 : 36,
    borderRadius: 11,
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  reminderIconText: {
    fontSize: isVeryShortScreen ? 16 : 18,
  },

  reminderTextBox: {
    flex: 1,
  },

  reminderTitle: {
    fontSize: isVeryShortScreen ? 11.5 : 12.5,
    fontWeight: "800",
    color: "#1E1B4B",
    marginBottom: 2,
  },

  reminderSub: {
    fontSize: isVeryShortScreen ? 9.5 : 10.5,
    color: "#6B7280",
    lineHeight: isVeryShortScreen ? 13 : 14,
  },

  clockIcon: {
    fontSize: isVeryShortScreen ? 26 : 32,
    marginLeft: 6,
  },
});