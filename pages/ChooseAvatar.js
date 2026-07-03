import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import { useDispatch, useSelector } from "react-redux";
import useT from "../app/i18n/useT";
import { updateUserFields } from "../app/features/userSlice";
import Avatar3DViewer from "../components/Avatar3DViewer";
import { AvatarStage, AvatarMini } from "../components/avatar3d";
import {
  useGetMyAvatarQuery,
  useSaveMyAvatarMutation,
} from "../app/features/avatarApi";
import {
  AVATAR_CATEGORIES,
  AVATAR_PRESETS,
  buildAvatarUrl,
  getAvatarColor,
  getDefaultAvatarConfig,
  normalizeAvatarConfig,
  randomizeAvatarConfig,
} from "../utils/avatarBuilder";

const { width, height } = Dimensions.get("screen");
const PREVIEW_HEIGHT = Math.max(250, Math.min(height * 0.36, width * 0.9));

const CATEGORY_LABELS = {
  scene: "Scene",
  faceShape: "Face Shape",
  skinColor: "Skin Tone",
  top: "Hair Style",
  hairColor: "Hair Color",
  eyes: "Eyes",
  eyeColor: "Eye Color",
  eyebrows: "Eyebrows",
  mouth: "Mouth",
  facialHair: "Facial Hair",
  bodyType: "Body Type",
  clothing: "Outfit",
  clothingColor: "Outfit Color",
  accessories: "Glasses",
  gadget: "Gadgets",
  backgroundColor: "Background",
  personality: "Personality",
};

// Categories rendered as color swatches instead of text cards.
const COLOR_CATEGORIES = ["skinColor", "hairColor", "clothingColor", "backgroundColor", "eyeColor"];

const EMOTES = [
  { name: "wave", icon: "hand-wave" },
  { name: "celebrate", icon: "party-popper" },
  { name: "think", icon: "lightbulb-on-outline" },
  { name: "sad", icon: "emoticon-sad-outline" },
  { name: "walk", icon: "walk" },
  { name: "talk", icon: "account-voice" },
];

const GADGET_ICONS = {
  Blank: "cancel",
  Watch: "watch",
  Headphones: "headphones",
  Backpack: "bag-personal",
  Medal: "medal",
  Crown: "crown",
};

const PERSONALITY_ICONS = {
  Energetic: "lightning-bolt",
  Chill: "weather-night",
  Curious: "magnify",
  Champion: "trophy",
};

const SCENE_ICONS = {
  Studio: "palette",
  FantasyGarden: "flower",
  NightSky: "weather-night",
  Space: "rocket-launch",
  Meadow: "white-balance-sunny",
};

const TALK_PHRASES = {
  en: [
    "Hi! I'm your study buddy!",
    "Ready for today's quiz?",
    "Let's learn something new together!",
    "You're doing great, keep going!",
    "Maths is fun when we do it together!",
  ],
  si: [
    "ආයුබෝවන්! මම ඔයාගේ ඉගෙනුම් යාළුවා!",
    "අද quiz එකට ලෑස්තිද?",
    "අලුත් දෙයක් එකට ඉගෙන ගමු!",
    "ඔයා නියමයි! දිගටම කරගෙන යමු!",
    "ගණිතය එකට කරද්දී හරිම විනෝදයි!",
  ],
};

const SAVE_PHRASES = {
  en: ["Looking awesome!", "I love my new look!"],
  si: ["නියම පෙනුමක්!", "මගේ අලුත් පෙනුම හරිම ලස්සනයි!"],
};

const prettyLabel = (value) =>
  String(value || "")
    .replace(/([A-Z0-9])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase())
    .trim();

const pickRandom = (list) => list[Math.floor(Math.random() * list.length)];

