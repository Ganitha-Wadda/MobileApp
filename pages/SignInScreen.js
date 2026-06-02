import React, { useState } from "react";
import { SafeAreaView, ScrollView, View, Text, TextInput, TouchableOpacity, Image, Dimensions, StyleSheet } from "react-native";
import Floating from "../pages/Floating.js";

const { width, height } = Dimensions.get("screen");

export default function SignInScreen({ navigation }) {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require("../assets/a_vertical_pastel_cartoon_illustration_scene_like.png")}
        style={styles.background}
        resizeMode="cover"
      />

      {/* Floating numbers */}
      <Floating text="2" startX={width * 0.05} startY={height * 0.25} color="#1B7EEF" size={width * 0.08} />
      <Floating text="3" startX={width * 0.85} startY={height * 0.75} color="#FF9500" size={width * 0.08} />
      <Floating text="5" startX={width * 0.15} startY={height * 0.6} color="#34C759" size={width * 0.08} />
      <Floating text="9" startX={width * 0.8} startY={height * 0.7} color="#FF3B30" size={width * 0.08} />

      <ScrollView contentContainerStyle={styles.formWrapper} keyboardShouldPersistTaps="handled">
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>Sign<Text style={styles.highlight}>In</Text></Text>
        </View>

        {/* Mobile Number input */}
        <View style={styles.inputBox}>
          <View style={styles.iconContainer}><Text style={styles.icon}>📱</Text></View>
          <TextInput
            style={styles.input}
            placeholder="Mobile Number"
            placeholderTextColor="#64748B"
            keyboardType="phone-pad"
            value={mobile}
            onChangeText={setMobile}
          />
        </View>

        {/* Password input */}
        <View style={styles.inputBox}>
          <View style={styles.iconContainer}><Text style={styles.icon}>🔒</Text></View>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#64748B"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {/* Forgot Password */}
        <TouchableOpacity style={styles.forgotPassword} onPress={() => navigation.navigate("ResetPassword1")}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Submit button */}
        <TouchableOpacity style={styles.submitButton} onPress={() => alert("Sign In clicked!")}>
          <Text style={styles.submitText}>Submit</Text>
        </TouchableOpacity>

        <Text style={styles.signinText}>
          Don't have an account? <Text style={{ color: "#1B7EEF" }} onPress={() => navigation.navigate("Signup")}>Sign Up</Text>
        </Text>
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
  inputBox: { flexDirection: "row", alignItems: "center", width: "100%", backgroundColor: "rgba(255,255,255,0.95)", borderRadius: 16, paddingHorizontal: 14, marginVertical: 8, height: 50 },
  iconContainer: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", marginRight: 10 },
  icon: { fontSize: 18 },
  input: { flex: 1, fontSize: 16, color: "#1E40AF" },
  forgotPassword: { width: "100%", alignItems: "flex-end", marginBottom: 3, marginTop: 4 },
  forgotPasswordText: { color: "#1B7EEF", fontSize: 14, fontWeight: "600" },
  submitButton: { backgroundColor: "#1B7EEF", paddingVertical: 14, borderRadius: 24, width: "100%", alignItems: "center", marginVertical: 12 },
  submitText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  signinText: { fontSize: 14, color: "#64748B", marginTop: 10 },
});