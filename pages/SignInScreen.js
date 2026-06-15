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
  Alert,
} from "react-native";
import { useDispatch } from "react-redux";

import Floating from "../pages/Floating.js";
import { useSigninMutation } from "../app/features/authApi";
import { setToken, setPendingIdentity } from "../app/features/authSlice";
import { setUser } from "../app/features/userSlice";
import useT from "../app/i18n/useT";

const { width, height } = Dimensions.get("screen");

export default function SignInScreen({ navigation }) {
  const dispatch = useDispatch();
  const { t } = useT();

  const [signin, { isLoading }] = useSigninMutation();

  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");

  const getErrorMessage = (err) => {
    return (
      err?.data?.message ||
      err?.error ||
      err?.message ||
      "Sign in failed. Please try again."
    );
  };

  const handleSignIn = async () => {
    const cleanMobile = String(mobile || "").trim();
    const cleanPassword = String(password || "");

    if (!cleanMobile) {
      Alert.alert("Required", "Please enter your mobile number");
      return;
    }

    if (!cleanPassword) {
      Alert.alert("Required", "Please enter your password");
      return;
    }

    try {
      const response = await signin({
        phonenumber: cleanMobile,
        password: cleanPassword,
      }).unwrap();

      if (response?.token) {
        dispatch(setToken(response.token));
      }

      if (response?.user) {
        dispatch(setUser(response.user));
      }

      navigation.reset({
        index: 0,
        routes: [{ name: "home" }],
      });
    } catch (err) {
      const message = getErrorMessage(err);

      if (err?.data?.needsVerification) {
        dispatch(
          setPendingIdentity({
            phone: err?.data?.phonenumber || cleanMobile,
          })
        );

        Alert.alert("Verify Mobile Number", message, [
          {
            text: "OK",
            onPress: () => navigation.navigate("Otp"),
          },
        ]);

        return;
      }

      Alert.alert("Sign In Failed", message);
    }
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

      <ScrollView
        contentContainerStyle={styles.formWrapper}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>
            Sign<Text style={styles.highlight}>In</Text>
          </Text>
        </View>

        {/* Mobile Number input */}
        <View style={styles.inputBox}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📱</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder={t("mobileNumber")}
            placeholderTextColor="#64748B"
            keyboardType="phone-pad"
            value={mobile}
            onChangeText={setMobile}
            autoCapitalize="none"
          />
        </View>

        {/* Password input */}
        <View style={styles.inputBox}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🔒</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder={t("password")}
            placeholderTextColor="#64748B"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
          />
        </View>

        {/* Forgot Password */}
        <TouchableOpacity
          style={styles.forgotPassword}
          onPress={() => navigation.navigate("ResetPassword1")}
        >
          <Text style={styles.forgotPasswordText}>{t("forgotPassword")}</Text>
        </TouchableOpacity>

        {/* Submit button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSignIn}
          disabled={isLoading}
        >
          <Text style={styles.submitText}>
            {isLoading ? t("pleaseWait") : t("submitButton")}
          </Text>
        </TouchableOpacity>

        <Text style={styles.signinText}>
          {t("noAccount")}{" "}
          <Text
            style={{ color: "#1B7EEF" }}
            onPress={() => navigation.navigate("Signup")}
          >
            {t("signUpLower")}
          </Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  formWrapper: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
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
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 16,
    paddingHorizontal: 14,
    marginVertical: 8,
    height: 50,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  icon: { fontSize: 18 },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1E40AF",
  },
  forgotPassword: {
    width: "100%",
    alignItems: "flex-end",
    marginBottom: 3,
    marginTop: 4,
  },
  forgotPasswordText: {
    color: "#1B7EEF",
    fontSize: 14,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#1B7EEF",
    paddingVertical: 14,
    borderRadius: 24,
    width: "100%",
    alignItems: "center",
    marginVertical: 12,
  },
  submitText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  signinText: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 10,
  },
});