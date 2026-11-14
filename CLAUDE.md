@AGENTS.md

# Pixellap Web — Project Rules

Next.js frontend for the bilingual (EN/AR) Pixellap site. All content comes from the Laravel API in
`../pixellap-api` (contract: `../pixellap-api/docs/API.md`).

## Stack

- **Next.js 16** (App Router, Turbopack, `cacheComponents: true` + `partialPrefetching`), React 19, TypeScript strict.
  This Next version differs from older training data: read `node_modules/next/dist/docs/` before using an API.
  Key differences we rely on: `src/proxy.ts` (not middleware), async `params`, `PageProps<'/route'>` / `LayoutProps`
  globals, `'use cache'` + `cacheTag`/`cacheLife`, `revalidateTag(tag, profile)`, `error.tsx` gets `{ error, retry }`.
- Tailwind CSS v4 (CSS-first `@theme` in `src/styles/globals.css`, Turbopack loader), next-intl (routing only),
  next-themes, Motion, GSAP + Lenis, react-hook-form + zod, lucide-react, three / R3F.
- Commands: `npm run dev` · `npm run build` · `npm run lint` · `npm run typecheck` · `npm run format`.
  `npm run build` prerenders pages from the API — **the API must be running** (`php artisan serve` in pixellap-api).

## Rules

- **Server components by default.** `'use client'` only for interactivity, browser APIs, animation or 3D.
- **No hardcoded user-facing copy.** Text comes from the API: page/section content from its endpoint,
  interface strings from `/site` `ui_strings`:
  - client: `const { t } = useSite(); t('nav.services')`
  - server: `const t = await getT(locale)` (or `createTranslator(site.ui_strings)` when `site` is at hand).
    Missing string → add it to `pixellap-api/database/seeders/data/ui_strings.php` (EN + proper MSA Arabic) and re-seed.
    next-intl message files are NOT used.
- **RTL-safe always.** Logical properties only: `ms/me/ps/pe/start/end/inset-inline`, `text-start/text-end`,
  `border-s/e`, `rounded-s/e`. Never `left/right`, `ml/mr`, `pl/pr`, `text-left/right`. Icons that imply direction
  (arrows, chevrons) get `rtl:-scale-x-100`. Emails, phones and numbers that must stay LTR get `dir="ltr"`.
- **Colors only through tokens** (`bg-surface`, `text-muted`, `border-border`, `bg-primary`, `text-danger`…).
  Tokens live in `src/styles/globals.css` (dark on `:root`/`.dark`, light on `.light`). No hex/rgb or Tailwind
  palette colors in components. Theme variants: `dark:` / `light:`.
- **3D** code lives in `src/components/three` and is always loaded with `next/dynamic(..., { ssr: false })`
  from a client component. Logo grid data: `src/lib/brand/logoGrid.ts`.
- **Motion:** respect `prefers-reduced-motion` everywhere — Motion inside `<MotionConfig reducedMotion="user">`,
  GSAP/Lenis guarded with `usePrefersReducedMotion()`, CSS animations are neutralised globally.
  Lenis is driven by the GSAP ticker (`SmoothScroll`); lock scrolling with `lockScroll()` from `src/lib/motion/lenis`.
- **Prerender-safe:** no `new Date()`, `Math.random()`, `headers()`/`searchParams` in server components of
  prerendered routes. Request-time data goes in a client component or behind `<Suspense>`.
- **Links:** always `Link`/`useRouter`/`usePathname` from `@/i18n/navigation` (locale-aware).
- Every page under `[locale]` starts with `const locale = await resolveLocale(params)` (validates + `setRequestLocale`)
  and exports `generateMetadata` via `buildMetadata()` (`src/lib/seo/metadata.ts`).

## API layer (`src/lib/api`)

- `types.ts` mirrors `../pixellap-api/docs/api-types.ts` — **keep them identical** (copy the file when the API changes).
- `client.ts` (`server-only`): `apiGet<T>(path, { locale, tags })` → throws `ApiError`.
- `endpoints.ts`: `getSite`, `getHome`, `getPage`, `getCategories`, `getCategory`, `getSitemap` — `'use cache'` +
  `cacheTag` + `cacheLife('hours')`, wrapped in React `cache()`. A 404 calls `notFound()`.
- Cache tags = the API's tags (`site`, `home`, `categories`, `category:{slug}`, `page:{key}`, `sitemap`).
  The API calls `POST /api/revalidate` (header `X-Revalidate-Secret`) → `revalidateTag(tag, { expire: 0 })`.
- Contact form posts through the Server Action `src/app/[locale]/contact/actions.ts` with `X-Site-Key` and
  `X-Client-IP` (visitor IP) — never from the browser.

## Home hero (3D)

- `components/sections/hero/`: `Hero` (server copy = LCP) → `HeroStage` (sticky pin, GSAP scrub → `progress` ref)
  → `SceneGate` (tier decision, poster/video/scene, pause off-screen) → `three/PixelScene` (dynamic, ssr:false).
- Tiers (`src/lib/device.ts`): static (reduced motion / no WebGL2) · video (weak mobile or Save-Data, needs the
  CMS loop video) · low (32 cubes, no postfx, dpr ≤ 1.25) · high. `PerformanceMonitor` drops high→low once.
  **Dev only:** force with `?tier=high|low|video|static`.
