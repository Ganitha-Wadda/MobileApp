import { useState } from "react";

const allData = [
  { rank: 1, name: "Saman Ekanayake", points: 45200, avatar: "👦", isUser: true },
  { rank: 2, name: "Nethmi Perera", points: 42100, avatar: "👧", isUser: false },
  { rank: 3, name: "Dinuka Fernando", points: 39800, avatar: "👦", isUser: false },
  { rank: 4, name: "Hasitha Jayawardena", points: 37500, avatar: "👧", isUser: false },
  { rank: 5, name: "Vihanga Rathnayake", points: 35200, avatar: "👦", isUser: false },
  { rank: 6, name: "Ayaan Silva", points: 32900, avatar: "👦", isUser: false },
  { rank: 7, name: "Imeshi De Silva", points: 30100, avatar: "👧", isUser: false },
  { rank: 8, name: "Tharusha Madushan", points: 27800, avatar: "👦", isUser: false },
  { rank: 9, name: "Pasindu Fernando", points: 25400, avatar: "👦", isUser: false },
  { rank: 10, name: "Sewmini Karunaratne", points: 22100, avatar: "👧", isUser: false },
];

const avatarColors = [
  "#FF6B9D", "#A78BFA", "#60A5FA", "#34D399", "#FBBF24",
  "#F87171", "#38BDF8", "#C084FC", "#FB923C", "#4ADE80",
];

const Cloud = ({ style, scale = 1, delay = 0 }) => (
  <div
    style={{
      position: "absolute",
      width: 58,
      height: 30,
      opacity: 0.8,
      zIndex: 1,
      transform: `scale(${scale})`,
      animation: "cloudMove 5.2s ease-in-out infinite",
      animationDelay: `${delay}s`,
      ...style,
    }}
  >
    <span style={cloudCircle1} />
    <span style={cloudCircle2} />
    <span style={cloudCircle3} />
    <span style={cloudBase} />
  </div>
);

const cloudCircle1 = {
  position: "absolute",
  left: 4,
  bottom: 4,
  width: 20,
  height: 20,
  borderRadius: "50%",
  background: "#FFFFFF",
};

const cloudCircle2 = {
  position: "absolute",
  left: 18,
  bottom: 8,
  width: 27,
  height: 27,
  borderRadius: "50%",
  background: "#FFFFFF",
};

const cloudCircle3 = {
  position: "absolute",
  right: 4,
  bottom: 4,
  width: 21,
  height: 21,
  borderRadius: "50%",
  background: "#FFFFFF",
};

const cloudBase = {
  position: "absolute",
  left: 5,
  right: 4,
  bottom: 3,
  height: 13,
  borderRadius: 8,
  background: "#FFFFFF",
};

const AvatarCircle = ({ emoji, size = 44, colorIndex = 0 }) => {
  const bg = avatarColors[colorIndex % avatarColors.length];

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.45,
        flexShrink: 0,
        border: "2.5px solid #fff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.13)",
      }}
    >
      {emoji}
    </div>
  );
};

const CoinIcon = ({ size = 16 }) => (
  <span style={{ fontSize: size, marginRight: 3 }}>🪙</span>
);

