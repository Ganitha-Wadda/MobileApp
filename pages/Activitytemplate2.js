import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";

export default function ActivityTemplate2({
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
  const [isCorrect, setIsCorrect] = useState(null);

  useEffect(() => {
    setSelectedId(null);
    setSubmitted(false);
    setIsCorrect(null);
  }, [question]);

  const selectedOption = useMemo(
    () => options.find((opt, index) => String(opt?.id ?? index) === String(selectedId)),
    [options, selectedId]
  );

  const isOptionCorrect = (opt) =>
    Boolean(opt?.correct) || String(opt?.value) === String(correctAnswer);

  const handleAnswer = (opt, index) => {
    if (submitted) return;
    setSelectedId(opt?.id ?? index);
  };

  const handleSubmitOrNext = () => {
    if (!submitted) {
      if (!selectedOption) return;
      setIsCorrect(isOptionCorrect(selectedOption));
      setSubmitted(true);
      return;
    }

    onNext?.();
  };

  const buttonDisabled = !submitted && !selectedOption;
  const buttonLabel = submitted ? nextLabel : "Submit";

  return (
    <SafeAreaView style={styles.wrapper}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>

          <View style={styles.activityRow}>
            <Text style={styles.starGold}>★</Text>
            <Text style={styles.activityDash}>· · ·</Text>
            <Text style={styles.activityLabel}>{activityLabel}</Text>
            <Text style={styles.activityDash}>· · ·</Text>
            <Text style={styles.starGold}>★</Text>
          </View>

          <Text style={styles.question}>{question}</Text>
        </View>

        <View style={styles.instructionBox}>
          <Text style={styles.instructionText}>Tap the answer to the box</Text>
        </View>

        <View
          style={[
            styles.dropZone,
            submitted && isCorrect === true && styles.dropZoneCorrect,
            submitted && isCorrect === false && styles.dropZoneWrong,
          ]}
        >
          {selectedOption ? (
            <View style={{ alignItems: "center" }}>
              <Text
                style={[
                  styles.droppedAnswer,
                  {
                    color: selectedOption.textColor || "#1a1a3e",
                    backgroundColor: selectedOption.color || "#ede9fc",
                  },
                ]}
              >
                {selectedOption.value}
              </Text>

              {submitted && isCorrect === true && (
                <Text style={styles.feedbackCorrect}>✓ Correct!</Text>
              )}
              {submitted && isCorrect === false && (
                <Text style={styles.feedbackWrong}>✗ Wrong answer</Text>
              )}
            </View>
          ) : (
            <Text style={styles.questionMark}>?</Text>
          )}
        </View>

        <View style={styles.optionsRow}>
          {options.map((opt, index) => {
            const optionId = opt?.id ?? index;
            const isSelected = String(selectedId) === String(optionId);

            return (
              <TouchableOpacity
                key={optionId}
                activeOpacity={0.85}
                disabled={submitted}
                onPress={() => handleAnswer(opt, index)}
                style={[
                  styles.optionTile,
                  {
                    backgroundColor: isSelected ? "#e8e8e8" : opt.color || "#ede9fc",
                    opacity: isSelected ? 0.55 : 1,
                    shadowOpacity: isSelected ? 0 : 0.12,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: isSelected ? "#bbb" : opt.textColor || "#1a1a3e" },
                  ]}
                >
                  {opt.value}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.bottomRow}>
          <TouchableOpacity
            style={[styles.btnActivity, buttonDisabled && styles.btnDisabled]}
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
  wrapper: {
    flex: 1,
    backgroundColor: "#EDE9FE",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    width: "100%",
    maxWidth: 380,
    overflow: "hidden",
    shadowColor: "#6450C8",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },

  header: {
    backgroundColor: "#fff",
    paddingTop: 20,
    paddingBottom: 6,
    alignItems: "center",
    paddingLeft: 16,
    paddingRight: 16,
  },

  title: {
    marginBottom: 4,
    fontSize: 18,
    fontWeight: "800",
    color: "#1a1a3e",
    textAlign: "center",
  },

  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: 6,
  },

  activityLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6c5ce7",
  },

  activityDash: {
    color: "#c4b8f8",
    fontSize: 10,
    letterSpacing: 2,
  },

  starGold: {
    color: "#f6c90e",
    fontSize: 16,
  },

  question: {
    marginTop: 4,
    marginBottom: 8,
    fontSize: 40,
    fontWeight: "900",
    color: "#1a1a3e",
    letterSpacing: -0.5,
    textAlign: "center",
  },

  instructionBox: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "#f5f3ff",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
  },

  instructionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
  },

  dropZone: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 18,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#c9c0f5",
    minHeight: 130,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f3ff",
  },

  dropZoneCorrect: {
    borderColor: "#3a8c3f",
  },

  dropZoneWrong: {
    borderColor: "#e74c3c",
  },

  questionMark: {
    fontSize: 64,
    fontWeight: "900",
    color: "#c9c0f5",
    lineHeight: 70,
  },

  droppedAnswer: {
    fontSize: 52,
    fontWeight: "900",
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 30,
    overflow: "hidden",
    lineHeight: 62,
  },

  feedbackCorrect: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "700",
    color: "#3a8c3f",
  },

  feedbackWrong: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "700",
    color: "#e74c3c",
  },

  optionsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  optionTile: {
    width: 72,
    height: 72,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
  },

  optionText: {
    fontSize: 28,
    fontWeight: "900",
  },

  bottomRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  btnActivity: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#6c5ce7",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },

  btnDisabled: {
    opacity: 0.45,
  },

  btnIcon: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
  },

  btnLabel: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
});
