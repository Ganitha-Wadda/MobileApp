import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ScrollView,
} from "react-native";

const { width, height } = Dimensions.get("window");

const isSmallScreen = width < 380;

const attendanceData = [
  { date: "2026.01.30", time: "11.30 a.m" },
];

export default function Attendance() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#EAE8F5" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
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

          {attendanceData.map((item, index) => (
            <View
              key={index}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#EAE8F5",
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 110,
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
    color: "#1A1A6E",
    letterSpacing: 1,
  },

  tableCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#9C9AC2",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(200, 198, 230, 0.4)",
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#D8D5F0",
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
    color: "#1A1A6E",
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
    backgroundColor: "#FDFCFF",
  },

  dataCellRight: {
    borderLeftWidth: 1,
    borderLeftColor: "#E5E3F4",
  },

  dataCellText: {
    fontSize: isSmallScreen ? 14 : 15,
    fontWeight: "700",
    color: "#1A1A6E",
  },
});