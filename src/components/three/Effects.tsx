'use client';

import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';

/** High tier + dark theme only. Loaded lazily so other tiers never download postprocessing. */
export default function Effects() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom mipmapBlur luminanceThreshold={0.8} luminanceSmoothing={0.15} intensity={0.6} />
      <Vignette eskil={false} offset={0.22} darkness={0.55} />
    </EffectComposer>
  );
}
