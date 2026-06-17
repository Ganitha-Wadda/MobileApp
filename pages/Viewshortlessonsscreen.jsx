import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useGetShortSubLessonsByShortLessonIdQuery } from "../app/features/Shortzapi";

// Lock Icon SVG-like using View/Text (pure RN)
const LockIcon = () => (
  <View style={styles.lockIconWrapper}>
    <View style={styles.lockBody}>
      <Text style={styles.lockSymbol}>🔒</Text>
    </View>
  </View>
);

// Star/sparkle decorations
const Sparkle = ({ style }) => <Text style={[styles.sparkle, style]}>✦</Text>;

export default function ViewShortLessonsScreen({ navigation, route }) {
  const lessonId = route?.params?.shortLessonId || route?.params?.lessonId;
  const lessonTitle = route?.params?.lessonTitle || "";

  const {
    data: subLessons = [],
    isLoading,
    isFetching,
    isError,
  } = useGetShortSubLessonsByShortLessonIdQuery(lessonId, {
    skip: !lessonId,
  });

  const lessons = Array.isArray(subLessons) ? subLessons : [];

  const handleViewPress = (lesson, index) => {
    const subLessonId = lesson?._id || lesson?.id;

    navigation.navigate("ShortVideo", {
      subLessonId,
      shortSubLessonId: subLessonId,
      shortLessonId: lessonId,
      lessonTitle,
      subLessonTitle: lesson?.title || "",
      lessonNumber: index + 1,
      links: Array.isArray(lesson?.links) ? lesson.links : [],
      shortSubLesson: lesson,
    });
  };

  const renderContent = () => {
    if (!lessonId) {
      return (
        <View style={styles.lessonCard}>
          <Text style={styles.lessonNumber}>Short lesson ID not found</Text>
        </View>
      );
    }

    if (isLoading || (isFetching && lessons.length === 0)) {
      return (
        <View style={styles.lessonCard}>
          <Text style={styles.lessonNumber}>Loading...</Text>
        </View>
      );
    }

    if (isError) {
      return (
        <View style={styles.lessonCard}>
          <Text style={styles.lessonNumber}>Failed to load sub lessons</Text>
        </View>
      );
    }

    if (lessons.length === 0) {
      return (
        <View style={styles.lessonCard}>
          <Text style={styles.lessonNumber}>
            No sub lessons found for this lesson
          </Text>
        </View>
      );
    }

    return lessons.map((lesson, index) => {
      const subLessonId = lesson?._id || lesson?.id;
      const lessonNumber = index + 1;
      const badgeNumber = `1.${lessonNumber}`;
      const title = lesson?.title || `Sub Lesson ${lessonNumber}`;
      const unlocked = lesson?.status === "published";

      return (
        <View key={subLessonId || index} style={styles.lessonCard}>
          <View style={styles.lessonIdBadge}>
            <Text style={styles.lessonIdText}>{badgeNumber}</Text>
          </View>

          <Text style={styles.lessonNumber}>{title}</Text>

          {unlocked ? (
            <TouchableOpacity
              style={styles.viewButton}
              onPress={() => handleViewPress(lesson, index)}
              activeOpacity={0.85}
            >
              <Text style={styles.viewButtonText}>View</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.lockCircle}>
              <Text style={styles.lockEmoji}>🔒</Text>
            </View>
          )}
        </View>
      );
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5ff" />

      <View style={styles.header}>
        <Sparkle style={styles.sparklLeft} />

        <View style={styles.headerPill}>
          <View style={styles.clockCircle}>
            <Text style={styles.clockEmoji}>🕐</Text>
          </View>
          <Text style={styles.headerText}>10 Min lesson</Text>
        </View>

        <Sparkle style={styles.sparklRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>Sub lessons</Text>

        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const PURPLE = "#6C4EF6";
const LIGHT_PURPLE = "#EDE9FF";
const CARD_BG = "#FFFFFF";
const BG = "#F7F6FF";

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: BG,
  },

  headerPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD_BG,
    borderRadius: 50,
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: "#a090e0",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
    gap: 8,
  },

  clockCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: LIGHT_PURPLE,
    alignItems: "center",
    justifyContent: "center",
  },

  clockEmoji: {
    fontSize: 14,
  },

  headerText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1a1a2e",
    letterSpacing: 0.2,
  },

  sparkle: {
    fontSize: 14,
    color: "#b8a8f8",
    marginHorizontal: 6,
  },

  sparklLeft: {},

  sparklRight: {},

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 4,
  },

  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a2e",
    marginBottom: 12,
    marginTop: 4,
    marginLeft: 2,
  },

  lessonCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD_BG,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
    shadowColor: "#c0b8e8",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },

  lessonIdBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: LIGHT_PURPLE,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  lessonIdText: {
    fontSize: 13,
    fontWeight: "600",
    color: PURPLE,
  },

  lessonNumber: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: "#1a1a2e",
  },

  viewButton: {
    backgroundColor: PURPLE,
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 28,
  },

  viewButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  lockCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PURPLE,
    alignItems: "center",
    justifyContent: "center",
  },

  lockEmoji: {
    fontSize: 17,
  },

  lockIconWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },

  lockBody: {
    alignItems: "center",
    justifyContent: "center",
  },

  lockSymbol: {
    fontSize: 17,
  },
});