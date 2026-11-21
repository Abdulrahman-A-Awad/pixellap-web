'use client';

import { ContactShadows, PerformanceMonitor } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { lazy, Suspense, type RefObject } from 'react';
import * as THREE from 'three';
import { GridFloor } from './GridFloor';
import { PixelCubes, type PointerState } from './PixelCubes';
import { ShadowBlob } from './ShadowBlob';
import { StudioEnvironment } from './StudioEnvironment';

const Effects = lazy(() => import('./Effects'));

export type SceneTier = 'high' | 'low';
export type SceneTheme = 'dark' | 'light';

export interface PixelSceneProps {
  tier: SceneTier;
  theme: SceneTheme;
  /**
   * Page background (CSS var --bg). Dark: clear colour + fog so the scene melts into the page.
   * Light: the canvas is transparent over the CSS backdrop (white → pearl + lavender glow, SceneGate).
   */
  background: string;
  progress: RefObject<number>;
  pointer: RefObject<PointerState>;
  offsetX: number;
  copySide: -1 | 0 | 1;
  frameloop: 'always' | 'never';
  onReady: () => void;
  /** Sustained low FPS: the gate switches to the low tier (once per session). */
  onDecline: () => void;
}

const PALETTE = {
  dark: {
    key: '#7aa2ff',
    rim: '#8152f8',
    top: '#ffffff',
    keyIntensity: 7,
    rimIntensity: 10,
    topIntensity: 2,
    directional: 2.4,
    envMap: 1.2,
    floorLine: '#8152f8',
    floorDot: '#b9a2ff',
    floorOpacity: 0.9,
    floorFade: 34,
    hemi: 0.35,
  },
  light: {
    key: '#9bb8ff',
    rim: '#a58bff',
    top: '#ffffff',
    keyIntensity: 5.5,
    rimIntensity: 5,
    topIntensity: 6,
    directional: 2.3,
    envMap: 1.1,
    floorLine: '#612fe2',
    floorDot: '#8152f8',
    floorOpacity: 0.13,
    floorFade: 22,
    hemi: 0.75,
  },
} as const;

/** Light-theme fog: the pearl of the CSS backdrop, so far cubes melt into it instead of into grey. */
const LIGHT_FOG = '#eef3fc';

function SceneBackground({ color, theme }: { color: string; theme: SceneTheme }) {
  if (theme === 'light') return <fog attach="fog" args={[LIGHT_FOG, 34, 70]} />;
  return (
    <>
      <color attach="background" args={[color]} />
      <fog attach="fog" args={[color, 30, 62]} />
    </>
  );
}

export default function PixelScene({
  tier,
  theme,
  background,
  progress,
  pointer,
  offsetX,
  copySide,
  frameloop,
  onReady,
  onDecline,
}: PixelSceneProps) {
  const p = PALETTE[theme];
  const high = tier === 'high';

  return (
    <Canvas
      frameloop={frameloop}
      dpr={high ? [1, 1.75] : [1, 1.25]}
      flat={false}
      camera={{ fov: 35, position: [0, 1.2, 30], near: 0.5, far: 140 }}
      gl={{
        antialias: true,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: theme === 'dark' ? 1.3 : 1.15,
        // Transparent in light mode (CSS backdrop shows through); dark paints its own background.
        alpha: true,
        stencil: false,
      }}
      aria-hidden="true"
    >
      <SceneBackground color={background} theme={theme} />

      {high && (
        <PerformanceMonitor bounds={() => [40, 1000]} flipflops={1} onDecline={onDecline} onFallback={onDecline} />
      )}

      {/* Studio reflections from lightformer panels only — no HDR / network assets. */}
      <StudioEnvironment
        formers={[
          { color: p.key, intensity: p.keyIntensity, position: [-8, 3, 9], scale: [10, 7] }, // cool blue key
          { color: p.rim, intensity: p.rimIntensity, position: [9, 1, -7], scale: [6, 14] }, // violet rim
          { color: p.top, intensity: p.topIntensity, position: [0, 10, 0], scale: [14, 14] }, // soft white top
        ]}
      />
      <directionalLight position={[6, 9, 7]} intensity={p.directional} color="#ffffff" />
      {/* Faint fill so shadow faces keep their violet instead of going black. */}
      <hemisphereLight args={['#c9b8ff', '#1a0b40', p.hemi]} />

      <PixelCubes
        count={high ? 64 : 32}
        progress={progress}
        pointer={pointer}
        offsetX={offsetX}
        copySide={copySide}
        envMapIntensity={p.envMap}
        onFirstFrame={onReady}
      />

      <GridFloor lineColor={p.floorLine} dotColor={p.floorDot} opacity={p.floorOpacity} fade={p.floorFade} />

      {/* Light theme: ground the floating cluster (real contact shadow on high, a soft blob on low). */}
      {theme === 'light' &&
        (high ? (
          <ContactShadows
            position={[offsetX, -5.58, 0]}
            scale={[20, 12]}
            resolution={256}
            far={9}
            blur={2.6}
            opacity={0.32}
            color="#3a119e"
          />
        ) : (
          <ShadowBlob x={offsetX} />
        ))}

      {/* Dropping to 'low' unmounts postprocessing immediately. */}
      {high && theme === 'dark' && (
        <Suspense fallback={null}>
          <Effects />
        </Suspense>
      )}
    </Canvas>
  );
}
