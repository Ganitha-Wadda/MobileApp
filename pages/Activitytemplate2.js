import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";

import useT from "../app/i18n/useT";

export default function ActivityTemplate2({
  title = "Chakkre (part - 1)",
  activityLabel = "Activity - 1",
  question = "",
  options = [],
  correctAnswer = "",
  onAnswerSubmit,
  onNext,
  nextLabel = "Next activity",
  coinText = "",
  submittingAnswer = false,
}) {
  const { t } = useT();
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

  const handleSubmitOrNext = async () => {
    if (!submitted) {
      if (!selectedOption || submittingAnswer) return;
      const correct = isOptionCorrect(selectedOption);
      setIsCorrect(correct);
      setSubmitted(true);
      await onAnswerSubmit?.({ selectedOption, isCorrect: correct });
      return;
    }

    onNext?.();
  };

  const buttonDisabled = (!submitted && !selectedOption) || submittingAnswer;
  const buttonLabel = submitted ? nextLabel : submittingAnswer ? t("saving") : t("submit");

  return (
    <SafeAreaView style={styles.wrapper}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.activityRow}>
            <Text style={styles.starGold}>✦</Text>
            <Text style={styles.activityLabel}>{activityLabel}</Text>
            <Text style={styles.starGold}>✦</Text>
          </View>
        </View>

        <View style={styles.questionBox}>
          <Text style={styles.instruction}>{t("dragSelectCorrectAnswer")}</Text>
          <Text style={styles.question}>{question}</Text>
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

              {submitted && isCorrect === true && <Text style={styles.feedbackCorrect}>{t("correctFeedback")}</Text>}
              {submitted && isCorrect === false && <Text style={styles.feedbackWrong}>{t("wrongAnswerFeedback")}</Text>}
              {submitted && Boolean(coinText) && <Text style={styles.coinText}>{coinText}</Text>}
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
  wrapper: { flex: 1, backgroundColor: "#EDE9FE", alignItems: "center", justifyContent: "center", padding: 16 },
  card: { backgroundColor: "#fff", borderRadius: 24, width: "100%", maxWidth: 380, overflow: "hidden", shadowColor: "#6450C8", shadowOpacity: 0.12, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  header: { paddingTop: 20, paddingBottom: 8, alignItems: "center" },
  title: { fontSize: 18, fontWeight: "800", color: "#1A1A3E", textAlign: "center" },
  activityRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 4 },
  activityLabel: { fontSize: 14, fontWeight: "700", color: "#6c5ce7" },
  starGold: { color: "#f6c90e", fontSize: 16 },
  questionBox: { backgroundColor: "#f7f7fb", marginHorizontal: 12, marginTop: 12, borderRadius: 20, padding: 16, alignItems: "center" },
  instruction: { marginBottom: 4, fontSize: 15, fontWeight: "600", color: "#333", lineHeight: 21, textAlign: "center" },
  question: { marginBottom: 4, fontSize: 28, fontWeight: "900", color: "#1a1a3e", textAlign: "center" },
  dropZone: { marginHorizontal: 18, marginTop: 14, minHeight: 88, borderRadius: 18, borderWidth: 2, borderStyle: "dashed", borderColor: "#c9c0f5", backgroundColor: "#ede9fc", alignItems: "center", justifyContent: "center" },
  dropZoneCorrect: { borderColor: "#3a8c3f", backgroundColor: "#dcfce7" },
  dropZoneWrong: { borderColor: "#e74c3c", backgroundColor: "#fee2e2" },
  questionMark: { fontSize: 38, fontWeight: "900", color: "#9c91d9" },
  droppedAnswer: { minWidth: 80, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 14, fontSize: 24, fontWeight: "900", textAlign: "center", overflow: "hidden" },
  feedbackCorrect: { marginTop: 6, fontSize: 14, fontWeight: "900", color: "#3a8c3f" },
  feedbackWrong: { marginTop: 6, fontSize: 14, fontWeight: "900", color: "#e74c3c" },
  coinText: { marginTop: 4, color: "#B45309", fontSize: 13, fontWeight: "900", textAlign: "center" },
  optionsRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 10, paddingHorizontal: 16, paddingTop: 16 },
  optionTile: { minWidth: 72, minHeight: 52, borderRadius: 16, alignItems: "center", justifyContent: "center", paddingHorizontal: 12, shadowColor: "#000", shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
  optionText: { fontSize: 20, fontWeight: "900" },
  bottomRow: { flexDirection: "row", gap: 12, padding: 16 },
  btnActivity: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#7c6ff0", borderRadius: 16, paddingVertical: 14, paddingHorizontal: 12, flexDirection: "row" },
  btnDisabled: { opacity: 0.45 },
  btnIcon: { color: "#fff", fontSize: 16, marginRight: 8 },
  btnLabel: { color: "#fff", fontSize: 15, fontWeight: "800", letterSpacing: 0.2 },
});
