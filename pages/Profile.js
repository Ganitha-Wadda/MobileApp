import React, { useRef, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  StatusBar,
  Animated,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Pressable,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useSelector, useDispatch } from "react-redux";

import {
  useGetCurrentUserQuery,
  useUpdateCurrentUserProfileMutation,
} from "../app/features/authApi";
import { useGetActiveGradesQuery } from "../app/features/gradeApi";
import {
  useGetLanguageQuery,
  useUpdateLanguageMutation,
} from "../app/features/Languageapi";
import { setLanguage } from "../app/features/Languageselectionslice";
import { setUser } from "../app/features/userSlice";
import useT from "../app/i18n/useT";

const PURPLE = "#6c5ce7";
const LIGHT_BG = "#f0eeff";

// Keep these as URLs so you do not need to add new local asset files.
// You can replace them with require("../assets/male-kid.png") later if you prefer local images.
const MALE_KID_AVATAR_URI = "https://cdn-icons-png.flaticon.com/512/4140/4140048.png";
const FEMALE_KID_AVATAR_URI = "https://cdn-icons-png.flaticon.com/512/4140/4140051.png";

const PROFILE_TEXT = {
  en: {
    profile: "Profile",
    name: "Name",
    grade: "Grade",
    district: "District",
    gender: "Gender",
    language: "Language",
    sinhala: "Sinhala",
    english: "English",
    update: "Update",
    save: "Save",
    cancel: "Cancel",
    selectGrade: "Select grade",
    selectLanguage: "Select language",
    loadingProfile: "Loading your profile…",
    loadingGrades: "Loading grades…",
    noGrades: "No active grades available",
    profileLoadError: "Couldn't load your profile. Please sign in again.",
    gradeRequired: "Please select a grade",
    updateSuccess: "Profile updated successfully",
    updateFailed: "Profile update failed. Please try again.",
    languageFailed: "Language update failed. Please try again.",
    male: "Male",
    female: "Female",
  },
  si: {
    profile: "පැතිකඩ",
    name: "නම",
    grade: "ශ්‍රේණිය",
    district: "දිස්ත්‍රික්කය",
    gender: "ලිංගය",
    language: "භාෂාව",
    sinhala: "සිංහල",
    english: "English",
    update: "යාවත්කාලීන කරන්න",
    save: "සුරකින්න",
    cancel: "අවලංගු කරන්න",
    selectGrade: "ශ්‍රේණිය තෝරන්න",
    selectLanguage: "භාෂාව තෝරන්න",
    loadingProfile: "ඔබගේ පැතිකඩ පූරණය වෙමින්…",
    loadingGrades: "ශ්‍රේණි පූරණය වෙමින්…",
    noGrades: "සක්‍රීය ශ්‍රේණි නැත",
    profileLoadError: "ඔබගේ පැතිකඩ පූරණය කල නොහැක. නැවත පිවිසෙන්න.",
    gradeRequired: "කරුණාකර ශ්‍රේණියක් තෝරන්න",
    updateSuccess: "පැතිකඩ සාර්ථකව යාවත්කාලීන විය",
    updateFailed: "පැතිකඩ යාවත්කාලීන කිරීම අසාර්ථක විය. නැවත උත්සාහ කරන්න.",
    languageFailed: "භාෂාව යාවත්කාලීන කිරීම අසාර්ථක විය. නැවත උත්සාහ කරන්න.",
    male: "පුරුෂ",
    female: "ස්ත්‍රී",
  },
};

