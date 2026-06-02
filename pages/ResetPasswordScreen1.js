import React, { useState } from "react";
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, Image, Dimensions, StyleSheet, ScrollView } from "react-native";
import Floating from "../pages/Floating.js";

const { width, height } = Dimensions.get("screen");

export default function ResetPasswordScreen1({ navigation }) {
  const [mobileNumber, setMobileNumber] = useState("");

  return (
    <SafeAreaView style={styles.container}>
      <Image source={require("../assets/a_vertical_pastel_cartoon_illustration_scene_like.png")} style={styles.background} resizeMode="cover" />

      <Floating text="2" startX={width * 0.05} startY={height * 0.25} color="#1B7EEF" size={width * 0.08} />
      <Floating text="3" startX={width * 0.85} startY={height * 0.75} color="#FF9500" size={width * 0.08} />
      <Floating text="5" startX={width * 0.15} startY={height * 0.6} color="#34C759" size={width * 0.08} />
      <Floating text="9" startX={width * 0.8} startY={height * 0.7} color="#FF3B30" size={width * 0.08} />

      <ScrollView contentContainerStyle={styles.formWrapper} keyboardShouldPersistTaps="handled">
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>Enter Your <Text style={styles.highlight}>Mobile Number</Text></Text>
        </View>

        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            placeholder="Mobile Number"
            placeholderTextColor="#64748B"
            keyboardType="phone-pad"
            value={mobileNumber}
            onChangeText={setMobileNumber}
          />
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={() => navigation.navigate("Otp", { nextScreen: "ResetPassword2" })}
        >
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