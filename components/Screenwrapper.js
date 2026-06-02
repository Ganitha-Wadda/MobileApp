import React from "react";
import { ScrollView, StyleSheet, Platform } from "react-native";

export default function ScreenWrapper({ children, contentStyle }) {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, contentStyle]}
      showsVerticalScrollIndicator={false}
      bounces={false}
      overScrollMode="never"
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    width: "100%",
  },
  content: {
    width: "100%",
    // On mobile: no flexGrow needed — native ScrollView hugs content perfectly
    // On web:    no flexGrow either — web ScrollView stretches with flexGrow = gap
    ...Platform.select({
      web: {
        // Force content to shrink-wrap on web
        // alignSelf:"flex-start" makes the container only as tall as its children
        alignSelf: "flex-start",
        minHeight: "unset",
      },
      default: {
        // Native — nothing needed, works perfectly already
      },
    }),
  },
});