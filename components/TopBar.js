import React, { useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { Audio } from "expo-av";

export default function TopBar() {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const soundRef = useRef(null);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const playClickSound = useCallback(async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.replayAsync();
        return;
      }

      const { sound } = await Audio.Sound.createAsync(
        require("../assets/click2.mp3")
      );

      soundRef.current = sound;
      await sound.playAsync();
    } catch (error) {
      console.log("Click sound error:", error);
    }
  }, []);

  const goToProfile = async () => {
    await playClickSound();
    navigation.navigate("profile");
  };

  const goToParent = async () => {
    await playClickSound();
    navigation.navigate("parent");
  };

  return (
    <LinearGradient
      colors={["#5e1cce", "#5e1cce"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.container, { width }]}
    >
      <TouchableOpacity onPress={goToProfile} activeOpacity={0.8}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarEmoji}>🧒</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.userInfo}
        onPress={goToProfile}
        activeOpacity={0.8}
      >
        <Text style={styles.userName} numberOfLines={1} adjustsFontSizeToFit>
          Saman Ekanayake
        </Text>
        <Text style={styles.userGrade}>Grade 3</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={goToParent} activeOpacity={0.8}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarEmoji}>👨‍👩‍👧‍👦</Text>
        </View>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },

  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },

  avatarEmoji: {
    fontSize: 26,
    lineHeight: 30,
    includeFontPadding: false,
    textAlignVertical: "center",
  },

  userInfo: {
    flex: 1,
    marginHorizontal: 12,
    justifyContent: "center",
  },

  userName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.2,
    ...Platform.select({
      web: { WebkitFontSmoothing: "antialiased" },
    }),
  },

  userGrade: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255,255,255,0.75)",
    marginTop: 2,
  },
});