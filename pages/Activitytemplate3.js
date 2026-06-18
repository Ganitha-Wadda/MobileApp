import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
} from "react-native";

const BALLOON_COLORS = {
  green: { body: "#4caf50", shine: "#81c784", shadow: "#2e7d32" },
  yellow: { body: "#ffc107", shine: "#ffd54f", shadow: "#f57f17" },
  red: { body: "#f44336", shine: "#ef9a9a", shadow: "#b71c1c" },
  blue: { body: "#29b6f6", shine: "#81d4fa", shadow: "#0277bd" },
};

function Balloon({ option, isSelected, isFloating, isWrong, disabled, onTap }) {
  const move = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const colorKey = option.balloonColor || option.color || "green";
  const c = BALLOON_COLORS[colorKey] || BALLOON_COLORS.green;

  useEffect(() => {
    if (!isFloating) return;

    Animated.parallel([
      Animated.timing(move, {
        toValue: -150,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isFloating, move, opacity]);

  return (
    <TouchableOpacity activeOpacity={0.9} disabled={disabled} onPress={() => onTap(option)}>
      <Animated.View
        style={[
          styles.balloonWrap,
          {
            opacity,
            transform: [
              { translateY: move },
              { scale: isWrong ? 0.9 : isSelected ? 1.06 : 1 },
            ],
          },
          isWrong && styles.balloonWrong,
        ]}
      >
        <View style={[styles.balloonBody, { backgroundColor: c.body }]}> 
          <View style={[styles.balloonShine, { backgroundColor: c.shine }]} />
          <Text style={styles.balloonText}>{option.value}</Text>
        </View>
        <View style={[styles.balloonKnot, { borderTopColor: c.shadow }]} />
        <View style={styles.balloonString} />
      </Animated.View>
    </TouchableOpacity>
  );
}

function Confetti({ active }) {
  if (!active) return null;

  return (
    <View pointerEvents="none" style={styles.confettiWrap}>
      {Array.from({ length: 18 }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.confettiPiece,
            {
              left: `${10 + (index * 5) % 80}%`,
              top: `${20 + (index % 5) * 8}%`,
              backgroundColor: [
                "#f6c90e",
                "#6c5ce7",
                "#4caf50",
                "#f44336",
                "#29b6f6",
                "#ff7043",
              ][index % 6],
            },
          ]}
        />
      ))}
    </View>
  );
}

export default function ActivityTemplate3({
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
  const [selectedId, setSelectedId] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [floatingId, setFloatingId] = useState(null);
  const [hiddenId, setHiddenId] = useState(null);
  const [wrongId, setWrongId] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const timerRef = useRef(null);
  const hideTimerRef = useRef(null);

  useEffect(() => {
    setSelectedId(null);
    setSubmitted(false);
    setIsCorrect(null);
    setFloatingId(null);
    setHiddenId(null);
    setWrongId(null);
    setShowConfetti(false);

    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(hideTimerRef.current);
    };
  }, [question]);

  const selectedOption = useMemo(
    () => options.find((opt, index) => String(opt?.id ?? index) === String(selectedId)),
    [options, selectedId]
  );

  const isOptionCorrect = (opt) =>
    Boolean(opt?.correct) || String(opt?.value) === String(correctAnswer);

  const handleTap = (opt, index) => {
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

      if (correct) {
        setFloatingId(selectedOption.id);
        setShowConfetti(true);

        hideTimerRef.current = setTimeout(() => {
          setHiddenId(selectedOption.id);
        }, 1150);

        timerRef.current = setTimeout(() => {
          setShowConfetti(false);
        }, 1400);
      } else {
        setWrongId(selectedOption.id);
      }

      return;
    }

    onNext?.();
  };

  const topRow = options.slice(0, 2);
  const bottomRow = options.slice(2, 4);
  const buttonDisabled = (!submitted && !selectedOption) || submittingAnswer;
  const buttonLabel = submitted ? nextLabel : submittingAnswer ? "Saving..." : "Submit";

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.card}>
        <Confetti active={showConfetti} />

        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.activityRow}>
            <Text style={styles.starGold}>✦</Text>
            <Text style={styles.activityLabel}>{activityLabel}</Text>
            <Text style={styles.starGold}>✦</Text>
          </View>
        </View>

        <View style={styles.balloonArea}>
          <Text style={styles.instruction}>Tap the correct balloon</Text>
          <Text style={styles.question}>{question}</Text>

          <View style={styles.answerBox}>
            {selectedOption ? (
              <>
                <Text style={styles.answerLabel}>Selected</Text>
                <Text style={styles.answerValue}>{selectedOption.value}</Text>
              </>
            ) : (
              <Text style={styles.answerPlaceholder}>Choose your answer</Text>
            )}
          </View>

          {submitted && isCorrect === true && <Text style={styles.feedbackCorrect}>✓ Correct!</Text>}
          {submitted && isCorrect === false && <Text style={styles.feedbackWrong}>✗ Wrong answer</Text>}
          {submitted && Boolean(coinText) && <Text style={styles.coinText}>{coinText}</Text>}

          <View style={styles.balloonRow}>
            {topRow.map((option, index) => (
              hiddenId === option.id ? (
                <View key={option.id} style={styles.emptyBalloonSpace} />
              ) : (
                <Balloon
                  key={option.id}
                  option={option}
                  isSelected={String(selectedId) === String(option.id)}
                  isFloating={floatingId === option.id}
                  isWrong={wrongId === option.id}
                  disabled={submitted}
                  onTap={(opt) => handleTap(opt, index)}
                />
              )
            ))}
          </View>

          <View style={styles.balloonRow}>
            {bottomRow.map((option, index) => (
              hiddenId === option.id ? (
                <View key={option.id} style={styles.emptyBalloonSpace} />
              ) : (
                <Balloon
                  key={option.id}
                  option={option}
                  isSelected={String(selectedId) === String(option.id)}
                  isFloating={floatingId === option.id}
                  isWrong={wrongId === option.id}
                  disabled={submitted}
                  onTap={(opt) => handleTap(opt, index + 2)}
                />
              )
            ))}
          </View>
        </View>

        <View style={styles.bottomRow}>
          <TouchableOpacity
            style={[styles.btnFinish, buttonDisabled && styles.btnDisabled]}
            onPress={handleSubmitOrNext}
            activeOpacity={buttonDisabled ? 1 : 0.85}
            disabled={buttonDisabled}
          >
            <Text style={styles.btnLabel}>{buttonLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#EDE9FE", alignItems: "center", justifyContent: "center", padding: 16 },
  card: { width: "100%", maxWidth: 390, backgroundColor: "#fff", borderRadius: 24, overflow: "hidden", shadowColor: "#6450C8", shadowOpacity: 0.14, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  header: { paddingTop: 18, paddingBottom: 4, alignItems: "center" },
  title: { fontSize: 18, fontWeight: "800", color: "#1A1A3E", textAlign: "center" },
  activityRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 0, marginTop: 4 },
  activityLabel: { fontSize: 14, fontWeight: "700", color: "#6c5ce7" },
  starGold: { color: "#f6c90e", fontSize: 16 },
  balloonArea: { backgroundColor: "#f7f7fb", marginHorizontal: 12, marginTop: 12, borderRadius: 20, paddingTop: 16, paddingHorizontal: 8, paddingBottom: 8, alignItems: "center", overflow: "hidden" },
  instruction: { marginBottom: 4, fontSize: 15, fontWeight: "600", color: "#333", lineHeight: 21, textAlign: "center" },
  question: { marginBottom: 10, fontSize: 28, fontWeight: "900", color: "#1a1a3e", textAlign: "center" },
  answerBox: { width: "82%", minHeight: 48, marginBottom: 10, borderRadius: 16, backgroundColor: "#ede9fc", borderWidth: 2, borderStyle: "dashed", borderColor: "#c9c0f5", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  answerLabel: { fontSize: 12, fontWeight: "800", color: "#6c5ce7" },
  answerValue: { fontSize: 26, fontWeight: "900", color: "#1a1a3e" },
  answerPlaceholder: { fontSize: 13, fontWeight: "700", color: "#9c91d9" },
  feedbackCorrect: { marginTop: -2, marginBottom: 6, fontSize: 14, fontWeight: "900", color: "#3a8c3f" },
  feedbackWrong: { marginTop: -2, marginBottom: 6, fontSize: 14, fontWeight: "900", color: "#e74c3c" },
  coinText: { marginTop: -2, marginBottom: 6, color: "#B45309", fontSize: 13, fontWeight: "900", textAlign: "center" },
  balloonRow: { flexDirection: "row", justifyContent: "center", gap: 16 },
  balloonWrap: { width: 120, height: 145, alignItems: "center" },
  balloonWrong: { opacity: 0.65 },
  balloonBody: { width: 104, height: 116, borderRadius: 56, alignItems: "center", justifyContent: "center", position: "relative" },
  balloonShine: { position: "absolute", top: 16, left: 24, width: 26, height: 34, borderRadius: 16, opacity: 0.55 },
  balloonText: { fontSize: 30, fontWeight: "900", color: "#1a1a1a" },
  balloonKnot: { width: 0, height: 0, borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 12, borderLeftColor: "transparent", borderRightColor: "transparent" },
  balloonString: { width: 1.5, height: 28, backgroundColor: "#555", borderRadius: 2 },
  emptyBalloonSpace: { width: 120, height: 145 },
  confettiWrap: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 10, overflow: "hidden" },
  confettiPiece: { position: "absolute", width: 10, height: 10, borderRadius: 2 },
  bottomRow: { flexDirection: "row", gap: 12, padding: 16 },
  btnFinish: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#7c6ff0", borderRadius: 16, paddingVertical: 14, paddingHorizontal: 12 },
  btnDisabled: { opacity: 0.45 },
  btnLabel: { color: "#fff", fontSize: 15, fontWeight: "800", letterSpacing: 0.2 },
});
