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
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { useGetActiveLiveClassesQuery } from "../app/features/Liveapi";
import { useCreateLiveClassAttemptMutation } from "../app/features/attemptApi";
import { useEnrollmentStatus } from "../app/features/enrollmentApi";
import EnrollmentGate from "../components/EnrollmentGate";
import useT from "../app/i18n/useT";

const { width, height } = Dimensions.get("window");

const isSmallScreen = width < 380;
const isShortScreen = height < 760;
const isVeryShortScreen = height < 700;

const ZOOM_ICON =
  "https://cdn-icons-png.flaticon.com/512/4401/4401470.png";

const normalizeValue = (value) => {
  if (value === null || value === undefined) return "";
  return String(value).trim();
};

const getGradeNumber = (grade) => {
  if (!grade) return "";
  if (typeof grade === "number") return grade;
  if (typeof grade === "string") return Number(grade);
  if (typeof grade === "object") {
    return Number(grade.gradeId ?? grade.grade ?? "");
  }
  return "";
};

// ─────────────────────────────────────────────────────────────────────────────
// Decorative helpers unchanged
// ─────────────────────────────────────────────────────────────────────────────

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
    const anim = Animated.loop(
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

    anim.start();
    return () => anim.stop();
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

// ─────────────────────────────────────────────────────────────────────────────
// LiveClassCard
// ─────────────────────────────────────────────────────────────────────────────

const LiveClassCard = ({ liveClass, index, t }) => {
  const cardScale = useRef(new Animated.Value(0.94)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const btnTranslate = useRef(new Animated.Value(30)).current;

  const [createLiveClassAttempt, { isLoading: isAttemptSaving }] =
    useCreateLiveClassAttemptMutation();

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
        delay: 200 + index * 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openZoomLink = (url) => {
    if (!url) return;

    Linking.openURL(url).catch(() => {});
  };

  const handleLink = async (url, linkIndex) => {
    const liveClassId = liveClass?._id ?? liveClass?.id;

    try {
      if (liveClassId) {
        await createLiveClassAttempt({
          liveClassId,
          linkIndex,
          zoomLink: url,
        }).unwrap();
      }
    } catch (err) {
      console.log("Live class attempt save failed:", err);
    } finally {
      openZoomLink(url);
    }
  };

  const formatSchedule = (dateStr) =>
    new Date(dateStr).toLocaleString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const teacherName = liveClass?.classId?.teacherName ?? "Teacher";
  const grade = liveClass?.classId?.grade ?? "";
  const classTitle = liveClass?.title ?? "Live Class";
  const links = liveClass?.links ?? [];

  return (
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
        <Text style={styles.liveNowText}>{t("liveNow")}</Text>
      </View>

      <View style={styles.classNameRow}>
        <Text style={styles.classDecor}>≻</Text>
        <Text style={styles.className} numberOfLines={1} adjustsFontSizeToFit>
          {classTitle}
        </Text>
        <Text style={styles.classDecor}>≺</Text>
      </View>

      <View style={styles.gradeBadge}>
        <Text style={styles.gradeBadgeText}>
          {t("gradeBadge")} {grade}
        </Text>
      </View>

      <View style={styles.avatarWrapper}>
        <LinearGradient
          colors={["#C4B5FD", "#F5D0FE", "#FFFFFF"]}
          style={styles.avatarRing}
        >
          <View style={styles.avatarInner}>
            <Image
              source={require("../assets/charithsir.png")}
              style={styles.avatar}
              resizeMode="cover"
            />
          </View>
        </LinearGradient>

        <View style={styles.cameraBadge}>
          <ZoomIcon size={19} />
        </View>
      </View>

      <Text style={styles.teacherName}>{teacherName}</Text>
      <Text style={styles.teacherRole}>{t("psychologyConsultant")}</Text>

      <View style={styles.scheduleRow}>
        <Text style={styles.scheduleIcon}>🕐</Text>
        <Text style={styles.scheduleText}>{formatSchedule(liveClass.date)}</Text>
      </View>

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
        {links.map((link, i) => (
          <TouchableOpacity
            key={i}
            style={styles.linkBtn}
            onPress={() => handleLink(link, i)}
            activeOpacity={0.82}
            disabled={isAttemptSaving}
          >
            <LinearGradient
              colors={
                i % 2 === 0
                  ? ["#8B5CF6", "#6D28D9"]
                  : ["#A855F7", "#4C1D95"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.linkBtnGradient}
            >
              <View style={styles.btnIconCircle}>
                <ZoomIcon size={20} />
              </View>

              <Text style={styles.linkBtnText}>Zoom Live Link {i + 1}</Text>
              <Text style={styles.linkBtnArrow}>›</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </Animated.View>
    </Animated.View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Actual live content shown only when enrolled and approved
// ─────────────────────────────────────────────────────────────────────────────

function LiveContent() {
  const { t } = useT();

  const {
    enrollment,
    isLoading: isEnrollmentLoading,
    isFetching: isEnrollmentFetching,
    refetch: refetchEnrollment,
  } = useEnrollmentStatus();

  const userGrade = getGradeNumber(enrollment?.grade);
  const userBatchNumber = normalizeValue(
    enrollment?.batchnumber ??
      enrollment?.batchNumber ??
      enrollment?.batch ??
      ""
  );

  const canLoadLiveClasses = Boolean(userGrade && userBatchNumber);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetActiveLiveClassesQuery(
    {
      grade: userGrade,
      batchnumber: userBatchNumber,
    },
    {
      skip: !canLoadLiveClasses,
    }
  );

  const liveClasses = data?.liveClasses ?? [];
  const isRefreshing =
    canLoadLiveClasses && (isFetching || isEnrollmentFetching) && !isLoading;

  const handleRefresh = () => {
    if (typeof refetchEnrollment === "function") {
      refetchEnrollment();
    }

    if (!canLoadLiveClasses) return;

    if (typeof refetch === "function") {
      refetch();
    }
  };

  const errorMessage = isError
    ? error?.data?.message ?? error?.error ?? "Failed to load live classes."
    : !isEnrollmentLoading && !userGrade
    ? "Grade not found in your approved enrollment. Please contact support."
    : !isEnrollmentLoading && !userBatchNumber
    ? "Batch number not found in your approved enrollment. Please contact support."
    : null;

  return (
    <LinearGradient
      colors={["#EDE9FE", "#DDD6FE", "#C4B5FD"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />

        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
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
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#7C3AED"
              colors={["#7C3AED"]}
            />
          }
        >
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.liveIconBg}>
                <ZoomIcon size={24} />

                <View style={styles.liveBadge}>
                  <Text style={styles.liveBadgeText}>{t("liveNow")}</Text>
                </View>
              </View>

              <View style={styles.headerTextBox}>
                <Text style={styles.headerTitle}>{t("todaysLiveSession")}</Text>

                <Text style={styles.headerSub}>
                  {userGrade
                    ? `${t("gradeBadge")} ${userGrade} `
                    : "Join your class and learn live!"}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.calendarBtn}
              activeOpacity={0.8}
              onPress={handleRefresh}
            >
              <Text style={styles.calendarIcon}>📅</Text>
            </TouchableOpacity>
          </View>

          {(isLoading || isEnrollmentLoading) && (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color="#7C3AED" />
              <Text style={styles.loadingText}>{t("loadingLiveClasses")}</Text>
            </View>
          )}

          {!isLoading && !isEnrollmentLoading && errorMessage && (
            <View style={styles.centerBox}>
              <Text style={styles.stateEmoji}>😕</Text>
              <Text style={styles.stateTitle}>Something went wrong</Text>
              <Text style={styles.stateSub}>{errorMessage}</Text>

              <TouchableOpacity
                style={styles.retryBtn}
                onPress={handleRefresh}
                activeOpacity={0.8}
              >
                <Text style={styles.retryBtnText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )}

          {!isLoading &&
            !isEnrollmentLoading &&
            !errorMessage &&
            liveClasses.length === 0 && (
              <View style={styles.centerBox}>
                <Text style={styles.stateEmoji}>📡</Text>
                <Text style={styles.stateTitle}>{t("noLiveClassRightNow")}</Text>
              </View>
            )}

          {!isLoading &&
            !isEnrollmentLoading &&
            !errorMessage &&
            liveClasses.map((lc, i) => (
              <LiveClassCard
                key={String(lc._id ?? i)}
                liveClass={lc}
                index={i}
                t={t}
              />
            ))}

          {!isLoading &&
            !isEnrollmentLoading &&
            !errorMessage &&
            liveClasses.length > 0 && (
              <View style={styles.reminderStrip}>
                <View style={styles.reminderIcon}>
                  <ZoomIcon size={22} />
                </View>

                <View style={styles.reminderTextBox}>
                  <Text style={styles.reminderTitle}>
                    {t("beReadyAndStayOnTime")}
                  </Text>

                  <Text style={styles.reminderSub}>
                    Open Zoom early and check your internet connection.
                  </Text>
                </View>

                <Text style={styles.clockIcon}>⏰</Text>
              </View>
            )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

export default function Live() {
  return (
    <EnrollmentGate>
      <LiveContent />
    </EnrollmentGate>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },

  scrollContent: {
    width: "100%",
    paddingHorizontal: isSmallScreen ? 14 : 18,
    paddingTop: Platform.OS === "android" ? 26 : 12,
    paddingBottom: 28,
    alignItems: "center",
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

  cloud: { position: "absolute", opacity: 0.52, zIndex: 1 },

  header: {
    width: "100%",
    maxWidth: 480,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    zIndex: 5,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
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
  liveBadgeText: { color: "#FFFFFF", fontSize: 7, fontWeight: "900" },
  headerTextBox: { marginLeft: 10, flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: "900", color: "#2E1065" },
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
  calendarIcon: { fontSize: 18 },

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
    marginBottom: 16,
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
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  classDecor: {
    fontSize: 18,
    color: "#FBBF24",
    marginHorizontal: 7,
    fontWeight: "900",
  },
  className: {
    fontSize: isVeryShortScreen ? 20 : 24,
    fontWeight: "900",
    color: "#2E1065",
    letterSpacing: 0.5,
    flexShrink: 1,
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
  avatar: { width: "100%", height: "100%" },
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

  buttonsBlock: { width: "100%" },
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
    marginTop: 4,
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
  reminderTextBox: { flex: 1 },
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
  clockIcon: { fontSize: 30, marginLeft: 6 },

  gradeBadge: {
    backgroundColor: "#EDE9FE",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(109,40,217,0.2)",
  },
  gradeBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#6D28D9",
    letterSpacing: 0.4,
  },

  scheduleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#F5F3FF",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "stretch",
  },
  scheduleIcon: { fontSize: 14, marginRight: 6 },
  scheduleText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4C1D95",
  },

  centerBox: {
    width: "100%",
    maxWidth: 480,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.82)",
    borderRadius: 26,
    paddingVertical: 44,
    paddingHorizontal: 28,
    marginTop: 8,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.95)",
    shadowColor: "#6D28D9",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 6,
  },
  loadingText: {
    marginTop: 14,
    fontSize: 13,
    fontWeight: "700",
    color: "#7C3AED",
  },
  stateEmoji: { fontSize: 48, marginBottom: 12 },
  stateTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#2E1065",
    marginBottom: 6,
    textAlign: "center",
  },
  stateSub: {
    fontSize: 12,
    color: "#6D28D9",
    textAlign: "center",
    lineHeight: 18,
    fontWeight: "600",
  },
  retryBtn: {
    marginTop: 18,
    backgroundColor: "#7C3AED",
    borderRadius: 50,
    paddingHorizontal: 28,
    paddingVertical: 10,
  },
  retryBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
});