import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";

/*
 * Fantasy 3D environments that surround the avatar like a diorama.
 * Everything is procedural low-poly geometry with emissive accents and fog,
 * tuned to stay well under mobile GPU budgets (< 80 draw calls per scene).
 *
 * Scene metadata (background + fog) lives in SCENE_SETTINGS so AvatarStage
 * can apply it to the canvas.
 */

// Deterministic pseudo-random so scenes look identical on every render.
const rand = (i, salt = 0) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const SCENE_SETTINGS = {
  Studio: null, // plain studio look — uses the user's background color
  FantasyGarden: { bg: "#2b3a55", fog: ["#2b3a55", 6.5, 14] },
  NightSky: { bg: "#0b1026", fog: ["#0b1026", 8, 17] },
  Space: { bg: "#0a0616", fog: null },
  Meadow: { bg: "#7cc4e8", fog: ["#a5d8f3", 9, 20] },
};

function Fireflies({ count = 10, color = "#fde047", area = 2.4 }) {
  const groupRef = useRef();

  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: (rand(i, 1) - 0.5) * 2 * area,
        z: (rand(i, 2) - 0.5) * 2 * area,
        y: 0.4 + rand(i, 3) * 1.9,
        speed: 0.5 + rand(i, 4) * 1.3,
        phase: rand(i, 5) * Math.PI * 2,
      })),
    [count, area]
  );

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const group = groupRef.current;
    if (!group) return;

    group.children.forEach((child, i) => {
      const s = seeds[i];
      if (!s) return;
      child.position.y = s.y + Math.sin(t * s.speed + s.phase) * 0.28;
      child.position.x = s.x + Math.sin(t * 0.4 + s.phase) * 0.22;
    });
  });

  return (
    <group ref={groupRef}>
      {seeds.map((s, i) => (
        <mesh key={i} position={[s.x, s.y, s.z]}>
          <sphereGeometry args={[0.032, 6, 6]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
}

function Stars({ count = 45, colorA = "#ffffff", colorB = "#c4b5fd" }) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = rand(i, 11) * Math.PI * 2;
        const radius = 3.5 + rand(i, 12) * 4;
        return {
          x: Math.cos(angle) * radius,
          y: 1 + rand(i, 13) * 5,
          z: Math.sin(angle) * radius,
          r: 0.018 + rand(i, 14) * 0.028,
          purple: rand(i, 15) > 0.75,
        };
      }),
    [count]
  );

  return (
    <group>
      {stars.map((s, i) => (
        <mesh key={i} position={[s.x, s.y, s.z]}>
          <sphereGeometry args={[s.r, 5, 5]} />
          <meshBasicMaterial color={s.purple ? colorB : colorA} />
        </mesh>
      ))}
    </group>
  );
}

function Flowers({ count = 9, palette = ["#f9a8d4", "#fdba74", "#fef3c7"] }) {
  const flowers = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = rand(i, 21) * Math.PI * 2;
        const radius = 1.4 + rand(i, 22) * 2.2;
        return {
          x: Math.cos(angle) * radius,
          z: Math.sin(angle) * radius,
          h: 0.14 + rand(i, 23) * 0.12,
          color: palette[i % palette.length],
        };
      }),
    [count, palette]
  );

  return (
    <group>
      {flowers.map((f, i) => (
        <group key={i} position={[f.x, 0, f.z]}>
          <mesh position={[0, f.h / 2, 0]}>
            <cylinderGeometry args={[0.012, 0.016, f.h, 5]} />
            <meshStandardMaterial color="#2f7d3f" roughness={0.8} />
          </mesh>
          <mesh position={[0, f.h + 0.05, 0]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial
              color={f.color}
              emissive={f.color}
              emissiveIntensity={0.35}
              roughness={0.5}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function MushroomHouse({ position, capColor = "#c2571f", scale = 1 }) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Stem / walls */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.5, 0.62, 1, 12]} />
        <meshStandardMaterial color="#e8d5b7" roughness={0.75} />
      </mesh>
      {/* Cap */}
      <mesh position={[0, 1.35, 0]}>
        <coneGeometry args={[1.05, 0.95, 12]} />
        <meshStandardMaterial
          color={capColor}
          emissive={capColor}
          emissiveIntensity={0.12}
          roughness={0.65}
        />
      </mesh>
      {/* Cap dots */}
      {[[-0.4, 1.25, 0.5], [0.45, 1.2, 0.35], [0, 1.5, 0.55]].map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.6} />
        </mesh>
      ))}
      {/* Glowing window + door */}
      <mesh position={[0, 0.55, 0.56]}>
        <boxGeometry args={[0.22, 0.26, 0.06]} />
        <meshBasicMaterial color="#ffb54d" />
      </mesh>
      <mesh position={[0.28, 0.28, 0.54]}>
        <boxGeometry args={[0.18, 0.32, 0.06]} />
        <meshStandardMaterial color="#7c4a21" roughness={0.7} />
      </mesh>
    </group>
  );
}

