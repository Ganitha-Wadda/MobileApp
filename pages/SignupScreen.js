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
  Alert,
} from "react-native";
import { useDispatch } from "react-redux";

import Floating from "../pages/Floating.js";
import { useSignupMutation } from "../app/features/authApi.js";
import { setToken, setPendingIdentity } from "../app/features/authSlice.js";
import { setUser } from "../app/features/userSlice.js";

const { width, height } = Dimensions.get("screen");

export default function SignupScreen({ navigation }) {
  const dispatch = useDispatch();
  const [signup, { isLoading }] = useSignupMutation();

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    birthday: "",
    grade: "",
    batchYear: "",
    district: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [gender, setGender] = useState(null);
  const [error, setError] = useState("");

  const updateField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    setError("");

    // Basic client-side guard before hitting the network
    if (!form.name.trim()) return setError("Name is required");
    if (!form.mobile.trim()) return setError("Mobile number is required");
    if (!form.birthday.trim()) return setError("Birthday is required");
    if (!form.grade.trim()) return setError("Grade is required");
    if (!form.batchYear.trim()) return setError("Batch year is required");
    if (!form.district.trim()) return setError("District is required");
    if (!form.address.trim()) return setError("Address is required");
    if (!gender) return setError("Gender is required");
    if (!form.password) return setError("Password is required");
    if (!form.confirmPassword) return setError("Confirm password is required");
    if (form.password !== form.confirmPassword)
      return setError("Passwords do not match");

    try {
      const result = await signup({
        name: form.name.trim(),
        phonenumber: form.mobile.trim(),
        birthday: form.birthday.trim(),
        grade: Number(form.grade),
        batchYear: Number(form.batchYear),
        district: form.district.trim(),
        address: form.address.trim(),
        gender: gender.toLowerCase(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      }).unwrap();

      // Save token to Redux (persisted via AsyncStorage)
      if (result?.token) {
        dispatch(setToken(result.token));
      }

      // Save user object to Redux
      if (result?.user) {
        dispatch(setUser(result.user));
      }

      // Save pending phone so OTP screen knows who to verify
      dispatch(setPendingIdentity({ phone: form.mobile.trim() }));

      // Navigate to OTP screen
      navigation.navigate("Otp");
    } catch (err) {
      // RTK Query unwrap throws the error payload
      const message =
        err?.data?.message ||
        err?.message ||
        "Signup failed. Please try again.";
      setError(message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require("../assets/a_vertical_pastel_cartoon_illustration_scene_like.png")}
        style={styles.background}
        resizeMode="cover"
      />

      <Floating text="2" startX={width * 0.05} startY={height * 0.25} color="#1B7EEF" size={width * 0.08} />
      <Floating text="3" startX={width * 0.85} startY={height * 0.75} color="#FF9500" size={width * 0.08} />
      <Floating text="5" startX={width * 0.15} startY={height * 0.6} color="#34C759" size={width * 0.08} />
      <Floating text="9" startX={width * 0.8} startY={height * 0.7} color="#FF3B30" size={width * 0.08} />

      <ScrollView
        contentContainerStyle={styles.formWrapper}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>
            Sign<Text style={styles.highlight}>Up</Text>
          </Text>
        </View>

        {/* Error message */}
        {!!error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <InputField
          icon="👤"
          placeholder="Name"
          value={form.name}
          onChangeText={(v) => updateField("name", v)}
        />
        <InputField
          icon="📱"
          placeholder="Mobile Number (07XXXXXXXX)"
          value={form.mobile}
          onChangeText={(v) => updateField("mobile", v)}
          keyboardType="phone-pad"
        />
        <InputField
          icon="🎂"
          placeholder="Birthday (YYYY-MM-DD)"
          value={form.birthday}
          onChangeText={(v) => updateField("birthday", v)}
        />
        <InputField
          icon="🎓"
          placeholder="Grade (3, 4 or 5)"
          value={form.grade}
          onChangeText={(v) => updateField("grade", v)}
          keyboardType="numeric"
        />
        <InputField
          icon="📅"
          placeholder="Batch Year (e.g. 2025)"
          value={form.batchYear}
          onChangeText={(v) => updateField("batchYear", v)}
          keyboardType="numeric"
        />
        <InputField
          icon="🏙️"
          placeholder="District (e.g. Colombo)"
          value={form.district}
          onChangeText={(v) => updateField("district", v)}
        />
        <InputField
          icon="🏠"
          placeholder="Address"
          value={form.address}
          onChangeText={(v) => updateField("address", v)}
        />
        <InputField
          icon="🔒"
          placeholder="Password"
          value={form.password}
          onChangeText={(v) => updateField("password", v)}
          secureTextEntry
        />
        <InputField
          icon="🔐"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChangeText={(v) => updateField("confirmPassword", v)}
          secureTextEntry
        />

        {/* Gender selection */}
        <View style={styles.genderContainer}>
          <GenderOption
            icon="👦"
            label="male"
            selected={gender === "male"}
            onPress={() => setGender("male")}
          />
          <GenderOption
            icon="👧"
            label="female"
            selected={gender === "female"}
            onPress={() => setGender("female")}
          />
        </View>

        {/* Submit button */}
        <TouchableOpacity
          style={[styles.submitButton, isLoading && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Submit</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.signinText}>
          Already have an account?{" "}
          <Text
            style={{ color: "#1B7EEF" }}
            onPress={() => navigation.navigate("Signin")}
          >
            Sign In
          </Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const InputField = ({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
}) => (
  <View style={styles.inputBox}>
    <View style={styles.iconContainer}>
      <Text style={styles.icon}>{icon}</Text>
    </View>
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor="#64748B"
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize="none"
    />
  </View>
);

const GenderOption = ({ icon, label, selected, onPress }) => (
  <TouchableOpacity
    style={[styles.genderOption, selected && styles.genderSelected]}
    onPress={onPress}
  >
    <View style={styles.genderIconCircle}>
      <Text style={{ fontSize: 18 }}>{icon}</Text>
    </View>
    <Text style={{ fontSize: 18 }}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  formWrapper: {
    paddingTop: height * 0.15,
    paddingHorizontal: 20,
    alignItems: "center",
    flexGrow: 1,
  },
  titleWrapper: { width: "100%", alignItems: "center", marginBottom: 20 },
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
  errorBox: {
    width: "100%",
    backgroundColor: "rgba(255,59,48,0.15)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255,59,48,0.4)",
  },
  errorText: { color: "#FF3B30", fontSize: 14, textAlign: "center" },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 16,
    paddingHorizontal: 14,
    marginVertical: 6,
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
  input: { flex: 1, fontSize: 16, color: "#1E40AF" },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginVertical: 12,
  },
  genderOption: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  genderSelected: { borderColor: "#1B7EEF" },
  genderIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  submitButton: {
    backgroundColor: "#1B7EEF",
    paddingVertical: 14,
    borderRadius: 24,
    width: "100%",
    alignItems: "center",
    marginVertical: 12,
  },
  submitText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  signinText: { fontSize: 14, color: "#64748B", marginTop: 10 },
});