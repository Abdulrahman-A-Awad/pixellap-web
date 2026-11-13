3D (three.js / React Three Fiber) components live here.
Always import them through `next/dynamic(() => import(...), { ssr: false })` from a client component,
and render a static fallback when `usePrefersReducedMotion()` is true. Logo data: `src/lib/brand/logoGrid.ts`.
