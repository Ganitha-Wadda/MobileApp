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
  SafeAreaView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

const isSmallScreen = width < 380;
const isShortScreen = height < 760;
const isVeryShortScreen = height < 700;

const ZOOM_ICON =
  "https://cdn-icons-png.flaticon.com/512/4401/4401470.png";

const Star = ({ style, size = 18, color = "#FDE68A" }) => {
  const move = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(move, {
          toValue: -10,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(move, {
          toValue: 0,
          duration: 1400,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [move]);

  return (
    <Animated.Text
      style={[
        {
          fontSize: size,
          position: "absolute",
          color,
          transform: [{ translateY: move }],
        },
        style,
      ]}
    >
      ★
    </Animated.Text>
  );
};

const MovingCloud = ({ style, size = 34, delay = 0 }) => {
  const move = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(move, {
          toValue: 18,
          duration: 2300,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(move, {
          toValue: 0,
          duration: 2300,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [move, delay]);

  return (
    <Animated.Text
      style={[
        styles.cloud,
        style,
        {
          fontSize: size,
          transform: [{ translateX: move }],
        },
      ]}
    >
      ☁️
    </Animated.Text>
  );
};

const LiveDot = () => {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.7,
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
  }, [pulse]);

  return (
    <View style={styles.liveDotWrapper}>
      <Animated.View
        style={[styles.liveDotRing, { transform: [{ scale: pulse }] }]}
      />
      <View style={styles.liveDot} />
    </View>
  );
};

const ZoomIcon = ({ size = 22 }) => (
  <Image
    source={{ uri: ZOOM_ICON }}
    style={{ width: size, height: size }}
    resizeMode="contain"
  />
);

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
  }, [cardScale, cardOpacity, btnTranslate]);

  const handleLink = (url) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <LinearGradient
      colors={["#EDE9FE", "#DDD6FE", "#C4B5FD"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

        <View style={styles.container}>
          <View style={styles.purpleGlowOne} />
          <View style={styles.purpleGlowTwo} />

          <MovingCloud style={{ top: 58, left: -12 }} size={38} delay={0} />
          <MovingCloud style={{ top: 110, right: 20 }} size={32} delay={300} />
          <MovingCloud style={{ top: 185, left: 35 }} size={28} delay={600} />
          <MovingCloud style={{ bottom: 185, right: -4 }} size={36} delay={900} />
          <MovingCloud style={{ bottom: 95, left: 12 }} size={30} delay={1200} />
          <MovingCloud style={{ bottom: 45, right: 35 }} size={26} delay={1500} />

          <Star style={{ top: 42, left: "12%" }} size={23} color="#FDE68A" />
          <Star style={{ top: 34, right: "14%" }} size={27} color="#A78BFA" />
          <Star style={{ top: 145, left: "8%" }} size={18} color="#F9A8D4" />
          <Star style={{ bottom: 130, right: "8%" }} size={22} color="#FDE68A" />

          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.liveIconBg}>
                <ZoomIcon size={24} />

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

          <Animated.View
            style={[
              styles.card,
              {
                transform: [{ scale: cardScale }],
                opacity: cardOpacity,
              },
            ]}
          >
            <View style={styles.liveNowBadge}>
              <LiveDot />
              <Text style={styles.liveNowText}>LIVE NOW</Text>
            </View>

            <View style={styles.classNameRow}>
              <Text style={styles.classDecor}>≻</Text>
              <Text style={styles.className}>Chakkre</Text>
              <Text style={styles.classDecor}>≺</Text>
            </View>

            <View style={styles.avatarWrapper}>
              <LinearGradient
                colors={["#C4B5FD", "#F5D0FE", "#FFFFFF"]}
                style={styles.avatarRing}
              >
                <View style={styles.avatarInner}>
                  <Image
                    source={require("F:/public_folder/Ganitha Wadda/App/assets/charithsir.png")}
                    style={styles.avatar}
                    resizeMode="cover"
                  />
                </View>
              </LinearGradient>

              <View style={styles.cameraBadge}>
                <ZoomIcon size={19} />
              </View>
            </View>

            <Text style={styles.teacherName}>Charith Gimhan</Text>
            <Text style={styles.teacherRole}>Psychology consultant</Text>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerStar}>★</Text>
              <View style={styles.dividerLine} />
            </View>

            <Animated.View
              style={[
                styles.buttonsBlock,
                {
                  transform: [{ translateY: btnTranslate }],
                },
              ]}
            >
              <TouchableOpacity
                style={styles.linkBtn}
                onPress={() => handleLink("https://zoom.us/j/your-link-1")}
                activeOpacity={0.82}
              >
                <LinearGradient
                  colors={["#8B5CF6", "#6D28D9"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.linkBtnGradient}
                >
                  <View style={styles.btnIconCircle}>
                    <ZoomIcon size={20} />
                  </View>

                  <Text style={styles.linkBtnText}>Zoom Live Link 1</Text>
                  <Text style={styles.linkBtnArrow}>›</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.linkBtn}
                onPress={() => handleLink("https://zoom.us/j/your-link-2")}
                activeOpacity={0.82}
              >
                <LinearGradient
                  colors={["#A855F7", "#4C1D95"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.linkBtnGradient}
                >
                  <View style={styles.btnIconCircle}>
                    <ZoomIcon size={20} />
                  </View>

                  <Text style={styles.linkBtnText}>Zoom Live Link 2</Text>
                  <Text style={styles.linkBtnArrow}>›</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>

          <View style={styles.reminderStrip}>
            <View style={styles.reminderIcon}>
              <ZoomIcon size={22} />
            </View>

            <View style={styles.reminderTextBox}>
              <Text style={styles.reminderTitle}>Be ready and stay on time!</Text>
              <Text style={styles.reminderSub}>
                Open Zoom early and check your internet connection.
              </Text>
            </View>

            <Text style={styles.clockIcon}>⏰</Text>
          </View>
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
  },

  container: {
    flex: 1,
    width: "100%",
    paddingHorizontal: isSmallScreen ? 14 : 18,
    paddingTop: Platform.OS === "android" ? 26 : 12,
    paddingBottom: 14,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  purpleGlowOne: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(168,85,247,0.25)",
    top: -60,
    right: -60,
  },

  purpleGlowTwo: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(124,58,237,0.22)",
    bottom: 40,
    left: -70,
  },

  cloud: {
    position: "absolute",
    opacity: 0.52,
    zIndex: 1,
  },

  header: {
    width: "100%",
    maxWidth: 480,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    zIndex: 5,
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  liveIconBg: {
    width: 46,
    height: 46,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6D28D9",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },

  liveBadge: {
    position: "absolute",
    bottom: -4,
    right: -5,
    backgroundColor: "#EF4444",
    borderRadius: 7,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },

  liveBadgeText: {
    color: "#FFFFFF",
    fontSize: 7,
    fontWeight: "900",
  },

  headerTextBox: {
    marginLeft: 10,
    flex: 1,
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#2E1065",
  },

  headerSub: {
    fontSize: 11,
    color: "#6D28D9",
    marginTop: 1,
    fontWeight: "700",
  },

  calendarBtn: {
    width: 40,
    height: 40,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6D28D9",
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 4,
    marginLeft: 8,
  },

  calendarIcon: {
    fontSize: 18,
  },

  card: {
    width: "100%",
    maxWidth: 480,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 30,
    paddingHorizontal: isSmallScreen ? 16 : 20,
    paddingTop: isVeryShortScreen ? 16 : 22,
    paddingBottom: isVeryShortScreen ? 16 : 22,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.95)",
    shadowColor: "#6D28D9",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 10,
    zIndex: 5,
  },

  liveNowBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3E8FF",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "rgba(168,85,247,0.25)",
    marginBottom: 10,
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
    fontSize: 10.5,
    fontWeight: "900",
    color: "#6D28D9",
    letterSpacing: 0.7,
  },

  classNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  classDecor: {
    fontSize: 18,
    color: "#FBBF24",
    marginHorizontal: 7,
    fontWeight: "900",
  },

  className: {
    fontSize: isVeryShortScreen ? 22 : 26,
    fontWeight: "900",
    color: "#2E1065",
    letterSpacing: 0.5,
  },

  avatarWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  avatarRing: {
    width: isVeryShortScreen ? 104 : isShortScreen ? 114 : 126,
    height: isVeryShortScreen ? 104 : isShortScreen ? 114 : 126,
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },

  avatarInner: {
    width: isVeryShortScreen ? 94 : isShortScreen ? 104 : 116,
    height: isVeryShortScreen ? 94 : isShortScreen ? 104 : 116,
    borderRadius: 60,
    overflow: "hidden",
    backgroundColor: "#F5D0FE",
  },

  avatar: {
    width: "100%",
    height: "100%",
  },

  cameraBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 34,
    height: 34,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6D28D9",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },

  teacherName: {
    fontSize: 18,
    fontWeight: "900",
    color: "#2E1065",
    marginBottom: 2,
  },

  teacherRole: {
    fontSize: 12,
    color: "#7C3AED",
    marginBottom: 10,
    fontWeight: "700",
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 12,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(168,85,247,0.25)",
  },

  dividerStar: {
    marginHorizontal: 9,
    fontSize: 15,
    color: "#FBBF24",
  },

  buttonsBlock: {
    width: "100%",
  },

  linkBtn: {
    width: "100%",
    marginBottom: 10,
    borderRadius: 50,
    overflow: "hidden",
  },

  linkBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 50,
    paddingVertical: 11,
    paddingHorizontal: 16,
  },

  btnIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  linkBtnText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.3,
  },

  linkBtnArrow: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "300",
  },

  reminderStrip: {
    width: "100%",
    maxWidth: 480,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginTop: 14,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.95)",
    shadowColor: "#6D28D9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 5,
  },

  reminderIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  reminderTextBox: {
    flex: 1,
  },

  reminderTitle: {
    fontSize: 12.5,
    fontWeight: "900",
    color: "#2E1065",
    marginBottom: 2,
  },

  reminderSub: {
    fontSize: 10.5,
    color: "#6B21A8",
    lineHeight: 14,
    fontWeight: "700",
  },

  clockIcon: {
    fontSize: 30,
    marginLeft: 6,
  },
});