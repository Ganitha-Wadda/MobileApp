import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PURPLE = "#6c5ce7";
const LIGHT_BG = "#f0eeff";

// Decorative star component
const Star = ({ size = 16, color = "#a78bfa", style }) => (
  <Text style={[{ fontSize: size, color, position: "absolute" }, style]}>
    ★
  </Text>
);

// Profile field row
const ProfileField = ({ icon, label, value }) => (
  <View style={styles.fieldRow}>
    <View style={styles.fieldIconWrap}>
      <Text style={styles.fieldIcon}>{icon}</Text>
    </View>

    <Text style={styles.fieldLabel}>{label}</Text>

    <View style={styles.fieldValueWrap}>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  </View>
);

export default function Profile({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Card */}
        <View style={styles.avatarCard}>
          <Star size={18} color="#f6c90e" style={{ top: 18, left: 22 }} />
          <Star size={13} color="#a78bfa" style={{ top: 12, left: 60 }} />
          <Star size={22} color="#f6c90e" style={{ top: 28, right: 30 }} />
          <Star size={14} color="#a78bfa" style={{ top: 14, right: 70 }} />
          <Star size={12} color="#60a5fa" style={{ top: 55, right: 18 }} />
          <Star size={10} color="#f472b6" style={{ bottom: 60, left: 18 }} />
          <Star size={16} color="#a78bfa" style={{ bottom: 55, right: 22 }} />
          <Star size={12} color="#60a5fa" style={{ top: 40, left: 14 }} />

          <View
            style={[
              styles.dot,
              {
                backgroundColor: "#f6c90e",
                top: 65,
                right: 44,
                width: 8,
                height: 8,
              },
            ]}
          />
          <View
            style={[
              styles.dot,
              {
                backgroundColor: "#f472b6",
                top: 80,
                left: 34,
                width: 7,
                height: 7,
              },
            ]}
          />
          <View
            style={[
              styles.dot,
              {
                backgroundColor: "#60a5fa",
                bottom: 70,
                right: 50,
                width: 9,
                height: 9,
              },
            ]}
          />

          <View style={styles.glowPlatformOuter}>
            <View style={styles.glowPlatformInner} />
          </View>

          <Image
            source={{ uri: "https://i.imgur.com/0y8Ftya.png" }}
            style={styles.avatarImage}
            resizeMode="contain"
          />

          <TouchableOpacity style={styles.viewAvatarBtn} activeOpacity={0.85}>
            <Text style={styles.viewAvatarIcon}>👤</Text>
            <Text style={styles.viewAvatarText}>View Avatar</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Info Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.profileTitleRow}>
              <View style={styles.profileIconBox}>
                <Text style={styles.profileIconText}>👤</Text>
              </View>
              <Text style={styles.profileTitle}>Profile</Text>
            </View>

            <Text style={styles.headerStar}>★</Text>
          </View>

          <View style={styles.divider} />

          <ProfileField icon="👤" label="Name" value="Saman Ekanayake" />
          <View style={styles.fieldDivider} />

          <ProfileField icon="🎓" label="Grade" value="3" />
          <View style={styles.fieldDivider} />

          <ProfileField icon="📍" label="District" value="Kandy" />
          <View style={styles.fieldDivider} />

          <ProfileField icon="👥" label="Gender" value="Male" />

          <TouchableOpacity style={styles.updateBtn} activeOpacity={0.85}>
            <Text style={styles.updateIcon}>✏️</Text>
            <Text style={styles.updateText}>Update</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ece9ff",
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 16,
  },

  avatarCard: {
    backgroundColor: "#f5f3ff",
    borderRadius: 24,
    paddingTop: 20,
    paddingBottom: 24,
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
    minHeight: 300,
    shadowColor: "#a78bfa",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },

  dot: {
    position: "absolute",
    borderRadius: 99,
  },

  glowPlatformOuter: {
    width: 200,
    height: 60,
    borderRadius: 100,
    backgroundColor: "rgba(168, 139, 250, 0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    borderWidth: 2,
    borderColor: "rgba(192, 132, 252, 0.25)",
  },

  glowPlatformInner: {
    width: 130,
    height: 36,
    borderRadius: 100,
    backgroundColor: "rgba(236, 72, 153, 0.12)",
    borderWidth: 1.5,
    borderColor: "rgba(236, 72, 153, 0.3)",
  },

  avatarImage: {
    width: 200,
    height: 200,
    marginTop: -80,
    zIndex: 2,
  },

  viewAvatarBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PURPLE,
    borderRadius: 30,
    paddingVertical: 11,
    paddingHorizontal: 28,
    marginTop: 8,
    gap: 8,
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },

  viewAvatarIcon: {
    fontSize: 16,
  },

  viewAvatarText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
    shadowColor: "#a78bfa",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },

  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  profileTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  profileIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: LIGHT_BG,
    alignItems: "center",
    justifyContent: "center",
  },

  profileIconText: {
    fontSize: 18,
  },

  profileTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1a1a3e",
    letterSpacing: 0.1,
  },

  headerStar: {
    fontSize: 22,
    color: "#f6c90e",
  },

  divider: {
    height: 1,
    backgroundColor: "#eeebff",
    marginBottom: 6,
  },

  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    gap: 12,
  },

  fieldIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: LIGHT_BG,
    alignItems: "center",
    justifyContent: "center",
  },

  fieldIcon: {
    fontSize: 16,
  },

  fieldLabel: {
    width: 68,
    fontSize: 13,
    fontWeight: "600",
    color: "#888",
  },

  fieldValueWrap: {
    flex: 1,
    backgroundColor: "#f7f5ff",
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },

  fieldValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a3e",
  },

  fieldDivider: {
    height: 1,
    backgroundColor: "#f0eeff",
    marginLeft: 46,
  },

  updateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PURPLE,
    borderRadius: 30,
    paddingVertical: 13,
    marginTop: 20,
    gap: 8,
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },

  updateIcon: {
    fontSize: 15,
  },

  updateText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});