export default function ChooseAvatar({ navigation, route, mode = "onboarding" }) {
  const dispatch = useDispatch();
  const { t, lang } = useT();
  const cachedAvatarConfig = useSelector((state) => state.user?.user?.avatarConfig);
  const userName = useSelector((state) => state.user?.user?.name || "student");
  const token = useSelector((state) => state.auth?.token);

  const initialConfig = useMemo(() => {
    const baseConfig = cachedAvatarConfig || getDefaultAvatarConfig();
    return normalizeAvatarConfig({ ...baseConfig, seed: String(userName || "student") });
  }, [cachedAvatarConfig, userName]);

  const [avatarConfig, setAvatarConfig] = useState(initialConfig);
  const [activeTab, setActiveTab] = useState("presets");
  const [savedConfig, setSavedConfig] = useState(initialConfig);
  const [animation, setAnimation] = useState("idle");
  const [rotating, setRotating] = useState(true);

  const soundRef = useRef(null);

  const { data: serverAvatar } = useGetMyAvatarQuery(undefined, { skip: !token });
  const [saveMyAvatar] = useSaveMyAvatarMutation();

  // If this device has no local avatar yet but the server does, adopt it.
  useEffect(() => {
    if (!cachedAvatarConfig && serverAvatar?.avatar?.config) {
      const fromServer = normalizeAvatarConfig({
        ...serverAvatar.avatar.config,
        seed: String(userName || "student"),
      });
      setAvatarConfig(fromServer);
      setSavedConfig(fromServer);
      dispatch(
        updateUserFields({
          avatarConfig: fromServer,
          avatarUrl: buildAvatarUrl(fromServer),
        })
      );
    }
  }, [serverAvatar, cachedAvatarConfig, dispatch, userName]);

  // Stop any speech / release sounds when leaving the screen.
  useEffect(() => {
    return () => {
      Speech.stop();
      if (soundRef.current) soundRef.current.unloadAsync();
    };
  }, []);

  const playClick = useCallback(async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.replayAsync();
        return;
      }
      const { sound } = await Audio.Sound.createAsync(require("../assets/click3.mp3"));
      soundRef.current = sound;
      await sound.playAsync();
    } catch (error) {
      // Sound is a nice-to-have; never block the UI on it.
    }
  }, []);

  const speechLanguage = lang === "si" ? "si-LK" : "en-US";

  const stopTalking = useCallback(() => {
    Speech.stop();
    setAnimation("idle");
  }, []);

  const startTalking = useCallback(() => {
    const phrase = pickRandom(TALK_PHRASES[lang] || TALK_PHRASES.en);
    setAnimation("talk");
    Speech.stop();
    Speech.speak(phrase, {
      language: speechLanguage,
      pitch: 1.15,
      rate: 0.95,
      onDone: () => setAnimation("idle"),
      onError: () => setAnimation("idle"),
    });
  }, [lang, speechLanguage]);

  const pressEmote = (name) => {
    playClick();

    if (name === "talk") {
      if (animation === "talk") stopTalking();
      else startTalking();
      return;
    }

    Speech.stop();
    setAnimation(animation === name ? "idle" : name);
  };

  const isProfileMode = mode === "profile" || route?.name === "chooseavatarpage";
  const hasChanges = JSON.stringify(avatarConfig) !== JSON.stringify(savedConfig);

  const saveAvatar = (thenGoBack = false) => {
    const finalConfig = normalizeAvatarConfig({
      ...avatarConfig,
      seed: String(userName || "student"),
    });
    const finalUrl = buildAvatarUrl(finalConfig);

    dispatch(
      updateUserFields({
        avatarConfig: finalConfig,
        avatarUrl: finalUrl,
      })
    );

    setAvatarConfig(finalConfig);
    setSavedConfig(finalConfig);
    setAnimation("celebrate");

    Speech.stop();
    Speech.speak(pickRandom(SAVE_PHRASES[lang] || SAVE_PHRASES.en), {
      language: speechLanguage,
      pitch: 1.15,
      rate: 0.95,
    });

    // Best-effort server sync; local save already succeeded (offline-first).
    if (token) {
      saveMyAvatar(finalConfig)
        .unwrap()
        .catch((error) => console.log("Avatar sync failed:", error?.message));
    }

    Alert.alert(t("chooseAvatar"), t("avatarSaved"), [
      {
        text: "OK",
        onPress: () => {
          if (thenGoBack && navigation?.canGoBack()) navigation.goBack();
        },
      },
    ]);
  };

  const continueFlow = () => {
    if (hasChanges) {
      saveAvatar(false);
    }
    navigation.navigate("home");
  };

  const applyPreset = (preset) => {
    playClick();
    setAvatarConfig((prev) =>
      normalizeAvatarConfig({
        ...prev,
        ...preset.config,
        seed: String(userName || "student"),
      })
    );
  };

  const applyOption = (category, value) => {
    playClick();
    setAvatarConfig((prev) => ({ ...prev, [category]: value }));
  };

  const randomizeAvatar = () => {
    playClick();
    setAvatarConfig((prev) =>
      randomizeAvatarConfig({
        ...prev,
        seed: String(userName || "student"),
      })
    );
  };

  const resetAvatar = () => {
    playClick();
    setAvatarConfig(savedConfig);
    stopTalking();
  };

  const tabs = ["presets", ...Object.keys(CATEGORY_LABELS)];

  const renderOptions = () => {
    if (activeTab === "presets") {
      return (
        <View style={styles.presetGrid}>
          {AVATAR_PRESETS.map((preset) => {
            const merged = normalizeAvatarConfig({ ...avatarConfig, ...preset.config });

            return (
              <TouchableOpacity
                key={preset.id}
                activeOpacity={0.85}
                style={styles.presetCard}
                onPress={() => applyPreset(preset)}
              >
                <AvatarMini config={merged} size={76} />
                <Text style={styles.presetText}>{preset.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      );
    }

    const options = AVATAR_CATEGORIES[activeTab] || [];

    if (COLOR_CATEGORIES.includes(activeTab)) {
      return (
        <View style={styles.swatchGrid}>
          {options.map((option) => {
            const selected = avatarConfig[activeTab] === option;
            const hex = getAvatarColor(activeTab, option, "#cccccc");

            return (
              <TouchableOpacity
                key={`${activeTab}-${option}`}
                style={[
                  styles.swatch,
                  { backgroundColor: hex },
                  selected && styles.swatchSelected,
                ]}
                onPress={() => applyOption(activeTab, option)}
                activeOpacity={0.85}
              >
                {selected ? (
                  <MaterialCommunityIcons name="check-bold" size={20} color="#ffffff" />
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      );
    }

    if (activeTab === "gadget" || activeTab === "personality" || activeTab === "scene") {
      const icons =
        activeTab === "gadget"
          ? GADGET_ICONS
          : activeTab === "personality"
          ? PERSONALITY_ICONS
          : SCENE_ICONS;

      return (
        <View style={styles.iconGrid}>
          {options.map((option) => {
            const selected = avatarConfig[activeTab] === option;

            return (
              <TouchableOpacity
                key={`${activeTab}-${option}`}
                style={[styles.iconCard, selected && styles.iconCardSelected]}
                onPress={() => applyOption(activeTab, option)}
                activeOpacity={0.85}
              >
                <MaterialCommunityIcons
                  name={icons[option] || "star-outline"}
                  size={26}
                  color={selected ? "#0ea5e9" : "#475569"}
                />
                <Text style={[styles.iconCardText, selected && styles.iconCardTextSelected]}>
                  {prettyLabel(option)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      );
    }

    return (
      <View style={styles.optionGrid}>
        {options.map((option) => {
          const selected = avatarConfig[activeTab] === option;

          return (
            <TouchableOpacity
              key={`${activeTab}-${option}`}
              style={[styles.optionCard, selected && styles.optionCardSelected]}
              onPress={() => applyOption(activeTab, option)}
              activeOpacity={0.85}
            >
              <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                {prettyLabel(option)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={["#f0f9ff", "#ecfeff", "#fff7ed"]} style={styles.container}>
        {/* ── Header (fixed) ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerText}>{t("chooseAvatar")}</Text>
            <Text style={styles.subText}>{t("pickFavoriteCharacter")}</Text>
          </View>
          <TouchableOpacity style={styles.headerIconButton} onPress={randomizeAvatar}>
            <MaterialCommunityIcons name="dice-multiple" size={24} color="#0f172a" />
          </TouchableOpacity>
        </View>

        {/* ── 3D preview (fixed — always visible while customizing) ── */}
        <LinearGradient
          colors={["#020617", "#0f172a", "#1e293b"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.previewCard}
        >
          <AvatarStage
            config={avatarConfig}
            animation={animation}
            autoRotate={rotating}
            onAnimationEnd={() => setAnimation("idle")}
            style={styles.mainAvatar3D}
            fallback={
              <Avatar3DViewer avatarConfig={avatarConfig} style={styles.mainAvatar3D} />
            }
          />

          <Text style={styles.previewHint}>Drag to rotate · Pinch to zoom</Text>

          <TouchableOpacity
            style={styles.rotateToggle}
            onPress={() => {
              playClick();
              setRotating((prev) => !prev);
            }}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name={rotating ? "pause-circle-outline" : "rotate-3d-variant"}
              size={26}
              color="#e2e8f0"
            />
          </TouchableOpacity>

          {/* Emote bar overlay */}
          <View style={styles.emoteBar}>
            {EMOTES.map((emote) => {
              const isActive = animation === emote.name;

              return (
                <TouchableOpacity
                  key={emote.name}
                  style={[styles.emoteButton, isActive && styles.emoteButtonActive]}
                  onPress={() => pressEmote(emote.name)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name={emote.icon}
                    size={21}
                    color={isActive ? "#0ea5e9" : "#e2e8f0"}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </LinearGradient>

        {/* ── Category tabs (fixed) ── */}
        <View style={styles.tabsWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryRow}
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab;
              const label = tab === "presets" ? "Quick Picks" : CATEGORY_LABELS[tab];

              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                >
                  <Text
                    style={[styles.categoryChipText, isActive && styles.categoryChipTextActive]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ── Options (scrolls under the pinned preview) ── */}
        <ScrollView
          style={styles.optionsScroll}
          contentContainerStyle={styles.optionsContent}
          showsVerticalScrollIndicator={false}
        >
          {renderOptions()}
        </ScrollView>

        {/* ── Bottom actions (fixed) ── */}
        <View style={styles.bottomBar}>
          {hasChanges ? (
            <TouchableOpacity style={styles.resetButton} onPress={resetAvatar}>
              <MaterialCommunityIcons name="restore" size={22} color="#475569" />
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => saveAvatar(isProfileMode)}
          >
            <Text style={styles.primaryButtonText}>{t("saveAvatar")}</Text>
          </TouchableOpacity>

          {!isProfileMode ? (
            <TouchableOpacity style={styles.continueButton} onPress={continueFlow}>
              <Text style={styles.continueText}>{t("continueButton")}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f0f9ff",
  },
  container: {
    flex: 1,
    paddingHorizontal: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0f172a",
  },
  subText: {
    fontSize: 12,
    color: "#334155",
    marginTop: 2,
  },
  headerIconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  previewCard: {
    width: "100%",
    height: PREVIEW_HEIGHT,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.32)",
  },
  mainAvatar3D: {
    width: "100%",
    height: "100%",
  },
  previewHint: {
    position: "absolute",
    top: 10,
    left: 12,
    color: "rgba(226,232,240,0.7)",
    fontSize: 10.5,
    fontWeight: "600",
  },
  rotateToggle: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(2,6,23,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  emoteBar: {
    position: "absolute",
    bottom: 8,
    alignSelf: "center",
    flexDirection: "row",
    backgroundColor: "rgba(2,6,23,0.55)",
    borderRadius: 22,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  emoteButton: {
    width: 38,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  emoteButtonActive: {
    backgroundColor: "rgba(14,165,233,0.22)",
  },
  tabsWrap: {
    marginTop: 10,
  },
  categoryRow: {
    paddingBottom: 8,
  },
  categoryChip: {
    backgroundColor: "#e2e8f0",
    borderRadius: 100,
    paddingHorizontal: 13,
    paddingVertical: 8,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: "#0ea5e9",
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
  },
  categoryChipTextActive: {
    color: "#ffffff",
  },
  optionsScroll: {
    flex: 1,
  },
  optionsContent: {
    paddingBottom: 12,
    paddingTop: 2,
  },
  presetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  presetCard: {
    width: "31.5%",
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 8,
    marginBottom: 9,
    borderWidth: 1,
    borderColor: "#dbeafe",
    alignItems: "center",
  },
  presetText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#1e293b",
    textAlign: "center",
    marginTop: 6,
  },
  swatchGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingTop: 6,
  },
  swatch: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "rgba(15,23,42,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  swatchSelected: {
    borderWidth: 3,
    borderColor: "#0ea5e9",
    transform: [{ scale: 1.08 }],
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  iconCard: {
    width: "31.5%",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    marginBottom: 9,
    paddingVertical: 12,
    alignItems: "center",
  },
  iconCardSelected: {
    borderColor: "#0ea5e9",
    backgroundColor: "#f0f9ff",
  },
  iconCardText: {
    color: "#334155",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 5,
  },
  iconCardTextSelected: {
    color: "#0369a1",
  },
  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  optionCard: {
    width: "48.5%",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  optionCardSelected: {
    borderColor: "#f97316",
    backgroundColor: "#fff7ed",
  },
  optionText: {
    color: "#0f172a",
    fontSize: 12,
    fontWeight: "700",
  },
  optionTextSelected: {
    color: "#9a3412",
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },
  resetButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  primaryButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f172a",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  continueButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f97316",
  },
  continueText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 0.2,
  },
});
