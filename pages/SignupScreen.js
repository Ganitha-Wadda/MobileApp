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
} from "react-native";
import Floating from "../pages/Floating.js";

const { width, height } = Dimensions.get("screen"); // full screen

export default function SignupScreen({ navigation }) {
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    birthday: "",
    grade: "",
    password: "",
    confirmPassword: "",
  });
  const [gender, setGender] = useState(null);

  const updateField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <SafeAreaView style={styles.container}>
      {/* Full-screen background */}
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

      {/* Scrollable form */}
      <ScrollView contentContainerStyle={styles.formWrapper} keyboardShouldPersistTaps="handled">
        {/* Styled title like Select Language */}
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>
            Sign
            <Text style={styles.highlight}>Up</Text>
          </Text>
        </View>

        {/* Input fields */}
        <InputField icon="👤" placeholder="Name" value={form.name} onChangeText={v => updateField("name", v)} />
        <InputField icon="📱" placeholder="Mobile Number" value={form.mobile} onChangeText={v => updateField("mobile", v)} keyboardType="phone-pad" />
        <InputField icon="🎂" placeholder="Birthday" value={form.birthday} onChangeText={v => updateField("birthday", v)} />
        <InputField icon="🎓" placeholder="Grade" value={form.grade} onChangeText={v => updateField("grade", v)} />
        <InputField icon="🔒" placeholder="Password" value={form.password} onChangeText={v => updateField("password", v)} secureTextEntry />
        <InputField icon="🔐" placeholder="Confirm Password" value={form.confirmPassword} onChangeText={v => updateField("confirmPassword", v)} secureTextEntry />

        {/* Gender selection */}
        <View style={styles.genderContainer}>
          <GenderOption icon="👦" label="male" selected={gender === "male"} onPress={() => setGender("male")} />
          <GenderOption icon="👧" label="female" selected={gender === "female"} onPress={() => setGender("female")} />
        </View>

        {/* Submit button */}
        <TouchableOpacity style={styles.submitButton} onPress={() => navigation.navigate("Otp")}>
          <Text style={styles.submitText}>Submit</Text>
        </TouchableOpacity>

        <Text style={styles.signinText}>
          Already have an account?{" "}
          <Text style={{ color: "#1B7EEF" }} onPress={() => navigation.navigate("Signin")}>
            Sign In
          </Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// Input field component
const InputField = ({ icon, placeholder, value, onChangeText, secureTextEntry = false, keyboardType = "default" }) => (
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
    />
  </View>
);

// Gender selection component
const GenderOption = ({ icon, label, selected, onPress }) => (
  <TouchableOpacity style={[styles.genderOption, selected && styles.genderSelected]} onPress={onPress}>
    <View style={styles.genderIconCircle}>
      <Text style={{ fontSize: 18 }}>{icon}</Text>
    </View>
    <Text style={{ fontSize: 18 }}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1, width: "100%", height: "100%", position: "absolute" },
  formWrapper: { paddingTop: height * 0.15, paddingHorizontal: 20, alignItems: "center", flexGrow: 1 },
  
  // Title like Select Language
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

  inputBox: { flexDirection: "row", alignItems: "center", width: "100%", backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 16, paddingHorizontal: 14, marginVertical: 6, height: 50 },
  iconContainer: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", marginRight: 10 },
  icon: { fontSize: 18 },
  input: { flex: 1, fontSize: 16, color: "#1E40AF" },
  genderContainer: { flexDirection: "row", justifyContent: "space-around", width: "100%", marginVertical: 12 },
  genderOption: { flexDirection: "row", alignItems: "center", borderWidth: 2, borderColor: "#CBD5E1", borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10 },
  genderSelected: { borderColor: "#1B7EEF" },
  genderIconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", marginRight: 8 },
  submitButton: { backgroundColor: "#1B7EEF", paddingVertical: 14, borderRadius: 24, width: "100%", alignItems: "center", marginVertical: 12 },
  submitText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  signinText: { fontSize: 14, color: "#64748B", marginTop: 10 },
});