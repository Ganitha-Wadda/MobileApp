import { useState, useEffect, useRef } from "react";

const Balloon = ({ option, isFloating, isWrong, onTap }) => {
  const colors = {
    green: { body: "#4caf50", shine: "#81c784", shadow: "#2e7d32", string: "#555" },
    yellow: { body: "#ffc107", shine: "#ffd54f", shadow: "#f57f17", string: "#555" },
    red: { body: "#f44336", shine: "#ef9a9a", shadow: "#b71c1c", string: "#555" },
    blue: { body: "#29b6f6", shine: "#81d4fa", shadow: "#0277bd", string: "#555" },
  };

  const c = colors[option.color] || colors.green;

  return (
    <div
      onClick={() => onTap(option)}
      style={{
        ...styles.balloonWrap,
        animation: isFloating ? "floatUp 1.2s ease forwards" : "none",
        transform: isWrong ? "scale(0.9)" : "scale(1)",
        filter: isWrong ? "brightness(0.7)" : "none",
        cursor: "pointer",
      }}
    >
      <svg width="120" height="145" viewBox="0 0 120 145">
        <ellipse cx="60" cy="58" rx="52" ry="58" fill={c.body} />
        <ellipse cx="42" cy="30" rx="14" ry="18" fill={c.shine} opacity="0.55" />
        <polygon points="57,112 63,112 61,122 59,122" fill={c.shadow} />
        <path
          d="M60 122 Q55 132 60 140 Q65 148 60 155"
          stroke={c.string}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
        <text
          x="60"
          y="68"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="30"
          fontWeight="900"
          fontFamily="Nunito, Poppins, sans-serif"
          fill="#1a1a1a"
        >
          {option.value}
        </text>
      </svg>
    </div>
  );
};

const Confetti = ({ active }) => {
  const pieces = Array.from({ length: 18 });
  const confettiColors = [
    "#f6c90e",
    "#6c5ce7",
    "#4caf50",
    "#f44336",
    "#29b6f6",
    "#ff7043",
  ];

  if (!active) return null;

  return (
    <div style={styles.confettiWrap}>
      {pieces.map((_, i) => (
        <div
          key={i}
          style={{
            ...styles.confettiPiece,
            backgroundColor: confettiColors[i % confettiColors.length],
            left: `${10 + (i * 5) % 80}%`,
            animationDelay: `${(i * 0.07).toFixed(2)}s`,
            animationDuration: `${0.8 + (i % 4) * 0.15}s`,
          }}
        />
      ))}
    </div>
  );
};

