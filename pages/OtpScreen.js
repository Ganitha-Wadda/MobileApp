import React, { useState } from "react";
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, Image, Dimensions, StyleSheet, ScrollView } from "react-native";
import Floating from "../pages/Floating.js";

const { width, height } = Dimensions.get("screen");

export default function OtpScreen({ navigation, route }) {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const refs = {};

  const handleChange = (index, value) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < otp.length - 1) refs[`otp${index + 1}`].focus();
  };

  const otpBoxWidth = (width * 0.8 - (otp.length - 1) * 10) / otp.length;

  const handleSubmit = () => {
    if (route.params?.nextScreen) navigation.navigate(route.params.nextScreen);
    else navigation.navigate("Signin");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image source={require("../assets/a_vertical_pastel_cartoon_illustration_scene_like.png")} style={styles.background} resizeMode="cover" />

      <Floating text="2" startX={width * 0.05} startY={height * 0.25} color="#1B7EEF" size={width * 0.08} />
      <Floating text="3" startX={width * 0.85} startY={height * 0.75} color="#FF9500" size={width * 0.08} />
      <Floating text="5" startX={width * 0.15} startY={height * 0.6} color="#34C759" size={width * 0.08} />
      <Floating text="9" startX={width * 0.8} startY={height * 0.7} color="#FF3B30" size={width * 0.08} />

      <ScrollView contentContainerStyle={styles.formWrapper} keyboardShouldPersistTaps="handled">
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>Enter <Text style={styles.highlight}>OTP</Text></Text>
        </View>

        <View style={styles.otpContainer}>
          {otp.map((digit, idx) => (
            <TextInput
              key={idx}
              ref={r => (refs[`otp${idx}`] = r)}
              style={[styles.otpInput, { width: otpBoxWidth }]}
              maxLength={1}
              keyboardType="number-pad"
              value={digit}
              onChangeText={v => handleChange(idx, v)}
              placeholder="-"
              placeholderTextColor="#64748B"
            />
          ))}
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1, width: "100%", height: "100%", position: "absolute" },
  formWrapper: { flexGrow: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 },
  titleWrapper: { width: "100%", alignItems: "center", marginBottom: 30 },
  title: { fontSize: 45, fontWeight: "900", color: "#FFFFFF", textShadowColor: "#1E40AF", textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 4, textAlign: "center" },
  highlight: { color: "#FFD600", textShadowColor: "#FF6F00", textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 4 },
  otpContainer: { flexDirection: "row", justifyContent: "space-between", width: "80%", marginBottom: 30 },
  otpInput: { height: 60, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.95)", textAlign: "center", fontSize: 24, fontWeight: "700", color: "#1E40AF" },
  submitButton: { backgroundColor: "#1B7EEF", paddingVertical: 14, borderRadius: 24, width: "80%", alignItems: "center" },
  submitText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});