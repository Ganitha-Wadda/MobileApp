import React, { useMemo, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useGetShortSubLessonOverviewQuery } from "../app/features/shortcoinscountApi";
import useT from "../app/i18n/useT";

const getId = (item = {}) => String(item?._id || item?.id || "");

const getCurrentVideoIndex = (subLesson = {}) => {
  const progress = subLesson?.progress || {};
  const value = Number(progress?.currentVideoIndex ?? progress?.lastUnlockedVideoIndex ?? 0);
  return Number.isInteger(value) && value >= 0 ? value : 0;
};

const getWatchedCount = (subLesson = {}) => {
  const progress = subLesson?.progress || {};
  if (Number.isFinite(Number(progress?.watchedCount))) return Number(progress.watchedCount);
  if (Array.isArray(progress?.watchedVideoIndexes)) return progress.watchedVideoIndexes.length;
  if (Array.isArray(progress?.watchedVideoKeys)) return progress.watchedVideoKeys.length;
  return 0;
};

export default function ViewShortLessonsScreen({ navigation, route }) {
  const { t } = useT();
  const shortLessonId = route?.params?.shortLessonId || route?.params?.lessonId;
  const lessonTitle = route?.params?.lessonTitle || t("shortLesson");
  const lessonNumber = Number(route?.params?.lessonNumber || 1);

  const {
    data: subLessons = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetShortSubLessonOverviewQuery(shortLessonId, {
    skip: !shortLessonId,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  useEffect(() => {
    const unsubscribe = navigation.addListener?.("focus", () => {
      if (shortLessonId) refetch?.();
    });

    return unsubscribe;
  }, [navigation, refetch, shortLessonId]);

  const sortedSubLessons = useMemo(() => {
    if (!Array.isArray(subLessons)) return [];
    return subLessons;
  }, [subLessons]);

  const openSubLesson = (subLesson, index) => {
    const locked = subLesson?.isLocked || subLesson?.isUnlocked === false;

    if (locked) {
      Alert.alert(
        t("subLessonLockedTitle"),
        t("subLessonLockedMessage")
      );
      return;
    }

    navigation.navigate("ShortVideo", {
      shortLessonId,
      lessonId: shortLessonId,
      lessonTitle,
      lessonNumber,
      shortSubLessonId: getId(subLesson),
      subLessonId: getId(subLesson),
      subLessonTitle: subLesson?.title || `${t("subLesson")} ${index + 1}`,
      links: Array.isArray(subLesson?.links) ? subLesson.links : [],
      shortSubLesson: subLesson,
      allSubLessons: sortedSubLessons,
      currentSubLessonIndex: index,
      initialVideoIndex: getCurrentVideoIndex(subLesson),
    });
  };

  const renderAction = ({ completed, locked }) => {
    if (completed) {
      return (
        <View style={[styles.actionBtn, styles.completedBtn]}>
          <Text style={styles.completedText}>{t("completed")}</Text>
        </View>
      );
    }

    if (locked) {
      return (
        <View style={[styles.actionBtn, styles.lockedBtn]}>
          <Text style={styles.lockedText}>🔒 {t("shortzLockedButton")}</Text>
        </View>
      );
    }

    return (
      <View style={[styles.actionBtn, styles.viewBtn]}>
        <Text style={styles.viewText}>{t("view")}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#5e1cce" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} activeOpacity={0.85} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerKicker}>{t("shortLesson")} {lessonNumber}</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {lessonTitle}
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.stateWrap}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text style={styles.stateTitle}>{t("viewShortLessonsLoadingSub")}</Text>
        </View>
      ) : isError ? (
        <View style={styles.stateWrap}>
          <Text style={styles.stateTitle}>{t("viewShortLessonsFailedSub")}</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={refetch}>
            <Text style={styles.primaryBtnText}>{t("tryAgain")}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={Boolean(isFetching)} onRefresh={refetch} />}
          showsVerticalScrollIndicator={false}
        >
          {sortedSubLessons.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>{t("viewShortLessonsNoSub")}</Text>
              <Text style={styles.emptySub}>{t("viewShortLessonsPublishedSub")}</Text>
            </View>
          ) : (
            sortedSubLessons.map((subLesson, index) => {
              const locked = subLesson?.isLocked || subLesson?.isUnlocked === false;
              const progress = subLesson?.progress || {};
              const completed = Boolean(subLesson?.isCompleted || progress?.isCompleted);
              const watchedCount = getWatchedCount(subLesson);
              const videoCount = Array.isArray(subLesson?.links) ? subLesson.links.length : 0;
              const needsActivities = Boolean(progress?.needsActivitiesBeforeNext);

              return (
                <TouchableOpacity
                  key={getId(subLesson) || index}
                  style={[styles.card, locked && styles.cardLocked]}
                  activeOpacity={0.88}
                  onPress={() => openSubLesson(subLesson, index)}
                >
                  <View style={styles.timelineWrap}>
                    <View style={[styles.dot, completed && styles.dotDone, locked && styles.dotLocked]}>
                      <Text style={styles.dotText}>{completed ? "✓" : index + 1}</Text>
                    </View>
                    {index < sortedSubLessons.length - 1 && <View style={styles.line} />}
                  </View>

                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                      {subLesson?.title || `${t("subLesson")} ${index + 1}`}
                    </Text>

                    <Text style={styles.cardSub}>
                      {completed
                        ? t("completedNextLessonUnlocked")
                        : locked
                        ? t("lockedFinishPreviousSubLesson")
                        : needsActivities
                        ? t("completeAllActivitiesThenContinue")
                        : `${t("unlocked")} • ${watchedCount}/${videoCount} ${t("videosWatched")}`}
                    </Text>
                  </View>

                  {renderAction({ completed, locked })}
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F4F0FF" },

  header: {
    backgroundColor: "#5e1cce",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 18,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: "row",
    alignItems: "center",
  },

  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  backText: { color: "#FFFFFF", fontSize: 34, fontWeight: "600", marginTop: -3 },

  headerTextWrap: { flex: 1 },

  headerKicker: { color: "#DDD6FE", fontSize: 12, fontWeight: "900" },

  headerTitle: { color: "#FFFFFF", fontSize: 21, fontWeight: "900", marginTop: 3 },

  content: { padding: 16, paddingBottom: 36 },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#5e1cce",
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 5,
  },

  cardLocked: { opacity: 0.58 },

  timelineWrap: { alignItems: "center", marginRight: 14 },

  dot: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
  },

  dotDone: { backgroundColor: "#2ECC71" },

  dotLocked: { backgroundColor: "#9CA3AF" },

  dotText: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" },

  line: { width: 2, height: 10, backgroundColor: "#DDD6FE", marginTop: 8 },

  cardContent: { flex: 1 },

  cardTitle: { color: "#1A1A3E", fontSize: 16, fontWeight: "900" },

  cardSub: { marginTop: 5, color: "#7C3AED", fontSize: 12, fontWeight: "700" },

  statusIcon: { fontSize: 22, marginLeft: 10 },

  stateWrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },

  stateTitle: { marginTop: 12, color: "#1A1A3E", fontSize: 17, fontWeight: "900", textAlign: "center" },

  primaryBtn: {
    marginTop: 18,
    backgroundColor: "#7C3AED",
    borderRadius: 999,
    paddingHorizontal: 30,
    paddingVertical: 13,
  },

  primaryBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },

  emptyCard: { backgroundColor: "#FFFFFF", borderRadius: 22, padding: 24, alignItems: "center" },

  emptyTitle: { color: "#1A1A3E", fontSize: 17, fontWeight: "900" },

  emptySub: { marginTop: 6, color: "#7C3AED", fontSize: 13, fontWeight: "700", textAlign: "center" },

  // NEW BUTTON STYLES ONLY
  actionBtn: {
    minWidth: 90,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },

  viewBtn: {
    backgroundColor: "#7C3AED",
  },

  viewText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  completedBtn: {
    backgroundColor: "#16A34A",
  },

  completedText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  lockedBtn: {
    backgroundColor: "#E5E7EB",
  },

  lockedText: {
    color: "#374151",
    fontSize: 12,
    fontWeight: "900",
  },
});
