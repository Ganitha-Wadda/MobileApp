import React from "react";
import { View, Text, TouchableOpacity, Image, Dimensions, StyleSheet, SafeAreaView } from "react-native";
import Floating from "./Floating";

export default function SelectLanguagePage({ navigation }) {
  const { width, height } = Dimensions.get("screen"); // full screen including notch/status bar

  return (
    <SafeAreaView style={styles.container}>
      {/* Full-screen background */}
      <Image
        source={require("../assets/a_vertical_pastel_cartoon_illustration_scene_like.png")}
        style={styles.background}
        resizeMode="cover"
      />

      {/* Floating numbers */}
      <Floating text="2" startX={width * 0.05} startY={height * 0.25} color="#1B7EEF" size={width * 0.08} />
      <Floating text="3" startX={width * 0.85} startY={height * 0.75} color="#FF9500" size={width * 0.08} />

      {/* Title */}
      <View style={[styles.titleWrapper, { top: height * 0.3 }]}>
        <Text style={styles.title}>
          Select{"\n"}
          <Text style={styles.highlight}>Language</Text>
        </Text>
      </View>

      {/* Language Buttons */}
      <View style={[styles.buttonContainer, { top: height * 0.45 }]}>
        <TouchableOpacity style={styles.languageButton} onPress={() => navigation.navigate("Signup")}>
          <View style={styles.langCircle}><Text style={styles.langLetter}>A</Text></View>
          <Text style={styles.langText}>English</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.languageButton} onPress={() => navigation.navigate("Signup")}>
          <View style={styles.langCircle}><Text style={styles.langLetter}>අ</Text></View>
          <Text style={styles.langText}>සිංහල</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { 
    flex: 1, 
    width: "100%", 
    height: "100%", 
    position: "absolute" 
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
  langLetter: { color: "#fff", fontWeight: "900", fontSize: 20 },
  langText: { fontSize: 18, fontWeight: "700", color: "#1E40AF" },
});