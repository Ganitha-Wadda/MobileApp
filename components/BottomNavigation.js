import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Audio } from "expo-av";
import { useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useT from "../app/i18n/useT";

const { width } = Dimensions.get("screen");

const BOTTOM_NAV_HEIGHT = 78;
const clickSound = require("../assets/click1.mp3");

export default function BottomNavigation({ navigation }) {
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { t } = useT();
  const [selectedTab, setSelectedTab] = useState("home");
  const soundRef = useRef(null);

  const tabs = useMemo(
    () => [
      {
        id: "home",
        labelKey: "navHome",
        icon: "https://img.icons8.com/ios-filled/50/ffffff/home.png",
        route: "home",
      },
      {
        id: "shortz",
        labelKey: "navShortz",
        icon: "https://img.icons8.com/ios-filled/50/ffffff/play.png",
        route: "shortz",
      },
      {
        id: "live",
        labelKey: "navLive",
        icon: "https://img.icons8.com/ios-filled/50/ffffff/video.png",
        badge: "LIVE",
        route: "live",
      },
      {
        id: "recordings",
        labelKey: "navRecordings",
        icon: "https://img.icons8.com/ios-filled/50/ffffff/film-reel.png",
        route: "recording",
      },
      {
        id: "game",
        labelKey: "navGame",
        icon: "https://img.icons8.com/ios-filled/50/ffffff/controller.png",
        route: "game",
      },
    ],
    []
  );

  useEffect(() => {
    let isMounted = true;

    const loadSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(clickSound);
        if (isMounted) {
          soundRef.current = sound;
        }
      } catch (error) {
        console.log("Sound load error:", error);
      }
    };

    loadSound();

    return () => {
      isMounted = false;

      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const playClickSound = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.replayAsync();
      }
    } catch (error) {
      console.log("Sound play error:", error);
    }
  };

  const activeTab = useMemo(() => {
    const currentRouteName = String(route?.name || "").toLowerCase();

    const matchedTab = tabs.find((tab) => {
      const tabRoute = String(tab.route || "").toLowerCase();
      const tabId = String(tab.id || "").toLowerCase();

      return (
        currentRouteName === tabRoute ||
        currentRouteName === tabId ||
        currentRouteName.includes(tabRoute) ||
        currentRouteName.includes(tabId)
      );
    });

    return matchedTab ? matchedTab.id : selectedTab;
  }, [route?.name, selectedTab, tabs]);

  const handleTabPress = async (tab) => {
    await playClickSound();

    setSelectedTab(tab.id);

    if (tab.route && navigation) {
      navigation.navigate(tab.route);
    }
  };

  return (
    <LinearGradient
      colors={["#5e1cce", "#5e1cce"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[
        styles.container,
        {
          height: BOTTOM_NAV_HEIGHT + insets.bottom,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {tabs.map((tab) => {
        const isSelected = activeTab === tab.id;

        return (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tabItem, isSelected && styles.selectedTabItem]}
            onPress={() => handleTabPress(tab)}
            activeOpacity={0.8}
          >
            <View style={styles.iconContainer}>
              <Image
                source={{ uri: tab.icon }}
                style={[styles.icon, isSelected && styles.selectedIcon]}
              />

              {tab.badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{tab.badge}</Text>
                </View>
              )}
            </View>

            <Text style={isSelected ? styles.labelSelected : styles.label}>
              {t(tab.labelKey)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 8,
    elevation: 10,
  },

  tabItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 66,
    marginHorizontal: 3,
    borderRadius: 14,
  },

  selectedTabItem: {
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },

  iconContainer: {
    width: 34,
    height: 34,
    justifyContent: "center",
    alignItems: "center",
  },

  icon: {
    width: 25,
    height: 25,
    tintColor: "#fff",
  },

  selectedIcon: {
    width: 29,
    height: 29,
  },

  badge: {
    position: "absolute",
    top: -8,
    right: -12,
    backgroundColor: "red",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },

  badgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "700",
  },

  label: {
    color: "#fff",
    fontSize: 11,
    marginTop: 2,
  },

  labelSelected: {
    color: "#fff",
    fontSize: 11,
    marginTop: 2,
    fontWeight: "700",
  },
});