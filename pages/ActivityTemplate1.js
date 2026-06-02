import { useState } from "react";

const ActivityTemplate1 = ({
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
}) => {
  // Allow title/activityLabel to come from route.params if navigated from ShortVideoScreen
  const resolvedTitle = route?.params?.title ?? title;
  const resolvedLabel = route?.params?.activityLabel ?? activityLabel;

  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);

  const handleSelect = (value) => {
    setSelected(value);
    setAnswered(true);
  };

  // ✅ Next Video → go back to ShortVideoScreen
  const handleNextVideo = () => {
    if (navigation) navigation.navigate('ShortVideo');
  };

  // ✅ Next Activity → navigate to ActivityTemplate2
  const handleNextActivity = () => {
    if (navigation) {
      navigation.navigate('activitytemplate2', {
        title: resolvedTitle,
        activityLabel: resolvedLabel,
      });
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <p style={styles.title}>{resolvedTitle}</p>
          <div style={styles.activityRow}>
            <span style={styles.star}>✦</span>
            <p style={styles.activityLabel}>{resolvedLabel}</p>
            <span style={styles.star}>✦</span>
          </div>
        </div>

        {/* Question Area */}
        <div style={styles.questionArea}>
          <div style={styles.starIcon}>☆</div>
          <div style={styles.dotYellow} />
          <div style={styles.dotPink} />
          <p style={styles.question}>{question}</p>
        </div>

        {/* Options */}
        <div style={styles.optionsList}>
          {options.map((opt) => {
            const isSelected = selected === opt.value;
            const isCorrect = opt.value === correctAnswer;
            return (
              <button
                key={opt.id}
                style={{
                  ...styles.optionBtn,
                  ...(isSelected ? styles.optionSelected : styles.optionDefault),
                }}
                onClick={() => handleSelect(opt.value)}
              >
                <span
                  style={{
                    ...styles.optionNumber,
                    ...(isSelected
                      ? styles.optionNumberSelected
                      : styles.optionNumberDefault),
                  }}
                >
                  {opt.id}
                </span>
                <span style={styles.optionText}>{opt.value}</span>
                {isSelected && isCorrect && (
                  <span style={styles.checkmark}>✓</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Buttons */}
        <div style={styles.bottomRow}>
          <button style={styles.btnVideo} onClick={handleNextVideo}>
            <span style={styles.btnIcon}>🎬</span>
            <span style={styles.btnLabel}>Next Video</span>
          </button>
          <button style={styles.btnActivity} onClick={handleNextActivity}>
            <span style={styles.btnIcon}>📖</span>
            <span style={styles.btnLabel}>Next activity</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f0f0f8",
    fontFamily: "'Nunito', 'Poppins', sans-serif",
    padding: "16px",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "24px",
    width: "100%",
    maxWidth: "380px",
    overflow: "hidden",
    boxShadow: "0 8px 32px rgba(100, 80, 200, 0.12)",
    display: "flex",
    flexDirection: "column",
  },

  /* Header */
  header: {
    backgroundColor: "#fff",
    paddingTop: "20px",
    paddingBottom: "4px",
    textAlign: "center",
  },
  title: {
    margin: "0 0 4px 0",
    fontSize: "18px",
    fontWeight: "800",
    color: "#1a1a3e",
    letterSpacing: "0.2px",
  },
  activityRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    marginBottom: "6px",
  },
  activityLabel: {
    margin: 0,
    fontSize: "14px",
    fontWeight: "700",
    color: "#6c5ce7",
  },
  star: {
    color: "#a29bfe",
    fontSize: "11px",
  },

  /* Question Area */
  questionArea: {
    backgroundColor: "#ede9fc",
    margin: "0 16px 0 16px",
    borderRadius: "16px",
    padding: "32px 24px 28px",
    textAlign: "center",
    position: "relative",
    marginTop: "8px",
    marginBottom: "16px",
  },
  starIcon: {
    position: "absolute",
    top: "14px",
    left: "50%",
    transform: "translateX(-50%)",
    fontSize: "20px",
    color: "#b2a4f5",
  },
  dotYellow: {
    position: "absolute",
    bottom: "18px",
    left: "20px",
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    backgroundColor: "#fdcb6e",
  },
  dotPink: {
    position: "absolute",
    bottom: "18px",
    right: "20px",
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    backgroundColor: "#fd79a8",
  },
  question: {
    margin: "18px 0 0 0",
    fontSize: "52px",
    fontWeight: "900",
    color: "#1a1a3e",
    letterSpacing: "-1px",
    lineHeight: 1.1,
  },

  /* Options */
  optionsList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    padding: "0 16px 16px 16px",
  },
  optionBtn: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    border: "none",
    borderRadius: "14px",
    padding: "14px 16px",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.18s ease",
    fontSize: "16px",
    fontWeight: "700",
  },
  optionDefault: {
    backgroundColor: "#f5f4ff",
    color: "#1a1a3e",
  },
  optionSelected: {
    backgroundColor: "#6c5ce7",
    color: "#fff",
  },
  optionNumber: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: "800",
    flexShrink: 0,
  },
  optionNumberDefault: {
    backgroundColor: "#e0dcff",
    color: "#6c5ce7",
  },
  optionNumberSelected: {
    backgroundColor: "rgba(255,255,255,0.25)",
    color: "#fff",
  },
  optionText: {
    flex: 1,
  },
  checkmark: {
    fontSize: "18px",
    color: "#fff",
    fontWeight: "900",
  },

  /* Bottom Buttons */
  bottomRow: {
    display: "flex",
    gap: "12px",
    padding: "16px",
    backgroundColor: "#fff",
  },
  btnVideo: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    backgroundColor: "#6c5ce7",
    color: "#fff",
    border: "none",
    borderRadius: "16px",
    padding: "14px 12px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "800",
  },
  btnActivity: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    backgroundColor: "#6c5ce7",
    color: "#fff",
    border: "none",
    borderRadius: "16px",
    padding: "14px 12px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "800",
  },
  btnIcon: {
    fontSize: "20px",
  },
  btnLabel: {
    fontWeight: "800",
    letterSpacing: "0.2px",
  },
};

export default ActivityTemplate1;