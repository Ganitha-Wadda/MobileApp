import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
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
import ShortVideoScreen from "./pages/Shortvideoscreen";
import ActivityTemplate1 from "./pages/ActivityTemplate1";
import ActivityTemplate2 from "./pages/Activitytemplate2";
import ActivityTemplate3 from "./pages/Activitytemplate3";
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

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
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

            <Stack.Screen name="activitytemplate1">
              {(props) => (
                <SecondLayout navigation={props.navigation}>
                  <ActivityTemplate1 {...props} />
                </SecondLayout>
              )}
            </Stack.Screen>

            <Stack.Screen name="activitytemplate2">
              {(props) => (
                <SecondLayout navigation={props.navigation}>
                  <ActivityTemplate2 {...props} />
                </SecondLayout>
              )}
            </Stack.Screen>

            <Stack.Screen name="activitytemplate3">
              {(props) => (
                <SecondLayout navigation={props.navigation}>
                  <ActivityTemplate3 {...props} />
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