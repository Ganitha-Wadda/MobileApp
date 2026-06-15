// pages/SelectLanguagePage.js
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useDispatch } from "react-redux";

import Floating from "./Floating";
import { setLanguage } from "../app/features/Languageselectionslice";
import { useUpdateLanguageMutation } from "../app/features/Languageapi";

export default function SelectLanguagePage({ navigation }) {
  const { width, height } = Dimensions.get("screen");
  const dispatch = useDispatch();
  const [updateLanguage, { isLoading }] = useUpdateLanguageMutation();

  const handleSelectLanguage = async (lang) => {
    // 1. Immediately update Redux so the whole app re-renders in the new language
    dispatch(setLanguage(lang));

    // 2. Persist to backend (fire-and-forget — don't block navigation on failure)
    try {
      await updateLanguage(lang).unwrap();
    } catch (_err) {
      // Silent — local Redux state already reflects the choice.
      // On next login, getLanguage will sync from backend.
    }

    // 3. Navigate to Signup
    navigation.navigate("Signup");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require("../assets/a_vertical_pastel_cartoon_illustration_scene_like.png")}
        style={styles.background}
        resizeMode="cover"
      />

      <Floating
        text="2"
        startX={width * 0.05}
        startY={height * 0.25}
        color="#1B7EEF"
        size={width * 0.08}
      />

      <Floating
        text="3"
        startX={width * 0.85}
        startY={height * 0.75}
        color="#FF9500"
        size={width * 0.08}
      />

      <View style={[styles.titleWrapper, { top: height * 0.3 }]}>
        <Text style={styles.title}>
          Select{"\n"}
          <Text style={styles.highlight}>Language</Text>
        </Text>
      </View>

      <View style={[styles.buttonContainer, { top: height * 0.45 }]}>
        <TouchableOpacity
          style={styles.languageButton}
          activeOpacity={0.8}
          disabled={isLoading}
          onPress={() => handleSelectLanguage("en")}
        >
          <View style={styles.langCircle}>
            <Text style={styles.langLetter}>A</Text>
          </View>

          <Text style={styles.langText}>English</Text>

          {isLoading && (
            <ActivityIndicator
              size="small"
              color="#1B7EEF"
              style={styles.loader}
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.languageButton}
          activeOpacity={0.8}
          disabled={isLoading}
          onPress={() => handleSelectLanguage("si")}
        >
          <View style={styles.langCircle}>
            <Text style={styles.langLetter}>අ</Text>
          </View>

          <Text style={styles.langText}>සිංහල</Text>

          {isLoading && (
            <ActivityIndicator
              size="small"
              color="#1B7EEF"
              style={styles.loader}
            />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ── Styles (design unchanged from original) ────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "#ffffff",
  },

  background: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
  },

  titleWrapper: {
    position: "absolute",
    width: "100%",
    alignItems: "center",
  },

  title: {
    fontSize: 45,
    fontWeight: "900",
    color: "#FFFFFF",
    textShadowColor: "#1E40AF",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
    textAlign: "center",
  },

  highlight: {
    color: "#FFD600",
    textShadowColor: "#FF6F00",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },

  buttonContainer: {
    position: "absolute",
    width: "100%",
    alignItems: "center",
  },

  languageButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 20,
    width: "75%",
    marginVertical: 10,
  },

  langCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1B7EEF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  langLetter: {
    color: "#ffffff",
    fontWeight: "900",
    fontSize: 20,
  },

  langText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E40AF",
    flex: 1,
  },

  loader: {
    marginLeft: 8,
  },
});