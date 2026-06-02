import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TopBar from "../components/TopBar";
import BottomNavigation from "../components/BottomNavigation";

const PURPLE_BG = "#6764FF";
const PAGE_BG   = "#EDE9FE";

export default function SecondLayout({ children, navigation }) {
  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>

      <View style={styles.topBarArea}>
        <TopBar />
      </View>

      <View style={styles.contentArea}>
        {children}
      </View>

      <View style={styles.bottomArea}>
        <BottomNavigation navigation={navigation} />
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  topBarArea: {
    backgroundColor: PURPLE_BG,
  },
  contentArea: {
    flex: 1,
    // On web: overflow hidden so the ScrollView inside clips correctly
    // and doesn't bleed past the bottom nav
    ...Platform.select({
      web: {
        overflow: "hidden",
      },
    }),
  },
  bottomArea: {
    backgroundColor: PURPLE_BG,
  },
});