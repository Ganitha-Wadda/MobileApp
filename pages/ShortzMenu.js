import React, { useMemo, useState } from "react";
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

import { useEnrollmentStatus } from "../app/features/enrollmentApi";
import { EnrollmentModal } from "../components/EnrollmentGate";
import {
  useGetMyTotalShortCoinsQuery,
  useGetShortLessonOverviewQuery,
} from "../app/features/shortcoinscountApi";
import useT from "../app/i18n/useT";

const getId = (item = {}) => String(item?._id || item?.id || "");

export default function ShortzMenu({ navigation }) {
  const { t } = useT();
  const [enrollModalVisible, setEnrollModalVisible] = useState(false);

  const {
    isApproved,
    isPending,
    isRejected,
    isNotEnrolled,
    isLoading: enrollmentLoading,
    refetch: refetchEnrollment,
  } = useEnrollmentStatus();

  const {
    data: lessons = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetShortLessonOverviewQuery(undefined, {
    skip: !isApproved,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const { data: totalCoinsData, refetch: refetchCoins } =
    useGetMyTotalShortCoinsQuery(undefined, { skip: !isApproved });

  const totalShortCoins = Number(
    totalCoinsData?.totalShortCoins || lessons?.[0]?.totalShortCoins || 0
  );

  const refreshing = Boolean(isFetching);

  const sortedLessons = useMemo(() => {
    if (!Array.isArray(lessons)) return [];
    return lessons;
  }, [lessons]);

  const refreshAll = () => {
    refetchEnrollment?.();
    if (isApproved) {
      refetch?.();
      refetchCoins?.();
    }
  };

  const openLesson = (lesson, index) => {
    if (!isApproved) {
      setEnrollModalVisible(true);
      return;
    }

    if (lesson?.isLocked || lesson?.isUnlocked === false) {
      Alert.alert(
        t("shortzLessonLocked"),
        t("shortzCompletePreviousLessonMessage")
      );
      return;
    }

    navigation.navigate("ViewShortLessons", {
      shortLessonId: getId(lesson),
      lessonId: getId(lesson),
      lessonTitle: lesson?.title || `${t("shortLesson")} ${index + 1}`,
      lessonNumber: index + 1,
      shortLesson: lesson,
    });
  };

  const renderActionButton = ({ completed, locked }) => {
    if (completed) {
      return (
        <View style={[styles.actionBtn, styles.completedBtn]}>
          <Text style={styles.completedBtnText}>{t("completed")}</Text>
        </View>
      );
    }

    if (locked) {
      return (
        <View style={[styles.actionBtn, styles.lockedBtn]}>
          <Text style={styles.lockedBtnText}>🔒 {t("shortzLockedButton")}</Text>
        </View>
      );
    }

    return (
      <View style={[styles.actionBtn, styles.viewBtn]}>
        <Text style={styles.viewBtnText}>{t("view")}</Text>
      </View>
    );
  };

  const renderLockState = () => {
    let title = t("shortzEnrollmentRequiredTitle");
    let sub = t("shortzEnrollmentRequiredSub");

    if (isPending) {
      title = t("shortzRequestPendingTitle");
      sub = t("shortzRequestPendingSub");
    } else if (isRejected) {
      title = t("shortzRequestRejectedTitle");
      sub = t("shortzRequestRejectedSub");
    } else if (isNotEnrolled) {
      title = t("shortzLockedTitle");
      sub = t("shortzLockedSub");
    }

    return (
      <SafeAreaView style={styles.statePage}>
        <StatusBar barStyle="light-content" backgroundColor="#5e1cce" />
        <Text style={styles.lockIcon}>🔒</Text>
        <Text style={styles.stateTitle}>{title}</Text>
        <Text style={styles.stateSub}>{sub}</Text>

        <TouchableOpacity
          style={styles.primaryBtn}
          activeOpacity={0.86}
          onPress={() => setEnrollModalVisible(true)}
        >
          <Text style={styles.primaryBtnText}>
            {isPending ? t("viewRequest") : t("enrollNowPlain")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          activeOpacity={0.86}
          onPress={refreshAll}
        >
          <Text style={styles.secondaryBtnText}>{t("refreshStatus")}</Text>
        </TouchableOpacity>

        <EnrollmentModal
          visible={enrollModalVisible}
          onClose={() => setEnrollModalVisible(false)}
        />
      </SafeAreaView>
    );
  };

  if (enrollmentLoading) {
    return (
      <SafeAreaView style={styles.statePage}>
        <StatusBar barStyle="light-content" backgroundColor="#5e1cce" />
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.stateTitle}>{t("checkingEnrollment")}</Text>
      </SafeAreaView>
    );
  }

  if (!isApproved) {
    return renderLockState();
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#5e1cce" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("shortzLessons")}</Text>
        <View style={styles.coinPill}>
          <Text style={styles.coinText}>🪙 {totalShortCoins}</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text style={styles.loadingText}>{t("shortzLoadingLessons")}</Text>
        </View>
      ) : isError ? (
        <View style={styles.loadingWrap}>
          <Text style={styles.emptyTitle}>{t("shortzFailedLoadLessons")}</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={refreshAll}>
            <Text style={styles.primaryBtnText}>{t("tryAgain")}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refreshAll} />
          }
          showsVerticalScrollIndicator={false}
        >
          {sortedLessons.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>{t("shortzNoLessonsFound")}</Text>
              <Text style={styles.emptySub}>
                {t("shortzPublishedLessonsAppear")}
              </Text>
            </View>
          ) : (
            sortedLessons.map((lesson, index) => {
              const locked = lesson?.isLocked || lesson?.isUnlocked === false;
              const completed = Boolean(lesson?.isCompleted);
              const total = Number(lesson?.totalSubLessonsCount || 0);
              const done = Number(lesson?.completedSubLessonsCount || 0);

              return (
                <TouchableOpacity
                  key={getId(lesson) || index}
                  style={[styles.lessonCard, locked && styles.lessonCardLocked]}
                  activeOpacity={0.88}
                  onPress={() => openLesson(lesson, index)}
                >
                  <View style={styles.lessonNoWrap}>
                    <Text style={styles.lessonNo}>{index + 1}</Text>
                  </View>

                  <View style={styles.lessonInfo}>
                    <Text style={styles.lessonTitle} numberOfLines={2}>
                      {lesson?.title || `${t("shortLesson")} ${index + 1}`}
                    </Text>

                    <Text style={styles.lessonSub}>
                      {completed
                        ? t("completed")
                        : locked
                        ? t("shortzLockedCompletePreviousLesson")
                        : `${done}/${total} ${t("shortzSubLessonsCompleted")}`}
                    </Text>
                  </View>

                  {renderActionButton({ completed, locked })}
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}

      <EnrollmentModal
        visible={enrollModalVisible}
        onClose={() => setEnrollModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F4F0FF" },

  header: {
    backgroundColor: "#5e1cce",
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
  },

  coinPill: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },

  coinText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },

  content: {
    padding: 16,
    paddingBottom: 32,
  },

  lessonCard: {
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

  lessonCardLocked: {
    opacity: 0.58,
  },

  lessonNoWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EDE9FE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  lessonNo: {
    color: "#5e1cce",
    fontSize: 18,
    fontWeight: "900",
  },

  lessonInfo: {
    flex: 1,
    paddingRight: 8,
  },

  lessonTitle: {
    color: "#1A1A3E",
    fontSize: 16,
    fontWeight: "900",
  },

  lessonSub: {
    marginTop: 5,
    color: "#7C3AED",
    fontSize: 12,
    fontWeight: "700",
  },

  actionBtn: {
    minWidth: 78,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  viewBtn: {
    backgroundColor: "#7C3AED",
  },

  viewBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  completedBtn: {
    backgroundColor: "#16A34A",
  },

  completedBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  lockedBtn: {
    backgroundColor: "#E5E7EB",
  },

  lockedBtnText: {
    color: "#374151",
    fontSize: 12,
    fontWeight: "900",
  },

  statePage: {
    flex: 1,
    backgroundColor: "#5e1cce",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },

  lockIcon: {
    fontSize: 60,
    marginBottom: 14,
  },

  stateTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
  },

  stateSub: {
    marginTop: 10,
    color: "#DDD6FE",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    fontWeight: "700",
  },

  primaryBtn: {
    marginTop: 22,
    backgroundColor: "#7C3AED",
    borderRadius: 999,
    paddingHorizontal: 34,
    paddingVertical: 14,
  },

  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },

  secondaryBtn: {
    marginTop: 10,
    padding: 10,
  },

  secondaryBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  loadingText: {
    marginTop: 12,
    color: "#5e1cce",
    fontWeight: "800",
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 24,
    alignItems: "center",
  },

  emptyTitle: {
    color: "#1A1A3E",
    fontSize: 17,
    fontWeight: "900",
    textAlign: "center",
  },

  emptySub: {
    marginTop: 6,
    color: "#7C3AED",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
});
