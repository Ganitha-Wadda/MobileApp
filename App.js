import React, { useState, useEffect, useCallback } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import store, { persistor } from "./app/features/store";

import SplashScreen from "./pages/SplashScreen";
import SelectLanguagePage from "./pages/SelectLanguagePage";
import SignupScreen from "./pages/SignupScreen";
import SignInScreen from "./pages/SignInScreen";
import OtpScreen from "./pages/OtpScreen";
import ResetPasswordScreen1 from "./pages/ResetPasswordScreen1";
import ForgotPasswordOtp from "./pages/Forgotpasswordotp";
import ResetPasswordScreen2 from "./pages/ResetPasswordScreen2";
import Notice from "./pages/Notice";
import ChooseAvatar from "./pages/ChooseAvatar";
import Home from "./pages/Home";

import RootLayout from "./Layouts/RootLayout";
import SecondLayout from "./Layouts/SecondLayout";

import ShortzMenu from "./pages/ShortzMenu";
import Live from "./pages/Live";
import Recording from "./pages/Recording";
import Game from "./pages/Game";
import ParentPage from "./pages/Parentpage";
import Result from "./pages/Result";
import Attendance from "./pages/Attendance";
import ViewShortLessonsScreen from "./pages/Viewshortlessonsscreen";
import ShortVideoScreen from "./pages/ShortVideoScreen";
import ActivityFlowScreen from "./pages/ActivityFlowScreen";
import ViewRecording from "./pages/Viewrecording";
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";
import DailyQuizz from "./pages/Dailyquizz";
import FiveHundredPapers from "./pages/FiveHundredPapers";
import LessonByLesson from "./pages/Lessonbylesson";
import PastPaper from "./pages/Pastpaper";
import DailyQuizzmenu from "./pages/Dailyquizzmenu";
import FiveHundredPaperMenu from "./pages/FiveHundredPapersmenu";
import LessonByLessonMenu from "./pages/lessonByLessonMenu";
import PastPaperMenu from "./pages/PastPaperMenu";
import Paperpage from "./pages/paperpage";
import ReviewPage from "./pages/Reviewpage";
import ChooseAvatarPage from "./pages/ChooseAvatarPage";
import Battle from "./pages/Battle";

// ─────────────────────────────────────────────────────────────────────────────
// Navigation state persistence key.
// Bump the version suffix (V1 → V2) if you ever restructure your stack so
// old saved states don't conflict with the new screen names.
// ─────────────────────────────────────────────────────────────────────────────
const NAV_PERSISTENCE_KEY = "NAV_STATE_V1";

// ─────────────────────────────────────────────────────────────────────────────
// clearNavState — call this on explicit logout so the next app open
// starts at the default screen instead of resuming a protected screen.
//
// Usage in your logout handler:
//   import { clearNavState } from "../App";
//   await clearNavState();
//   dispatch(clearAuth());
// ─────────────────────────────────────────────────────────────────────────────
export const clearNavState = async () => {
  try {
    await AsyncStorage.removeItem(NAV_PERSISTENCE_KEY);
  } catch (e) {
    console.warn("[NavPersist] Failed to clear nav state:", e);
  }
};

const Stack = createNativeStackNavigator();

