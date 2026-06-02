import { useState, useEffect, useRef } from "react";

const Balloon = ({ option, isCorrect, isPopped, isWrong, onTap }) => {
  const colors = {
    green:  { body: "#4caf50", shine: "#81c784", shadow: "#2e7d32", string: "#555" },
    yellow: { body: "#ffc107", shine: "#ffd54f", shadow: "#f57f17", string: "#555" },
    red:    { body: "#f44336", shine: "#ef9a9a", shadow: "#b71c1c", string: "#555" },
    blue:   { body: "#29b6f6", shine: "#81d4fa", shadow: "#0277bd", string: "#555" },
  };
  const c = colors[option.color] || colors.green;

  return (
    <div
      onClick={() => !isPopped && onTap(option)}
      style={{
        ...styles.balloonWrap,
        opacity: isPopped ? 0 : 1,
        transform: isCorrect
          ? "scale(1.08)"
          : isWrong
          ? "scale(0.92)"
          : "scale(1)",
        transition: "transform 0.2s ease, opacity 0.35s ease",
        cursor: isPopped ? "default" : "pointer",
        filter: isWrong ? "brightness(0.7)" : "none",
      }}
    >
      {/* Correct glow lines */}
      {isCorrect && (
        <div style={styles.glowLines}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              style={{
                ...styles.glowLine,
                transform: `rotate(${i * 60}deg)`,
                backgroundColor: c.body,
              }}
            />
          ))}
        </div>
      )}

      {/* SVG Balloon */}
      <svg
        width="120"
        height="145"
        viewBox="0 0 120 145"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block" }}
      >
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

// Confetti burst component
const Confetti = ({ active }) => {
  const pieces = Array.from({ length: 18 });
  const confettiColors = ["#f6c90e", "#6c5ce7", "#4caf50", "#f44336", "#29b6f6", "#ff7043"];
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
    { id: 1, value: "6",  color: "green",  correct: true  },
    { id: 2, value: "8",  color: "yellow", correct: false },
    { id: 3, value: "9",  color: "red",    correct: false },
    { id: 4, value: "10", color: "blue",   correct: false },
  ],
}) => {
  const resolvedTitle = route?.params?.title ?? title;
  const resolvedLabel = route?.params?.activityLabel ?? activityLabel;

  const [tapped, setTapped] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [wrongId, setWrongId] = useState(null);
  const timerRef = useRef(null);

  const handleTap = (opt) => {
    if (tapped) return;
    if (opt.correct) {
      setTapped(opt.id);
      setShowConfetti(true);
      timerRef.current = setTimeout(() => setShowConfetti(false), 1200);
    } else {
      setWrongId(opt.id);
      setTimeout(() => setWrongId(null), 600);
    }
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const topRow = options.slice(0, 2);
  const bottomRow = options.slice(2, 4);

  // ✅ Next Video → go back to ShortVideoScreen
  const handleNextVideo = () => {
    if (navigation) navigation.navigate('ShortVideo');
  };

  // ✅ Finish → navigate back to ShortVideoScreen
  const handleFinish = () => {
    if (navigation) navigation.navigate('ShortVideo');
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        {/* Confetti */}
        <Confetti active={showConfetti} />

        {/* Header */}
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

        {/* Balloon Area */}
        <div style={styles.balloonArea}>
          <p style={styles.instruction}>
            Tap the balloons with<br />the correct answer
          </p>
          <p style={styles.question}>{question}</p>

          {/* Top row */}
          <div style={styles.balloonRow}>
            {topRow.map((opt) => (
              <Balloon
                key={opt.id}
                option={opt}
                isCorrect={tapped === opt.id}
                isPopped={tapped !== null && tapped !== opt.id && opt.correct}
                isWrong={wrongId === opt.id}
                onTap={handleTap}
              />
            ))}
          </div>

          {/* Bottom row */}
          <div style={{ ...styles.balloonRow, marginTop: "8px", paddingLeft: "10px" }}>
            {bottomRow.map((opt) => (
              <Balloon
                key={opt.id}
                option={opt}
                isCorrect={tapped === opt.id}
                isPopped={tapped !== null && tapped !== opt.id && opt.correct}
                isWrong={wrongId === opt.id}
                onTap={handleTap}
              />
            ))}
          </div>
        </div>

        {/* Bottom Buttons */}
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
        @keyframes confettiFall {
          0%   { transform: translateY(-10px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(160px) rotate(360deg); opacity: 0; }
        }
      `}</style>
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
    position: "relative",
  },

  /* Header */
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

  /* Balloon Area */
  balloonArea: {
    backgroundColor: "#f7f7fb",
    margin: "12px 12px 0 12px",
    borderRadius: "20px",
    padding: "16px 8px 8px 8px",
    textAlign: "center",
  },
  instruction: {
    margin: "0 0 4px 0",
    fontSize: "15px",
    fontWeight: "600",
    color: "#333",
    lineHeight: 1.4,
  },
  question: {
    margin: "0 0 12px 0",
    fontSize: "28px",
    fontWeight: "900",
    color: "#1a1a3e",
  },
  balloonRow: {
    display: "flex",
    justifyContent: "center",
    gap: "16px",
  },

  /* Balloon Wrap */
  balloonWrap: {
    position: "relative",
    display: "inline-flex",
    flexDirection: "column",
    alignItems: "center",
    userSelect: "none",
    WebkitTapHighlightColor: "transparent",
  },

  /* Glow lines for correct */
  glowLines: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -60%)",
    width: "140px",
    height: "140px",
    pointerEvents: "none",
    zIndex: 0,
  },
  glowLine: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "3px",
    height: "28px",
    marginLeft: "-1.5px",
    marginTop: "-62px",
    borderRadius: "4px",
    transformOrigin: "50% 62px",
    opacity: 0.8,
  },

  /* Confetti */
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

  /* Bottom Buttons */
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
  btnIcon: { fontSize: "20px" },
  btnLabel: { fontWeight: "800", letterSpacing: "0.2px" },
};

export default ActivityTemplate3;