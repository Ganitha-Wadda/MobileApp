import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  StatusBar,
  Platform,
  Pressable,
  Modal,
  Linking,
  StyleSheet,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

import CrossWebView from "../components/CrossWebView";
import YoutubePlayerBox from "../components/YoutubePlayerBox";
import useT from "../app/i18n/useT";

const { width, height } = Dimensions.get("window");

// ─────────────────────────────────────────────────────────────────────────────
// Decorative helpers (copied from Live page)
// ─────────────────────────────────────────────────────────────────────────────

const Star = ({ style, size = 18, color = "#FDE68A" }) => {
  const move = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(move, {
          toValue: -10,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(move, {
          toValue: 0,
          duration: 1400,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [move]);

  return (
    <Animated.Text
      style={[
        {
          fontSize: size,
          position: "absolute",
          color,
          transform: [{ translateY: move }],
        },
        style,
      ]}
    >
      ★
    </Animated.Text>
  );
};

const MovingCloud = ({ style, size = 34, delay = 0 }) => {
  const move = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(move, {
          toValue: 18,
          duration: 2300,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(move, {
          toValue: 0,
          duration: 2300,
          useNativeDriver: true,
        }),
      ])
    );

    anim.start();
    return () => anim.stop();
  }, [move, delay]);

  return (
    <Animated.Text
      style={[
        styles.cloud,
        style,
        {
          fontSize: size,
          transform: [{ translateX: move }],
        },
      ]}
    >
      ☁️
    </Animated.Text>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Unchanged helpers
// ─────────────────────────────────────────────────────────────────────────────

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function normalizeValue(value = "") {
  return String(value ?? "").trim();
}

function pickVideoUrl(params = {}) {
  const recording = params?.recording ?? params?.raw ?? {};

  return (
    params?.youtubeUrl ??
    params?.recordingUrl ??
    params?.videoUrl ??
    params?.lessonUrl ??
    params?.url ??
    params?.videoId ??
    recording?.youtubeUrl ??
    recording?.recordingUrl ??
    recording?.videoUrl ??
    recording?.lessonUrl ??
    recording?.url ??
    recording?.videoId ??
    ""
  );
}

function pickTitle(params = {}) {
  const recording = params?.recording ?? params?.raw ?? {};

  return (
    params?.title ??
    params?.recordingTitle ??
    params?.name ??
    recording?.title ??
    recording?.recordingTitle ??
    recording?.name ??
    ""
  );
}

function getYouTubeId(url = "") {
  if (!url) return "";

  const cleanUrl = String(url).trim();

  const shortMatch = cleanUrl.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/);
  if (shortMatch?.[1]) return shortMatch[1];

  const watchMatch = cleanUrl.match(/[?&]v=([A-Za-z0-9_-]{6,})/);
  if (watchMatch?.[1]) return watchMatch[1];

  const embedMatch = cleanUrl.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{6,})/);
  if (embedMatch?.[1]) return embedMatch[1];

  const shortsMatch = cleanUrl.match(/youtube\.com\/shorts\/([A-Za-z0-9_-]{6,})/);
  if (shortsMatch?.[1]) return shortsMatch[1];

  const plainIdMatch = cleanUrl.match(/^[A-Za-z0-9_-]{6,}$/);
  if (plainIdMatch) return cleanUrl;

  return "";
}

