import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  Animated,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSelector }    from "react-redux";
import {
  useEnrollmentStatus,
  useSubmitEnrollmentMutation,
} from "../app/features/enrollmentApi";

const { width } = Dimensions.get("window");

// ─────────────────────────────────────────────────────────────────────────────
// Tiny floating emoji
// ─────────────────────────────────────────────────────────────────────────────
function FloatEmoji({ emoji, style }) {
  const y = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(y, { toValue: -10, duration: 1500, useNativeDriver: true }),
        Animated.timing(y, { toValue: 0,   duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, [y]);
  return (
    <Animated.Text style={[{ transform: [{ translateY: y }] }, style]}>
      {emoji}
    </Animated.Text>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared grade selector from Redux
// ─────────────────────────────────────────────────────────────────────────────
function useUserGrade() {
  return useSelector(
    (s) =>
      s.user?.user?.grade    ??
      s.user?.profile?.grade ??
      s.user?.data?.grade    ??
      s.user?.grade          ??
      null
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Inner content — three states + form
// ─────────────────────────────────────────────────────────────────────────────
function GateContent({ onClose }) {
  const userGrade = useUserGrade();
  const { status, isLoading, isFetching, refetch } = useEnrollmentStatus();
  const [submit, { isLoading: isSubmitting }] = useSubmitEnrollmentMutation();

  const [name,      setName]      = useState("");
  const [phone,     setPhone]     = useState("");
  const [grade,     setGrade]     = useState(userGrade ? String(userGrade) : "");
  const [formError, setFormError] = useState("");
  const [showForm,  setShowForm]  = useState(false); // re-apply after rejection

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim() || !grade.trim()) {
      setFormError("Please fill in all fields.");
      return;
    }
    setFormError("");
    try {
      await submit({
        name:  name.trim(),
        phone: phone.trim(),
        grade: Number(grade),
      }).unwrap();
      refetch();
    } catch (err) {
      setFormError(err?.data?.message ?? "Submission failed. Please try again.");
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <View style={gs.centerBox}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={gs.loadingText}>Checking access…</Text>
      </View>
    );
  }

  // ── Pending ───────────────────────────────────────────────────────────
  if (status === "pending" && !showForm) {
    return (
      <View style={gs.centerBox}>
        <FloatEmoji emoji="⏳" style={gs.bigEmoji} />
        <Text style={gs.gateTitle}>Enrollment Under Review</Text>
        <Text style={gs.gateSub}>
          Your request has been submitted. You'll get full access once the admin
          approves it.
        </Text>
        <View style={gs.infoStrip}>
          <Text style={gs.infoStripText}>
            💜  A free demo lesson is available while you wait.
          </Text>
        </View>
        <TouchableOpacity
          style={gs.secondaryBtn}
          onPress={refetch}
          activeOpacity={0.8}
        >
          {isFetching ? (
            <ActivityIndicator color="#7C3AED" size="small" />
          ) : (
            <Text style={gs.secondaryBtnText}>🔄  Check Status</Text>
          )}
        </TouchableOpacity>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={gs.closeLink}>
            <Text style={gs.closeLinkText}>Close</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // ── Rejected ──────────────────────────────────────────────────────────
  if (status === "rejected" && !showForm) {
    return (
      <View style={gs.centerBox}>
        <FloatEmoji emoji="😔" style={gs.bigEmoji} />
        <Text style={gs.gateTitle}>Enrollment Not Approved</Text>
        <Text style={gs.gateSub}>
          Your request was not approved. You may reapply or contact support.
        </Text>
        <TouchableOpacity
          style={gs.primaryBtn}
          onPress={() => setShowForm(true)}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={["#7C3AED", "#5B21B6"]}
            style={gs.primaryBtnInner}
          >
            <Text style={gs.primaryBtnText}>Reapply</Text>
          </LinearGradient>
        </TouchableOpacity>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={gs.closeLink}>
            <Text style={gs.closeLinkText}>Close</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // ── Enrollment form (not_enrolled OR showForm after rejection) ────────
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={gs.formScroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <FloatEmoji emoji="🎓" style={gs.bigEmoji} />
        <Text style={gs.gateTitle}>Enroll to Access Classes</Text>
        <Text style={gs.gateSub}>
          Submit your details. Once the admin approves, you'll unlock all Live
          Sessions, Recordings and Short Videos.
        </Text>

        <View style={gs.formCard}>
          {/* Grade badge or input */}
          {userGrade ? (
            <View style={gs.gradePill}>
              <Text style={gs.gradePillText}>Grade {userGrade}</Text>
            </View>
          ) : (
            <>
              <Text style={gs.label}>Your Grade</Text>
              <TextInput
                style={gs.input}
                placeholder="e.g.  3"
                placeholderTextColor="#A78BFA"
                value={grade}
                onChangeText={setGrade}
                keyboardType="number-pad"
                returnKeyType="next"
              />
            </>
          )}

          <Text style={gs.label}>Full Name</Text>
          <TextInput
            style={gs.input}
            placeholder="Enter your full name"
            placeholderTextColor="#A78BFA"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            returnKeyType="next"
          />

          <Text style={gs.label}>Phone Number</Text>
          <TextInput
            style={gs.input}
            placeholder="Enter your phone number"
            placeholderTextColor="#A78BFA"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            returnKeyType="done"
          />

          {!!formError && (
            <Text style={gs.errorText}>{formError}</Text>
          )}

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={["#7C3AED", "#5B21B6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={gs.submitBtn}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={gs.submitBtnText}>Submit Enrollment ✦</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <Text style={gs.footNote}>
          ✦ A free demo lesson is available while your request is under review.
        </Text>

        {onClose && (
          <TouchableOpacity onPress={onClose} style={gs.closeLink}>
            <Text style={gs.closeLinkText}>Close</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT EXPORT — full-screen gate (used in Live.jsx)
// Children are rendered only when status === "approved"
// ─────────────────────────────────────────────────────────────────────────────
export default function EnrollmentGate({ children }) {
  const { status, isLoading } = useEnrollmentStatus();

  if (!isLoading && status === "approved") {
    return <>{children}</>;
  }

  return (
    <LinearGradient
      colors={["#EDE9FE", "#DDD6FE", "#C4B5FD"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <GateContent />
      </SafeAreaView>
    </LinearGradient>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NAMED EXPORT — modal variant (used in Recording.jsx + ShortVideoScreen.jsx)
// ─────────────────────────────────────────────────────────────────────────────
export function EnrollmentModal({ visible, onClose }) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <LinearGradient
        colors={["#EDE9FE", "#DDD6FE", "#C4B5FD"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
          <GateContent onClose={onClose} />
        </SafeAreaView>
      </LinearGradient>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const gs = StyleSheet.create({
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },

  formScroll: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 36,
    paddingBottom: 40,
  },

  bigEmoji: {
    fontSize: 62,
    marginBottom: 14,
  },

  gateTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#2E1065",
    textAlign: "center",
    marginBottom: 10,
  },

  gateSub: {
    fontSize: 13,
    color: "#6D28D9",
    textAlign: "center",
    lineHeight: 20,
    fontWeight: "600",
    marginBottom: 22,
    paddingHorizontal: 6,
  },

  infoStrip: {
    backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(109,40,217,0.2)",
  },

  infoStripText: {
    fontSize: 12.5,
    color: "#4C1D95",
    fontWeight: "700",
    textAlign: "center",
  },

  formCard: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 24,
    padding: 22,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.95)",
    shadowColor: "#6D28D9",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
    marginBottom: 18,
  },

  gradePill: {
    alignSelf: "flex-start",
    backgroundColor: "#EDE9FE",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(109,40,217,0.25)",
  },

  gradePillText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#6D28D9",
    letterSpacing: 0.4,
  },

  label: {
    fontSize: 12,
    fontWeight: "800",
    color: "#4C1D95",
    marginBottom: 6,
    marginTop: 4,
    letterSpacing: 0.3,
  },

  input: {
    width: "100%",
    height: 48,
    backgroundColor: "#F5F3FF",
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: "700",
    color: "#2E1065",
    borderWidth: 1.5,
    borderColor: "rgba(109,40,217,0.2)",
    marginBottom: 14,
  },

  errorText: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
  },

  submitBtn: {
    borderRadius: 50,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },

  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.4,
  },

  primaryBtn: {
    width: "70%",
    borderRadius: 50,
    overflow: "hidden",
    marginTop: 6,
  },

  primaryBtnInner: {
    paddingVertical: 13,
    alignItems: "center",
    borderRadius: 50,
  },

  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.3,
  },

  secondaryBtn: {
    paddingHorizontal: 28,
    paddingVertical: 11,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1.5,
    borderColor: "rgba(109,40,217,0.3)",
    marginTop: 6,
  },

  secondaryBtnText: {
    color: "#6D28D9",
    fontSize: 14,
    fontWeight: "800",
  },

  closeLink: {
    marginTop: 18,
    paddingVertical: 8,
  },

  closeLinkText: {
    color: "#7C3AED",
    fontSize: 13,
    fontWeight: "700",
    textDecorationLine: "underline",
  },

  footNote: {
    fontSize: 11.5,
    color: "#7C3AED",
    textAlign: "center",
    fontWeight: "600",
    paddingHorizontal: 10,
  },

  loadingText: {
    marginTop: 14,
    fontSize: 13,
    fontWeight: "700",
    color: "#7C3AED",
  },
});