import React from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useFonts } from "expo-font";
import Floating from "../pages/Floating.js";

const { width, height } = Dimensions.get("screen");

export default function Notice({ navigation }) {
  const [fontsLoaded] = useFonts({
    FMBasurux: require("../app/api/FMBasurux.ttf"),
    FMGemunux: require("../app/api/FMGemunux.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Background */}
      <Image
        source={require("../assets/a_vertical_pastel_cartoon_illustration_scene_like.png")}
        style={styles.background}
        resizeMode="cover"
      />

      {/* Floating numbers */}
      <Floating text="2" startX={width * 0.05} startY={height * 0.25} color="#1B7EEF" size={width * 0.08} />
      <Floating text="3" startX={width * 0.85} startY={height * 0.75} color="#FF9500" size={width * 0.08} />
      <Floating text="5" startX={width * 0.15} startY={height * 0.6} color="#34C759" size={width * 0.08} />
      <Floating text="9" startX={width * 0.8} startY={height * 0.7} color="#FF3B30" size={width * 0.08} />

      <ScrollView contentContainerStyle={styles.formWrapper}>
        {/* Title */}
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>
            {".‚; "}
            <Text style={styles.highlight}>jeâvd</Text>
          </Text>
        </View>

        {/* Notice paragraph */}
        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>
            ගණිත වැඩ්ඩා යනු ප්‍රවීණ මනෝවිද්‍යා උපදේශයකු වන චරිත් ගිම්හාන් ඇදුරා විසින් මනෝවිද්‍යානුකූල ක්‍රමවේද අනුව "දරුවන්ට විසදීමට අපහසු ගණිත ගැටළු සරල විසදීමට හැකිවන පරිදි" නිර්මාණය කරන ලද ජංගම යෙදවුමකි.  ඔබේ දරුවා  කුමන දැනුම් මට්ටමක වුවත් විශිෂ්ඨයෙකු කරන මනෝවිද්‍යා ගණිත පාඨමාලාව මෙම යෙදවුම හරහා සරලව ඔබේ දරුවාටත් ඉගෙන ගත හැකිය.
          </Text>
        </View>

        <Image
          source={require("../assets/charith.png")}
          style={styles.boyImage}
          resizeMode="contain"
        />

        {/* Purple Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={() => {
            navigation.navigate("ChooseAvatar");
          }}
        >
          <Text style={styles.submitText}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1, width: "100%", height: "100%", position: "absolute" },
  formWrapper: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: height * 0.15,
  },
  titleWrapper: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontFamily: "FMBasurux",
    fontSize: 42,
    color: "#FFFFFF",
    textShadowColor: "#1E40AF",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
    textAlign: "center",
  },
  highlight: {
    fontFamily: "FMBasurux",
    fontSize: 42,
    color: "#FFD600",
    textShadowColor: "#FF6F00",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  noticeBox: {
    width: "90%",
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 16,
    padding: 30,
    marginBottom: 20,
  },
  noticeText: {
    fontSize: 15,
    color: "#1E40AF",
    lineHeight: 30,
    textAlign: "justify",
  },
  submitButton: {
    backgroundColor: "#7C3AED",
    width: "80%",
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: "center",
    marginBottom: 20,
    marginTop: -10,
  },
  submitText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  boyImage: {
    width: width * 0.6,
    height: height * 0.3,
    borderRadius: 16,
    marginTop: -70,
    marginRight: -180,
  },
});
