import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useDispatch } from "react-redux";

import Floating from "../pages/Floating.js";
import { useForgotPasswordSendOtpMutation } from "../app/features/authApi.js";
import { setForgotPasswordFlow } from "../app/features/authSlice.js";

const { width, height } = Dimensions.get("window");

export default function ResetPasswordScreen1({ navigation }) {
  const dispatch = useDispatch();
  const [sendOtp, { isLoading }] = useForgotPasswordSendOtpMutation();

  const [mobileNumber, setMobileNumber] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!mobileNumber) {
      setError("Mobile number is required");
      return;
    }

    try {
      const result = await sendOtp({
        phonenumber: mobileNumber,
      }).unwrap();

      if (result?.message) {
        setSuccess(result.message);
        
        // Set the forgot password flow state
        dispatch(setForgotPasswordFlow(mobileNumber));

        // Navigate to OTP screen after a short delay
        setTimeout(() => {
          navigation.navigate("ForgotPasswordOtp");
        }, 500);
      }
    } catch (err) {
      const message =
        err?.data?.message ||
        err?.message ||
        "Failed to send OTP. Please try again.";
      setError(message);
    }
  };

  const handleGoBack = () => {
    navigation.navigate("Signin");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require("../assets/a_vertical_pastel_cartoon_illustration_scene_like.png")}
        style={styles.background}
        resizeMode="cover"
      />

      <Floating
        text="2"
        startX={width * 0.05}
        startY={height * 0.25}
        color="#1B7EEF"
        size={width * 0.08}
      />
      <Floating
        text="3"
        startX={width * 0.85}
        startY={height * 0.75}
        color="#FF9500"
        size={width * 0.08}
      />
      <Floating
        text="5"
        startX={width * 0.15}
        startY={height * 0.6}
        color="#34C759"
        size={width * 0.08}
      />
      <Floating
        text="9"
        startX={width * 0.8}
        startY={height * 0.7}
        color="#FF3B30"
        size={width * 0.08}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.formWrapper}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <View style={styles.titleWrapper}>
            <Text style={styles.title}>
              Enter Your{"\n"}
              <Text style={styles.highlight}>Mobile Number</Text>
            </Text>
            <Text style={styles.subtitle}>
              We'll send you an OTP to reset your password
            </Text>
          </View>

          {/* Error message */}
          {!!error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Success message */}
          {!!success && (
            <View style={styles.successBox}>
              <Text style={styles.successText}>{success}</Text>
            </View>
          )}

          {/* Mobile Number Input */}
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              placeholder="Mobile Number"
              placeholderTextColor="#64748B"
              keyboardType="phone-pad"
              value={mobileNumber}
              onChangeText={setMobileNumber}
              editable={!isLoading}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>Send OTP</Text>
            )}
          </TouchableOpacity>

          {/* Back to Sign In */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleGoBack}
            activeOpacity={0.8}
          >
            <Text style={styles.backText}>← Back to Sign In</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#BFE7FF",
  },

  background: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },

  keyboardView: {
    flex: 1,
  },

  formWrapper: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 30,
  },

  titleWrapper: {
    width: "100%",
    alignItems: "center",
    marginBottom: 30,
  },

  title: {
    fontSize: 45,
    fontWeight: "900",
    color: "#FFFFFF",
    textShadowColor: "#1E40AF",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
    textAlign: "center",
  },

  highlight: {
    color: "#FFD600",
    textShadowColor: "#FF6F00",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },

  subtitle: {
    fontSize: 14,
    color: "#334155",
    marginTop: 8,
    textAlign: "center",
    fontWeight: "500",
  },

  errorBox: {
    width: "100%",
    backgroundColor: "rgba(255,59,48,0.15)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,59,48,0.4)",
  },

  errorText: {
    color: "#FF3B30",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "600",
  },

  successBox: {
    width: "100%",
    backgroundColor: "rgba(52,199,89,0.15)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(52,199,89,0.4)",
  },

  successText: {
    color: "#34C759",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "600",
  },

  inputBox: {
    width: "80%",
    height: 60,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.95)",
    marginBottom: 20,
    justifyContent: "center",
    paddingHorizontal: 16,
  },

  input: {
    fontSize: 18,
    color: "#1E40AF",
  },

  submitButton: {
    backgroundColor: "#1B7EEF",
    width: "80%",
    paddingVertical: 0,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    marginBottom: 20,
  },

  disabledButton: {
    opacity: 0.7,
  },

  submitText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.6)",
    alignItems: "center",
  },

  backText: {
    color: "#1E40AF",
    fontSize: 14,
    fontWeight: "600",
  },
});