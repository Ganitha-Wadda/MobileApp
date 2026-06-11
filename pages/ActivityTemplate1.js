import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";

export default function ActivityTemplate1({
  navigation,
  route,
  title = "Chakkre (part - 1)",
  activityLabel = "Activity - 1",
  question = "2 × 3",
  options = [
    { id: 1, value: "6" },
    { id: 2, value: "8" },
    { id: 3, value: "9" },
    { id: 4, value: "10" },
  ],
  correctAnswer = "6",
}) {
  const resolvedTitle = route?.params?.title ?? title;
  const resolvedLabel = route?.params?.activityLabel ?? activityLabel;

  const [selected, setSelected] = useState(null);

  const handleNextVideo = () => {
    navigation?.navigate("ShortVideo");
  };

  const handleNextActivity = () => {
    navigation?.navigate("activitytemplate2", {
      title: resolvedTitle,
      activityLabel: resolvedLabel,
    });
  };

  return (
    <View style={styles.page}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>{resolvedTitle}</Text>

          <View style={styles.activityRow}>
            <Text style={styles.star}>✦</Text>
            <Text style={styles.activityLabel}>{resolvedLabel}</Text>
            <Text style={styles.star}>✦</Text>
          </View>
        </View>

        <View style={styles.questionArea}>
          <Text style={styles.starIcon}>☆</Text>
          <View style={styles.dotYellow} />
          <View style={styles.dotPink} />
          <Text style={styles.question}>{question}</Text>
        </View>

        <View style={styles.optionsList}>
          {options.map((opt) => {
            const isSelected = selected === opt.value;
            const isCorrect = opt.value === correctAnswer;

            return (
              <TouchableOpacity
                key={opt.id}
                activeOpacity={0.85}
                style={[
                  styles.optionBtn,
                  isSelected ? styles.optionSelected : styles.optionDefault,
                ]}
                onPress={() => setSelected(opt.value)}
              >
                <Text
                  style={[
                    styles.optionNumber,
                    isSelected
                      ? styles.optionNumberSelected
                      : styles.optionNumberDefault,
                  ]}
                >
                  {opt.id}
                </Text>

                <Text
                  style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected,
                  ]}
                >
                  {opt.value}
                </Text>

                {isSelected && isCorrect && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.bottomRow}>
          <TouchableOpacity style={styles.btn} onPress={handleNextVideo}>
            <Text style={styles.btnIcon}>🎬</Text>
            <Text style={styles.btnLabel}>Next Video</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btn} onPress={handleNextActivity}>
            <Text style={styles.btnIcon}>📖</Text>
            <Text style={styles.btnLabel}>Next activity</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#EDE9FE",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#6450C8",
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },

  header: {
    backgroundColor: "#FFFFFF",
    paddingTop: 20,
    paddingBottom: 4,
    alignItems: "center",
  },

  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1A1A3E",
  },

  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
    marginBottom: 6,
  },

  activityLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6C5CE7",
  },

  star: {
    color: "#A29BFE",
    fontSize: 11,
  },

  questionArea: {
    backgroundColor: "#EDE9FC",
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 16,
    paddingTop: 32,
    paddingBottom: 28,
    paddingHorizontal: 24,
    alignItems: "center",
    position: "relative",
  },

  starIcon: {
    position: "absolute",
    top: 12,
    fontSize: 20,
    color: "#B2A4F5",
  },

  dotYellow: {
    position: "absolute",
    bottom: 18,
    left: 20,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FDCB6E",
  },

  dotPink: {
    position: "absolute",
    bottom: 18,
    right: 20,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FD79A8",
  },

  question: {
    marginTop: 18,
    fontSize: 52,
    fontWeight: "900",
    color: "#1A1A3E",
    lineHeight: 58,
  },

  optionsList: {
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },

  optionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },

  optionDefault: {
    backgroundColor: "#F5F4FF",
  },

  optionSelected: {
    backgroundColor: "#6C5CE7",
  },

  optionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    textAlign: "center",
    lineHeight: 28,
    fontSize: 13,
    fontWeight: "800",
    overflow: "hidden",
  },

  optionNumberDefault: {
    backgroundColor: "#E0DCFF",
    color: "#6C5CE7",
  },

  optionNumberSelected: {
    backgroundColor: "rgba(255,255,255,0.25)",
    color: "#FFFFFF",
  },

  optionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A3E",
  },

  optionTextSelected: {
    color: "#FFFFFF",
  },

  checkmark: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "900",
  },

  bottomRow: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    backgroundColor: "#FFFFFF",
  },

  btn: {
    flex: 1,
    backgroundColor: "#6C5CE7",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  btnIcon: {
    fontSize: 18,
  },

  btnLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
});