import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ScrollView,
  Animated,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { useGetMyLiveClassAttemptsQuery } from "../app/features/attemptApi";

const { width, height } = Dimensions.get("window");

const isSmallScreen = width < 380;

const pad = (value) => String(value).padStart(2, "0");

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(
    date.getDate()
  )}`;
};

const formatTime = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

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

export default function Attendance() {
  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetMyLiveClassAttemptsQuery();

  const attempts = data?.attempts ?? [];

  const attendanceData = attempts.map((attempt) => ({
    id: attempt?._id,
    date: formatDate(attempt?.attemptedAt ?? attempt?.lastOpenedAt),
    time: formatTime(attempt?.attemptedAt ?? attempt?.lastOpenedAt),
  }));

  const isRefreshing = isFetching && !isLoading;

  return (
    <LinearGradient
      colors={["#FAF9FF", "#F3F0FF", "#ECE8FF"]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
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
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={refetch}
                tintColor="#6C6FC7"
                colors={["#6C6FC7"]}
              />
            }
          >
            <View style={styles.header}>
              <View style={styles.iconWrapper}>
                <View style={styles.iconCircle}>
                  <View style={styles.calendarIcon}>
                    <View style={styles.calendarTop} />

                    <View style={styles.calendarBody}>
                      <View style={styles.calendarGrid}>
                        {[...Array(6)].map((_, i) => (
                          <View key={i} style={styles.calendarDot} />
                        ))}
                      </View>
                    </View>
                  </View>

                  <View style={styles.checkBadge}>
                    <Text style={styles.checkMark}>✓</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.headerTitle}>ATTENDANCE</Text>
            </View>

            <View style={styles.tableCard}>
              <View style={styles.tableHeader}>
                <View style={styles.headerCell}>
                  <Text style={styles.headerCellText}>Date</Text>
                </View>

                <View style={[styles.headerCell, styles.headerCellRight]}>
                  <Text style={styles.headerCellText}>Time</Text>
                </View>
              </View>

              {isLoading && (
                <View style={styles.tableRow}>
                  <View style={styles.dataCell}>
                    <ActivityIndicator size="small" color="#6C6FC7" />
                  </View>

                  <View style={[styles.dataCell, styles.dataCellRight]}>
                    <Text style={styles.dataCellText}>Loading...</Text>
                  </View>
                </View>
              )}

              {!isLoading && isError && (
                <View style={styles.tableRow}>
                  <View style={styles.dataCell}>
                    <Text style={styles.dataCellText}>Failed</Text>
                  </View>

                  <View style={[styles.dataCell, styles.dataCellRight]}>
                    <Text style={styles.dataCellText}>Try again</Text>
                  </View>
                </View>
              )}

              {!isLoading && !isError && attendanceData.length === 0 && (
                <View style={styles.tableRow}>
                  <View style={styles.dataCell}>
                    <Text style={styles.dataCellText}>No attendance</Text>
                  </View>

                  <View style={[styles.dataCell, styles.dataCellRight]}>
                    <Text style={styles.dataCellText}>-</Text>
                  </View>
                </View>
              )}

              {!isLoading &&
                !isError &&
                attendanceData.map((item, index) => (
                  <View
                    key={String(item.id ?? index)}
                    style={[
                      styles.tableRow,
                      index === attendanceData.length - 1 && styles.tableRowLast,
                    ]}
                  >
                    <View style={styles.dataCell}>
                      <Text style={styles.dataCellText}>{item.date}</Text>
                    </View>

                    <View style={[styles.dataCell, styles.dataCellRight]}>
                      <Text style={styles.dataCellText}>{item.time}</Text>
                    </View>
                  </View>
                ))}
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
  gradient: { flex: 1 },
  safeArea: { flex: 1 },

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
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 130,
    minHeight: height,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },

  iconWrapper: {
    marginRight: 12,
  },

  iconCircle: {
    width: isSmallScreen ? 52 : 58,
    height: isSmallScreen ? 52 : 58,
    borderRadius: isSmallScreen ? 26 : 29,
    backgroundColor: "#D6D3F0",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  calendarIcon: {
    width: isSmallScreen ? 29 : 32,
    height: isSmallScreen ? 27 : 30,
    borderRadius: 5,
    overflow: "hidden",
    borderWidth: 1.4,
    borderColor: "#6C6FC7",
    backgroundColor: "#FFFFFF",
  },

  calendarTop: {
    height: 8,
    backgroundColor: "#5A5EC4",
  },

  calendarBody: {
    flex: 1,
    padding: 3,
    backgroundColor: "#FFFFFF",
  },

  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  calendarDot: {
    width: 4,
    height: 4,
    borderRadius: 1,
    backgroundColor: "#C8C6E8",
    margin: 1,
  },

  checkBadge: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: isSmallScreen ? 18 : 20,
    height: isSmallScreen ? 18 : 20,
    borderRadius: 10,
    backgroundColor: "#3DC45A",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#D6D3F0",
  },

  checkMark: {
    color: "#FFFFFF",
    fontSize: isSmallScreen ? 9 : 10,
    fontWeight: "900",
    lineHeight: 12,
  },

  headerTitle: {
    fontSize: isSmallScreen ? 19 : 21,
    fontWeight: "800",
    color: "#07124A",
    letterSpacing: 1,
  },

  tableCard: {
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#A39BF5",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#ECE8FF",
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#EDE9FC",
    paddingVertical: isSmallScreen ? 13 : 15,
  },

  headerCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },

  headerCellRight: {
    borderLeftWidth: 1,
    borderLeftColor: "rgba(255,255,255,0.5)",
  },

  headerCellText: {
    fontSize: isSmallScreen ? 14 : 15,
    fontWeight: "700",
    color: "#07124A",
  },

  tableRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#E5E3F4",
  },

  tableRowLast: {},

  dataCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: isSmallScreen ? 20 : 23,
    paddingHorizontal: 8,
    backgroundColor: "rgba(255,255,255,0.86)",
  },

  dataCellRight: {
    borderLeftWidth: 1,
    borderLeftColor: "#E5E3F4",
  },

  dataCellText: {
    fontSize: isSmallScreen ? 14 : 15,
    fontWeight: "700",
    color: "#07124A",
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