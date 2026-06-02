import React, { useEffect } from "react";
import { View, Image, StyleSheet, Dimensions } from "react-native";
import Floating from "./Floating";

export default function SplashScreen({ navigation }) {
  const { width, height } = Dimensions.get("screen"); // full screen including status/nav bar
  const logoSize = Math.min(width, height) * 0.8; // 50% of smaller dimension

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("SelectLanguage");
    }, 5000); // 5 seconds
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Full-screen background */}
      <Image
        source={require("../assets/a_vertical_pastel_cartoon_illustration_scene_like.png")}
        style={styles.background}
        resizeMode="cover"
      />

      {/* Centered logo */}
      <Image
        source={require("../assets/wadda.png")}
        style={{
          position: "absolute",
          top: height / 2 - logoSize / 2,
          left: width / 2 - logoSize / 2,
          width: logoSize,
          height: logoSize,
        }}
        resizeMode="contain"
      />

      {/* Floating numbers */}
      <Floating text="2" startX={width * 0.1} startY={height * 0.25} color="#1B7EEF" size={width * 0.08} />
      <Floating text="3" startX={width * 0.85} startY={height * 0.75} color="#FF9500" size={width * 0.08} />
      <Floating text="5" startX={width * 0.15} startY={height * 0.6} color="#34C759" size={width * 0.08} />
      <Floating text="9" startX={width * 0.8} startY={height * 0.7} color="#FF3B30" size={width * 0.08} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
});