import React, { useMemo, useRef } from "react";
import { PanResponder, View, StyleSheet } from "react-native";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import AvatarRig from "./AvatarRig";
import SceneEnvironment, { SCENE_SETTINGS } from "./SceneEnvironment";
import { normalizeAvatarConfig, getAvatarColor } from "../../utils/avatarBuilder";

/*
 * Interactive 3D stage for the avatar. "@react-three/fiber" resolves to the
 * expo-gl native build on Android/iOS (via the package's react-native field)
 * and to the DOM WebGL build on web, so one import serves all platforms.
 *
 * Gestures use PanResponder (works on Android, iOS and react-native-web):
 *   one finger drag  -> orbit the character
 *   two finger pinch -> zoom
 */

const ZOOM_MIN = 3.2;
const ZOOM_MAX = 6.5;

function Orbiter({ rotationRef, autoRotate, children }) {
  const groupRef = useRef();

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const rot = rotationRef.current;
    const now = Date.now();

    if (autoRotate && now - rot.lastTouch > 2500) {
      rot.target += delta * 0.35;
    }

    group.rotation.y += (rot.target - group.rotation.y) * Math.min(1, delta * 8);
  });

  return <group ref={groupRef}>{children}</group>;
}

function CameraRig({ rotationRef, lookAtY }) {
  const camera = useThree((state) => state.camera);

  useFrame((_, delta) => {
    const rot = rotationRef.current;
    camera.position.z += (rot.zoom - camera.position.z) * Math.min(1, delta * 6);
    camera.lookAt(0, lookAtY, 0);
  });

  return null;
}

class StageErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.log("Avatar 3D stage failed, using fallback:", error?.message);
  }

  render() {
    if (this.state.failed) return this.props.fallback || null;
    return this.props.children;
  }
}

export default function AvatarStage({
  config,
  animation = "idle",
  onAnimationEnd,
  interactive = true,
  autoRotate = true,
  quality = "high",
  minimal = false,
  transparent = false,
  zoom = 4.6,
  style,
  fallback = null,
}) {
  const cfg = useMemo(() => normalizeAvatarConfig(config), [config]);

  // Fantasy scenes bring their own sky/fog; Studio uses the user's color.
  const sceneSettings =
    !minimal && !transparent ? SCENE_SETTINGS[cfg.scene] || null : null;
  const bg =
    sceneSettings?.bg ||
    getAvatarColor("backgroundColor", cfg.backgroundColor, "#dbeafe");
  const isStudio = !sceneSettings;

  const rotationRef = useRef({
    target: 0,
    zoom,
    lastTouch: 0,
    lastDx: 0,
    pinchStartDist: 0,
    pinchStartZoom: zoom,
  });

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        // Claim horizontal drags and pinches only, so the stage can live inside
        // a vertical ScrollView without stealing its scroll gesture.
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (evt, gesture) =>
          interactive &&
          ((evt.nativeEvent.touches?.length || 0) >= 2 ||
            (Math.abs(gesture.dx) > 6 && Math.abs(gesture.dx) > Math.abs(gesture.dy))),
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: () => {
          const rot = rotationRef.current;
          rot.lastDx = 0;
          rot.pinchStartDist = 0;
          rot.lastTouch = Date.now();
        },
        onPanResponderMove: (evt, gesture) => {
          const rot = rotationRef.current;
          rot.lastTouch = Date.now();

          const touches = evt.nativeEvent.touches;
          if (touches && touches.length >= 2) {
            const dx = touches[0].pageX - touches[1].pageX;
            const dy = touches[0].pageY - touches[1].pageY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (!rot.pinchStartDist) {
              rot.pinchStartDist = dist;
              rot.pinchStartZoom = rot.zoom;
              return;
            }

            const next = rot.pinchStartZoom * (rot.pinchStartDist / dist);
            rot.zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, next));
            return;
          }

          rot.pinchStartDist = 0;
          const delta = gesture.dx - rot.lastDx;
          rot.lastDx = gesture.dx;
          rot.target += delta * 0.012;
        },
        onPanResponderRelease: () => {
          rotationRef.current.lastTouch = Date.now();
        },
      }),
    [interactive]
  );

  const dpr = quality === "low" ? 1 : [1, 2];
  const lookAtY = minimal ? 1.05 : 0.95;

  return (
    <View style={[styles.wrap, style]} {...(interactive ? panResponder.panHandlers : {})}>
      <StageErrorBoundary fallback={fallback}>
        <Canvas
          dpr={dpr}
          gl={{ antialias: quality !== "low", alpha: transparent }}
          camera={{ position: [0, 1.05, zoom], fov: 35 }}
          style={styles.canvas}
        >
          {!transparent ? <color attach="background" args={[bg]} /> : null}
          {sceneSettings?.fog ? <fog attach="fog" args={sceneSettings.fog} /> : null}

          {/* Soft three-point portrait lighting for stronger facial depth. */}
          <hemisphereLight args={["#ffffff", "#94a3b8", 0.62]} />
          <ambientLight intensity={0.24} />
          <directionalLight position={[3.2, 5.2, 4.4]} intensity={1.55} color="#fff7ed" />
          <directionalLight position={[-4.5, 3.1, 2.4]} intensity={0.48} color="#dbeafe" />
          <pointLight position={[-3.2, 2.2, -3.4]} intensity={0.72} color="#7dd3fc" />
          <spotLight
            position={[0, 3.4, 2.6]}
            angle={0.44}
            penumbra={0.8}
            intensity={0.48}
            color="#ffffff"
          />

          {/* Soft halo behind the character for depth (studio mode only) */}
          {!minimal && isStudio ? (
            <mesh position={[0, 1.1, -1.4]}>
              <circleGeometry args={[1.5, 40]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.14} />
            </mesh>
          ) : null}

          <CameraRig rotationRef={rotationRef} lookAtY={lookAtY} />

          <Orbiter rotationRef={rotationRef} autoRotate={autoRotate}>
            <AvatarRig
              config={cfg}
              animation={animation}
              onAnimationEnd={onAnimationEnd}
              minimal={minimal}
            />

            {/* Fantasy environment rotates with the character like a diorama */}
            {!minimal ? <SceneEnvironment scene={cfg.scene} /> : null}

            {!minimal ? (
              <group>
                {/* Studio ground disc (scenes bring their own ground) */}
                {isStudio ? (
                  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
                    <circleGeometry args={[1.45, 40]} />
                    <meshStandardMaterial color="#ffffff" transparent opacity={0.35} />
                  </mesh>
                ) : null}
                {/* Soft contact shadow under the character */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} scale={[1, 0.55, 1]}>
                  <circleGeometry args={[0.55, 32]} />
                  <meshStandardMaterial color="#0f172a" transparent opacity={0.24} />
                </mesh>
              </group>
            ) : null}
          </Orbiter>
        </Canvas>
      </StageErrorBoundary>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: "hidden",
  },
  canvas: {
    flex: 1,
  },
});
