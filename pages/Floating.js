import React, { useRef, useEffect } from "react";
import { Animated, Text } from "react-native";

export default function Floating({
  text,
  startX,
  startY,
  color,
  size,
  duration = 3000,
  delay = 0,
  deltaY = 15,
  deltaX = 10,
}) {
  const animY = useRef(new Animated.Value(0)).current;
  const animX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const yAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(animY, {
          toValue: -deltaY,
          duration,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(animY, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
      ])
    );

    const xAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(animX, {
          toValue: deltaX,
          duration: duration * 1.2,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(animX, {
          toValue: 0,
          duration: duration * 1.2,
          useNativeDriver: true,
        }),
      ])
    );

    yAnimation.start();
    xAnimation.start();

    return () => {
      yAnimation.stop();
      xAnimation.stop();
    };
  }, [animY, animX, deltaY, deltaX, duration, delay]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: startX,
        top: startY,
        transform: [{ translateY: animY }, { translateX: animX }],
      }}
    >
      <Text style={{ fontSize: size, fontWeight: "900", color }}>
        {text}
      </Text>
    </Animated.View>
  );
}