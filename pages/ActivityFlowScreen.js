import React, { useMemo, useState, useEffect } from "react";
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from "react-native";

import { useGetActivityPaperQuery } from "../app/features/Shortzapi";
import ActivityTemplate1 from "./ActivityTemplate1";
import ActivityTemplate2 from "./ActivityTemplate2";
import ActivityTemplate3 from "./ActivityTemplate3";

const TEMPLATE2_COLORS = [
  { color: "#a8e6a3", textColor: "#3a8c3f" },
  { color: "#fde68a", textColor: "#b45309" },
  { color: "#a5d8f3", textColor: "#1a6fa0" },
  { color: "#fbb6ce", textColor: "#9b2247" },
];

const BALLOON_COLORS = ["green", "yellow", "red", "blue"];

function getRandomTemplateNo(previousTemplateNo) {
  const templates = [1, 2, 3];
  const available = templates.filter((value) => value !== previousTemplateNo);
  const pool = available.length > 0 ? available : templates;
  return pool[Math.floor(Math.random() * pool.length)];
}

function getCorrectIndexes(item = {}) {
  if (Array.isArray(item?.correctAnswerIndexes)) {
    return item.correctAnswerIndexes
      .map((value) => Number(value))
      .filter((value) => Number.isInteger(value) && value >= 0);
  }

  if (Number.isInteger(Number(item?.correctAnswerIndex))) {
    return [Number(item.correctAnswerIndex)];
  }

  return [0];
}

function normalizeActivity(item, index, templateNo) {
  const answers = Array.isArray(item?.answers) ? item.answers : [];
  const correctIndexes = getCorrectIndexes(item);
  const safeCorrectIndex = correctIndexes.length > 0 ? correctIndexes[0] : 0;
  const correctAnswer = String(answers[safeCorrectIndex] ?? "");

  const options = answers.map((answer, optionIndex) => ({
    id: optionIndex + 1,
    value: String(answer),
    correct: correctIndexes.includes(optionIndex),
    color: TEMPLATE2_COLORS[optionIndex % TEMPLATE2_COLORS.length].color,
    textColor: TEMPLATE2_COLORS[optionIndex % TEMPLATE2_COLORS.length].textColor,
    balloonColor: BALLOON_COLORS[optionIndex % BALLOON_COLORS.length],
  }));

  return {
    id: item?._id || item?.id || `activity-${index}`,
    question: String(item?.question || ""),
    correctAnswer,
    options,
    templateNo,
  };
}

function normalizeActivitiesWithRandomTemplates(rawActivities = []) {
  if (!Array.isArray(rawActivities)) return [];

  let previousTemplateNo = null;

  return rawActivities.map((item, index) => {
    const templateNo = getRandomTemplateNo(previousTemplateNo);
    previousTemplateNo = templateNo;
    return normalizeActivity(item, index, templateNo);
  });
}

export default function ActivityFlowScreen({ navigation, route }) {
  const shortLessonId = route?.params?.shortLessonId || route?.params?.lessonId;
  const shortSubLessonId =
    route?.params?.shortSubLessonId || route?.params?.subLessonId;

  const title = route?.params?.title || route?.params?.subLessonTitle || "Activity";
  const returnToVideoParams = route?.params?.returnToVideoParams || {};
  const completedVideoId = route?.params?.completedVideoId;
  const videoIndex = Number(route?.params?.videoIndex || 0);
  const nextVideoIndex = Number(route?.params?.nextVideoIndex || videoIndex);
  const hasNextVideo = Boolean(route?.params?.hasNextVideo);

  const {
    data: rawActivities = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetActivityPaperQuery(
    { lessonId: shortLessonId, subLessonId: shortSubLessonId },
    { skip: !shortLessonId || !shortSubLessonId }
  );

  const activities = useMemo(
    () => normalizeActivitiesWithRandomTemplates(rawActivities),
    [rawActivities]
  );

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
  }, [shortLessonId, shortSubLessonId, rawActivities]);

  const finishAndGoNextVideo = () => {
    const targetVideoIndex = hasNextVideo ? nextVideoIndex : videoIndex;

    navigation.navigate({
      name: "ShortVideo",
      params: {
        ...returnToVideoParams,
        initialVideoIndex: targetVideoIndex,
        completedVideoId,
        completedActivity: true,
      },
      merge: true,
    });
  };

  const handleNext = () => {
    const nextActivityIndex = currentIndex + 1;

    if (nextActivityIndex < activities.length) {
      setCurrentIndex(nextActivityIndex);
      return;
    }

    finishAndGoNextVideo();
  };

  if (!shortLessonId || !shortSubLessonId) {
    return (
      <SafeAreaView style={styles.statePage}>
        <StatusBar barStyle="dark-content" backgroundColor="#EDE9FE" />
        <Text style={styles.stateTitle}>Activity not found</Text>
        <Text style={styles.stateSub}>Lesson or sub lesson ID is missing.</Text>
        <TouchableOpacity style={styles.stateBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.stateBtnText}>Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (isLoading || isFetching) {
    return (
      <SafeAreaView style={styles.statePage}>
        <StatusBar barStyle="dark-content" backgroundColor="#EDE9FE" />
        <ActivityIndicator size="large" color="#6C5CE7" />
        <Text style={styles.stateTitle}>Loading activities...</Text>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.statePage}>
        <StatusBar barStyle="dark-content" backgroundColor="#EDE9FE" />
        <Text style={styles.stateTitle}>Failed to load activities</Text>
        <TouchableOpacity style={styles.stateBtn} onPress={refetch}>
          <Text style={styles.stateBtnText}>Try again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (activities.length === 0) {
    return (
      <SafeAreaView style={styles.statePage}>
        <StatusBar barStyle="dark-content" backgroundColor="#EDE9FE" />
        <Text style={styles.stateTitle}>No activities found</Text>
        <Text style={styles.stateSub}>No MCQ paper is assigned for this sub lesson.</Text>
        <TouchableOpacity style={styles.stateBtn} onPress={finishAndGoNextVideo}>
          <Text style={styles.stateBtnText}>{hasNextVideo ? "Next Video" : "Back to Video"}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const currentActivity = activities[currentIndex];
  const isLast = currentIndex === activities.length - 1;
  const activityLabel = `Activity - ${currentIndex + 1}`;
  const nextLabel = isLast ? (hasNextVideo ? "Next Video" : "Back to Video") : "Next activity";

  const commonProps = {
    title,
    activityLabel,
    question: currentActivity.question,
    options: currentActivity.options,
    correctAnswer: currentActivity.correctAnswer,
    onNext: handleNext,
    nextLabel,
  };

  if (currentActivity.templateNo === 2) {
    return <ActivityTemplate2 key={currentActivity.id} {...commonProps} />;
  }

  if (currentActivity.templateNo === 3) {
    return <ActivityTemplate3 key={currentActivity.id} {...commonProps} />;
  }

  return <ActivityTemplate1 key={currentActivity.id} {...commonProps} />;
}

const styles = StyleSheet.create({
  statePage: {
    flex: 1,
    backgroundColor: "#EDE9FE",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  stateTitle: {
    marginTop: 14,
    fontSize: 18,
    fontWeight: "900",
    color: "#1A1A3E",
    textAlign: "center",
  },
  stateSub: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "700",
    color: "#6C5CE7",
    textAlign: "center",
    lineHeight: 19,
  },
  stateBtn: {
    marginTop: 18,
    backgroundColor: "#6C5CE7",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  stateBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
});
