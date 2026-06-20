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
import useT from "../app/i18n/useT";

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
          transform: [
            { translateX: move },
            { translateY: float },
            { scale },
          ],
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
  const { t } = useT();

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

          <AnimatedCloud style={{ top: 92, left: -18 }} scale={0.85} />
          <AnimatedCloud style={{ top: 145, right: 20 }} scale={0.65} delay={300} />
          <AnimatedCloud style={{ top: 235, left: 35 }} scale={0.5} delay={600} />

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

              <Text style={styles.headerTitle}>
                {t("attendanceTitle")}
              </Text>
            </View>

            <View style={styles.tableCard}>
              <View style={styles.tableHeader}>
                <View style={styles.headerCell}>
                  <Text style={styles.headerCellText}>
                    {t("attendanceDate")}
                  </Text>
                </View>

                <View style={[styles.headerCell, styles.headerCellRight]}>
                  <Text style={styles.headerCellText}>
                    {t("attendanceTime")}
                  </Text>
                </View>
              </View>

              {isLoading && (
                <View style={styles.tableRow}>
                  <View style={styles.dataCell}>
                    <ActivityIndicator size="small" color="#6C6FC7" />
                  </View>
                  <View style={[styles.dataCell, styles.dataCellRight]}>
                    <Text style={styles.dataCellText}>
                      {t("attendanceLoading")}
                    </Text>
                  </View>
                </View>
              )}

              {!isLoading && isError && (
                <View style={styles.tableRow}>
                  <View style={styles.dataCell}>
                    <Text style={styles.dataCellText}>
                      {t("attendanceFailed")}
                    </Text>
                  </View>
                  <View style={[styles.dataCell, styles.dataCellRight]}>
                    <Text style={styles.dataCellText}>
                      {t("attendanceTryAgain")}
                    </Text>
                  </View>
                </View>
              )}

              {!isLoading &&
                !isError &&
                attendanceData.length === 0 && (
                  <View style={styles.tableRow}>
                    <View style={styles.dataCell}>
                      <Text style={styles.dataCellText}>
                        {t("attendanceNoAttendance")}
                      </Text>
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
                      index === attendanceData.length - 1 &&
                        styles.tableRowLast,
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
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  root: { flex: 1 },

  scrollArea: { flex: 1 },
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

  iconWrapper: { marginRight: 12 },

  iconCircle: {
    width: isSmallScreen ? 52 : 58,
    height: isSmallScreen ? 52 : 58,
    borderRadius: 29,
    backgroundColor: "#D6D3F0",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  calendarIcon: {
    width: 32,
    height: 30,
    borderRadius: 5,
    overflow: "hidden",
    borderWidth: 1.4,
    borderColor: "#6C6FC7",
    backgroundColor: "#FFF",
  },

  calendarTop: {
    height: 8,
    backgroundColor: "#5A5EC4",
  },

  calendarBody: { flex: 1, padding: 3 },

  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  calendarDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#C8C6E8",
    margin: 1,
  },

  checkBadge: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 18,
    height: 18,
    borderRadius: 10,
    backgroundColor: "#3DC45A",
    alignItems: "center",
    justifyContent: "center",
  },

  checkMark: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "900",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#07124A",
  },

  tableCard: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ECE8FF",
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#EDE9FC",
    paddingVertical: 14,
  },

  headerCell: {
    flex: 1,
    alignItems: "center",
  },

  headerCellRight: {
    borderLeftWidth: 1,
    borderLeftColor: "#FFF",
  },

  headerCellText: {
    fontSize: 15,
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
    paddingVertical: 22,
  },

  dataCellRight: {
    borderLeftWidth: 1,
    borderLeftColor: "#E5E3F4",
  },

  dataCellText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#07124A",
  },

  spark: { position: "absolute", fontSize: 15, color: "#FFC84D" },
  sparkSmall: { position: "absolute", fontSize: 18, color: "#B9AFF7" },
});