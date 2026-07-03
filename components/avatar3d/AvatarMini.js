import React from "react";
import { View, StyleSheet } from "react-native";
import { SCENE_SETTINGS } from "./SceneEnvironment";
import { normalizeAvatarConfig, getAvatarColor } from "../../utils/avatarBuilder";

/*
 * Lightweight 2D "chibi" preview drawn with plain Views, using the exact same
 * palette as the 3D rig — so preset cards and list thumbnails visually match
 * the real 3D character without paying for extra GL contexts.
 */
export default function AvatarMini({ config, size = 64, style }) {
  const cfg = normalizeAvatarConfig(config);

  const skin = getAvatarColor("skinColor", cfg.skinColor, "#f5d0b5");
  const hair = getAvatarColor("hairColor", cfg.hairColor, "#3f2a1d");
  const cloth = getAvatarColor("clothingColor", cfg.clothingColor, "#1e3a8a");
  const bg =
    SCENE_SETTINGS[cfg.scene]?.bg ||
    getAvatarColor("backgroundColor", cfg.backgroundColor, "#dbeafe");
  const iris = getAvatarColor("eyeColor", cfg.eyeColor, "#6b4423");

  const u = size / 64; // unit scale — design was drawn on a 64px grid

  const isHat = cfg.top === "Hat";
  const isTurban = cfg.top === "Turban";
  const isHijab = cfg.top === "Hijab";
  const isLong = cfg.top.startsWith("LongHair");
  const isBraids = cfg.top === "LongHairBraids";
  const isPigTails = cfg.top === "PigTails";
  const hasGlasses = cfg.accessories && cfg.accessories !== "Blank";
  const darkGlasses = cfg.accessories === "Sunglasses";
  const isCrown = cfg.gadget === "Crown";
  const isHeadphones = cfg.gadget === "Headphones";

  return (
    <View
      style={[
        styles.frame,
        { width: size, height: size, borderRadius: 14 * u, backgroundColor: bg },
        style,
      ]}
    >
      {/* Long hair back panels */}
      {isLong ? (
        <View
          style={{
            position: "absolute",
            top: 14 * u,
            width: 34 * u,
            height: 26 * u,
            borderRadius: 12 * u,
            backgroundColor: hair,
          }}
        />
      ) : null}

      {/* Braids hanging down the sides */}
      {isBraids
        ? [-1, 1].map((side) => (
            <View
              key={side}
              style={{
                position: "absolute",
                top: 30 * u,
                left: 32 * u + side * 16 * u - 3 * u,
                width: 6 * u,
                height: 16 * u,
                borderRadius: 3 * u,
                backgroundColor: hair,
              }}
            />
          ))
        : null}

      {/* Pigtail puffs sticking out */}
      {isPigTails
        ? [-1, 1].map((side) => (
            <View
              key={side}
              style={{
                position: "absolute",
                top: 12 * u,
                left: 32 * u + side * 19 * u - 5 * u,
                width: 10 * u,
                height: 10 * u,
                borderRadius: 5 * u,
                backgroundColor: hair,
              }}
            />
          ))
        : null}

      {/* Body */}
      <View
        style={{
          position: "absolute",
          bottom: 4 * u,
          width: 30 * u,
          height: 18 * u,
          borderTopLeftRadius: 12 * u,
          borderTopRightRadius: 12 * u,
          borderBottomLeftRadius: 6 * u,
          borderBottomRightRadius: 6 * u,
          backgroundColor: cloth,
        }}
      />

      {/* Head */}
      <View
        style={{
          position: "absolute",
          top: 12 * u,
          width: 26 * u,
          height: 26 * u,
          borderRadius: 13 * u,
          backgroundColor: isHijab ? hair : skin,
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        {/* Face opening for hijab */}
        {isHijab ? (
          <View
            style={{
              position: "absolute",
              top: 5 * u,
              width: 18 * u,
              height: 19 * u,
              borderRadius: 9 * u,
              backgroundColor: skin,
            }}
          />
        ) : null}

        {/* Eyes */}
        <View
          style={{
            position: "absolute",
            top: 11 * u,
            flexDirection: "row",
            gap: 6 * u,
          }}
        >
          {[0, 1].map((i) => (
            <View
              key={i}
              style={{
                width: 5 * u,
                height: darkGlasses ? 5 * u : 5 * u,
                borderRadius: 3 * u,
                backgroundColor: darkGlasses ? "#0f172a" : "#ffffff",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {!darkGlasses ? (
                <View
                  style={{
                    width: 3 * u,
                    height: 3 * u,
                    borderRadius: 2 * u,
                    backgroundColor: iris,
                  }}
                />
              ) : null}
            </View>
          ))}
        </View>

        {/* Glasses frame */}
        {hasGlasses && !darkGlasses ? (
          <View
            style={{
              position: "absolute",
              top: 9.5 * u,
              width: 20 * u,
              height: 8 * u,
              borderRadius: 4 * u,
              borderWidth: 1.2 * u,
              borderColor: "#0f172a",
            }}
          />
        ) : null}

        {/* Smile */}
        <View
          style={{
            position: "absolute",
            top: 18 * u,
            width: 8 * u,
            height: 4 * u,
            borderBottomWidth: 1.6 * u,
            borderColor: "#7f1d1d",
            borderBottomLeftRadius: 5 * u,
            borderBottomRightRadius: 5 * u,
          }}
        />
      </View>

      {/* Hair / headwear cap (drawn above head) */}
      {!isHijab ? (
        <View
          style={{
            position: "absolute",
            top: isHat || isTurban ? 8 * u : 10 * u,
            width: isHat ? 30 * u : 27 * u,
            height: isHat ? 8 * u : isTurban ? 12 * u : 11 * u,
            borderTopLeftRadius: 14 * u,
            borderTopRightRadius: 14 * u,
            borderBottomLeftRadius: isHat ? 2 * u : 5 * u,
            borderBottomRightRadius: isHat ? 2 * u : 5 * u,
            backgroundColor: hair,
          }}
        />
      ) : null}

      {/* Crown */}
      {isCrown ? (
        <View
          style={{
            position: "absolute",
            top: 4 * u,
            width: 14 * u,
            height: 6 * u,
            borderBottomLeftRadius: 2 * u,
            borderBottomRightRadius: 2 * u,
            backgroundColor: "#fbbf24",
          }}
        />
      ) : null}

      {/* Headphones band */}
      {isHeadphones ? (
        <View
          style={{
            position: "absolute",
            top: 8 * u,
            width: 30 * u,
            height: 14 * u,
            borderTopLeftRadius: 15 * u,
            borderTopRightRadius: 15 * u,
            borderWidth: 2 * u,
            borderBottomWidth: 0,
            borderColor: "#1e293b",
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignItems: "center",
    overflow: "hidden",
  },
});
