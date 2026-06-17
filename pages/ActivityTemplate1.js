import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";

export default function ActivityTemplate1({
  title = "Chakkre (part - 1)",
  activityLabel = "Activity - 1",
  question = "",
  options = [],
  correctAnswer = "",
  onNext,
  nextLabel = "Next activity",
}) {
  const [selectedId, setSelectedId] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrectSelected, setIsCorrectSelected] = useState(null);

  useEffect(() => {
    setSelectedId(null);
    setSubmitted(false);
    setIsCorrectSelected(null);
  }, [question]);

  const selectedOption = useMemo(
    () => options.find((opt, index) => String(opt?.id ?? index) === String(selectedId)),
    [options, selectedId]
  );

  const isOptionCorrect = (opt) =>
    Boolean(opt?.correct) || String(opt?.value) === String(correctAnswer);

  const handleSelect = (opt, index) => {
    if (submitted) return;
    setSelectedId(opt?.id ?? index);
  };

  const handleSubmitOrNext = () => {
    if (!submitted) {
      if (!selectedOption) return;
      setIsCorrectSelected(isOptionCorrect(selectedOption));
      setSubmitted(true);
      return;
    }

    onNext?.();
  };

  const buttonDisabled = !submitted && !selectedOption;
  const buttonLabel = submitted ? nextLabel : "Submit";

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>

          <View style={styles.activityRow}>
            <Text style={styles.star}>✦</Text>
            <Text style={styles.activityLabel}>{activityLabel}</Text>
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
          {options.map((opt, index) => {
            const optionId = opt?.id ?? index;
            const isSelected = String(selectedId) === String(optionId);
            const isCorrect = isOptionCorrect(opt);

            return (
              <TouchableOpacity
                key={optionId}
                activeOpacity={0.85}
                disabled={submitted}
                style={[
                  styles.optionBtn,
                  isSelected ? styles.optionSelected : styles.optionDefault,
                  submitted && isSelected && !isCorrect && styles.optionWrong,
                ]}
                onPress={() => handleSelect(opt, index)}
              >
                <Text
                  style={[
                    styles.optionNumber,
                    isSelected
                      ? styles.optionNumberSelected
                      : styles.optionNumberDefault,
                  ]}
                >
                  {index + 1}
                </Text>

                <Text
                  style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected,
                  ]}
                >
                  {opt.value}
                </Text>

                {submitted && isSelected && isCorrect && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
                {submitted && isSelected && !isCorrect && (
                  <Text style={styles.wrongMark}>✕</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {submitted && (
          <Text
            style={[
              styles.feedback,
              isCorrectSelected ? styles.feedbackCorrect : styles.feedbackWrong,
            ]}
          >
            {isCorrectSelected ? "✓ Correct!" : "✗ Wrong answer"}
          </Text>
        )}

        <View style={styles.bottomRow}>
          <TouchableOpacity
            style={[styles.btn, buttonDisabled && styles.btnDisabled]}
            onPress={handleSubmitOrNext}
            activeOpacity={buttonDisabled ? 1 : 0.85}
            disabled={buttonDisabled}
          >
            <Text style={styles.btnIcon}>{submitted ? "📖" : "✓"}</Text>
            <Text style={styles.btnLabel}>{buttonLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
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
    textAlign: "center",
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
    textAlign: "center",
  },

  optionsList: {
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 10,
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

  optionWrong: {
    backgroundColor: "#E74C3C",
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

  wrongMark: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "900",
  },

  feedback: {
    textAlign: "center",
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 2,
  },

  feedbackCorrect: {
    color: "#3A8C3F",
  },

  feedbackWrong: {
    color: "#E74C3C",
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

  btnDisabled: {
    opacity: 0.45,
  },

  btnIcon: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },

  btnLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
});
