import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";

import Floating from "../pages/Floating.js";
import { useForgotPasswordResetMutation } from "../app/features/authApi.js";
import { clearForgotPasswordFlow } from "../app/features/authSlice.js";
import useT from "../app/i18n/useT";

const { width, height } = Dimensions.get("screen");

export default function ResetPasswordScreen2({ navigation }) {
  const dispatch = useDispatch();
  const { t } = useT();
  const [resetPassword, { isLoading }] = useForgotPasswordResetMutation();

  const forgotPasswordPhone = useSelector(
    (state) => state.auth?.forgotPasswordPhone
  );

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!password) {
      setError(t("passwordRequired"));
      return;
    }

    if (password.length < 6) {
      setError(t("passwordMinLength"));
      return;
    }

    if (!confirmPassword) {
      setError(t("confirmPasswordRequired"));
      return;
    }

    if (confirmPassword.length < 6) {
      setError(t("confirmPasswordMinLength"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("passwordsMatch"));
      return;
    }

    if (!forgotPasswordPhone) {
      setError(t("phoneNumberNotFound"));
      return;
    }

    try {
      const result = await resetPassword({
        phonenumber: forgotPasswordPhone,
        password,
        confirmPassword,
      }).unwrap();

      if (result?.message) {
        setSuccess(result.message);
      }

      // Clear forgot password flow and navigate to signin
      setTimeout(() => {
        dispatch(clearForgotPasswordFlow());
        navigation.reset({
          index: 0,
          routes: [{ name: "Signin" }],
        });
      }, 1000);
    } catch (err) {
      const message =
        err?.data?.message ||
        err?.message ||
        t("resetPasswordFailed");
      setError(message);
    }
  };

  const handleGoBack = () => {
    navigation.navigate("ForgotPasswordOtp");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require("../assets/a_vertical_pastel_cartoon_illustration_scene_like.png")}
        style={styles.background}
        resizeMode="cover"
      />

      {/* Floating numbers */}
      <Floating
        text="2+3"
        startX={width * 0.05}
        startY={height * 0.15}
        color="#6B21A8"
        size={width * 0.08}
      />
      <Floating
        text="4x2"
        startX={width * 0.75}
        startY={height * 0.1}
        color="#2563EB"
        size={width * 0.08}
      />
      <Floating
        text="6÷2"
        startX={width * 0.15}
        startY={height * 0.6}
        color="#F59E0B"
        size={width * 0.08}
      />
      <Floating
        text="7-1"
        startX={width * 0.75}
        startY={height * 0.75}
        color="#7C3AED"
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
              Reset <Text style={styles.highlight}>Password</Text>
            </Text>
            <Text style={styles.subtitle}>
              {t("resetPasswordHeading")}
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

          {/* Password Input */}
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              placeholder={t("newPassword")}
              placeholderTextColor="#64748B"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.passwordToggleText}>
                {showPassword ? t("hide") : t("show")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              placeholder={t("confirmNewPassword")}
              placeholderTextColor="#64748B"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Text style={styles.passwordToggleText}>
                {showConfirmPassword ? t("hide") : t("show")}
              </Text>
            </TouchableOpacity>
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
              <Text style={styles.submitText}>{t("resetPasswordTitle")}</Text>
            )}
          </TouchableOpacity>

          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleGoBack}
            activeOpacity={0.8}
          >
            <Text style={styles.backText}>{t("back")}</Text>
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
    flex: 1,
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
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
    textAlign: "center",
  },

  highlight: {
    color: "#FFD600",
    textShadowColor: "#FF6F00",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
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
    flexDirection: "row",
    alignItems: "center",
  },

  input: {
    fontSize: 18,
    color: "#1E40AF",
    flex: 1,
  },

  passwordToggle: {
    paddingHorizontal: 10,
  },

  passwordToggleText: {
    color: "#1B7EEF",
    fontSize: 12,
    fontWeight: "600",
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