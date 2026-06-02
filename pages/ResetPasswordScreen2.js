import React, { useState } from "react";
import { SafeAreaView, ScrollView, View, Text, TextInput, TouchableOpacity, Image, Dimensions, StyleSheet } from "react-native";
import Floating from "../pages/Floating.js";

const { width, height } = Dimensions.get("screen");

export default function ResetPasswordScreen2({ navigation }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <SafeAreaView style={styles.container}>
      <Image source={require("../assets/a_vertical_pastel_cartoon_illustration_scene_like.png")} style={styles.background} resizeMode="cover" />

      {/* Floating numbers */}
      <Floating text="2+3" startX={width * 0.05} startY={height * 0.15} color="#6B21A8" size={width * 0.08} />
      <Floating text="4x2" startX={width * 0.75} startY={height * 0.1} color="#2563EB" size={width * 0.08} />
      <Floating text="6÷2" startX={width * 0.15} startY={height * 0.6} color="#F59E0B" size={width * 0.08} />
      <Floating text="7-1" startX={width * 0.75} startY={height * 0.75} color="#7C3AED" size={width * 0.08} />

      <ScrollView contentContainerStyle={styles.formWrapper} keyboardShouldPersistTaps="handled">
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>Reset <Text style={styles.highlight}>Password</Text></Text>
        </View>

        <View style={styles.inputBox}>
          <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#64748B" secureTextEntry value={password} onChangeText={setPassword} />
        </View>

        <View style={styles.inputBox}>
          <TextInput style={styles.input} placeholder="Confirm Password" placeholderTextColor="#64748B" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={() => {
          if (password && password === confirmPassword) navigation.navigate("Notice");
          else alert("Passwords do not match!");
        }}>
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
  title: { fontSize: 45, fontWeight: "900", color: "#FFFFFF", textShadowColor: "#1E40AF", textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 5, textAlign: "center" },
  highlight: { color: "#FFD600", textShadowColor: "#FF6F00", textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 5 },
  inputBox: { width: "80%", height: 60, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.95)", marginBottom: 20, justifyContent: "center", paddingHorizontal: 16 },
  input: { fontSize: 18, color: "#1E40AF" },
  submitButton: { backgroundColor: "#1B7EEF", width: "80%", paddingVertical: 16, borderRadius: 24, alignItems: "center" },
  submitText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});