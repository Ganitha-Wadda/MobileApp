import { useState, useRef } from "react";

const ActivityTemplate2 = ({
  navigation,
  route,
  title = "Chakkre (part - 1)",
  activityLabel = "Activity - 1",
  question = "2 × 3",
  options = [
    { id: 1, value: "10", color: "#a8e6a3", textColor: "#3a8c3f" },
    { id: 2, value: "6", color: "#fde68a", textColor: "#b45309" },
    { id: 3, value: "8", color: "#a5d8f3", textColor: "#1a6fa0" },
    { id: 4, value: "9", color: "#fbb6ce", textColor: "#9b2247" },
  ],
  correctAnswer = "6",
}) => {
  const resolvedTitle = route?.params?.title ?? title;
  const resolvedLabel = route?.params?.activityLabel ?? activityLabel;

  const [droppedValue, setDroppedValue] = useState(null);
  const [droppedColor, setDroppedColor] = useState(null);
  const [droppedTextColor, setDroppedTextColor] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [isOver, setIsOver] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);

  const touchItem = useRef(null);
  const ghostRef = useRef(null);
  const dropZoneRef = useRef(null);

  const handleDragStart = (e, opt) => {
    setDraggingId(opt.id);
    e.dataTransfer.setData("optionId", String(opt.id));
  };

  const handleDragEnd = () => setDraggingId(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = () => setIsOver(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsOver(false);

    const id = parseInt(e.dataTransfer.getData("optionId"));
    const opt = options.find((o) => o.id === id);

    if (opt) dropAnswer(opt);
  };

  const handleTouchStart = (e, opt) => {
    touchItem.current = opt;
    setDraggingId(opt.id);

    const touch = e.touches[0];
    const ghost = document.createElement("div");

    ghost.innerText = opt.value;

    Object.assign(ghost.style, {
      position: "fixed",
      top: touch.clientY - 35 + "px",
      left: touch.clientX - 35 + "px",
      width: "70px",
      height: "70px",
      borderRadius: "16px",
      backgroundColor: opt.color,
      color: opt.textColor,
      fontSize: "28px",
      fontWeight: "900",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      opacity: "0.9",
      pointerEvents: "none",
      fontFamily: "Nunito, Poppins, sans-serif",
    });

    document.body.appendChild(ghost);
    ghostRef.current = ghost;
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];

    if (ghostRef.current) {
      ghostRef.current.style.top = touch.clientY - 35 + "px";
      ghostRef.current.style.left = touch.clientX - 35 + "px";
    }

    if (dropZoneRef.current) {
      const rect = dropZoneRef.current.getBoundingClientRect();

      const over =
        touch.clientX >= rect.left &&
        touch.clientX <= rect.right &&
        touch.clientY >= rect.top &&
        touch.clientY <= rect.bottom;

      setIsOver(over);
    }
  };

  const handleTouchEnd = () => {
    if (ghostRef.current) {
      document.body.removeChild(ghostRef.current);
      ghostRef.current = null;
    }

    setDraggingId(null);

    if (isOver && touchItem.current) {
      dropAnswer(touchItem.current);
    }

    setIsOver(false);
    touchItem.current = null;
  };

  const dropAnswer = (opt) => {
    setDroppedValue(opt.value);
    setDroppedColor(opt.color);
    setDroppedTextColor(opt.textColor);
    setIsCorrect(opt.value === correctAnswer);
  };

  const handleReset = () => {
    setDroppedValue(null);
    setDroppedColor(null);
    setDroppedTextColor(null);
    setIsCorrect(null);
  };

  const handleNextVideo = () => {
    navigation?.navigate("ShortVideo");
  };

  const handleNextActivity = () => {
    navigation?.navigate("activitytemplate3", {
      title: resolvedTitle,
      activityLabel: resolvedLabel,
    });
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.header}>
          <p style={styles.title}>{resolvedTitle}</p>

          <div style={styles.activityRow}>
            <span style={styles.starGold}>★</span>
            <span style={styles.activityDash}>· · ·</span>
            <p style={styles.activityLabel}>{resolvedLabel}</p>
            <span style={styles.activityDash}>· · ·</span>
            <span style={styles.starGold}>★</span>
          </div>

          <p style={styles.question}>{question}</p>
        </div>

        <div style={styles.instructionBox}>
          <p style={styles.instructionText}>Drag the correct answer to the box</p>
        </div>

        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={droppedValue ? handleReset : undefined}
          style={{
            ...styles.dropZone,
            borderColor: isOver
              ? "#6c5ce7"
              : isCorrect === true
              ? "#3a8c3f"
              : isCorrect === false
              ? "#e74c3c"
              : "#c9c0f5",
            backgroundColor: isOver ? "#ede9fc" : "#f5f3ff",
            cursor: droppedValue ? "pointer" : "default",
          }}
        >
          {droppedValue ? (
            <div style={{ textAlign: "center" }}>
              <span
                style={{
                  ...styles.droppedAnswer,
                  color: droppedTextColor,
                  backgroundColor: droppedColor,
                }}
              >
                {droppedValue}
              </span>

              {isCorrect === true && (
                <p style={styles.feedbackCorrect}>✓ Correct!</p>
              )}

              {isCorrect === false && (
                <p style={styles.feedbackWrong}>✗ Try again — tap to reset</p>
              )}
            </div>
          ) : (
            <span style={styles.questionMark}>?</span>
          )}
        </div>

        <div style={styles.optionsRow}>
          {options.map((opt) => {
            const isDropped = droppedValue === opt.value;

            return (
              <div
                key={opt.id}
                draggable={!isDropped}
                onDragStart={(e) => !isDropped && handleDragStart(e, opt)}
                onDragEnd={handleDragEnd}
                onTouchStart={(e) => !isDropped && handleTouchStart(e, opt)}
                onTouchMove={(e) => !isDropped && handleTouchMove(e)}
                onTouchEnd={() => !isDropped && handleTouchEnd()}
                style={{
                  ...styles.optionTile,
                  backgroundColor: isDropped ? "#e8e8e8" : opt.color,
                  color: isDropped ? "#bbb" : opt.textColor,
                  opacity: draggingId === opt.id ? 0.4 : isDropped ? 0.5 : 1,
                  cursor: isDropped ? "default" : "grab",
                  transform: draggingId === opt.id ? "scale(0.95)" : "scale(1)",
                  boxShadow: isDropped
                    ? "none"
                    : "0 4px 12px rgba(0,0,0,0.12)",
                }}
              >
                {opt.value}
              </div>
            );
          })}
        </div>

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
  },

  header: {
    backgroundColor: "#fff",
    paddingTop: "20px",
    paddingBottom: "6px",
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
    marginBottom: "6px",
  },

  activityLabel: {
    margin: 0,
    fontSize: "14px",
    fontWeight: "700",
    color: "#6c5ce7",
  },

  activityDash: {
    color: "#c4b8f8",
    fontSize: "10px",
    letterSpacing: "2px",
  },

  starGold: {
    color: "#f6c90e",
    fontSize: "16px",
  },

  question: {
    margin: "4px 0 8px 0",
    fontSize: "40px",
    fontWeight: "900",
    color: "#1a1a3e",
    letterSpacing: "-0.5px",
  },

  instructionBox: {
    margin: "0 16px 12px 16px",
    backgroundColor: "#f5f3ff",
    borderRadius: "14px",
    padding: "12px 16px",
    textAlign: "center",
  },

  instructionText: {
    margin: 0,
    fontSize: "14px",
    fontWeight: "600",
    color: "#555",
  },

  dropZone: {
    margin: "0 16px 20px 16px",
    borderRadius: "18px",
    border: "2px dashed #c9c0f5",
    minHeight: "130px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  },

  questionMark: {
    fontSize: "64px",
    fontWeight: "900",
    color: "#c9c0f5",
    lineHeight: 1,
    userSelect: "none",
  },

  droppedAnswer: {
    display: "inline-block",
    fontSize: "52px",
    fontWeight: "900",
    borderRadius: "18px",
    padding: "10px 30px",
    lineHeight: 1.2,
  },

  feedbackCorrect: {
    margin: "8px 0 0 0",
    fontSize: "14px",
    fontWeight: "700",
    color: "#3a8c3f",
  },

  feedbackWrong: {
    margin: "8px 0 0 0",
    fontSize: "13px",
    fontWeight: "700",
    color: "#e74c3c",
  },

  optionsRow: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    padding: "0 16px 20px 16px",
  },

  optionTile: {
    width: "72px",
    height: "72px",
    borderRadius: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    fontWeight: "900",
    userSelect: "none",
    transition: "transform 0.15s ease, opacity 0.2s ease",
    touchAction: "none",
  },

  bottomRow: {
    display: "flex",
    gap: "12px",
    padding: "0 16px 20px 16px",
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

export default ActivityTemplate2;