const PodiumCard = ({ player, position }) => {
  const configs = {
    1: {
      height: 110,
      podiumColor: "#FFD700",
      podiumShadow: "#B8860B",
      avatarSize: 72,
      crown: true,
      zIndex: 3,
      marginTop: 0,
    },
    2: {
      height: 82,
      podiumColor: "#C0C0C0",
      podiumShadow: "#888",
      avatarSize: 58,
      crown: false,
      zIndex: 2,
      marginTop: 18,
    },
    3: {
      height: 68,
      podiumColor: "#CD7F32",
      podiumShadow: "#8B4513",
      avatarSize: 54,
      crown: false,
      zIndex: 1,
      marginTop: 26,
    },
  };

  const c = configs[position];
  const colorIdx = position === 1 ? 0 : position === 2 ? 1 : 2;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        zIndex: c.zIndex,
        marginTop: c.marginTop,
        flex: 1,
      }}
    >
      {c.crown && <div style={{ fontSize: 26, marginBottom: -6, zIndex: 10 }}>👑</div>}

      <div
        style={{
          width: c.avatarSize,
          height: c.avatarSize,
          borderRadius: "50%",
          background: avatarColors[colorIdx],
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: c.avatarSize * 0.45,
          border: `3px solid ${c.podiumColor}`,
          boxShadow: "0 4px 18px rgba(0,0,0,0.18)",
          marginBottom: 6,
        }}
      >
        {player.avatar}
      </div>

      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "#2d1b69",
          textAlign: "center",
          maxWidth: 80,
          lineHeight: 1.2,
          marginBottom: 4,
        }}
      >
        {player.name}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "rgba(255,200,0,0.22)",
          borderRadius: 20,
          padding: "2px 8px",
          fontSize: 12,
          fontWeight: 800,
          color: "#92400e",
          marginBottom: 4,
        }}
      >
        <CoinIcon size={14} />
        {player.points.toLocaleString()}
      </div>

      <div
        style={{
          width: 74,
          height: c.height,
          background: `linear-gradient(160deg, ${c.podiumColor} 60%, ${c.podiumShadow})`,
          borderRadius: "10px 10px 0 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 -3px 12px ${c.podiumColor}88`,
          marginTop: 2,
        }}
      >
        <span
          style={{
            fontSize: 28,
            fontWeight: 900,
            color: "#fff",
            textShadow: "0 2px 8px rgba(0,0,0,0.18)",
          }}
        >
          {position}
        </span>
      </div>
    </div>
  );
};

const LeaderboardRow = ({ player, animDelay }) => {
  const colorIdx = player.rank - 1;
  const isUser = player.isUser;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        background: isUser
          ? "linear-gradient(90deg, #ede9fe 0%, #ddd6fe 100%)"
          : "rgba(255,255,255,0.92)",
        borderRadius: 16,
        padding: "10px 14px",
        marginBottom: 8,
        boxShadow: isUser
          ? "0 2px 12px rgba(139,92,246,0.18)"
          : "0 1px 6px rgba(0,0,0,0.06)",
        border: isUser ? "1.5px solid #a78bfa" : "1.5px solid #ECE8FF",
        animation: "fadeSlideIn 0.4s ease both",
        animationDelay: `${animDelay}s`,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: isUser
            ? "linear-gradient(135deg, #7c3aed, #a78bfa)"
            : "#f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 800,
          fontSize: 13,
          color: isUser ? "#fff" : "#6b7280",
          marginRight: 10,
          flexShrink: 0,
        }}
      >
        {player.rank}
      </div>

      <AvatarCircle emoji={player.avatar} size={42} colorIndex={colorIdx} />

      <div style={{ flex: 1, marginLeft: 10 }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 14,
            color: isUser ? "#4c1d95" : "#1e1b4b",
          }}
        >
          {isUser ? `You – ${player.name}` : player.name}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          fontWeight: 800,
          fontSize: 14,
          color: isUser ? "#7c3aed" : "#92400e",
        }}
      >
        <CoinIcon size={15} />
        {player.points.toLocaleString()}
      </div>
    </div>
  );
};

