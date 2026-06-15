import React, { useRef, useState, useEffect } from "react";
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
import { useSelector } from "react-redux";

import Floating from "../pages/Floating.js";
import {
  useForgotPasswordVerifyOtpMutation,
  useForgotPasswordResendOtpMutation,
} from "../app/features/authApi.js";
import useT from "../app/i18n/useT";

const { width, height } = Dimensions.get("window");

export default function ForgotPasswordOtp({ navigation }) {
  const { t } = useT();
  const [verifyOtp, { isLoading: isVerifying }] =
    useForgotPasswordVerifyOtpMutation();
  const [resendOtp, { isLoading: isResending }] =
    useForgotPasswordResendOtpMutation();

  const forgotPasswordPhone = useSelector(
    (state) => state.auth?.forgotPasswordPhone
  );

  const [otp, setOtp] = useState(Array(6).fill(""));
  const refs = useRef([]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  // Countdown timer for resend cooldown
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const otpBoxWidth = (width * 0.8 - 5 * 10) / 6;

  const handleChange = (index, value) => {
    const onlyDigits = String(value || "").replace(/\D/g, "");

    // Handle paste / autofill of full OTP
    if (onlyDigits.length > 1) {
      const newOtp = Array(6).fill("");
      onlyDigits
        .slice(0, 6)
        .split("")
        .forEach((digit, i) => {
          newOtp[i] = digit;
        });
      setOtp(newOtp);
      const focusIndex = Math.min(onlyDigits.length, 6) - 1;
      refs.current[focusIndex]?.focus?.();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = onlyDigits;
    setOtp(newOtp);

    if (onlyDigits && index < 5) {
      refs.current[index + 1]?.focus?.();
    }
  };

  const handleBackspace = (index, key) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      refs.current[index - 1]?.focus?.();
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    setSuccess("");

    if (!forgotPasswordPhone) {
      setError(t("phoneNumberNotFound"));
      return;
    }

    const code = otp.join("");
    if (code.length !== 6) {
      setError(t("validOtpRequired"));
      return;
    }

    try {
      const result = await verifyOtp({
        phonenumber: forgotPasswordPhone,
        code,
      }).unwrap();

      if (result?.message) {
        setSuccess(result.message);
      }

      // Navigate to password reset screen
      setTimeout(() => {
        navigation.navigate("ResetPasswordScreen2");
      }, 500);
    } catch (err) {
      const message =
        err?.data?.message ||
        err?.message ||
        t("otpVerificationFailed");
      setError(message);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setSuccess("");

    if (!forgotPasswordPhone) {
      setError(t("phoneNumberNotFound"));
      return;
    }

    try {
      const result = await resendOtp({
        phonenumber: forgotPasswordPhone,
      }).unwrap();

      setSuccess(result?.message || t("otpSentSuccessfully"));
      setOtp(Array(6).fill(""));
      refs.current[0]?.focus?.();
      setResendTimer(60); // 60 second cooldown
    } catch (err) {
      const message =
        err?.data?.message ||
        err?.message ||
        t("failedToSendOtp");
      setError(message);
    }
  };

  const handleGoBack = () => {
    navigation.navigate("ResetPassword1");
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
              Enter <Text style={styles.highlight}>OTP</Text>
            </Text>
            <Text style={styles.subtitle}>
              {t("enterOtpSubtitle")} {forgotPasswordPhone}
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

          {/* 6-box OTP input */}
          <View style={styles.otpContainer}>
            {otp.map((digit, idx) => (
              <TextInput
                key={idx}
                ref={(r) => {
                  refs.current[idx] = r;
                }}
                style={[styles.otpInput, { width: otpBoxWidth }]}
                maxLength={idx === 0 ? 6 : 1}
                keyboardType="number-pad"
                inputMode="numeric"
                value={digit}
                onChangeText={(v) => handleChange(idx, v)}
                onKeyPress={({ nativeEvent }) =>
                  handleBackspace(idx, nativeEvent.key)
                }
                placeholder="-"
                placeholderTextColor="#64748B"
                textContentType={Platform.OS === "ios" ? "oneTimeCode" : "none"}
                autoComplete={idx === 0 ? "sms-otp" : "off"}
                importantForAutofill={idx === 0 ? "yes" : "no"}
              />
            ))}
          </View>

          {/* Verify button */}
          <TouchableOpacity
            style={[styles.submitButton, isVerifying && styles.disabledButton]}
            onPress={handleVerifyOtp}
            disabled={isVerifying}
            activeOpacity={0.8}
          >
            {isVerifying ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>{t("verifyOtp")}</Text>
            )}
          </TouchableOpacity>

          {/* Resend OTP */}
          <View style={styles.resendSection}>
            <Text style={styles.resendLabel}>{t("didntReceiveCode")}</Text>
            <TouchableOpacity
              onPress={handleResendOtp}
              disabled={resendTimer > 0 || isResending}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.resendText,
                  (resendTimer > 0 || isResending) && styles.resendTextDisabled,
                ]}
              >
                {resendTimer > 0
                  ? `${t("resendIn")} ${resendTimer}s`
                  : isResending
                  ? t("sending")
                  : t("resendOtp")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Back to Reset Password 1 */}
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
    marginBottom: 24,
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

  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginBottom: 30,
  },

  otpInput: {
    height: 60,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.95)",
    textAlign: "center",
    fontSize: 24,
    fontWeight: "700",
    color: "#1E40AF",
  },

  submitButton: {
    backgroundColor: "#1B7EEF",
    paddingVertical: 0,
    borderRadius: 24,
    width: "80%",
    height: 52,
    alignItems: "center",
    justifyContent: "center",
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

  resendSection: {
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(203,213,225,0.3)",
  },

  resendLabel: {
    fontSize: 14,
    color: "#334155",
    marginBottom: 8,
    textAlign: "center",
  },

  resendText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    textShadowColor: "#1E40AF",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },

  resendTextDisabled: {
    color: "#94A3B8",
    textShadowColor: "transparent",
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