function AnimatedCloud({ style, scale = 1, delay = 0, distance = 18 }) {
  const move = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(move, {
          toValue: distance,
          duration: 2600,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(move, {
          toValue: 0,
          duration: 2600,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: -6,
          duration: 1800,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [move, float, delay, distance]);

  return (
    <Animated.View
      style={[
        styles.cloud,
        style,
        {
          transform: [{ translateX: move }, { translateY: float }, { scale }],
        },
      ]}
    >
      <View style={styles.cloudCircle1} />
      <View style={styles.cloudCircle2} />
      <View style={styles.cloudCircle3} />
      <View style={styles.cloudBase} />
    </Animated.View>
  );
}

function LeafDecor({ side = "left" }) {
  return (
    <View
      pointerEvents="none"
      style={[
        styles.leafWrapper,
        side === "left" ? styles.leafLeft : styles.leafRight,
        side === "right" && styles.leafFlip,
      ]}
    >
      <View style={styles.leafMain} />
      <View style={styles.leafSecond} />
      <View style={styles.leafThird} />
    </View>
  );
}

const Star = ({ size = 16, color = "#a78bfa", style }) => (
  <Text style={[{ fontSize: size, color, position: "absolute" }, style]}>★</Text>
);

const capitalize = (value) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : "";

const getUserGradeNumber = (user) => {
  if (!user?.grade) return "";
  if (typeof user.grade === "object") return String(user.grade.gradeId || "");
  return String(user.grade || "");
};

const getGradeLabel = (grade) => {
  if (!grade) return "";
  if (typeof grade === "object") return String(grade.gradeId || "");
  return String(grade);
};

function ProfileField({ icon, label, value, labelStyle }) {
  return (
    <View style={styles.fieldRow}>
      <View style={styles.fieldIconWrap}>
        <Text style={styles.fieldIcon}>{icon}</Text>
      </View>

      <Text style={[styles.fieldLabel, labelStyle]}>{label}</Text>

      <View style={styles.fieldValueWrap}>
        <Text style={styles.fieldValue}>{value}</Text>
      </View>
    </View>
  );
}

function SelectModal({ visible, title, options, selectedValue, onSelect, onClose, emptyText }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={() => {}}>
          <Text style={styles.modalTitle}>{title}</Text>

          {options.length === 0 ? (
            <Text style={styles.emptyText}>{emptyText}</Text>
          ) : (
            options.map((item) => {
              const active = String(item.value) === String(selectedValue);

              return (
                <TouchableOpacity
                  key={String(item.value)}
                  style={[styles.optionBtn, active && styles.optionBtnActive]}
                  activeOpacity={0.85}
                  onPress={() => {
                    onSelect(item.value);
                    onClose();
                  }}
                >
                  <Text style={[styles.optionText, active && styles.optionTextActive]}>
                    {item.label}
                  </Text>
                  {active && <Text style={styles.optionCheck}>✓</Text>}
                </TouchableOpacity>
              );
            })
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function Profile() {
  const dispatch = useDispatch();
  const { lang, sinFont } = useT();
  const copy = PROFILE_TEXT[lang] || PROFILE_TEXT.si;

  const token = useSelector((state) => state.auth?.token);
  const cachedUser = useSelector((state) => state.user?.user);
  const reduxLanguage = useSelector((state) => state.languageSelection?.language || "si");

  const [isEditing, setIsEditing] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState(reduxLanguage);
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [languageModalOpen, setLanguageModalOpen] = useState(false);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetCurrentUserQuery(undefined, { skip: !token });

  const {
    data: activeGrades = [],
    isLoading: isGradesLoading,
    refetch: refetchGrades,
  } = useGetActiveGradesQuery(undefined, { skip: !token });

  const { data: backendLanguage } = useGetLanguageQuery(undefined, { skip: !token });
  const [updateProfile, { isLoading: isSavingProfile }] = useUpdateCurrentUserProfileMutation();
  const [updateLanguage, { isLoading: isSavingLanguage }] = useUpdateLanguageMutation();

  useEffect(() => {
    if (data?.user) {
      dispatch(setUser(data.user));
    }
  }, [data, dispatch]);

  const user = data?.user || cachedUser || null;

  useEffect(() => {
    if (user) {
      setSelectedGrade(getUserGradeNumber(user));
    }
  }, [user]);

  useEffect(() => {
    if (backendLanguage?.language) {
      const nextLanguage = backendLanguage.language;
      setSelectedLanguage(nextLanguage);
      dispatch(setLanguage(nextLanguage));
    }
  }, [backendLanguage?.language, dispatch]);

  const gradeOptions = useMemo(
    () =>
      activeGrades.map((grade) => ({
        label: `${copy.grade} ${grade.gradeId}`,
        value: String(grade.gradeId),
      })),
    [activeGrades, copy.grade]
  );

  const languageOptions = useMemo(
    () => [
      { label: copy.sinhala, value: "si" },
      { label: copy.english, value: "en" },
    ],
    [copy.english, copy.sinhala]
  );

  const displayName = user?.name?.trim() || "—";
  const displayGrade = getUserGradeNumber(user) || "—";
  const displayDistrict = user?.district || "—";
  const cleanGender = String(user?.gender || "").toLowerCase().trim();
  const displayGender = cleanGender === "female" ? copy.female : cleanGender === "male" ? copy.male : capitalize(cleanGender) || "—";
  const avatarUri = cleanGender === "female" ? FEMALE_KID_AVATAR_URI : MALE_KID_AVATAR_URI;
  const displayLanguage = selectedLanguage === "en" ? copy.english : copy.sinhala;

  const showInitialLoader = isLoading && !user;

  const handleRefresh = () => {
    if (token) {
      refetch();
      refetchGrades();
    }
  };

  const handleLanguageSelect = async (nextLanguage) => {
    const previousLanguage = selectedLanguage;

    setSelectedLanguage(nextLanguage);
    dispatch(setLanguage(nextLanguage));

    try {
      await updateLanguage(nextLanguage).unwrap();
    } catch (err) {
      setSelectedLanguage(previousLanguage);
      dispatch(setLanguage(previousLanguage));
      Alert.alert(copy.language, err?.data?.message || copy.languageFailed);
    }
  };

  const handleSaveProfile = async () => {
    if (!selectedGrade) {
      Alert.alert(copy.profile, copy.gradeRequired);
      return;
    }

    try {
      const response = await updateProfile({ grade: Number(selectedGrade) }).unwrap();

      if (response?.user) {
        dispatch(setUser(response.user));
      }

      setIsEditing(false);
      Alert.alert(copy.profile, response?.message || copy.updateSuccess);
    } catch (err) {
      Alert.alert(copy.profile, err?.data?.message || copy.updateFailed);
    }
  };

  return (
    <LinearGradient
      colors={["#FAF9FF", "#F3F0FF", "#ECE8FF"]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAF9FF" />

        <View style={styles.root}>
          <Text style={[styles.sparkSmall, { top: 36, left: "18%" }]}>•</Text>
          <Text style={[styles.spark, { top: 34, left: "22%" }]}>✦</Text>
          <Text style={[styles.spark, { top: 34, right: "21%" }]}>✦</Text>
          <Text style={[styles.sparkSmall, { top: 31, right: "16%" }]}>•</Text>

          <AnimatedCloud style={{ top: 92, left: -18 }} scale={0.85} delay={0} />
          <AnimatedCloud style={{ top: 145, right: 20 }} scale={0.65} delay={300} />
          <AnimatedCloud style={{ top: 235, left: 35 }} scale={0.5} delay={600} />
          <AnimatedCloud style={{ top: 315, right: -8 }} scale={0.72} delay={900} />
          <AnimatedCloud style={{ bottom: 130, left: 32 }} scale={0.78} delay={1200} />
          <AnimatedCloud style={{ bottom: 105, right: 32 }} scale={0.68} delay={1500} />
          <AnimatedCloud style={{ bottom: 65, left: -8 }} scale={0.5} delay={1800} />
          <AnimatedCloud style={{ bottom: 42, right: -2 }} scale={0.55} delay={2100} />

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isFetching}
                onRefresh={handleRefresh}
                tintColor={PURPLE}
              />
            }
          >
            <View style={styles.avatarCard}>
              <Star size={18} color="#f6c90e" style={{ top: 18, left: 22 }} />
              <Star size={13} color="#a78bfa" style={{ top: 12, left: 60 }} />
              <Star size={22} color="#f6c90e" style={{ top: 28, right: 30 }} />
              <Star size={14} color="#a78bfa" style={{ top: 14, right: 70 }} />
              <Star size={12} color="#60a5fa" style={{ top: 55, right: 18 }} />
              <Star size={10} color="#f472b6" style={{ bottom: 60, left: 18 }} />
              <Star size={16} color="#a78bfa" style={{ bottom: 55, right: 22 }} />
              <Star size={12} color="#60a5fa" style={{ top: 40, left: 14 }} />

              <View style={[styles.dot, { backgroundColor: "#f6c90e", top: 65, right: 44, width: 8, height: 8 }]} />
              <View style={[styles.dot, { backgroundColor: "#f472b6", top: 80, left: 34, width: 7, height: 7 }]} />
              <View style={[styles.dot, { backgroundColor: "#60a5fa", bottom: 70, right: 50, width: 9, height: 9 }]} />

              <View style={styles.glowPlatformOuter}>
                <View style={styles.glowPlatformInner} />
              </View>

              <Image
                source={{ uri: avatarUri }}
                style={styles.avatarImage}
                resizeMode="contain"
              />
            </View>

            <View style={styles.profileCard}>
              <View style={styles.profileHeader}>
                <View style={styles.profileTitleRow}>
                  <View style={styles.profileIconBox}>
                    <Text style={styles.profileIconText}>👤</Text>
                  </View>
                  <Text style={[styles.profileTitle, sinFont("bold")]}>{copy.profile}</Text>
                </View>

                <Text style={styles.headerStar}>★</Text>
              </View>

              <View style={styles.divider} />

              {showInitialLoader ? (
                <View style={styles.loaderWrap}>
                  <ActivityIndicator size="small" color={PURPLE} />
                  <Text style={[styles.loaderText, sinFont("regular")]}>{copy.loadingProfile}</Text>
                </View>
              ) : (
                <>
                  {isError && !user && (
                    <Text style={[styles.errorText, sinFont("bold")]}> {copy.profileLoadError}</Text>
                  )}

                  <ProfileField icon="👤" label={copy.name} value={displayName} labelStyle={sinFont("regular")} />
                  <View style={styles.fieldDivider} />

                  <View style={styles.fieldRow}>
                    <View style={styles.fieldIconWrap}>
                      <Text style={styles.fieldIcon}>🎓</Text>
                    </View>
                    <Text style={[styles.fieldLabel, sinFont("regular")]}>{copy.grade}</Text>

                    {isEditing ? (
                      <TouchableOpacity
                        style={[styles.fieldValueWrap, styles.selectBox]}
                        activeOpacity={0.85}
                        onPress={() => setGradeModalOpen(true)}
                        disabled={isGradesLoading}
                      >
                        <Text style={styles.fieldValue}>
                          {isGradesLoading
                            ? copy.loadingGrades
                            : selectedGrade
                              ? `${copy.grade} ${selectedGrade}`
                              : copy.selectGrade}
                        </Text>
                        <Text style={styles.chevron}>⌄</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.fieldValueWrap}>
                        <Text style={styles.fieldValue}>{displayGrade}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.fieldDivider} />

                  <ProfileField icon="📍" label={copy.district} value={displayDistrict} labelStyle={sinFont("regular")} />
                  <View style={styles.fieldDivider} />

                  <ProfileField icon="👥" label={copy.gender} value={displayGender} labelStyle={sinFont("regular")} />
                  <View style={styles.fieldDivider} />

                  <View style={styles.fieldRow}>
                    <View style={styles.fieldIconWrap}>
                      <Text style={styles.fieldIcon}>🌐</Text>
                    </View>
                    <Text style={[styles.fieldLabel, sinFont("regular")]}>{copy.language}</Text>

                    <TouchableOpacity
                      style={[styles.fieldValueWrap, styles.selectBox]}
                      activeOpacity={0.85}
                      onPress={() => setLanguageModalOpen(true)}
                      disabled={isSavingLanguage}
                    >
                      <Text style={styles.fieldValue}>{isSavingLanguage ? copy.loadingProfile : displayLanguage}</Text>
                      <Text style={styles.chevron}>⌄</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {isEditing ? (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.secondaryBtn]}
                    activeOpacity={0.85}
                    onPress={() => {
                      setSelectedGrade(getUserGradeNumber(user));
                      setIsEditing(false);
                    }}
                    disabled={isSavingProfile}
                  >
                    <Text style={[styles.secondaryBtnText, sinFont("bold")]}>{copy.cancel}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.updateBtn, styles.saveBtn]}
                    activeOpacity={0.85}
                    onPress={handleSaveProfile}
                    disabled={isSavingProfile}
                  >
                    {isSavingProfile ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Text style={styles.updateIcon}>✓</Text>
                        <Text style={[styles.updateText, sinFont("bold")]}>{copy.save}</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.updateBtn}
                  activeOpacity={0.85}
                  onPress={() => setIsEditing(true)}
                  disabled={showInitialLoader}
                >
                  <Text style={styles.updateIcon}>✏️</Text>
                  <Text style={[styles.updateText, sinFont("bold")]}>{copy.update}</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>

          <View style={[styles.bgCircle, styles.bgCircleLeft]} />
          <View style={[styles.bgCircle, styles.bgCircleRight]} />
          <Text style={[styles.softDot, { bottom: 38, left: "28%" }]}>✦</Text>
          <Text style={[styles.softDot, { bottom: 46, right: "17%" }]}>✦</Text>
          <LeafDecor side="left" />
          <LeafDecor side="right" />

          <SelectModal
            visible={gradeModalOpen}
            title={copy.selectGrade}
            options={gradeOptions}
            selectedValue={selectedGrade}
            onSelect={setSelectedGrade}
            onClose={() => setGradeModalOpen(false)}
            emptyText={copy.noGrades}
          />

          <SelectModal
            visible={languageModalOpen}
            title={copy.selectLanguage}
            options={languageOptions}
            selectedValue={selectedLanguage}
            onSelect={handleLanguageSelect}
            onClose={() => setLanguageModalOpen(false)}
            emptyText={copy.selectLanguage}
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },

  root: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },

  scrollArea: {
    flex: 1,
    zIndex: 5,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 130,
    gap: 16,
  },

  avatarCard: {
    backgroundColor: "rgba(245,243,255,0.94)",
    borderRadius: 24,
    paddingTop: 20,
    paddingBottom: 24,
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
    minHeight: 300,
    shadowColor: "#A39BF5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#ECE8FF",
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
    width: 180,
    height: 180,
    marginTop: -70,
    zIndex: 2,
  },

  profileCard: {
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
    shadowColor: "#A39BF5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#ECE8FF",
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
    color: "#07124A",
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

  loaderWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 28,
  },

  loaderText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#888",
  },

  errorText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#E11D48",
    marginBottom: 10,
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
    width: 76,
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

  selectBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  chevron: {
    fontSize: 16,
    color: PURPLE,
    fontWeight: "900",
  },

  fieldDivider: {
    height: 1,
    backgroundColor: "#f0eeff",
    marginLeft: 46,
  },

  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
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

  saveBtn: {
    flex: 1,
    marginTop: 0,
  },

  secondaryBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f7f5ff",
    borderRadius: 30,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: "#e2dcff",
  },

  secondaryBtnText: {
    color: PURPLE,
    fontSize: 16,
    fontWeight: "800",
  },

  updateIcon: {
    fontSize: 15,
    color: "#fff",
  },

  updateText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(7, 18, 74, 0.28)",
    alignItems: "center",
    justifyContent: "center",
    padding: 22,
  },

  modalCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 18,
    shadowColor: "#07124A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 10,
  },

  modalTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#07124A",
    marginBottom: 12,
  },

  optionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "#f7f5ff",
    marginBottom: 8,
  },

  optionBtnActive: {
    backgroundColor: PURPLE,
  },

  optionText: {
    color: "#1a1a3e",
    fontSize: 15,
    fontWeight: "800",
  },

  optionTextActive: {
    color: "#fff",
  },

  optionCheck: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
  },

  emptyText: {
    color: "#888",
    fontWeight: "700",
    paddingVertical: 12,
  },

  spark: {
    position: "absolute",
    fontSize: 15,
    color: "#FFC84D",
    fontWeight: "900",
    zIndex: 2,
  },

  sparkSmall: {
    position: "absolute",
    fontSize: 18,
    color: "#B9AFF7",
    zIndex: 2,
  },

  softDot: {
    position: "absolute",
    color: "#D6CDFC",
    fontSize: 14,
    zIndex: 2,
  },

  cloud: {
    position: "absolute",
    width: 58,
    height: 30,
    opacity: 0.8,
    zIndex: 1,
  },

  cloudCircle1: {
    position: "absolute",
    left: 4,
    bottom: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },

  cloudCircle2: {
    position: "absolute",
    left: 18,
    bottom: 8,
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
  },

  cloudCircle3: {
    position: "absolute",
    right: 4,
    bottom: 4,
    width: 21,
    height: 21,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
  },

  cloudBase: {
    position: "absolute",
    left: 5,
    right: 4,
    bottom: 3,
    height: 13,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
  },

  bgCircle: {
    position: "absolute",
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: "rgba(214,205,252,0.55)",
    bottom: -20,
    zIndex: 0,
  },

  bgCircleLeft: {
    left: 39,
  },

  bgCircleRight: {
    right: 32,
  },

  leafWrapper: {
    position: "absolute",
    bottom: -8,
    width: 86,
    height: 95,
    zIndex: 2,
  },

  leafLeft: {
    left: -4,
  },

  leafRight: {
    right: -4,
  },

  leafFlip: {
    transform: [{ scaleX: -1 }],
  },

  leafMain: {
    position: "absolute",
    left: 12,
    bottom: 0,
    width: 25,
    height: 65,
    backgroundColor: "#9E94F4",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 35,
    transform: [{ rotate: "28deg" }],
  },

  leafSecond: {
    position: "absolute",
    left: 36,
    bottom: -4,
    width: 22,
    height: 58,
    backgroundColor: "#B7AFFA",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 32,
    transform: [{ rotate: "10deg" }],
  },

  leafThird: {
    position: "absolute",
    left: 2,
    bottom: -5,
    width: 20,
    height: 50,
    backgroundColor: "#8175E8",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 15,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 28,
    transform: [{ rotate: "50deg" }],
  },
});