export default function Leaderboard() {
  const data = allData;

  const top3 = [
    data.find((p) => p.rank === 2),
    data.find((p) => p.rank === 1),
    data.find((p) => p.rank === 3),
  ];

  const rest = data.filter((p) => p.rank > 3);
  const userEntry = data.find((p) => p.isUser);

  return (
    <div
      style={{
        height: "100vh",
        background:
          "linear-gradient(180deg, #FAF9FF 0%, #F3F0FF 48%, #ECE8FF 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "0 0 32px",
        fontFamily: "'Nunito', 'Poppins', sans-serif",
        position: "relative",
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes podiumPop {
          0%   { opacity: 0; transform: scaleY(0.6) translateY(30px); }
          80%  { transform: scaleY(1.04) translateY(-2px); }
          100% { opacity: 1; transform: scaleY(1) translateY(0); }
        }

        @keyframes starFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.7; }
          50% { transform: translateY(-12px) rotate(15deg); opacity: 1; }
        }

        @keyframes cloudMove {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(18px) translateY(-6px); }
        }
      `}</style>

      <Cloud style={{ top: 92, left: -18 }} scale={0.85} delay={0} />
      <Cloud style={{ top: 145, right: 20 }} scale={0.65} delay={0.3} />
      <Cloud style={{ top: 235, left: 35 }} scale={0.5} delay={0.6} />
      <Cloud style={{ top: 315, right: -8 }} scale={0.72} delay={0.9} />
      <Cloud style={{ bottom: 130, left: 32 }} scale={0.78} delay={1.2} />
      <Cloud style={{ bottom: 105, right: 32 }} scale={0.68} delay={1.5} />

      <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 5 }}>
        <div style={{ textAlign: "center", padding: "32px 20px 0", position: "relative" }}>
          {["⭐", "✨", "🌟"].map((s, i) => (
            <span
              key={i}
              style={{
                position: "absolute",
                fontSize: 18 + i * 4,
                animation: `starFloat ${2.2 + i * 0.4}s ease-in-out infinite`,
                animationDelay: `${i * 0.6}s`,
                left: [14, "auto", 20][i],
                right: ["auto", 16, "auto"][i],
                top: [28, 18, 55][i],
                opacity: 0.85,
              }}
            >
              {s}
            </span>
          ))}

          <div
            style={{
              fontSize: 26,
              fontWeight: 900,
              color: "#07124A",
              letterSpacing: 0.5,
              textShadow: "0 2px 8px rgba(255,255,255,0.4)",
            }}
          >
            🏆 Leaderboard
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            padding: "28px 24px 0",
            gap: 6,
            animation: "podiumPop 0.6s cubic-bezier(.34,1.56,.64,1) both",
          }}
        >
          <PodiumCard player={top3[0]} position={2} />
          <PodiumCard player={top3[1]} position={1} />
          <PodiumCard player={top3[2]} position={3} />
        </div>

        <div
          style={{
            textAlign: "center",
            margin: "18px 16px 0",
            background: "rgba(255,255,255,0.75)",
            borderRadius: 30,
            padding: "10px 0",
            boxShadow: "0 2px 12px rgba(109,40,217,0.12)",
            border: "1px solid #ECE8FF",
            color: "#6D28D9",
            fontWeight: 900,
            fontSize: 14,
          }}
        >
          All Time
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.55)",
            backdropFilter: "blur(10px)",
            borderRadius: "24px 24px 0 0",
            margin: "14px 0 0",
            padding: "16px 14px 8px",
            minHeight: 320,
            boxShadow: "0 -4px 24px rgba(109,40,217,0.10)",
            border: "1px solid rgba(255,255,255,0.55)",
          }}
        >
          {rest.map((player, i) => (
            <LeaderboardRow
              key={player.rank}
              player={player}
              animDelay={i * 0.06}
            />
          ))}

          {userEntry && (
            <div
              style={{
                borderTop: "1.5px dashed #a78bfa",
                marginTop: 4,
                paddingTop: 10,
              }}
            >
              <LeaderboardRow player={userEntry} animDelay={0} />
            </div>
          )}

          <div
            style={{
              background: "linear-gradient(90deg, #7c3aed 0%, #4f46e5 100%)",
              borderRadius: 20,
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              marginTop: 14,
              boxShadow: "0 4px 18px rgba(124,58,237,0.30)",
            }}
          >
            <div style={{ fontSize: 36, marginRight: 14 }}>🏆</div>

            <div style={{ flex: 1 }}>
              <div style={{ color: "#ddd6fe", fontSize: 12, fontWeight: 600 }}>
                Your Rank:
              </div>

              <div
                style={{
                  color: "#fff",
                  fontSize: 28,
                  fontWeight: 900,
                  lineHeight: 1.1,
                }}
              >
                #{userEntry ? userEntry.rank : "—"}
              </div>

              <div style={{ color: "#c4b5fd", fontSize: 12, marginTop: 1 }}>
                Amazing work! You're at the top!
              </div>

              <div style={{ color: "#a78bfa", fontSize: 11 }}>
                Keep learning and stay on top!
              </div>
            </div>

            <div style={{ fontSize: 34 }}>🚀</div>
          </div>
        </div>
      </div>
    </div>
  );
}