export default function App() {
  const [isNavReady, setIsNavReady] = useState(false);
  const [initialNavState, setInitialNavState] = useState(undefined);

  // ── Restore last screen on every app open (works for ALL users: ─────────────
  //    non-logged-in on OTP / Signup / etc., AND fully logged-in users)
  useEffect(() => {
    const restoreNavState = async () => {
      try {
        const savedStateString = await AsyncStorage.getItem(NAV_PERSISTENCE_KEY);
        if (savedStateString) {
          setInitialNavState(JSON.parse(savedStateString));
        }
        // If nothing was saved yet, initialNavState stays undefined and the
        // navigator uses its own default (Splash screen).
      } catch (e) {
        console.warn("[NavPersist] Failed to restore nav state:", e);
      } finally {
        // Always mark ready so the app never hangs on a blank screen.
        setIsNavReady(true);
      }
    };

    restoreNavState();
  }, []);

  // ── Persist nav state on every screen change ────────────────────────────────
  const onNavStateChange = useCallback(async (state) => {
    try {
      if (state) {
        await AsyncStorage.setItem(NAV_PERSISTENCE_KEY, JSON.stringify(state));
      }
    } catch (e) {
      console.warn("[NavPersist] Failed to save nav state:", e);
    }
  }, []);

  // ── Show blank loading view while AsyncStorage is being read ────────────────
  //    This is extremely brief (< 100ms). Replace with your SplashScreen
  //    component here if you want a visible splash during this moment.
  if (!isNavReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer
          initialState={initialNavState}    // ← resumes last screen for ALL users
          onStateChange={onNavStateChange}  // ← saves on every navigation
        >
          <Stack.Navigator screenOptions={{ headerShown: false }}>

            {/* ── Auth / Onboarding screens (RootLayout) ───────────────────── */}

            <Stack.Screen name="Splash">
              {(props) => (
                <RootLayout>
                  <SplashScreen {...props} />
                </RootLayout>
              )}
            </Stack.Screen>

            <Stack.Screen name="SelectLanguage">
              {(props) => (
                <RootLayout>
                  <SelectLanguagePage {...props} />
                </RootLayout>
              )}
            </Stack.Screen>

            <Stack.Screen name="Signup">
              {(props) => (
                <RootLayout>
                  <SignupScreen {...props} />
                </RootLayout>
              )}
            </Stack.Screen>

            <Stack.Screen name="Signin">
              {(props) => (
                <RootLayout>
                  <SignInScreen {...props} />
                </RootLayout>
              )}
            </Stack.Screen>

            <Stack.Screen name="Otp">
              {(props) => (
                <RootLayout>
                  <OtpScreen {...props} />
                </RootLayout>
              )}
            </Stack.Screen>

            <Stack.Screen name="ResetPassword1">
              {(props) => (
                <RootLayout>
                  <ResetPasswordScreen1 {...props} />
                </RootLayout>
              )}
            </Stack.Screen>

            <Stack.Screen name="ForgotPasswordOtp">
              {(props) => (
                <RootLayout>
                  <ForgotPasswordOtp {...props} />
                </RootLayout>
              )}
            </Stack.Screen>

            <Stack.Screen name="ResetPasswordScreen2">
              {(props) => (
                <RootLayout>
                  <ResetPasswordScreen2 {...props} />
                </RootLayout>
              )}
            </Stack.Screen>

            <Stack.Screen name="Notice">
              {(props) => (
                <RootLayout>
                  <Notice {...props} />
                </RootLayout>
              )}
            </Stack.Screen>

            <Stack.Screen name="ChooseAvatar">
              {(props) => (
                <RootLayout>
                  <ChooseAvatar {...props} />
                </RootLayout>
              )}
            </Stack.Screen>

            {/* ── Main app screens (SecondLayout) ──────────────────────────── */}

            <Stack.Screen name="home">
              {(props) => (
                <SecondLayout navigation={props.navigation}>
                  <Home {...props} />
                </SecondLayout>
              )}
            </Stack.Screen>

            <Stack.Screen name="shortz">
              {(props) => (
                <SecondLayout navigation={props.navigation}>
                  <ShortzMenu {...props} />
                </SecondLayout>
              )}
            </Stack.Screen>

            <Stack.Screen name="live">
              {(props) => (
                <SecondLayout navigation={props.navigation}>
                  <Live {...props} />
                </SecondLayout>
              )}
            </Stack.Screen>

            <Stack.Screen name="recording">
              {(props) => (
                <SecondLayout navigation={props.navigation}>
                  <Recording {...props} />
                </SecondLayout>
              )}
            </Stack.Screen>

            <Stack.Screen name="game">
              {(props) => (
                <SecondLayout navigation={props.navigation}>
                  <Game {...props} />
                </SecondLayout>
              )}
            </Stack.Screen>

            <Stack.Screen name="parent">
              {(props) => (
                <SecondLayout navigation={props.navigation}>
                  <ParentPage {...props} />
                </SecondLayout>
              )}
            </Stack.Screen>

            <Stack.Screen name="result">
              {(props) => (
                <SecondLayout navigation={props.navigation}>
                  <Result {...props} />
                </SecondLayout>
              )}
            </Stack.Screen>

            <Stack.Screen name="attendance">
              {(props) => (
                <SecondLayout navigation={props.navigation}>
                  <Attendance {...props} />
                </SecondLayout>
              )}
            </Stack.Screen>

            <Stack.Screen name="ViewShortLessons">
              {(props) => (
                <SecondLayout navigation={props.navigation}>
                  <ViewShortLessonsScreen {...props} />
                </SecondLayout>
              )}
            </Stack.Screen>

            <Stack.Screen name="ShortVideo">
              {(props) => (
                <SecondLayout navigation={props.navigation}>
                  <ShortVideoScreen {...props} />
                </SecondLayout>
              )}
            </Stack.Screen>

            <Stack.Screen name="ActivityFlow">
              {(props) => (
                <SecondLayout navigation={props.navigation}>
                  <ActivityFlowScreen {...props} />
                </SecondLayout>
              )}
            </Stack.Screen>

            <Stack.Screen name="viewrecording">
              {(props) => (
                <SecondLayout navigation={props.navigation}>
                  <ViewRecording {...props} />
                </SecondLayout>
              )}
            </Stack.Screen>

            <Stack.Screen name="profile">
              {(props) => (
                <SecondLayout navigation={props.navigation}>
                  <Profile {...props} />
                </SecondLayout>
              )}
            </Stack.Screen>

            <Stack.Screen name="Leaderboard">
              {(props) => (
                <SecondLayout navigation={props.navigation}>
                  <Leaderboard {...props} />
                </SecondLayout>
              )}
            </Stack.Screen>

            <Stack.Screen name="DailyPapers">
              {(props) => (
                <SecondLayout navigation={props.navigation}>
                  <DailyQuizz {...props} />
                </SecondLayout>
              )}
            </Stack.Screen>

            <Stack.Screen name="DailyQuizz">
              {(props) => (
                <SecondLayout navigation={props.navigation}>
                  <DailyQuizz {...props} />
                </SecondLayout>
              )}
            </Stack.Screen>

            <Stack.Screen name="FiveHundredPapers">
              {(props) => (
                <SecondLayout navigation={props.navigation}>
                  <FiveHundredPapers {...props} />
                </SecondLayout>
              )}
            </Stack.Screen>

            <Stack.Screen name="LessonByLesson">
              {(props) => (
                <SecondLayout navigation={props.navigation}>
                  <LessonByLesson {...props} />
                </SecondLayout>
              )}
            </Stack.Screen>

            <Stack.Screen name="PastPaper">
              {(props) => (
                <SecondLayout navigation={props.navigation}>
                  <PastPaper {...props} />
                </SecondLayout>
              )}
            </Stack.Screen>

            <Stack.Screen name="DailyQuizzMenu">
              {(props) => (
                <SecondLayout navigation={props.navigation}>
                  <DailyQuizzmenu {...props} />
                </SecondLayout>
              )}
            </Stack.Screen>

            <Stack.Screen name="FiveHundredPaperMenu">
              {(props) => (
                <SecondLayout navigation={props.navigation}>
                  <FiveHundredPaperMenu {...props} />
                </SecondLayout>
              )}
            </Stack.Screen>

            <Stack.Screen name="LessonByLessonMenu">
              {(props) => (
                <SecondLayout navigation={props.navigation}>
                  <LessonByLessonMenu {...props} />
                </SecondLayout>
              )}
            </Stack.Screen>

            <Stack.Screen name="PastPaperMenu">
              {(props) => (
                <SecondLayout navigation={props.navigation}>
                  <PastPaperMenu {...props} />
                </SecondLayout>
              )}
            </Stack.Screen>

            <Stack.Screen name="paperpage">
              {(props) => (
                <SecondLayout navigation={props.navigation}>
                  <Paperpage {...props} />
                </SecondLayout>
              )}
            </Stack.Screen>

            <Stack.Screen name="reviewpage">
              {(props) => (
                <SecondLayout navigation={props.navigation}>
                  <ReviewPage {...props} />
                </SecondLayout>
              )}
            </Stack.Screen>

            <Stack.Screen name="chooseavatarpage">
              {(props) => (
                <SecondLayout navigation={props.navigation}>
                  <ChooseAvatarPage {...props} />
                </SecondLayout>
              )}
            </Stack.Screen>

            <Stack.Screen name="battle">
              {(props) => (
                <SecondLayout navigation={props.navigation}>
                  <Battle {...props} />
                </SecondLayout>
              )}
            </Stack.Screen>

          </Stack.Navigator>
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff", // match your splash screen background color
  },
});