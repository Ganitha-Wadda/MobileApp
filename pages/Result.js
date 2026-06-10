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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const initialPapers = [
  { id: 1, name: "Daily paper - 1", marks: "20/100" },
  { id: 2, name: "", marks: "" },
  { id: 3, name: "", marks: "" },
  { id: 4, name: "", marks: "" },
  { id: 5, name: "", marks: "" },
  { id: 6, name: "", marks: "" },
];

const paperTypes = [
  "Daily papers",
  "Weekly papers",
  "Monthly papers",
  "Term papers",
  "Final papers",
];

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
  const [selectedType, setSelectedType] = useState("Daily papers");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [papers] = useState(initialPapers);

  const handleSelect = (type) => {
    setSelectedType(type);
    setDropdownOpen(false);
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
                <Text style={styles.dropdownText}>{selectedType}</Text>
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
                      key={type}
                      activeOpacity={0.8}
                      onPress={() => handleSelect(type)}
                      style={[
                        styles.dropdownItem,
                        selectedType === type && styles.dropdownItemActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          selectedType === type && styles.dropdownItemTextActive,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.tableCard}>
              <View style={styles.headerRow}>
                <View style={styles.headerCellLeft}>
                  <Text style={styles.headerText}>paper name</Text>
                </View>
                <View style={styles.headerCellRight}>
                  <Text style={styles.headerText}>Marks</Text>
                </View>
              </View>

              {papers.map((paper, index) => (
                <View
                  key={paper.id}
                  style={[
                    styles.dataRow,
                    index < papers.length - 1 && styles.dataRowBorder,
                  ]}
                >
                  <View style={styles.nameCell}>
                    <Text style={styles.cellText}>{paper.name}</Text>
                  </View>
                  <View style={styles.marksCell}>
                    <Text style={styles.cellText}>{paper.marks}</Text>
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