const ActivityTemplate3 = ({
  navigation,
  route,
  title = "Chakkre (part - 1)",
  activityLabel = "Activity - 1",
  question = "2 × 3",
  options = [
    { id: 1, value: "6", color: "green", correct: true },
    { id: 2, value: "8", color: "yellow", correct: false },
    { id: 3, value: "9", color: "red", correct: false },
    { id: 4, value: "10", color: "blue", correct: false },
  ],
}) => {
  const resolvedTitle = route?.params?.title ?? title;
  const resolvedLabel = route?.params?.activityLabel ?? activityLabel;

  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [floatingId, setFloatingId] = useState(null);
  const [hiddenId, setHiddenId] = useState(null);
  const [wrongId, setWrongId] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const timerRef = useRef(null);
  const hideTimerRef = useRef(null);

  const handleTap = (opt) => {
    if (selectedAnswer) return;

    setSelectedAnswer(opt.value);

    if (opt.correct) {
      setFloatingId(opt.id);
      setShowConfetti(true);

      hideTimerRef.current = setTimeout(() => {
        setHiddenId(opt.id);
      }, 1150);

      timerRef.current = setTimeout(() => {
        setShowConfetti(false);
      }, 1400);
    } else {
      setWrongId(opt.id);

      setTimeout(() => {
        setWrongId(null);
        setSelectedAnswer(null);
      }, 700);
    }
  };

  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(hideTimerRef.current);
    };
  }, []);

  const topRow = options.slice(0, 2);
  const bottomRow = options.slice(2, 4);

  const handleNextVideo = () => {
    navigation?.navigate("ShortVideo");
  };

  const handleFinish = () => {
    navigation?.navigate("ShortVideo");
  };

  const renderBalloon = (opt) => {
    if (hiddenId === opt.id) return <div key={opt.id} style={styles.emptyBalloonSpace} />;

    return (
      <Balloon
        key={opt.id}
        option={opt}
        isFloating={floatingId === opt.id}
        isWrong={wrongId === opt.id}
        onTap={handleTap}
      />
    );
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <Confetti active={showConfetti} />

        <div style={styles.header}>
          <p style={styles.title}>{resolvedTitle}</p>

          <div style={styles.activityRow}>
            <span style={styles.starGold}>★</span>
            <span style={styles.dash}>· · ·</span>
            <p style={styles.activityLabel}>{resolvedLabel}</p>
            <span style={styles.dash}>· · ·</span>
            <span style={styles.starGold}>★</span>
          </div>
        </div>

        <div style={styles.balloonArea}>
          <p style={styles.instruction}>
            Tap the balloons with<br />the correct answer
          </p>

          <p style={styles.question}>{question}</p>

          <div style={styles.answerBox}>
            {selectedAnswer ? (
              <>
                <span style={styles.answerLabel}>Selected Answer</span>
                <span style={styles.answerValue}>{selectedAnswer}</span>
              </>
            ) : (
              <span style={styles.answerPlaceholder}>Tap correct balloon</span>
            )}
          </div>

          <div style={styles.balloonRow}>{topRow.map(renderBalloon)}</div>

          <div style={{ ...styles.balloonRow, marginTop: "8px", paddingLeft: "10px" }}>
            {bottomRow.map(renderBalloon)}
          </div>
        </div>

        <div style={styles.bottomRow}>
          <button style={styles.btnVideo} onClick={handleNextVideo}>
            <span style={styles.btnIcon}>🎬</span>
            <span style={styles.btnLabel}>Next Video</span>
          </button>

          <button style={styles.btnFinish} onClick={handleFinish}>
            <span style={styles.btnLabel}>Finish</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          50% {
            transform: translateY(-65px) scale(1.06);
            opacity: 1;
          }
          100% {
            transform: translateY(-150px) scale(0.9);
            opacity: 0;
          }
        }

        @keyframes confettiFall {
          0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(160px) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

const styles = {
  wrapper: {
    width: "100%",
    height: "100%",
    minHeight: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EDE9FE",
    fontFamily: "'Nunito', 'Poppins', sans-serif",
    padding: "16px",
    boxSizing: "border-box",
    overflow: "hidden",
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
    position: "relative",
  },

  header: {
    paddingTop: "20px",
    paddingBottom: "0px",
    textAlign: "center",
    paddingLeft: "16px",
    paddingRight: "16px",
  },

  title: {
    margin: "0 0 4px 0",
    fontSize: "18px",
    fontWeight: "800",
    color: "#1a1a3e",
  },

  activityRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    marginBottom: "0px",
  },

  activityLabel: {
    margin: 0,
    fontSize: "14px",
    fontWeight: "700",
    color: "#6c5ce7",
  },

  dash: {
    color: "#c4b8f8",
    fontSize: "10px",
    letterSpacing: "2px",
  },

  starGold: {
    color: "#f6c90e",
    fontSize: "16px",
  },

  balloonArea: {
    backgroundColor: "#f7f7fb",
    margin: "12px 12px 0 12px",
    borderRadius: "20px",
    padding: "16px 8px 8px 8px",
    textAlign: "center",
    overflow: "hidden",
  },

  instruction: {
    margin: "0 0 4px 0",
    fontSize: "15px",
    fontWeight: "600",
    color: "#333",
    lineHeight: 1.4,
  },

  question: {
    margin: "0 0 10px 0",
    fontSize: "28px",
    fontWeight: "900",
    color: "#1a1a3e",
  },

  answerBox: {
    width: "82%",
    minHeight: "48px",
    margin: "0 auto 10px auto",
    borderRadius: "16px",
    backgroundColor: "#ede9fc",
    border: "2px dashed #c9c0f5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },

  answerLabel: {
    fontSize: "12px",
    fontWeight: "800",
    color: "#6c5ce7",
  },

  answerValue: {
    fontSize: "26px",
    fontWeight: "900",
    color: "#1a1a3e",
  },

  answerPlaceholder: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#9c91d9",
  },

  balloonRow: {
    display: "flex",
    justifyContent: "center",
    gap: "16px",
  },

  balloonWrap: {
    position: "relative",
    display: "inline-flex",
    flexDirection: "column",
    alignItems: "center",
    userSelect: "none",
    WebkitTapHighlightColor: "transparent",
  },

  emptyBalloonSpace: {
    width: "120px",
    height: "145px",
  },

  confettiWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: 10,
    overflow: "hidden",
  },

  confettiPiece: {
    position: "absolute",
    top: "30%",
    width: "10px",
    height: "10px",
    borderRadius: "2px",
    animation: "confettiFall linear forwards",
  },

  bottomRow: {
    display: "flex",
    gap: "12px",
    padding: "16px",
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

  btnFinish: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7c6ff0",
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

export default ActivityTemplate3;