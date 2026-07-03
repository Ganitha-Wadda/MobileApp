import React, { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { normalizeAvatarConfig, getAvatarColor } from "../../utils/avatarBuilder";

/*
 * Procedural stylized 3D character ("Study Buddy").
 * Built entirely from three.js primitives so it needs no external GLB assets,
 * stays tiny (<40k tris) and runs at 60fps on mid-range Android devices.
 * The rig swaps to real modeled parts later without changing its public API:
 *   <AvatarRig config={avatarConfig} animation="wave" onAnimationEnd={...} />
 */

// Darken/lighten a #rrggbb hex color by factor f (0..1 darkens, >1 lightens).
const shadeHex = (hex, f) => {
  const n = parseInt(String(hex).replace("#", ""), 16);
  const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
  const r = clamp(((n >> 16) & 255) * f);
  const g = clamp(((n >> 8) & 255) * f);
  const b = clamp((n & 255) * f);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
};

const hexToRgb = (hex) => {
  const n = parseInt(String(hex).replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const mixHex = (a, b, t) => {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
  const r = clamp(ar + (br - ar) * t);
  const g = clamp(ag + (bg - ag) * t);
  const blue = clamp(ab + (bb - ab) * t);
  return `#${((r << 16) | (g << 8) | blue).toString(16).padStart(6, "0")}`;
};

const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

// One-shot animation durations (seconds). Anything not listed loops forever
// (talk loops until the caller stops it, e.g. when speech playback finishes).
const ANIMATION_DURATIONS = {
  wave: 2.4,
  celebrate: 2.8,
  think: 2.6,
  sad: 2.6,
};

// Facial overrides applied while an animation plays.
const ANIMATION_EXPRESSIONS = {
  wave: { eyes: "Happy", mouth: "Smile" },
  celebrate: { eyes: "Happy", mouth: "Twinkle", eyebrows: "RaisedExcited" },
  think: { eyes: "Squint", mouth: "Serious", eyebrows: "UpDown" },
  sad: { eyes: "Cry", mouth: "Concerned", eyebrows: "SadConcerned" },
  talk: { mouth: "Open", eyebrows: "RaisedExcited" },
};

// Personality style tunes the idle motion so two identical outfits feel different.
const PERSONALITY_IDLE = {
  Energetic: { bob: 0.045, speed: 1.5, look: 0.1, sway: 0.03 },
  Chill: { bob: 0.02, speed: 0.75, look: 0.05, sway: 0.015 },
  Curious: { bob: 0.03, speed: 1.1, look: 0.28, sway: 0.02 },
  Champion: { bob: 0.028, speed: 1.0, look: 0.08, sway: 0.04 },
};

const BODY_SCALE = {
  Slim: [0.88, 1.0, 0.88],
  Regular: [1, 1, 1],
  Sturdy: [1.14, 0.98, 1.14],
};

const FACE_SCALE = {
  Round: [1, 1, 1],
  Oval: [0.92, 1.07, 0.94],
  Square: [1.04, 0.95, 1.0],
};

function SkinMaterial({ color, roughness = 0.5 }) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={roughness}
      metalness={0}
      emissive={mixHex(color, "#ffffff", 0.18)}
      emissiveIntensity={0.035}
    />
  );
}

function ClothMaterial({ color, roughness = 0.78 }) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={roughness}
      metalness={0.02}
      emissive={shadeHex(color, 0.55)}
      emissiveIntensity={0.025}
    />
  );
}

function HairMaterial({ color, roughness = 0.86 }) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={roughness}
      metalness={0.03}
      emissive={shadeHex(color, 0.6)}
      emissiveIntensity={0.025}
    />
  );
}

function Ear({ side, skin }) {
  const x = side * 0.49;
  const inner = mixHex(skin, "#9f5a45", 0.24);

  return (
    <group position={[x, -0.005, -0.005]} rotation={[0, 0, side * 0.04]}>
      <mesh scale={[0.48, 1, 0.68]}>
        <sphereGeometry args={[0.095, 16, 14]} />
        <SkinMaterial color={skin} roughness={0.56} />
      </mesh>
      <mesh position={[side * 0.012, -0.002, 0.035]} scale={[0.36, 0.7, 0.32]}>
        <sphereGeometry args={[0.074, 12, 10]} />
        <meshStandardMaterial color={inner} roughness={0.65} />
      </mesh>
      <mesh position={[side * 0.014, -0.018, 0.06]} scale={[0.28, 0.42, 0.22]}>
        <sphereGeometry args={[0.052, 10, 8]} />
        <meshStandardMaterial color={shadeHex(inner, 0.88)} roughness={0.7} />
      </mesh>
    </group>
  );
}

