import { useState } from "react";

const initialPapers = [
  { id: 1, name: "Daily paper - 1", marks: "20/100" },
  { id: 2, name: "", marks: "" },
  { id: 3, name: "", marks: "" },
  { id: 4, name: "", marks: "" },
  { id: 5, name: "", marks: "" },
  { id: 6, name: "", marks: "" },
];

const paperTypes = [
  "Daily papers",
  "Weekly papers",
  "Monthly papers",
  "Term papers",
  "Final papers",
];

export default function Result() {
  const [selectedType, setSelectedType] = useState("Daily papers");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [papers] = useState(initialPapers);

  const handleSelect = (type) => {
    setSelectedType(type);
    setDropdownOpen(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#eeeaf8",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingTop: "32px",
        paddingBottom: "32px",
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: "480px", padding: "0 16px" }}>
        {/* Dropdown */}
        <div style={{ position: "relative", marginBottom: "24px" }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              width: "100%",
              backgroundColor: "#ffffff",
              border: "none",
              borderRadius: "16px",
              padding: "18px 24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(80,60,180,0.08)",
            }}
          >
            <span
              style={{
                fontWeight: "700",
                fontSize: "18px",
                color: "#1a0a6b",
                letterSpacing: "0.01em",
              }}
            >
              {selectedType}
            </span>
            <span
              style={{
                color: "#3d2eb8",
                fontSize: "20px",
                transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
                display: "inline-block",
              }}
            >
              &#8964;
            </span>
          </button>

          {dropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                left: 0,
                right: 0,
                backgroundColor: "#ffffff",
                borderRadius: "14px",
                boxShadow: "0 4px 20px rgba(80,60,180,0.15)",
                zIndex: 100,
                overflow: "hidden",
              }}
            >
              {paperTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => handleSelect(type)}
                  style={{
                    width: "100%",
                    padding: "14px 24px",
                    textAlign: "left",
                    background:
                      selectedType === type ? "#ede9fc" : "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: selectedType === type ? "700" : "500",
                    fontSize: "16px",
                    color: "#1a0a6b",
                    borderBottom: "1px solid #eeeaf8",
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Table Card */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 2px 12px rgba(80,60,180,0.07)",
          }}
        >
          {/* Header Row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              backgroundColor: "#ede9fc",
              borderBottom: "1.5px solid #d8d2f5",
            }}
          >
            <div
              style={{
                padding: "20px 24px",
                fontWeight: "700",
                fontSize: "15px",
                color: "#1a0a6b",
                borderRight: "1.5px solid #d8d2f5",
              }}
            >
              paper name
            </div>
            <div
              style={{
                padding: "20px 24px",
                fontWeight: "700",
                fontSize: "15px",
                color: "#1a0a6b",
                textAlign: "center",
              }}
            >
              Marks
            </div>
          </div>

          {/* Data Rows */}
          {papers.map((paper, index) => (
            <div
              key={paper.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                borderBottom:
                  index < papers.length - 1
                    ? "1.5px solid #ede9fc"
                    : "none",
                minHeight: "80px",
              }}
            >
              <div
                style={{
                  padding: "20px 24px",
                  fontWeight: "700",
                  fontSize: "16px",
                  color: "#1a0a6b",
                  borderRight: "1.5px solid #ede9fc",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {paper.name}
              </div>
              <div
                style={{
                  padding: "20px 24px",
                  fontWeight: "700",
                  fontSize: "16px",
                  color: "#1a0a6b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {paper.marks}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}