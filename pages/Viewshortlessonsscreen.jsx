import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';

// Sub lesson data
const subLessons = [
  { id: '1.1', number: 2, unlocked: true },
  { id: '1.2', number: 3, unlocked: false },
  { id: '1.3', number: 4, unlocked: false },
  { id: '1.4', number: 5, unlocked: false },
  { id: '1.5', number: 6, unlocked: false },
  { id: '1.6', number: 7, unlocked: false },
  { id: '1.7', number: 8, unlocked: false },
  { id: '1.8', number: 9, unlocked: false },
];

// Lock Icon SVG-like using View/Text (pure RN)
const LockIcon = () => (
  <View style={styles.lockIconWrapper}>
    {/* Lock body */}
    <View style={styles.lockBody}>
      <Text style={styles.lockSymbol}>🔒</Text>
    </View>
  </View>
);

// Star/sparkle decorations
const Sparkle = ({ style }) => (
  <Text style={[styles.sparkle, style]}>✦</Text>
);

export default function ViewShortLessonsScreen({ navigation }) {
  const handleViewPress = (lesson) => {
    navigation.navigate('ShortVideo', {
      subLessonId: lesson.id,
      lessonNumber: lesson.number,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5ff" />

      {/* Header */}
      <View style={styles.header}>
        <Sparkle style={styles.sparklLeft} />
        <View style={styles.headerPill}>
          {/* Clock icon */}
          <View style={styles.clockCircle}>
            <Text style={styles.clockEmoji}>🕐</Text>
          </View>
          <Text style={styles.headerText}>10 Min lesson</Text>
        </View>
        <Sparkle style={styles.sparklRight} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Sub lessons label */}
        <Text style={styles.sectionLabel}>Sub lessons</Text>

        {/* Lesson cards */}
        {subLessons.map((lesson, index) => (
          <View key={lesson.id} style={styles.lessonCard}>
            {/* Left: lesson id badge */}
            <View style={styles.lessonIdBadge}>
              <Text style={styles.lessonIdText}>{lesson.id}</Text>
            </View>

            {/* Middle: lesson number */}
            <Text style={styles.lessonNumber}>{lesson.number}</Text>

            {/* Right: View button or Lock icon */}
            {lesson.unlocked ? (
              <TouchableOpacity
                style={styles.viewButton}
                onPress={() => handleViewPress(lesson)}
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
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const PURPLE = '#6C4EF6';
const LIGHT_PURPLE = '#EDE9FF';
const CARD_BG = '#FFFFFF';
const BG = '#F7F6FF';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },

  // ── Header ──────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: BG,
  },
  headerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 50,
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: '#a090e0',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockEmoji: {
    fontSize: 14,
  },
  headerText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a2e',
    letterSpacing: 0.2,
  },
  sparkle: {
    fontSize: 14,
    color: '#b8a8f8',
    marginHorizontal: 6,
  },
  sparklLeft: {},
  sparklRight: {},

  // ── Scroll ───────────────────────────────────────────────
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 4,
  },

  // ── Section label ────────────────────────────────────────
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 12,
    marginTop: 4,
    marginLeft: 2,
  },

  // ── Lesson card ──────────────────────────────────────────
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
    shadowColor: '#c0b8e8',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 2,
  },

  // Lesson ID badge (left)
  lessonIdBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: LIGHT_PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  lessonIdText: {
    fontSize: 13,
    fontWeight: '600',
    color: PURPLE,
  },

  // Lesson number (center)
  lessonNumber: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a2e',
  },

  // View button (unlocked)
  viewButton: {
    backgroundColor: PURPLE,
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 28,
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Lock circle (locked)
  lockCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockEmoji: {
    fontSize: 17,
  },
});