function isDirectVideoFile(url = "") {
  const cleanUrl = String(url || "").trim().toLowerCase();

  return (
    /\.mp4(\?|#|$)/i.test(cleanUrl) ||
    /\.m3u8(\?|#|$)/i.test(cleanUrl) ||
    /\.mov(\?|#|$)/i.test(cleanUrl) ||
    /\.webm(\?|#|$)/i.test(cleanUrl)
  );
}

function getVideoHtml(url = "") {
  const safeUrl = String(url || "").trim();
  if (!safeUrl) return "";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <style>
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            background: #000;
            overflow: hidden;
          }

          video {
            width: 100%;
            height: 100%;
            background: #000;
          }
        </style>
      </head>

      <body>
        <video controls playsinline webkit-playsinline preload="metadata">
          <source src="${escapeHtml(safeUrl)}" />
        </video>
      </body>
    </html>
  `;
}

function getYouTubeEmbedHtml(videoId = "") {
  if (!videoId) return "";

  const safeVideoId = escapeHtml(videoId);

  const src =
    `https://www.youtube-nocookie.com/embed/${safeVideoId}` +
    `?playsinline=1&rel=0&modestbranding=1&controls=1`;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <style>
          html, body {
            margin: 0;
            padding: 0;
            background: #000;
            width: 100%;
            height: 100%;
            overflow: hidden;
          }

          iframe {
            width: 100%;
            height: 100%;
            border: 0;
          }
        </style>
      </head>

      <body>
        <iframe
          src="${src}"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowfullscreen
        ></iframe>
      </body>
    </html>
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export default function Viewrecording({ route }) {
  const { t, lang } = useT();
  const isSi = lang === "si";
  const isFocused = useIsFocused();

  const params = route?.params ?? {};

  const title = normalizeValue(pickTitle(params)) || t("recordingVideoTitle");
  const videoUrl = normalizeValue(pickVideoUrl(params));

  const [fullOpen, setFullOpen] = useState(false);
  const [playerKey, setPlayerKey] = useState(0);

  const youtubeId = useMemo(() => getYouTubeId(videoUrl), [videoUrl]);
  const isYoutube = !!youtubeId;

  const isDirectFile = useMemo(() => isDirectVideoFile(videoUrl), [videoUrl]);

  const cardWidth = width - 32;
  const normalHeight = Math.round(cardWidth * 0.56);
  const fullHeight = Math.round(height * 0.34);

  const playerHtml = useMemo(() => {
    if (isYoutube) return getYouTubeEmbedHtml(youtubeId);
    if (isDirectFile) return getVideoHtml(videoUrl);
    return "";
  }, [isYoutube, youtubeId, isDirectFile, videoUrl]);

  useEffect(() => {
    setFullOpen(false);
    setPlayerKey((prev) => prev + 1);
  }, [videoUrl]);

  useEffect(() => {
    if (!isFocused) {
      setFullOpen(false);
      setPlayerKey((prev) => prev + 1);
    }
  }, [isFocused]);

  const handleOpenExternal = async () => {
    try {
      if (!videoUrl) return;

      const supported = await Linking.canOpenURL(videoUrl);

      if (supported) {
        await Linking.openURL(videoUrl);
      }
    } catch (error) {
      console.log(t("failedOpenRecordingVideoUrl"), error);
    }
  };

  const renderPlayer = (playerHeight, mode = "normal") => {
    const currentPlayerKey = `${mode}-${playerKey}-${videoUrl}`;

    if (!isFocused) {
      return (
        <View style={styles.playerFallback}>
          <Ionicons name="pause-circle-outline" size={22} color="#FFFFFF" />
          <Text style={styles.fallbackText}>{t("playbackStopped")}</Text>
        </View>
      );
    }

    if (!videoUrl) {
      return (
        <View style={styles.playerFallback}>
          <Ionicons name="alert-circle-outline" size={22} color="#FFFFFF" />
          <Text style={styles.fallbackText}>{t("missingRecordingVideoLink")}</Text>
        </View>
      );
    }

    if (isYoutube) {
      if (Platform.OS === "web") {
        return (
          <CrossWebView
            key={`web-youtube-${currentPlayerKey}`}
            source={{ html: playerHtml }}
            style={[styles.webview, { height: playerHeight }]}
          />
        );
      }

      return (
        <YoutubePlayerBox
          key={`native-youtube-${currentPlayerKey}`}
          videoId={youtubeId}
          height={playerHeight}
        />
      );
    }

    if (isDirectFile) {
      return (
        <CrossWebView
          key={`direct-video-${currentPlayerKey}`}
          source={{ html: playerHtml }}
          style={[styles.webview, { height: playerHeight }]}
        />
      );
    }

    return (
      <View style={styles.playerFallback}>
        <Ionicons name="alert-circle-outline" size={22} color="#FFFFFF" />
        <Text style={styles.fallbackText}>{t("linkCannotPlayInsideApp")}</Text>

        <Pressable style={styles.openExternalBtn} onPress={handleOpenExternal}>
          <Text style={styles.openExternalBtnText}>{t("openOutside")}</Text>
        </Pressable>
      </View>
    );
  };

  return (
    // ── Live-page purple gradient background ──────────────────────────────────
    <LinearGradient
      colors={["#EDE9FE", "#DDD6FE", "#C4B5FD"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Decorative layer (glows + clouds + stars) */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={styles.purpleGlowOne} />
        <View style={styles.purpleGlowTwo} />

        <MovingCloud style={{ top: 58, left: -12 }} size={38} delay={0} />
        <MovingCloud style={{ top: 110, right: 20 }} size={32} delay={300} />
        <MovingCloud style={{ top: 185, left: 35 }} size={28} delay={600} />
        <MovingCloud style={{ bottom: 185, right: -4 }} size={36} delay={900} />
        <MovingCloud style={{ bottom: 95, left: 12 }} size={30} delay={1200} />
        <MovingCloud style={{ bottom: 45, right: 35 }} size={26} delay={1500} />

        <Star style={{ top: 42, left: "12%" }} size={23} color="#FDE68A" />
        <Star style={{ top: 34, right: "14%" }} size={27} color="#A78BFA" />
        <Star style={{ top: 145, left: "8%" }} size={18} color="#F9A8D4" />
        <Star style={{ bottom: 130, right: "8%" }} size={22} color="#FDE68A" />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.centerWrap}>
          <Text style={styles.titleText} numberOfLines={2}>
            {title}
          </Text>

          <View style={[styles.mainCard, { width: cardWidth }]}>
            <View style={[styles.playerBox, { height: normalHeight }]}>
              {fullOpen ? (
                <View style={styles.playerFallback}>
                  <Ionicons name="expand-outline" size={22} color="#FFFFFF" />
                  <Text style={styles.fallbackText}>{t("fullscreenOpened")}</Text>
                </View>
              ) : (
                renderPlayer(normalHeight, "normal")
              )}
            </View>

            <View style={styles.actionRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.fullBtn,
                  pressed && styles.fullBtnPressed,
                ]}
                onPress={() => {
                  setPlayerKey((prev) => prev + 1);
                  setFullOpen(true);
                }}
              >
                <Ionicons name="expand-outline" size={14} color="#FFFFFF" />
                <Text style={styles.fullBtnText}>{t("view")}</Text>
              </Pressable>
            </View>

            <Text style={[styles.helperText, isSi && styles.helperTextSi]}>
              {t("tapViewFullScreen")}
            </Text>
          </View>
        </View>
      </ScrollView>

      <Modal visible={fullOpen && isFocused} animationType="fade" transparent={false}>
        <SafeAreaView style={styles.fullScreenWrap}>
          <View style={styles.fullHeader}>
            <Text style={styles.fullHeaderText} numberOfLines={1}>
              {title}
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.closeBtn,
                pressed && styles.closeBtnPressed,
              ]}
              onPress={() => {
                setFullOpen(false);
                setPlayerKey((prev) => prev + 1);
              }}
            >
              <Ionicons name="close" size={22} color="#FFFFFF" />
            </Pressable>
          </View>

          <View style={styles.fullPlayerArea}>
            <View style={[styles.fullPlayerBox, { height: fullHeight }]}>
              {renderPlayer(fullHeight, "full")}
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </LinearGradient>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // ── Background (from Live page) ───────────────────────────────────────────
  gradient: { flex: 1 },

  purpleGlowOne: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(168,85,247,0.25)",
    top: -60,
    right: -60,
  },
  purpleGlowTwo: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(124,58,237,0.22)",
    bottom: 40,
    left: -70,
  },

  cloud: { position: "absolute", opacity: 0.52, zIndex: 1 },

  // ── Content (unchanged) ───────────────────────────────────────────────────
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 24,
  },

  centerWrap: {
    alignItems: "center",
    justifyContent: "center",
  },

  titleText: {
    fontSize: 20,
    fontWeight: "900",
    color: "#2E1065",
    textAlign: "center",
    marginBottom: 10,
    width: "100%",
    lineHeight: 26,
  },

  mainCard: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20,
    padding: 12,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.95)",
    shadowColor: "#6D28D9",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 6,
    zIndex: 5,
  },

  playerBox: {
    width: "100%",
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#0B1220",
  },

  webview: {
    width: "100%",
    backgroundColor: "#0B1220",
  },

  playerFallback: {
    flex: 1,
    backgroundColor: "#0B1220",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 14,
  },

  fallbackText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13,
    textAlign: "center",
  },

  openExternalBtn: {
    marginTop: 8,
    backgroundColor: "#214294",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },

  openExternalBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  actionRow: {
    marginTop: 10,
    alignItems: "flex-end",
  },

  fullBtn: {
    height: 34,
    minWidth: 82,
    borderRadius: 10,
    backgroundColor: "#7C3AED",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    gap: 6,
  },

  fullBtnPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.985 }],
  },

  fullBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  helperText: {
    marginTop: 10,
    fontSize: 11,
    fontWeight: "700",
    color: "#6D28D9",
    textAlign: "center",
    lineHeight: 17,
  },

  helperTextSi: {
    fontFamily: "AbhayaLibre_700Bold",
    fontWeight: "normal",
  },

  fullScreenWrap: {
    flex: 1,
    backgroundColor: "#020617",
  },

  fullHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },

  fullHeaderText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    flex: 1,
    textAlign: "center",
    paddingLeft: 38,
    paddingRight: 10,
  },

  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },

  closeBtnPressed: {
    opacity: 0.9,
  },

  fullPlayerArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },

  fullPlayerBox: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#000000",
  },
});
