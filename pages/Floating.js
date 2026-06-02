import React, { useRef, useEffect } from "react";
import { Animated } from "react-native";

export default function Floating({ text, startX, startY, color, size, duration = 3000, delay = 0, deltaY = 15, deltaX = 10 }) {
  const animY = useRef(new Animated.Value(0)).current;
  const animX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animY, { toValue: -deltaY, duration, delay, useNativeDriver: true }),
        Animated.timing(animY, { toValue: 0, duration, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(animX, { toValue: deltaX, duration: duration * 1.2, delay, useNativeDriver: true }),
        Animated.timing(animX, { toValue: 0, duration: duration * 1.2, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.Text
      style={{
        position: "absolute",
        left: startX,
        top: startY,
        transform: [{ translateY: animY }, { translateX: animX }],
        fontSize: size,
        fontWeight: "900",
        color,
      }}
    >
      {text}
    </Animated.Text>
  );
}