function Nose({ skin }) {
  const highlight = mixHex(skin, "#ffffff", 0.2);
  const shade = mixHex(skin, "#7c2d12", 0.22);

  return (
    <group position={[0, -0.035, 0.48]}>
      <mesh position={[0, 0.055, 0]} rotation={[0.18, 0, 0]} scale={[0.72, 1.05, 0.5]}>
        <capsuleGeometry args={[0.026, 0.105, 5, 12]} />
        <meshStandardMaterial color={highlight} roughness={0.52} />
      </mesh>
      <mesh position={[0, -0.025, 0.026]} scale={[0.9, 0.68, 0.56]}>
        <sphereGeometry args={[0.055, 16, 12]} />
        <SkinMaterial color={skin} roughness={0.5} />
      </mesh>
      {[-0.026, 0.026].map((x) => (
        <mesh key={x} position={[x, -0.045, 0.066]} scale={[1, 0.55, 0.45]}>
          <sphereGeometry args={[0.012, 8, 6]} />
          <meshStandardMaterial color={shade} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function Hand({ skin, side = 1 }) {
  const nail = mixHex(skin, "#ffffff", 0.32);

  return (
    <group position={[0, -0.47, 0]}>
      <mesh scale={[0.92, 1.08, 0.72]}>
        <sphereGeometry args={[0.083, 14, 12]} />
        <SkinMaterial color={skin} roughness={0.56} />
      </mesh>
      <mesh
        position={[side * 0.055, -0.005, 0.018]}
        rotation={[0, 0, side * 0.55]}
        scale={[0.62, 0.8, 0.55]}
      >
        <capsuleGeometry args={[0.018, 0.065, 4, 8]} />
        <SkinMaterial color={skin} roughness={0.58} />
      </mesh>
      {[-0.03, 0, 0.03].map((x, i) => (
        <mesh
          key={x}
          position={[x, -0.067, 0.018]}
          rotation={[0.12, 0, (i - 1) * 0.08]}
          scale={[0.56, 0.78, 0.5]}
        >
          <capsuleGeometry args={[0.012, 0.052, 4, 7]} />
          <SkinMaterial color={skin} roughness={0.6} />
        </mesh>
      ))}
      {[-0.03, 0, 0.03].map((x) => (
        <mesh key={`nail-${x}`} position={[x, -0.096, 0.039]} scale={[1, 0.45, 0.35]}>
          <sphereGeometry args={[0.007, 6, 5]} />
          <meshStandardMaterial color={nail} roughness={0.38} />
        </mesh>
      ))}
    </group>
  );
}

function Leg({ side, legRef }) {
  return (
    <group ref={legRef} position={[side * 0.16, 0.56, 0]}>
      <mesh position={[0, -0.21, 0]}>
        <capsuleGeometry args={[0.1, 0.33, 8, 14]} />
        <meshStandardMaterial color="#29384f" roughness={0.82} />
      </mesh>
      <mesh position={[0, -0.16, 0.085]} scale={[0.82, 0.42, 0.34]}>
        <sphereGeometry args={[0.055, 10, 8]} />
        <meshStandardMaterial color="#475569" roughness={0.86} />
      </mesh>
      <mesh position={[0, -0.38, 0]} scale={[0.78, 0.22, 0.75]}>
        <sphereGeometry args={[0.07, 10, 8]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>
      <Shoe side={side} />
    </group>
  );
}

function Shoe({ side }) {
  return (
    <group position={[0, -0.46, 0.045]}>
      <mesh position={[side * 0.01, -0.015, 0]} scale={[1.04, 0.34, 1.68]}>
        <boxGeometry args={[0.215, 0.12, 0.22]} />
        <meshStandardMaterial color="#dbeafe" roughness={0.62} />
      </mesh>
      <mesh position={[0, 0.035, 0.015]} scale={[1, 0.58, 1.5]}>
        <sphereGeometry args={[0.112, 16, 12]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.48} />
      </mesh>
      <mesh position={[0, 0.067, 0.145]} rotation={[0.45, 0, 0]}>
        <boxGeometry args={[0.1, 0.046, 0.018]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.52} />
      </mesh>
      {[-0.032, 0.032].map((x) => (
        <mesh key={x} position={[x, 0.084, 0.12]} rotation={[0.5, 0, side * 0.28]}>
          <boxGeometry args={[0.052, 0.008, 0.012]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.45} />
        </mesh>
      ))}
    </group>
  );
}

function Eye({
  x,
  variant = "Default",
  irisColor = "#6b4423",
  skin = "#f5d0b5",
  groupRef,
}) {
  // Realistic stylized eye: white sclera, colored iris, pupil and a glint.
  const lidColor = mixHex(skin, "#ffffff", 0.12);
  const socketColor = mixHex(skin, "#7c2d12", 0.18);
  const scaleY =
    variant === "Wink" && x < 0
      ? 0.1
      : variant === "Squint"
      ? 0.45
      : variant === "Happy"
      ? 0.72
      : variant === "Surprised"
      ? 1.3
      : 1;

  // Outer group holds the eye-variant shape; inner group (groupRef) is scaled
  // by the procedural blink so the two never fight each other.
  return (
    <group position={[x, 0.06, 0.4]} scale={[1, scaleY, 1]}>
      <mesh position={[0, -0.002, 0.006]} scale={[1.22, 1.34, 0.36]}>
        <sphereGeometry args={[0.112, 16, 12]} />
        <meshStandardMaterial color={socketColor} transparent opacity={0.2} roughness={0.8} />
      </mesh>
      <group ref={groupRef}>
        {/* Sclera — large, anime/Pixar proportion */}
        <mesh scale={[1, 1.2, 0.5]}>
          <sphereGeometry args={[0.105, 22, 22]} />
          <meshStandardMaterial color="#fefefe" roughness={0.15} />
        </mesh>
        {/* Iris outer ring (darker shade gives depth) */}
        <mesh position={[0, -0.005, 0.043]} scale={[1, 1.1, 0.4]}>
          <sphereGeometry args={[0.068, 18, 18]} />
          <meshStandardMaterial color={shadeHex(irisColor, 0.55)} roughness={0.2} />
        </mesh>
        {/* Iris */}
        <mesh position={[0, -0.005, 0.055]} scale={[1, 1.1, 0.4]}>
          <sphereGeometry args={[0.056, 18, 18]} />
          <meshStandardMaterial color={irisColor} roughness={0.22} />
        </mesh>
        {/* Pupil */}
        <mesh position={[0, -0.005, 0.075]} scale={[1, 1, 0.4]}>
          <sphereGeometry args={[0.028, 12, 12]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.12} />
        </mesh>
        {/* Primary glint */}
        <mesh position={[0.024, 0.03, 0.085]}>
          <sphereGeometry args={[0.017, 10, 10]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={0.75}
            roughness={0.05}
          />
        </mesh>
        {/* Secondary glint */}
        <mesh position={[-0.018, -0.02, 0.083]}>
          <sphereGeometry args={[0.008, 8, 8]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={0.5}
            roughness={0.05}
          />
        </mesh>
      </group>
      <mesh position={[0, 0.086, 0.056]} rotation={[0.14, 0, 0.72]}>
        <torusGeometry args={[0.1, 0.014, 6, 18, 1.55]} />
        <meshStandardMaterial color={lidColor} roughness={0.62} />
      </mesh>
      <mesh position={[0, -0.083, 0.047]} rotation={[0.04, 0, -2.38]}>
        <torusGeometry args={[0.094, 0.009, 6, 16, 1.32]} />
        <meshStandardMaterial color={mixHex(lidColor, "#7c2d12", 0.08)} roughness={0.7} />
      </mesh>
      {/* Lash line above the eye */}
      <mesh position={[0, 0.075, 0.045]} rotation={[0.15, 0, 0.75]}>
        <torusGeometry args={[0.1, 0.012, 6, 16, 1.65]} />
        <meshStandardMaterial color="#1f2937" roughness={0.6} />
      </mesh>
      {variant === "Cry" && x < 0 ? (
        <mesh position={[0, -0.15, 0.05]} scale={[0.6, 1, 0.6]}>
          <sphereGeometry args={[0.04, 10, 10]} />
          <meshStandardMaterial color="#60a5fa" roughness={0.15} />
        </mesh>
      ) : null}
    </group>
  );
}

function Gadget({ variant, bodyScale }) {
  // Body-mounted gadgets. Head-mounted ones (Headphones/Crown) and the wrist
  // Watch are rendered inside the head / arm groups so they follow motion.
  if (variant === "Backpack") {
    const backZ = -(0.34 * bodyScale[2] + 0.12);
    return (
      <group>
        <mesh position={[0, 0.95, backZ]}>
          <boxGeometry args={[0.44, 0.52, 0.22]} />
          <meshStandardMaterial color="#b45309" roughness={0.65} />
        </mesh>
        <mesh position={[0, 0.85, backZ - 0.13]}>
          <boxGeometry args={[0.3, 0.22, 0.08]} />
          <meshStandardMaterial color="#d97706" roughness={0.6} />
        </mesh>
        {[-0.16, 0.16].map((x) => (
          <mesh key={x} position={[x, 1.05, 0.34 * bodyScale[2] + 0.01]}>
            <boxGeometry args={[0.07, 0.34, 0.03]} />
            <meshStandardMaterial color="#78350f" roughness={0.7} />
          </mesh>
        ))}
      </group>
    );
  }

  if (variant === "Medal") {
    const chestZ = 0.34 * bodyScale[2] + 0.02;
    return (
      <group>
        {[-0.09, 0.09].map((x) => (
          <mesh
            key={x}
            position={[x, 1.16, chestZ]}
            rotation={[0.1, 0, x > 0 ? 0.45 : -0.45]}
          >
            <boxGeometry args={[0.06, 0.24, 0.02]} />
            <meshStandardMaterial color="#dc2626" roughness={0.6} />
          </mesh>
        ))}
        <mesh position={[0, 1.0, chestZ + 0.02]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.025, 20]} />
          <meshStandardMaterial
            color="#fbbf24"
            roughness={0.2}
            metalness={0.75}
          />
        </mesh>
        <mesh position={[0, 1.0, chestZ + 0.045]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.01, 12]} />
          <meshStandardMaterial color="#b45309" roughness={0.3} metalness={0.6} />
        </mesh>
      </group>
    );
  }

  return null;
}

function HeadGadget({ variant }) {
  if (variant === "Headphones") {
    return (
      <group>
        <mesh position={[0, 0.1, 0]}>
          <torusGeometry args={[0.56, 0.045, 10, 28, Math.PI]} />
          <meshStandardMaterial color="#1e293b" roughness={0.35} metalness={0.4} />
        </mesh>
        {[-0.55, 0.55].map((x) => (
          <group key={x} position={[x, 0.02, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.14, 0.14, 0.09, 18]} />
              <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.35} />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 2]} position={[x > 0 ? -0.05 : 0.05, 0, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 0.03, 16]} />
              <meshStandardMaterial color="#38bdf8" roughness={0.5} />
            </mesh>
          </group>
        ))}
      </group>
    );
  }

  if (variant === "Crown") {
    return (
      <group position={[0, 0.68, 0]}>
        <mesh>
          <cylinderGeometry args={[0.26, 0.3, 0.16, 20]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.2} metalness={0.7} />
        </mesh>
        {[0, 1, 2, 3, 4].map((i) => {
          const angle = (i / 5) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * 0.24, 0.14, Math.sin(angle) * 0.24]}
            >
              <coneGeometry args={[0.05, 0.14, 8]} />
              <meshStandardMaterial color="#fbbf24" roughness={0.2} metalness={0.7} />
            </mesh>
          );
        })}
        <mesh position={[0, 0, 0.29]}>
          <sphereGeometry args={[0.045, 10, 10]} />
          <meshStandardMaterial color="#dc2626" roughness={0.15} metalness={0.3} />
        </mesh>
      </group>
    );
  }

  return null;
}