function CloudPuff({ position, scale = 1 }) {
  return (
    <group position={position} scale={[scale, scale * 0.6, scale]}>
      {[[-0.35, 0, 0], [0, 0.15, 0], [0.38, 0, 0]].map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.32, 10, 10]} />
          <meshStandardMaterial color="#ffffff" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function Ground({ color }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
      <circleGeometry args={[9, 36]} />
      <meshStandardMaterial color={color} roughness={0.95} />
    </mesh>
  );
}

export default function SceneEnvironment({ scene }) {
  if (!scene || scene === "Studio" || !SCENE_SETTINGS[scene]) return null;

  if (scene === "FantasyGarden") {
    return (
      <group>
        <Ground color="#3d6b46" />
        <Flowers count={11} />
        <MushroomHouse position={[-2.6, 0, -4.6]} capColor="#c2571f" scale={1.15} />
        <MushroomHouse position={[0.6, 0, -5.6]} capColor="#b03a2e" scale={1.5} />
        <MushroomHouse position={[3, 0, -4.2]} capColor="#d97706" scale={0.9} />
        <Fireflies count={12} color="#fde047" />
        {/* Warm ambient accent for the dusk mood */}
        <pointLight position={[0, 1.6, -3]} intensity={0.55} color="#ffb54d" distance={8} />
      </group>
    );
  }

  if (scene === "NightSky") {
    return (
      <group>
        <Ground color="#16213a" />
        <Stars count={50} />
        {/* Moon */}
        <mesh position={[-2.3, 3.4, -5]}>
          <sphereGeometry args={[0.5, 18, 18]} />
          <meshBasicMaterial color="#fef9c3" />
        </mesh>
        <pointLight position={[-2.3, 3.4, -4]} intensity={0.5} color="#e0e7ff" distance={12} />
        <Fireflies count={7} color="#93c5fd" />
      </group>
    );
  }

  if (scene === "Space") {
    return (
      <group>
        {/* Moon-like surface with craters */}
        <Ground color="#6b7280" />
        {[[-1.4, 0.9], [1.1, -1.3], [2.2, 0.7]].map(([x, z], i) => (
          <mesh
            key={i}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[x, 0.006, z]}
          >
            <circleGeometry args={[0.32 + i * 0.1, 16]} />
            <meshStandardMaterial color="#4b5563" roughness={1} />
          </mesh>
        ))}
        <Stars count={55} />
        {/* Ringed planet */}
        <group position={[2.5, 2.9, -5.5]} rotation={[0.5, 0, 0.35]}>
          <mesh>
            <sphereGeometry args={[0.7, 18, 18]} />
            <meshStandardMaterial
              color="#8b5cf6"
              emissive="#8b5cf6"
              emissiveIntensity={0.25}
              roughness={0.6}
            />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.05, 0.06, 8, 32]} />
            <meshStandardMaterial
              color="#c4b5fd"
              emissive="#c4b5fd"
              emissiveIntensity={0.3}
              roughness={0.5}
            />
          </mesh>
        </group>
        <pointLight position={[2, 3, -4]} intensity={0.45} color="#c4b5fd" distance={12} />
      </group>
    );
  }

  if (scene === "Meadow") {
    return (
      <group>
        <Ground color="#69a331" />
        <Flowers count={10} palette={["#ffffff", "#fde047", "#fca5a5"]} />
        {/* Sun */}
        <mesh position={[2.6, 3.5, -5]}>
          <sphereGeometry args={[0.55, 16, 16]} />
          <meshBasicMaterial color="#fde047" />
        </mesh>
        <pointLight position={[2.6, 3.5, -4]} intensity={0.5} color="#fef9c3" distance={14} />
        <CloudPuff position={[-2.4, 3.1, -4.6]} scale={1.3} />
        <CloudPuff position={[1.6, 3.9, -5.4]} scale={1} />
        <CloudPuff position={[-0.5, 4.2, -6]} scale={0.8} />
        <Fireflies count={5} color="#ffffff" area={2} />
      </group>
    );
  }

  return null;
}
