import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { Audio } from "expo-av";
import { useDispatch, useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useGetCurrentUserQuery, useSignoutMutation } from "../app/features/authApi";
import { setUser } from "../app/features/userSlice";
import { LOGOUT_ACTION, persistor } from "../app/features/store";

// ─────────────────────────────────────────────────────────────────────────────
// Storage keys used during logout
// ─────────────────────────────────────────────────────────────────────────────

const NAV_PERSISTENCE_KEY = "NAV_STATE_V1";

const LOGOUT_STORAGE_KEYS = [
  NAV_PERSISTENCE_KEY,
  "persist:root",
  "token",
  "accessToken",
  "authToken",
  "user",
  "currentUser",
  "selectedLanguage",
  "language",
  "appLanguage",
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const getUserFromResponse = (response) => {
  if (!response) return null;
  if (response.user && typeof response.user === "object") return response.user;
  if (response.data?.user && typeof response.data.user === "object") {
    return response.data.user;
  }
  if (
    response.data &&
    typeof response.data === "object" &&
    !Array.isArray(response.data)
  ) {
    return response.data;
  }
  return null;
};

const parseGradeId = (value) => {
  if (value === undefined || value === null || value === "") return "";
  if (typeof value === "object") {
    return parseGradeId(value.gradeId ?? value.grade ?? value.value ?? value.id);
  }

  const gradeId = Number(value);

  return Number.isInteger(gradeId) && gradeId > 0 && gradeId < 20
    ? String(gradeId)
    : "";
};

const getUserGradeLabel = (user) => {
  const gradeId = parseGradeId(
    user?.grade?.gradeId ??
      user?.gradeId ??
      user?.gradeNumber ??
      user?.selectedGrade?.gradeId ??
      user?.selectedGrade ??
      user?.grade
  );

  return gradeId ? `Grade ${gradeId}` : "Grade —";
};

const getDisplayName = (user) => {
  const name = String(
    user?.name || user?.fullname || user?.fullName || ""
  ).trim();

  return name || "Student";
};

// ─────────────────────────────────────────────────────────────────────────────
// TopBar
// Layout: [Profile 🧒] [Name / Grade] [LOGOUT] [Parent 👨‍👩‍👧‍👦]
// ─────────────────────────────────────────────────────────────────────────────

export default function TopBar() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { width } = useWindowDimensions();
  const soundRef = useRef(null);

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const token = useSelector((state) => state?.auth?.token);
  const cachedUser = useSelector((state) => state?.user?.user);

  // ── Fetch current user ──────────────────────────────────────────────────────
  const {
    data: currentUserResponse,
    isLoading,
    isFetching,
  } = useGetCurrentUserQuery(undefined, {
    skip: !token,
    refetchOnMountOrArgChange: true,
  });

  // ── Backend logout mutation ─────────────────────────────────────────────────
  const [signout] = useSignoutMutation();

  const backendUser = useMemo(
    () => getUserFromResponse(currentUserResponse),
    [currentUserResponse]
  );

  useEffect(() => {
    if (backendUser) {
      dispatch(setUser(backendUser));
    }
  }, [backendUser, dispatch]);

  const user = token ? backendUser || cachedUser : null;
  const isUserLoading = Boolean(token) && !user && (isLoading || isFetching);

  const displayName = isUserLoading ? "Loading..." : getDisplayName(user);
  const displayGrade = isUserLoading ? "Loading grade..." : getUserGradeLabel(user);

  // ── Sound ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const playClickSound = useCallback(async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.replayAsync();
        return;
      }

      const { sound } = await Audio.Sound.createAsync(
        require("../assets/click2.mp3")
      );

      soundRef.current = sound;
      await sound.playAsync();
    } catch (error) {
      console.log("Click sound error:", error);
    }
  }, []);

  // ── Navigation ──────────────────────────────────────────────────────────────
  const goToProfile = async () => {
    await playClickSound();
    navigation.navigate("profile");
  };

  const goToParent = async () => {
    await playClickSound();
    navigation.navigate("parent");
  };

  // ── LOGOUT ──────────────────────────────────────────────────────────────────
  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return;

    await playClickSound();
    setIsLoggingOut(true);

    try {
      // Backend logout is best-effort. Even if backend fails, local logout must work.
      try {
        await signout().unwrap();
      } catch (e) {
        console.warn("[Logout] Backend logout failed, continuing local logout:", e);
      }

      // Stop redux-persist while we clear everything.
      try {
        persistor.pause();
      } catch (e) {
        console.warn("[Logout] Persistor pause error:", e);
      }

      // Reset Redux memory state.
      dispatch(LOGOUT_ACTION);

      // Flush pending persistence writes.
      try {
        await persistor.flush();
      } catch (e) {
        console.warn("[Logout] Persistor flush error:", e);
      }

      // Purge persisted Redux data.
      try {
        await persistor.purge();
      } catch (e) {
        console.warn("[Logout] Persistor purge error:", e);
      }

      // Remove navigation/auth/language storage keys.
      try {
        await AsyncStorage.multiRemove(LOGOUT_STORAGE_KEYS);
      } catch (e) {
        console.warn("[Logout] AsyncStorage clear error:", e);
      }

      // Start persistor again for next login/session.
      try {
        persistor.persist();
      } catch (e) {
        console.warn("[Logout] Persistor restart error:", e);
      }

      // Reset full navigation stack to SelectLanguage.
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "SelectLanguage" }],
        })
      );
    } finally {
      setIsLoggingOut(false);
    }
  }, [isLoggingOut, playClickSound, signout, dispatch, navigation]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <LinearGradient
      colors={["#5e1cce", "#5e1cce"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.container, { width }]}
    >
      {/* ── Profile ──────────────────────────────────────────────────────────── */}
      <TouchableOpacity onPress={goToProfile} activeOpacity={0.8}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarEmoji}>🧒</Text>
        </View>
      </TouchableOpacity>

      {/* ── Name + Grade ─────────────────────────────────────────────────────── */}
      <TouchableOpacity
        style={styles.userInfo}
        onPress={goToProfile}
        activeOpacity={0.8}
      >
        <Text style={styles.userName} numberOfLines={1} adjustsFontSizeToFit>
          {displayName}
        </Text>
        <Text style={styles.userGrade}>{displayGrade}</Text>
      </TouchableOpacity>

      {/* ── Friendly Purple LOGOUT button ────────────────────────────────────── */}
      <TouchableOpacity
        onPress={handleLogout}
        activeOpacity={0.82}
        disabled={isLoggingOut}
        style={[
          styles.logoutTouchable,
          isLoggingOut && styles.logoutTouchableDisabled,
        ]}
      >
        <LinearGradient
          colors={["#A78BFA", "#8B5CF6", "#7C3AED"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logoutBtn}
        >
          {isLoggingOut ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.logoutIcon}>⏻</Text>
              <Text style={styles.logoutText}>Logout</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* ── Parent ───────────────────────────────────────────────────────────── */}
      <TouchableOpacity onPress={goToParent} activeOpacity={0.8}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarEmoji}>👨‍👩‍👧‍👦</Text>
        </View>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },

  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },

  avatarEmoji: {
    fontSize: 26,
    lineHeight: 30,
    includeFontPadding: false,
    textAlignVertical: "center",
  },

  userInfo: {
    flex: 1,
    marginHorizontal: 12,
    justifyContent: "center",
  },

  userName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.2,
    ...Platform.select({
      web: { WebkitFontSmoothing: "antialiased" },
    }),
  },

  userGrade: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255,255,255,0.75)",
    marginTop: 2,
  },

  // ── Friendly purple logout button ─────────────────────────────────────────
  logoutTouchable: {
    marginRight: 10,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },

  logoutTouchableDisabled: {
    opacity: 0.7,
  },

  logoutBtn: {
    minWidth: 66,
    minHeight: 42,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.4,
    borderColor: "rgba(255,255,255,0.65)",
  },

  logoutIcon: {
    fontSize: 15,
    color: "#FFFFFF",
    includeFontPadding: false,
    textAlignVertical: "center",
  },

  logoutText: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.35,
    marginTop: 1,
  },
});