function WristWatch() {
  return (
    <group position={[0, -0.37, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.088, 0.024, 8, 18]} />
        <meshStandardMaterial color="#1e293b" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0, 0.1]}>
        <boxGeometry args={[0.08, 0.09, 0.035]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.12]}>
        <boxGeometry args={[0.055, 0.065, 0.005]} />
        <meshStandardMaterial
          color="#0ea5e9"
          emissive="#0ea5e9"
          emissiveIntensity={0.45}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}

function Eyebrows({ variant, color }) {
  const base = { y: 0.22, z: 0.45 };
  if (variant === "UnibrowNatural") {
    return (
      <mesh position={[0, base.y - 0.02, base.z]}>
        <boxGeometry args={[0.42, 0.035, 0.03]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
    );
  }

  const tilt =
    variant === "SadConcerned"
      ? 0.45
      : variant === "RaisedExcited"
      ? -0.18
      : 0;
  const lift = variant === "RaisedExcited" ? 0.05 : 0;
  const rightTilt = variant === "UpDown" ? -0.3 : -tilt;
  const rightLift = variant === "UpDown" ? 0.06 : lift;

  return (
    <group>
      <mesh position={[-0.18, base.y + lift, base.z]} rotation={[0, 0, tilt]}>
        <boxGeometry args={[0.17, 0.035, 0.03]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh position={[0.18, base.y + rightLift, base.z]} rotation={[0, 0, rightTilt]}>
        <boxGeometry args={[0.17, 0.035, 0.03]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
    </group>
  );
}

function Mouth({ type, openRef }) {
  // "Open" is the animated talking mouth; the rest are static stylized shapes.
  if (type === "Open") {
    return (
      <group ref={openRef} position={[0, -0.17, 0.45]}>
        <mesh scale={[1, 1, 0.4]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial color="#7f1d1d" roughness={0.4} />
        </mesh>
      </group>
    );
  }

  if (type === "Serious" || type === "Eating") {
    return (
      <mesh position={[0, -0.18, 0.46]}>
        <boxGeometry args={[type === "Serious" ? 0.16 : 0.1, 0.028, 0.02]} />
        <meshStandardMaterial color="#7f1d1d" roughness={0.5} />
      </mesh>
    );
  }

  if (type === "Concerned") {
    // Frown: 1.9rad arc centered on the top of the circle (∩ shape).
    return (
      <mesh position={[0, -0.24, 0.44]} rotation={[0.2, 0, 0.62]}>
        <torusGeometry args={[0.1, 0.02, 8, 20, 1.9]} />
        <meshStandardMaterial color="#7f1d1d" roughness={0.5} />
      </mesh>
    );
  }

  // Smile family (Smile / Twinkle / Tongue)
  const radius = type === "Twinkle" ? 0.09 : 0.12;
  return (
    <group position={[0, -0.15, 0.44]}>
      <mesh rotation={[-0.15, 0, 3.6]}>
        <torusGeometry args={[radius, 0.022, 8, 20, 2.2]} />
        <meshStandardMaterial color="#7f1d1d" roughness={0.5} />
      </mesh>
      {type === "Tongue" ? (
        <mesh position={[0, -0.09, 0.02]} scale={[1, 0.7, 0.5]}>
          <sphereGeometry args={[0.05, 10, 10]} />
          <meshStandardMaterial color="#f472b6" roughness={0.35} />
        </mesh>
      ) : null}
    </group>
  );
}

function FacialHair({ variant, color }) {
  if (!variant || variant === "Blank") return null;

  if (variant === "MoustacheFancy") {
    return (
      <group position={[0, -0.1, 0.46]}>
        <mesh position={[-0.09, 0, 0]} rotation={[0, 0, 0.35]}>
          <capsuleGeometry args={[0.025, 0.1, 4, 8]} />
          <meshStandardMaterial color={color} roughness={0.75} />
        </mesh>
        <mesh position={[0.09, 0, 0]} rotation={[0, 0, -0.35]}>
          <capsuleGeometry args={[0.025, 0.1, 4, 8]} />
          <meshStandardMaterial color={color} roughness={0.75} />
        </mesh>
      </group>
    );
  }

  // Beards: 4.2rad torus arc centered on the bottom of the circle, hugging the jaw.
  const thickness = variant === "BeardMedium" ? 0.09 : 0.055;
  return (
    <mesh position={[0, -0.16, 0.18]} rotation={[0.5, 0, 2.62]}>
      <torusGeometry args={[0.34, thickness, 10, 24, 4.2]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
  );
}

function Glasses({ variant }) {
  if (!variant || variant === "Blank") return null;

  const dark = variant === "Sunglasses";
  const frameColor = "#0f172a";

  if (dark) {
    return (
      <group position={[0, 0.06, 0.46]}>
        {[-0.18, 0.18].map((x) => (
          <mesh key={x} position={[x, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.11, 0.11, 0.03, 20]} />
            <meshStandardMaterial color="#111827" roughness={0.15} metalness={0.3} />
          </mesh>
        ))}
        <mesh position={[0, 0.02, 0]}>
          <boxGeometry args={[0.14, 0.025, 0.025]} />
          <meshStandardMaterial color={frameColor} />
        </mesh>
      </group>
    );
  }

  return (
    <group position={[0, 0.06, 0.46]}>
      {[-0.18, 0.18].map((x) => (
        <mesh key={x} position={[x, 0, 0]}>
          <torusGeometry args={[0.105, 0.016, 8, 24]} />
          <meshStandardMaterial color={frameColor} roughness={0.3} metalness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[0.15, 0.02, 0.02]} />
        <meshStandardMaterial color={frameColor} />
      </mesh>
    </group>
  );
}

function Hair({ style, color }) {
  const shade = shadeHex(color, 0.72);
  const highlight = mixHex(color, "#ffffff", 0.18);

  if (style === "Hat") {
    return (
      <group position={[0, 0.32, 0]}>
        <mesh position={[0, 0.02, 0]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.56, 0.56, 0.05, 24]} />
          <HairMaterial color={color} roughness={0.72} />
        </mesh>
        <mesh position={[0, 0.18, 0]}>
          <cylinderGeometry args={[0.36, 0.4, 0.28, 24]} />
          <HairMaterial color={color} roughness={0.72} />
        </mesh>
        <mesh position={[0, 0.08, 0.36]}>
          <boxGeometry args={[0.74, 0.045, 0.06]} />
          <meshStandardMaterial color={shade} roughness={0.82} />
        </mesh>
        <mesh position={[0.02, 0.28, 0.03]} rotation={[0, 0, -0.05]}>
          <boxGeometry args={[0.36, 0.035, 0.035]} />
          <meshStandardMaterial color={highlight} transparent opacity={0.35} roughness={0.7} />
        </mesh>
      </group>
    );
  }

  if (style === "Turban") {
    return (
      <group position={[0, 0.22, 0]}>
        <mesh scale={[1.06, 0.75, 1.06]}>
          <sphereGeometry args={[0.5, 20, 16]} />
          <HairMaterial color={color} roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.18, 0]} scale={[0.8, 0.6, 0.8]}>
          <sphereGeometry args={[0.42, 18, 14]} />
          <HairMaterial color={color} roughness={0.8} />
        </mesh>
        {[-0.18, 0, 0.18].map((x, i) => (
          <mesh key={x} position={[x, 0.2 + i * 0.015, 0.4]} rotation={[0.22, 0, x * 0.8]}>
            <capsuleGeometry args={[0.018, 0.38 - i * 0.04, 4, 8]} />
            <meshStandardMaterial color={highlight} transparent opacity={0.26} roughness={0.82} />
          </mesh>
        ))}
        <mesh position={[0, 0.03, 0.46]} scale={[1, 0.4, 0.3]}>
          <sphereGeometry args={[0.18, 12, 8]} />
          <meshStandardMaterial color={shade} roughness={0.86} />
        </mesh>
        <mesh position={[0, 0.12, 0.42]}>
          <sphereGeometry args={[0.05, 10, 10]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.2} metalness={0.6} />
        </mesh>
      </group>
    );
  }

  if (style === "Hijab") {
    return (
      <group>
        <mesh position={[0, 0.05, -0.06]} scale={[1.12, 1.14, 1.1]}>
          <sphereGeometry args={[0.5, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.72]} />
          <HairMaterial color={color} roughness={0.86} />
        </mesh>
        <mesh position={[0, -0.42, 0.02]} scale={[1, 1.15, 0.95]}>
          <cylinderGeometry args={[0.34, 0.5, 0.5, 20, 1, true]} />
          <HairMaterial color={color} roughness={0.86} />
        </mesh>
        {[-0.2, 0.2].map((x) => (
          <mesh key={x} position={[x, -0.18, 0.42]} rotation={[0.1, 0, x > 0 ? -0.1 : 0.1]}>
            <capsuleGeometry args={[0.018, 0.42, 4, 8]} />
            <meshStandardMaterial color={highlight} transparent opacity={0.2} roughness={0.85} />
          </mesh>
        ))}
      </group>
    );
  }

  const isLong = style.startsWith("LongHair");
  const isBraids = style === "LongHairBraids";
  const isPigTails = style === "PigTails";
  const hasBangs = isLong || isPigTails;

  return (
    <group>
      {/* Base cap shared by every hair style */}
      <mesh position={[0, 0.1, -0.02]} scale={[1.04, 1.02, 1.04]}>
        <sphereGeometry args={[0.5, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <HairMaterial color={color} />
      </mesh>

      {/* Hairline, sideburns and subtle specular strands break up the round cap. */}
      {[-0.3, -0.16, 0, 0.16, 0.3].map((x, i) => (
        <mesh
          key={`hairline-${i}`}
          position={[x, 0.27 - Math.abs(x) * 0.08, 0.38]}
          rotation={[0.15, 0, x * -0.65]}
          scale={[1, 1.15 - Math.abs(x) * 0.8, 0.8]}
        >
          <capsuleGeometry args={[0.035, 0.12, 4, 8]} />
          <HairMaterial color={i % 2 ? shade : color} />
        </mesh>
      ))}
      {[-0.43, 0.43].map((x) => (
        <mesh key={`sideburn-${x}`} position={[x, -0.03, 0.24]} rotation={[0, 0, x > 0 ? -0.08 : 0.08]}>
          <capsuleGeometry args={[0.04, 0.2, 4, 8]} />
          <HairMaterial color={shade} />
        </mesh>
      ))}
      {[[-0.16, 0.37, 0.25], [0.14, 0.39, 0.2]].map((p, i) => (
        <mesh key={`hair-shine-${i}`} position={p} rotation={[0.42, 0, i ? -0.35 : 0.35]}>
          <capsuleGeometry args={[0.012, 0.28, 4, 8]} />
          <meshStandardMaterial color={highlight} transparent opacity={0.32} roughness={0.72} />
        </mesh>
      ))}

      {/* Fringe / bangs across the forehead */}
      {hasBangs
        ? [-0.28, -0.1, 0.1, 0.28].map((x, i) => (
            <mesh
              key={`bang-${i}`}
              position={[x, 0.3, 0.36]}
              scale={[1, 1.25, 0.8]}
            >
              <sphereGeometry args={[0.12, 12, 12]} />
              <HairMaterial color={color} />
            </mesh>
          ))
        : null}

      {/* Twin braids hanging over the shoulders, with hair ties */}
      {isBraids
        ? [-1, 1].map((side) => (
            <group key={`braid-${side}`}>
              {[0, 1, 2, 3].map((i) => (
                <mesh
                  key={i}
                  position={[
                    side * (0.36 - i * 0.02),
                    -0.14 - i * 0.17,
                    0.24 + i * 0.03,
                  ]}
                >
                  <sphereGeometry args={[0.1 - i * 0.012, 12, 12]} />
                  <HairMaterial color={color} />
                </mesh>
              ))}
              <mesh position={[side * 0.29, -0.78, 0.36]}>
                <sphereGeometry args={[0.045, 10, 10]} />
                <meshStandardMaterial color="#f472b6" roughness={0.5} />
              </mesh>
            </group>
          ))
        : null}

      {/* Pigtails sticking out high on the sides */}
      {isPigTails
        ? [-1, 1].map((side) => (
            <group key={`pig-${side}`}>
              {[0, 1, 2].map((i) => (
                <mesh
                  key={i}
                  position={[
                    side * (0.48 + i * 0.13),
                    0.18 - i * 0.14,
                    -0.05,
                  ]}
                >
                  <sphereGeometry args={[0.13 - i * 0.02, 12, 12]} />
                  <HairMaterial color={color} />
                </mesh>
              ))}
              <mesh position={[side * 0.46, 0.22, -0.05]}>
                <torusGeometry args={[0.09, 0.025, 8, 16]} />
                <meshStandardMaterial color="#f472b6" roughness={0.5} />
              </mesh>
            </group>
          ))
        : null}

      {style === "ShortHairDreads01" ? (
        <group>
          {[
            [-0.3, 0.42, 0.1], [0.3, 0.42, 0.1], [0, 0.5, -0.1],
            [-0.18, 0.48, -0.25], [0.18, 0.48, -0.25], [0, 0.46, 0.28],
          ].map((p, i) => (
            <mesh key={i} position={p} rotation={[p[2], 0, p[0]]}>
              <capsuleGeometry args={[0.05, 0.16, 4, 8]} />
              <HairMaterial color={color} roughness={0.9} />
            </mesh>
          ))}
        </group>
      ) : null}

      {style === "ShortHairFrizzle" ? (
        <group>
          {[
            [-0.24, 0.44, 0.12], [0.24, 0.44, 0.12], [0, 0.52, 0],
            [-0.14, 0.48, -0.2], [0.14, 0.48, -0.2],
          ].map((p, i) => (
            <mesh key={i} position={p}>
              <sphereGeometry args={[0.11, 10, 10]} />
              <HairMaterial color={color} roughness={0.9} />
            </mesh>
          ))}
        </group>
      ) : null}

      {style === "LongHairBun" ? (
        <mesh position={[0, 0.55, -0.15]}>
          <sphereGeometry args={[0.17, 14, 14]} />
          <HairMaterial color={color} />
        </mesh>
      ) : null}

      {isLong && style !== "LongHairBun" ? (
        <group>
          {/* Back panel */}
          <mesh position={[0, -0.25, -0.3]} scale={[1, 1.3, 0.55]}>
            <sphereGeometry args={[0.42, 18, 14]} />
            <HairMaterial color={color} />
          </mesh>
          {/* Side strands (braids replace these with sphere chains) */}
          {!isBraids
            ? [-0.42, 0.42].map((x) => (
                <mesh
                  key={x}
                  position={[x, -0.22, 0.05]}
                  rotation={[0, 0, x > 0 ? -0.08 : 0.08]}
                >
                  <capsuleGeometry
                    args={[style === "LongHairCurvy" ? 0.11 : 0.08, 0.5, 4, 10]}
                  />
                  <HairMaterial color={color} />
                </mesh>
              ))
            : null}
        </group>
      ) : null}
    </group>
  );
}

function Outfit({ clothing, clothColor, bodyScale }) {
  const shade = shadeHex(clothColor, 0.72);
  const deepShade = shadeHex(clothColor, 0.48);
  const highlight = mixHex(clothColor, "#ffffff", 0.22);

  return (
    <group scale={bodyScale}>
      {/* Torso with shoulders, waist and fabric highlights. */}
      <mesh position={[0, 0.95, 0]} scale={[1, 1, 0.92]}>
        <capsuleGeometry args={[0.36, 0.46, 10, 20]} />
        <ClothMaterial color={clothColor} />
      </mesh>
      <mesh position={[0, 1.2, -0.005]} scale={[1.16, 0.3, 0.85]}>
        <sphereGeometry args={[0.36, 18, 12]} />
        <ClothMaterial color={clothColor} />
      </mesh>
      <mesh position={[0, 0.66, 0.015]} scale={[0.84, 0.26, 0.78]}>
        <sphereGeometry args={[0.28, 14, 10]} />
        <meshStandardMaterial color={shade} roughness={0.82} />
      </mesh>
      <mesh position={[0, 0.96, 0.335]}>
        <boxGeometry args={[0.026, 0.54, 0.024]} />
        <meshStandardMaterial color={deepShade} roughness={0.88} />
      </mesh>
      {[[-0.18, 1.02], [0.18, 1.02]].map(([x, y]) => (
        <mesh key={x} position={[x, y, 0.33]} rotation={[0.12, 0, x > 0 ? -0.08 : 0.08]}>
          <capsuleGeometry args={[0.01, 0.34, 4, 8]} />
          <meshStandardMaterial color={highlight} transparent opacity={0.3} roughness={0.78} />
        </mesh>
      ))}

      {clothing === "Hoodie" ? (
        <group>
          <mesh position={[0, 1.24, -0.06]} rotation={[0.5, 0, 0]}>
            <torusGeometry args={[0.27, 0.095, 12, 24]} />
            <ClothMaterial color={clothColor} roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.82, 0.315]} rotation={[0.25, 0, 0]}>
            <boxGeometry args={[0.36, 0.17, 0.075]} />
            <meshStandardMaterial color={shade} roughness={0.88} />
          </mesh>
          {[-0.055, 0.055].map((x) => (
            <mesh key={x} position={[x, 1.14, 0.335]} rotation={[0.25, 0, x > 0 ? -0.12 : 0.12]}>
              <capsuleGeometry args={[0.009, 0.28, 4, 8]} />
              <meshStandardMaterial color="#e2e8f0" roughness={0.62} />
            </mesh>
          ))}
        </group>
      ) : null}

      {clothing === "ShirtCrewNeck" || clothing === "ShirtVNeck" ? (
        <group>
          <mesh position={[0, 1.26, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.16, 0.035, 8, 22]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.6} />
          </mesh>
          {clothing === "ShirtVNeck" ? (
            <mesh position={[0, 1.18, 0.33]} rotation={[0.18, 0, Math.PI]}>
              <coneGeometry args={[0.1, 0.18, 3]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.58} />
            </mesh>
          ) : null}
          <mesh position={[0, 0.91, 0.35]}>
            <boxGeometry args={[0.24, 0.055, 0.026]} />
            <meshStandardMaterial color={highlight} transparent opacity={0.28} roughness={0.78} />
          </mesh>
        </group>
      ) : null}

      {clothing === "BlazerShirt" || clothing === "BlazerSweater" ? (
        <group>
          <mesh position={[0, 1.1, 0.315]} rotation={[0.18, 0, Math.PI]}>
            <coneGeometry args={[0.15, 0.28, 3]} />
            <meshStandardMaterial
              color={clothing === "BlazerSweater" ? "#cbd5e1" : "#f8fafc"}
              roughness={0.55}
            />
          </mesh>
          {[-0.16, 0.16].map((x) => (
            <mesh
              key={x}
              position={[x, 1.08, 0.31]}
              rotation={[0.15, 0, x > 0 ? 0.52 : -0.52]}
            >
              <boxGeometry args={[0.074, 0.32, 0.034]} />
              <meshStandardMaterial color={deepShade} roughness={0.66} />
            </mesh>
          ))}
          {[0.98, 0.84].map((y) => (
            <mesh key={y} position={[0.055, y, 0.365]}>
              <sphereGeometry args={[0.017, 8, 8]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.35} />
            </mesh>
          ))}
        </group>
      ) : null}

      {clothing === "Overall" ? (
        <group>
          <mesh position={[0, 1.2, 0]}>
            <capsuleGeometry args={[0.32, 0.12, 8, 16]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.7} />
          </mesh>
          {[-0.15, 0.15].map((x) => (
            <mesh key={x} position={[x, 1.16, 0.325]} rotation={[0.15, 0, 0]}>
              <boxGeometry args={[0.07, 0.36, 0.032]} />
              <ClothMaterial color={clothColor} roughness={0.8} />
            </mesh>
          ))}
          <mesh position={[0, 0.95, 0.35]}>
            <boxGeometry args={[0.24, 0.16, 0.034]} />
            <meshStandardMaterial color={shade} roughness={0.88} />
          </mesh>
          {[-0.15, 0.15].map((x) => (
            <mesh key={`overall-button-${x}`} position={[x, 1.02, 0.37]}>
              <sphereGeometry args={[0.018, 8, 8]} />
              <meshStandardMaterial color="#fbbf24" roughness={0.3} metalness={0.3} />
            </mesh>
          ))}
        </group>
      ) : null}
    </group>
  );
}

export default function AvatarRig({
  config,
  animation = "idle",
  onAnimationEnd,
  minimal = false,
}) {
  const cfg = useMemo(() => normalizeAvatarConfig(config), [config]);

  const rootRef = useRef();
  const headRef = useRef();
  const torsoRef = useRef();
  const armLRef = useRef();
  const armRRef = useRef();
  const legLRef = useRef();
  const legRRef = useRef();
  const eyeLRef = useRef();
  const eyeRRef = useRef();
  const mouthOpenRef = useRef();
  const sparklesRef = useRef();

  const animState = useRef({ name: "idle", start: 0, pending: false, ended: false });
  const blinkState = useRef({ next: 2.5, until: 0 });

  useEffect(() => {
    animState.current = {
      name: animation || "idle",
      start: 0,
      pending: true,
      ended: false,
    };
  }, [animation]);

  const skin = getAvatarColor("skinColor", cfg.skinColor, "#f5d0b5");
  const hair = getAvatarColor("hairColor", cfg.hairColor, "#3f2a1d");
  const cloth = getAvatarColor("clothingColor", cfg.clothingColor, "#1e3a8a");
  const iris = getAvatarColor("eyeColor", cfg.eyeColor, "#6b4423");

  const bodyScale = BODY_SCALE[cfg.bodyType] || BODY_SCALE.Regular;
  const faceScale = FACE_SCALE[cfg.faceShape] || FACE_SCALE.Round;
  const idle = PERSONALITY_IDLE[cfg.personality] || PERSONALITY_IDLE.Energetic;

  const isPlaying = animation && animation !== "idle";
  const expression = isPlaying ? ANIMATION_EXPRESSIONS[animation] || {} : {};
  const eyes = expression.eyes || cfg.eyes;
  const mouth = expression.mouth || cfg.mouth;
  const eyebrows = expression.eyebrows || cfg.eyebrows;

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const anim = animState.current;

    if (anim.pending) {
      anim.start = t;
      anim.pending = false;
    }

    const root = rootRef.current;
    const head = headRef.current;
    const torso = torsoRef.current;
    const armL = armLRef.current;
    const armR = armRRef.current;
    const legL = legLRef.current;
    const legR = legRRef.current;
    if (!root || !head || !armL || !armR) return;

    // ---- Idle base layer (always running, personality-tuned) ----
    const s = idle.speed;
    root.position.y = Math.sin(t * s * 2) * idle.bob;
    root.rotation.z = Math.sin(t * s) * idle.sway;
    head.rotation.y = Math.sin(t * 0.6) * idle.look;
    head.rotation.x = Math.sin(t * s * 0.8) * 0.03;
    head.rotation.z = 0;
    if (torso) {
      const breathe = 1 + Math.sin(t * s * 2.4) * 0.015;
      torso.scale.set(breathe, 1, breathe);
    }
    let armLz = -0.15 - Math.sin(t * s * 2) * 0.04;
    let armRz = 0.15 + Math.sin(t * s * 2) * 0.04;
    let armRx = 0;
    let armRy = 0;
    if (legL && legR) {
      legL.rotation.x = 0;
      legR.rotation.x = 0;
    }

    // ---- Blink layer (procedural, costs nothing) ----
    const eyeL = eyeLRef.current;
    const eyeR = eyeRRef.current;
    const blink = blinkState.current;
    if (t > blink.next) {
      blink.until = t + 0.13;
      blink.next = t + 2 + Math.random() * 4;
    }
    const blinking = t < blink.until;
    if (eyeL && eyeR) {
      const blinkScale = blinking ? 0.08 : 1;
      eyeL.scale.y = lerp(eyeL.scale.y, blinkScale, Math.min(1, delta * 30));
      eyeR.scale.y = lerp(eyeR.scale.y, blinkScale, Math.min(1, delta * 30));
    }

    // ---- One-shot / looping animation overlay ----
    const name = anim.name;
    const elapsed = t - anim.start;
    const duration = ANIMATION_DURATIONS[name];
    const progress = duration ? clamp01(elapsed / duration) : 0;
    // Fade the overlay in fast, and out near the end of one-shots.
    const weight = duration
      ? Math.min(easeOut(clamp01(elapsed / 0.25)), easeInOut(clamp01((1 - progress) / 0.2)))
      : 1;

    if (name === "wave") {
      const raised = 2.35 + Math.sin(elapsed * 11) * 0.28;
      armRz = lerp(armRz, raised, weight);
      head.rotation.z = lerp(head.rotation.z, -0.12, weight);
    } else if (name === "celebrate") {
      armRz = lerp(armRz, 2.7, weight);
      armLz = lerp(armLz, -2.7, weight);
      root.position.y += Math.abs(Math.sin(elapsed * 7)) * 0.16 * weight;
      root.rotation.y = Math.sin(elapsed * 3.2) * 0.14 * weight;
      head.rotation.x = lerp(head.rotation.x, -0.1, weight);
    } else if (name === "think") {
      armRz = lerp(armRz, 2.05, weight);
      armRy = lerp(0, -1.0, weight);
      head.rotation.z = lerp(head.rotation.z, 0.16, weight);
      head.rotation.x = lerp(head.rotation.x, 0.1, weight);
    } else if (name === "sad") {
      head.rotation.x = lerp(head.rotation.x, 0.34, weight);
      armLz = lerp(armLz, -0.05, weight);
      armRz = lerp(armRz, 0.05, weight);
      root.position.y -= 0.03 * weight;
    } else if (name === "talk") {
      armRz = lerp(armRz, 0.7 + Math.sin(elapsed * 5) * 0.2, weight * 0.8);
      const mouthOpen = mouthOpenRef.current;
      if (mouthOpen) {
        mouthOpen.scale.y = 0.4 + Math.abs(Math.sin(elapsed * 9)) * 0.75;
      }
    } else if (name === "walk") {
      const swing = Math.sin(elapsed * 7) * 0.55;
      if (legL && legR) {
        legL.rotation.x = swing;
        legR.rotation.x = -swing;
      }
      armLz = -0.15 + swing * 0.4;
      armRz = 0.15 - swing * 0.4;
      root.position.y += Math.abs(Math.sin(elapsed * 7)) * 0.03;
    }

    armL.rotation.z = armLz;
    armR.rotation.z = armRz;
    armR.rotation.x = armRx;
    armR.rotation.y = armRy;

    if (duration && progress >= 1 && !anim.ended) {
      anim.ended = true;
      if (onAnimationEnd) onAnimationEnd(name);
    }

    // ---- Ambient sparkles ----
    const sparkles = sparklesRef.current;
    if (sparkles) {
      sparkles.rotation.y = t * 0.35;
      sparkles.children.forEach((child, i) => {
        child.position.y = 1.2 + Math.sin(t * 1.4 + i * 2.1) * 0.35;
      });
    }
  });

  const isCovered = cfg.top === "Hijab";

  return (
    <group>
      <group ref={rootRef}>
        {/* Legs */}
        <Leg side={-1} legRef={legLRef} />
        <Leg side={1} legRef={legRRef} />

        {/* Torso + outfit details */}
        <group ref={torsoRef}>
          <Outfit clothing={cfg.clothing} clothColor={cloth} bodyScale={bodyScale} />
        </group>

        {/* Body gadgets (backpack / medal) */}
        <Gadget variant={cfg.gadget} bodyScale={bodyScale} />

        {/* Arms (group origin = shoulder so rotation waves naturally) */}
        <group ref={armLRef} position={[-0.42 * bodyScale[0], 1.16, 0]}>
          <mesh position={[0, -0.24, 0]}>
            <capsuleGeometry args={[0.083, 0.35, 8, 14]} />
            <ClothMaterial color={cloth} />
          </mesh>
          <mesh position={[0, -0.39, 0]} scale={[1.05, 0.42, 1.05]}>
            <sphereGeometry args={[0.082, 10, 8]} />
            <meshStandardMaterial color={shadeHex(cloth, 0.72)} roughness={0.82} />
          </mesh>
          <Hand skin={skin} side={-1} />
          {cfg.gadget === "Watch" ? <WristWatch /> : null}
        </group>
        <group ref={armRRef} position={[0.42 * bodyScale[0], 1.16, 0]}>
          <mesh position={[0, -0.24, 0]}>
            <capsuleGeometry args={[0.083, 0.35, 8, 14]} />
            <ClothMaterial color={cloth} />
          </mesh>
          <mesh position={[0, -0.39, 0]} scale={[1.05, 0.42, 1.05]}>
            <sphereGeometry args={[0.082, 10, 8]} />
            <meshStandardMaterial color={shadeHex(cloth, 0.72)} roughness={0.82} />
          </mesh>
          <Hand skin={skin} side={1} />
        </group>

        {/* Neck */}
        <mesh position={[0, 1.32, 0]}>
          <cylinderGeometry args={[0.11, 0.13, 0.14, 16]} />
          <SkinMaterial color={skin} roughness={0.55} />
        </mesh>

        {/* Head */}
        <group ref={headRef} position={[0, 1.78, 0]}>
          <group scale={faceScale}>
            <mesh>
              <sphereGeometry args={[0.5, 40, 30]} />
              <SkinMaterial color={skin} roughness={0.46} />
            </mesh>
            <mesh position={[0, -0.24, 0.08]} scale={[0.82, 0.42, 0.76]}>
              <sphereGeometry args={[0.28, 18, 12]} />
              <SkinMaterial color={mixHex(skin, "#ffffff", 0.08)} roughness={0.5} />
            </mesh>

            {/* Ears (hidden under hijab) */}
            {!isCovered
              ? [-1, 1].map((side) => <Ear key={side} side={side} skin={skin} />)
              : null}

            {/* Face */}
            <Eye x={-0.18} variant={eyes} irisColor={iris} skin={skin} groupRef={eyeLRef} />
            <Eye x={0.18} variant={eyes} irisColor={iris} skin={skin} groupRef={eyeRRef} />
            <Eyebrows variant={eyebrows} color={hair} />
            <Nose skin={skin} />
            {/* Cheek blush */}
            {[-0.28, 0.28].map((x) => (
              <mesh key={x} position={[x, -0.12, 0.38]} scale={[1, 0.6, 0.4]}>
                <sphereGeometry args={[0.07, 10, 10]} />
                <meshStandardMaterial
                  color="#fb7185"
                  transparent
                  opacity={0.3}
                  roughness={0.9}
                />
              </mesh>
            ))}
            <Mouth type={mouth} openRef={mouthOpenRef} />
            <FacialHair variant={cfg.facialHair} color={hair} />
            <Glasses variant={cfg.accessories} />
            <Hair style={cfg.top} color={hair} />
            <HeadGadget variant={cfg.gadget} />
          </group>
        </group>
      </group>

      {!minimal ? (
        <group ref={sparklesRef}>
          {[0, 1, 2].map((i) => (
            <mesh
              key={i}
              position={[
                Math.cos((i / 3) * Math.PI * 2) * 1.15,
                1.2,
                Math.sin((i / 3) * Math.PI * 2) * 1.15,
              ]}
            >
              <sphereGeometry args={[0.035, 8, 8]} />
              <meshStandardMaterial
                color={i === 0 ? "#facc15" : i === 1 ? "#38bdf8" : "#ffffff"}
                emissive={i === 0 ? "#facc15" : i === 1 ? "#38bdf8" : "#ffffff"}
                emissiveIntensity={0.7}
              />
            </mesh>
          ))}
        </group>
      ) : null}
    </group>
  );
}