- All cube motion is in ONE `useFrame` (`three/PixelCubes.tsx`); layouts are precomputed in `three/layouts.ts`.
  Never add React state per frame. Scratch objects live in refs (React Compiler forbids mutating memo values).
- Reflections come from `three/StudioEnvironment.tsx` (lightformer panels → PMREM). Do not use drei
  `<Environment>`: it bundles HDR/EXR loaders. No network assets in the scene.
- Budgets: 3D path ≤ 250 KB gzip (three+R3F ≈ 233 KB, scene ≈ 11 KB; postprocessing ≈ 22 KB lazy, high+dark only).
  Nothing heavy in the initial route: the scene, GSAP, Lenis, Motion (menu / reel dialog) load after idle or on use.
- Showreel: `ui/VideoModal` intercepts any link to `#reel` (YouTube/Vimeo privacy embeds or direct files).

## Sections & motion conventions

- Home renders `/home` sections in API order (`app/[locale]/page.tsx` → `renderSection`). Sections live in
  `components/sections/{home,about}`; shared: `SectionHeading`, `ContactCtaBand`, `PageHero`, `ui/CtaLink`.
- **Reveal on scroll:** add `data-reveal` (stagger with `style={{'--reveal-i': n}}`). `motion/RevealObserver` (one shared
  IntersectionObserver) only hides elements that start below the fold, so above-the-fold text never waits for JS.
- **Above-the-fold text is always plain server HTML** (no JS-gated or opacity-0 animations). The hero title reveal is
  pure CSS and starts at opacity 0.001. Phones: the hero visual is an inline SVG until first interaction
  (keeps the headline as LCP).
- Islands: `useInView` / `observe()` (`lib/hooks/useInView.ts`) share observers; GSAP is only ever `import()`ed after
  idle (`StackingCards`, `HeroStage`, `SmoothScroll`). Never import gsap/motion statically in always-loaded code.
- Fonts: IBM Plex Sans Arabic 400 + 700 only — use `font-normal` / `font-bold` (no light/medium/semibold).
- Numbers inside RTL text: wrap in `<bdi dir="ltr">`. Pixel numerals: `brand/PixelDigits`.
- Page transitions: `motion/PageTransition` (CSS pixel grid, same-locale internal links only, focus → `<main>`).
- Prefer zero-JS patterns: FAQ = native `<details name="faq-{scope}">` (`home/FaqSection`, reused on category pages);
  stat counters = CSS `@property --n` + `.stat-count` driven by the reveal observer (no island).
- Plurals: `plural(t, locale, 'services.count', n)` (`lib/site/format.ts`) picks `{base}_{Intl.PluralRules category}`
  — Arabic needs zero/one/two/few/many/other keys in the seeder. `interpolate()` fills `{placeholders}`.
- Services: `/services` = `services/ServicesBento` (fixed 2-large + 4-medium layout); `/services/[slug]` = CategoryHero
  (breadcrumb + BreadcrumbList), overview (`.prose-rich`), sticky `ServiceIndex` / mobile `ServiceChips`, `ServiceItemCard`
  ("Request this service" → `/contact?service=&item=` prefills the form), FAQ, `CategoryRail`, CTA, Service JSON-LD.
- SEO: `app/sitemap.ts` (from GET /sitemap, en/ar alternates) and `app/robots.ts`. `buildMetadata` falls back to
  `settings.og_image` for pages without their own image.
- After seeding new ui strings, the Next data cache may still hold the old `/site`: POST the `site` tag to
  `/api/revalidate` (the API's webhook does this automatically for admin edits, not for seeders).

## Production

- Runs with `next start` under PM2 (`ecosystem.config.cjs`, 1 instance, 127.0.0.1:3000) behind Nginx; deploy kit and
  runbook in `../pixellap-api/deploy/README.md` (`deploy-web.sh` builds each release in its own folder, `current` symlink,
  `--rollback`). Env template: `.env.production.example` (values are baked in at build time).
- Security headers + CSP live in `next.config.ts` (no nonces: pages are prerendered, so scripts need `'unsafe-inline'`).
  **Any new external origin** (embed, CDN, analytics) must be added to the CSP there, or it is blocked in production.
  No `eval`/`new Function` (Zod runs with `z.config({ jitless: true })`).
- `compress: false` (Nginx compresses), `poweredByHeader: false`; `images.remotePatterns` = the API_URL host's `/storage/**` only.
- Nginx overwrites `X-Forwarded-For` with the visitor IP — the contact action relies on its first entry.

## Environment

`.env.local` (gitignored) — see `.env.example`: `NEXT_PUBLIC_SITE_URL`, `API_URL`, `API_SITE_KEY`, `REVALIDATE_SECRET`
(the last two must equal the values in `pixellap-api/.env`). Only `NEXT_PUBLIC_*` may be read in client code.

## Layout

- `src/app/[locale]/` — pages (root layout is `[locale]/layout.tsx`: `<html lang dir>`, providers, header/footer).
- `src/components/{layout,brand,contact,sections,providers,ui,three}` · `src/lib/*` · `src/styles/{globals.css,fonts.ts}`.
- Fonts: only `src/styles/fonts.ts` (IBM Plex Sans Arabic now; swap to RH-Zak via next/font/local there).
- Brand assets: `public/brand/` (logo / mark, color and white variants).
