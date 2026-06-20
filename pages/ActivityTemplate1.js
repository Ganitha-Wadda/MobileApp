import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";

import useT from "../app/i18n/useT";

export default function ActivityTemplate1({
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

  const handleSubmitOrNext = async () => {
    if (!submitted) {
      if (!selectedOption || submittingAnswer) return;
      const correct = isOptionCorrect(selectedOption);
      setIsCorrectSelected(correct);
      setSubmitted(true);
      await onAnswerSubmit?.({ selectedOption, isCorrect: correct });
      return;
    }

    onNext?.();
  };

  const buttonDisabled = (!submitted && !selectedOption) || submittingAnswer;
  const buttonLabel = submitted ? nextLabel : submittingAnswer ? t("saving") : t("submit");

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
                    isSelected ? styles.optionNumberSelected : styles.optionNumberDefault,
                  ]}
                >
                  {index + 1}
                </Text>

                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                  {opt.value}
                </Text>

                {submitted && isSelected && isCorrect && <Text style={styles.checkmark}>✓</Text>}
                {submitted && isSelected && !isCorrect && <Text style={styles.wrongMark}>✕</Text>}
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
            {isCorrectSelected ? t("correctFeedback") : t("wrongAnswerFeedback")}
          </Text>
        )}

        {submitted && Boolean(coinText) && <Text style={styles.coinText}>{coinText}</Text>}

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
    marginTop: 4,
    gap: 6,
  },
  star: { color: "#f6c90e", fontSize: 15 },
  activityLabel: { color: "#6c5ce7", fontSize: 13, fontWeight: "800" },
  questionArea: {
    marginHorizontal: 14,
    marginTop: 14,
    padding: 18,
    borderRadius: 20,
    backgroundColor: "#F7F7FB",
    alignItems: "center",
    minHeight: 128,
    justifyContent: "center",
  },
  starIcon: { position: "absolute", top: 8, right: 12, color: "#f6c90e", fontSize: 24 },
  dotYellow: { position: "absolute", left: 18, top: 18, width: 10, height: 10, borderRadius: 5, backgroundColor: "#f6c90e" },
  dotPink: { position: "absolute", left: 34, top: 28, width: 8, height: 8, borderRadius: 4, backgroundColor: "#f59ac1" },
  question: { color: "#1A1A3E", fontSize: 28, fontWeight: "900", textAlign: "center" },
  optionsList: { paddingHorizontal: 16, paddingTop: 16, gap: 10 },
  optionBtn: {
    minHeight: 52,
    borderRadius: 16,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
  },
  optionDefault: { backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" },
  optionSelected: { backgroundColor: "#6C5CE7", borderColor: "#6C5CE7" },
  optionWrong: { backgroundColor: "#EF4444", borderColor: "#EF4444" },
  optionNumber: { width: 28, height: 28, borderRadius: 14, textAlign: "center", textAlignVertical: "center", fontWeight: "900", marginRight: 10, lineHeight: 28 },
  optionNumberDefault: { color: "#6C5CE7", backgroundColor: "#EDE9FE" },
  optionNumberSelected: { color: "#6C5CE7", backgroundColor: "#FFFFFF" },
  optionText: { flex: 1, color: "#1A1A3E", fontSize: 16, fontWeight: "800" },
  optionTextSelected: { color: "#FFFFFF" },
  checkmark: { color: "#FFFFFF", fontSize: 22, fontWeight: "900" },
  wrongMark: { color: "#FFFFFF", fontSize: 22, fontWeight: "900" },
  feedback: { marginTop: 10, textAlign: "center", fontSize: 15, fontWeight: "900" },
  feedbackCorrect: { color: "#16A34A" },
  feedbackWrong: { color: "#EF4444" },
  coinText: { marginTop: 4, color: "#B45309", textAlign: "center", fontSize: 13, fontWeight: "900" },
  bottomRow: { padding: 16 },
  btn: { backgroundColor: "#7C3AED", borderRadius: 16, paddingVertical: 14, alignItems: "center", justifyContent: "center", flexDirection: "row" },
  btnDisabled: { opacity: 0.45 },
  btnIcon: { color: "#FFFFFF", fontSize: 16, marginRight: 8 },
  btnLabel: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
});
