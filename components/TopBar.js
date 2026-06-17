import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { Audio } from "expo-av";
import { useDispatch, useSelector } from "react-redux";
import { useGetCurrentUserQuery } from "../app/features/authApi";
import { setUser } from "../app/features/userSlice";

const getUserFromResponse = (response) => {
  if (!response) return null;
  if (response.user && typeof response.user === "object") return response.user;
  if (response.data?.user && typeof response.data.user === "object") {
    return response.data.user;
  }
  if (response.data && typeof response.data === "object" && !Array.isArray(response.data)) {
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
  const name = String(user?.name || user?.fullname || user?.fullName || "").trim();
  return name || "Student";
};

export default function TopBar() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { width } = useWindowDimensions();
  const soundRef = useRef(null);

  const token = useSelector((state) => state?.auth?.token);
  const cachedUser = useSelector((state) => state?.user?.user);

  const {
    data: currentUserResponse,
    isLoading,
    isFetching,
  } = useGetCurrentUserQuery(undefined, {
    skip: !token,
    refetchOnMountOrArgChange: true,
  });

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

  const goToProfile = async () => {
    await playClickSound();
    navigation.navigate("profile");
  };

  const goToParent = async () => {
    await playClickSound();
    navigation.navigate("parent");
  };

  return (
    <LinearGradient
      colors={["#5e1cce", "#5e1cce"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.container, { width }]}
    >
      <TouchableOpacity onPress={goToProfile} activeOpacity={0.8}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarEmoji}>🧒</Text>
        </View>
      </TouchableOpacity>

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
});
