import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Animated,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { useGetMyPaperResultsQuery } from "../app/features/paperResultApi";
import useT from "../app/i18n/useT";

const PAGE_SIZE = 10;

const paperTypes = [
  {
    label: "Daily papers",
    labelKey: "resultDailyPapers",
    value: "daily paper",
  },
  {
    label: "FiveHundredpapers",
    labelKey: "resultFiveHundredPapers",
    value: "500 paper",
  },
  {
    label: "Pastpapers",
    labelKey: "resultPastPapers",
    value: "pastpapers",
  },
  {
    label: "lesson by lesson",
    labelKey: "resultLessonByLessonPapers",
    value: "lesson by lesson",
  },
];

const toSafeNumber = (value, fallback = 0) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

const parseMarksRatio = (marks) => {
  if (typeof marks !== "string") return null;

  const match = marks.match(/^\s*(\d+)\s*\/\s*(\d+)\s*$/);

  if (!match) return null;

  return {
    correct: toSafeNumber(match[1]),
    total: toSafeNumber(match[2]),
  };
};

const getPercentageText = (paper = {}) => {
  const ratio = parseMarksRatio(paper.marks);

  const correctCount = toSafeNumber(
    paper.correctCount ??
      paper.correctAnswers ??
      paper.totalCorrect ??
      ratio?.correct ??
      0
  );

  const totalQuestions = toSafeNumber(
    paper.totalQuestions ??
      paper.questionCount ??
      paper.totalQuestionCount ??
      ratio?.total ??
      0
  );

  if (!totalQuestions || totalQuestions <= 0) {
    return "0%";
  }

  const percentage = (correctCount / totalQuestions) * 100;
  const roundedPercentage =
    percentage % 1 === 0 ? percentage : Math.round(percentage * 10) / 10;

  return `${roundedPercentage}%`;
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

export default function Result() {
  const { t, sinFont, isSi } = useT();

  const [selectedType, setSelectedType] = useState(paperTypes[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [page, setPage] = useState(1);

  const sinhalaBoldFont = isSi ? sinFont("bold") : null;
  const sinhalaRegularFont = isSi ? sinFont("regular") : null;

  const { data, isLoading, isFetching, isError, refetch } =
    useGetMyPaperResultsQuery({
      paperType: selectedType.value,
      page,
      limit: PAGE_SIZE,
    });

  const papers = data?.data || data?.results || [];
  const pagination = data?.pagination || {};
  const totalPages = Number(pagination?.totalPages || 1);
  const hasPreviousPage = Boolean(pagination?.hasPreviousPage);
  const hasNextPage = Boolean(pagination?.hasNextPage);

  const handleSelect = (type) => {
    setSelectedType(type);
    setPage(1);
    setDropdownOpen(false);
  };

  const handlePrevious = () => {
    if (!hasPreviousPage || isFetching) return;
    setPage((current) => Math.max(current - 1, 1));
  };

  const handleNext = () => {
    if (!hasNextPage || isFetching) return;
    setPage((current) => current + 1);
  };

  const renderTableBody = () => {
    if (isLoading || isFetching) {
      return (
        <View style={styles.emptyRow}>
          <ActivityIndicator size="small" color="#6D28D9" />
          <Text style={[styles.emptyText, sinhalaBoldFont]}>
            {t("resultLoadingResults")}
          </Text>
        </View>
      );
    }

    if (isError) {
      return (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={refetch}
          style={styles.emptyRow}
        >
          <Text style={[styles.emptyText, sinhalaBoldFont]}>
            {t("resultLoadingFailedTapRetry")}
          </Text>
        </TouchableOpacity>
      );
    }

    if (!papers.length) {
      return (
        <View style={styles.emptyRow}>
          <Text style={[styles.emptyText, sinhalaBoldFont]}>
            {t("resultNoResultsFound")}
          </Text>
        </View>
      );
    }

    return papers.map((paper, index) => {
      const percentageText = getPercentageText(paper);

      return (
        <View
          key={paper.id || paper._id || paper.attemptId || `${paper.paperId}-${index}`}
          style={[
            styles.dataRow,
            index < papers.length - 1 && styles.dataRowBorder,
          ]}
        >
          <View style={styles.nameCell}>
            <Text style={[styles.cellText, sinhalaBoldFont]} numberOfLines={2}>
              {paper.name || paper.paperName || t("resultUntitledPaper")}
            </Text>
          </View>

          <View style={styles.marksCell}>
            <Text style={[styles.cellText, sinhalaBoldFont]}>
              {percentageText}
            </Text>
          </View>
        </View>
      );
    });
  };

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
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.dropdownWrap}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setDropdownOpen(!dropdownOpen)}
                style={styles.dropdownButton}
              >
                <Text style={[styles.dropdownText, sinhalaBoldFont]}>
                  {t(selectedType.labelKey)}
                </Text>
                <Text
                  style={[
                    styles.dropdownArrow,
                    dropdownOpen && styles.dropdownArrowOpen,
                  ]}
                >
                  ⌄
                </Text>
              </TouchableOpacity>

              {dropdownOpen && (
                <View style={styles.dropdownMenu}>
                  {paperTypes.map((type) => (
                    <TouchableOpacity
                      key={type.value}
                      activeOpacity={0.8}
                      onPress={() => handleSelect(type)}
                      style={[
                        styles.dropdownItem,
                        selectedType.value === type.value &&
                          styles.dropdownItemActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          selectedType.value === type.value &&
                            styles.dropdownItemTextActive,
                          selectedType.value === type.value
                            ? sinhalaBoldFont
                            : sinhalaRegularFont,
                        ]}
                      >
                        {t(type.labelKey)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.tableCard}>
              <View style={styles.headerRow}>
                <View style={styles.headerCellLeft}>
                  <Text style={[styles.headerText, sinhalaBoldFont]}>
                    {t("resultPaperName")}
                  </Text>
                </View>
                <View style={styles.headerCellRight}>
                  <Text style={[styles.headerText, sinhalaBoldFont]}>
                    {t("resultPercentage")}
                  </Text>
                </View>
              </View>

              {renderTableBody()}
            </View>

            <View style={styles.paginationWrap}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handlePrevious}
                disabled={!hasPreviousPage || isFetching}
                style={[
                  styles.paginationButton,
                  (!hasPreviousPage || isFetching) &&
                    styles.paginationButtonDisabled,
                ]}
              >
                <Text
                  style={[
                    styles.paginationButtonText,
                    (!hasPreviousPage || isFetching) &&
                      styles.paginationButtonTextDisabled,
                    sinhalaBoldFont,
                  ]}
                >
                  {t("previous")}
                </Text>
              </TouchableOpacity>

              <Text style={[styles.pageText, sinhalaBoldFont]}>
                {page} / {totalPages}
              </Text>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleNext}
                disabled={!hasNextPage || isFetching}
                style={[
                  styles.paginationButton,
                  (!hasNextPage || isFetching) && styles.paginationButtonDisabled,
                ]}
              >
                <Text
                  style={[
                    styles.paginationButtonText,
                    (!hasNextPage || isFetching) &&
                      styles.paginationButtonTextDisabled,
                    sinhalaBoldFont,
                  ]}
                >
                  {t("next")}
                </Text>
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

  container: {
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 130,
  },

  dropdownWrap: {
    position: "relative",
    marginBottom: 24,
    zIndex: 20,
  },

  dropdownButton: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.94)",
    borderWidth: 1,
    borderColor: "#ECE8FF",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#A39BF5",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 14,
    elevation: 3,
  },

  dropdownText: {
    fontWeight: "700",
    fontSize: 18,
    color: "#07124A",
    letterSpacing: 0.1,
  },

  dropdownArrow: {
    color: "#6D28D9",
    fontSize: 24,
    fontWeight: "900",
  },

  dropdownArrowOpen: {
    transform: [{ rotate: "180deg" }],
  },

  dropdownMenu: {
    position: "absolute",
    top: 66,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ECE8FF",
    shadowColor: "#503CB4",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 20,
    elevation: 8,
    zIndex: 50,
  },

  dropdownItem: {
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEAF8",
  },

  dropdownItemActive: {
    backgroundColor: "#EDE9FC",
  },

  dropdownItemText: {
    fontSize: 16,
    color: "#07124A",
    fontWeight: "500",
  },

  dropdownItemTextActive: {
    fontWeight: "700",
  },

  tableCard: {
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ECE8FF",
    shadowColor: "#A39BF5",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 14,
    elevation: 3,
  },

  headerRow: {
    flexDirection: "row",
    backgroundColor: "#EDE9FC",
    borderBottomWidth: 1.5,
    borderBottomColor: "#D8D2F5",
  },

  headerCellLeft: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRightWidth: 1.5,
    borderRightColor: "#D8D2F5",
  },

  headerCellRight: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: "center",
  },

  headerText: {
    fontWeight: "700",
    fontSize: 15,
    color: "#07124A",
  },

  dataRow: {
    flexDirection: "row",
    minHeight: 80,
  },

  dataRowBorder: {
    borderBottomWidth: 1.5,
    borderBottomColor: "#EDE9FC",
  },

  nameCell: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRightWidth: 1.5,
    borderRightColor: "#EDE9FC",
    justifyContent: "center",
  },

  marksCell: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
  },

  cellText: {
    fontWeight: "700",
    fontSize: 16,
    color: "#07124A",
  },

  emptyRow: {
    minHeight: 80,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
  },

  emptyText: {
    marginTop: 6,
    fontWeight: "700",
    fontSize: 15,
    color: "#07124A",
    textAlign: "center",
  },

  paginationWrap: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },

  paginationButton: {
    backgroundColor: "rgba(255,255,255,0.94)",
    borderWidth: 1,
    borderColor: "#ECE8FF",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    shadowColor: "#A39BF5",
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 10,
    elevation: 2,
  },

  paginationButtonDisabled: {
    opacity: 0.45,
  },

  paginationButtonText: {
    fontWeight: "900",
    fontSize: 14,
    color: "#6D28D9",
  },

  paginationButtonTextDisabled: {
    color: "#9CA3AF",
  },

  pageText: {
    fontWeight: "900",
    fontSize: 15,
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