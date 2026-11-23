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

- `components/sections/hero/`: `Hero` (server copy = LCP) → `HeroStage` (sticky pin 200svh = 100svh of scroll, GSAP
  scrub → `progress` ref; the copy is NOT faded: it stays for the whole pin and leaves with the stage, so the pin never
  shows an empty stage; subtitle + buttons rise in after the title via `.hero-rise`, pure CSS from opacity 0.001)
  → `SceneGate` (tier decision, poster/video/scene, pause off-screen) → `three/PixelScene` (dynamic, ssr:false).
- Tiers (`src/lib/device.ts`): static (reduced motion / no WebGL2 → matching poster) · video (weak mobile or Save-Data,
  needs a CMS loop video) · low (32 cubes, no postfx, dpr ≤ 1.25) · high. `PerformanceMonitor` drops high→low once.
- Loop videos: `hero.media.{wide,vertical}.{webm,mp4,poster}` (`lib/hero/media.ts`). Vertical when
  `(max-width: 767px), (orientation: portrait)`. `HeroFrame` + `.hero-frame` CSS: the loops are clean (cube only), shown
  full-frame with object-fit cover (wide = anchored to the inline-end side, mirrored in RTL; vertical = bottom);
  dark = edge-masked (desktop: exact 16:9 layer ≤ 72% wide on the end side, copy capped at min(46vw, 620px) so they
  never overlap), light = rounded black stage card (16:9 beside the copy on desktop). Desktop loads the video at once; phones after idle + first interaction (LCP stays the copy).
  **Dev only:** force with `?tier=high|low|video|static`.
- All cube motion is in ONE `useFrame` (`three/PixelCubes.tsx`); layouts are precomputed in `three/layouts.ts`.
  Never add React state per frame. Scratch objects live in refs (React Compiler forbids mutating memo values).
- Light theme: the canvas is transparent (`alpha: true`, no scene background) over `.hero-light-backdrop` (white → pearl +
  lavender glow behind the cluster, rendered by SceneGate); fainter grid with a shorter fade; grounding shadow =
  drei `ContactShadows` on high, `three/ShadowBlob` (one quad) on low. Dark is unchanged.
- Reflections come from `three/StudioEnvironment.tsx` (lightformer panels → PMREM). Do not use drei
  `<Environment>`: it bundles HDR/EXR loaders. No network assets in the scene.
- Desktop (motion allowed): the scene chunk is `import()`ed when `SceneGate` evaluates (parallel to hydration) and the
  scene mounts right after hydration; phones keep the idle gate. Intro = `INTRO_SECONDS` (1.2 s). Lenis lerp 0.13, touch native.
- Budgets: 3D path ≤ 250 KB gzip (three+R3F ≈ 233 KB, scene ≈ 11 KB; postprocessing ≈ 22 KB lazy, high+dark only).
  Nothing heavy in the initial route: the scene, GSAP, Lenis load after idle; Motion reveals use `m.*` + LazyMotion
  (features chunk on first use); menu / reel dialog load on use.
- Showreel: `ui/VideoModal` intercepts any link to `#reel` (YouTube/Vimeo privacy embeds or direct files). `VideoDialog`:
  `--scrim` (rgba(0,0,0,.8)) + blur in both themes, player `w-[min(92vw,calc(88svh*16/9))]` aspect 16:9 (never larger than
  the viewport), 20px corners, spring scale-in, close button top-end (first focus), Esc, backdrop click; unmount stops it.

## Sections & motion conventions

- **Motion system:** tokens in `src/lib/motion.ts` (durations fast .2 / base .45 / slow .8 s, ease-out [0.16,1,0.3,1],
  springs soft 120/20 + snappy, stagger .06–.08, reveal variants fade-up / scale-in / blur-in / slide-start / slide-end),
  mirrored in CSS (`--dur-*`, `--ease-out-expo`, `--ease-spring` (linear() spring), `--ease-pop`).
  `components/motion/MotionProvider` (layout) = LazyMotion (async `domAnimation`) + `MotionConfig reducedMotion="user"`.
- **Section reveals on home = `components/motion/Reveal`** (`variant`, `index` for stagger, `as`): the server HTML is the
  FINAL state; after hydration only elements below 85% of the viewport are set hidden (instantly, unseen) and animate in
  once when they pass the 85% line (IntersectionObserver, works in every browser; reduced motion = nothing). Used by
  `SectionHeading` (eyebrow / title / subtitle / action staggered), About, stats, FAQ, clients, CTA. Inner pages still use
  the CSS `data-reveal` (scroll-driven, progressive). Don't nest a `data-reveal` inside a `Reveal`.
- **Glass navbar:** `layout/Header` = floating pill (`.nav-shell` / `.nav-pill`): centred, max 1200px, 12px from the top,
  always visible (no hide-on-scroll), `--glass-bg` + `backdrop-filter: saturate(180%) blur(20px)`, hairline
  `--glass-border`, `--glass-shadow`; compacts after 24px (64→56 desktop, 56→52 phones, `--pill-h*`, spring easing). No
  backdrop-filter → `--glass-solid`. `--header-h` = the space it occupies (68 / 76px), constant while it compacts.
  `HeaderFallback` renders the same pill. Phones: `MobileMenu` = glass sheet (`.glass-sheet`) dropping from the pill.
- **Surfaces:** `.surface-card` (24px, `corner-shape: squircle` where supported, hairline, dark = `--card-sheen` glass,
  light = layered `--card-shadow`) for services, process, stats, FAQ, help card; `.lift` hover. Buttons: `buttonClasses`
  includes `.btn-press` (spring scale .97). `ui/Magnetic` wraps primary CTAs (fine pointers only, ≤ 7px, own
  `translate`). `.btn-shine` sweep (CTA band). Images: `ui/Parallax` layer (±24px, `.parallax-layer` 48px taller than its
  clipping frame, only while visible) + `group-hover:scale-[1.03]` — remember the extra 48px in `coverSizes` box ratios.
- **Type scale = utilities only** (globals.css, fluid): `text-display` (home hero H1) · `text-page-title` (inner-page H1;
  a category title must fit 2 lines at 1280) · `text-heading` (H2) · `text-card-title` (home stacking-card titles) · `text-title` (H3/cards) · `text-stat` (stat tile numerals) · `text-lead` (subtitles) ·
  `text-meta` (small). Body is 1rem / ar 1.0625rem. Paragraph width: `measure` (65ch). No one-off font sizes.
- **Rhythm:** sections use `section-y`; the header block is always `SectionHeading` (start-aligned; `action` slot for an
  end-side link). Home alternates bands (`tone-surface` on every other content section, set in `page.tsx`); cards use
  `bg-card` (= surface on bg sections, bg on surface sections) so they read on both.
- **PixelField:** corner-only (`corner`, 6–10 squares), lives in the page gutter outside the content column, renders
  ≥ 1400px only, opacity capped by `--pixel-opacity` (0.35 dark / 0.2 light). Never in heroes or the header.
- Images on cards are never under a scrim: text goes on a solid card panel (bento, rail, stacking cards).
- Logo: `variant="horizontal"` in header (40px desktop / 32px below lg) and footer; generated from the stacked logo's paths
  (`public/brand/pixellap-logo-h*.svg`).
- Header height = `--header-h` (68px, 76px from lg: the floating pill + its 12px gap): use `pt-(--header-h)` /
  `calc(var(--header-h) …)`, never a fixed number. Desktop nav = `layout/NavLinks` (active pill measured + slid, hover underline `.nav-link` from the
  reading start). `LanguageSwitch` = segmented "EN | ع" pill (dir=ltr, thumb slides on click); `ThemeToggle` = one SVG
  sun↔moon morph (`.theme-icon-*`). Below lg the header is logo + theme + menu; language, CTA and WhatsApp live in
  `MobileMenu`. The footer has no language/theme toggles.
- WhatsApp: `layout/WhatsAppButton` = floating chat widget (tooltip after 4 s once per session, chat card → wa.me with
  `whatsapp.prefill` + page title; Esc/outside click; lifts above `[data-footer-bar]` through `--wa-lift`). CSS only,
  no Motion. Hidden without a real number (`whatsappDigits`).
- Brand icons: `brand/BrandIcons` (Simple Icons paths, CC0; lucide has none). Footer socials render only networks with a
  URL, in `SOCIAL_ORDER`; hover tint per network in `.social-btn[data-network]`. Pixel glyphs: `brand/PixelIcon`.
- Cover images: `imageSource(asset)` (original file → optimizer) + `coverSizes(asset, rules)` for every `fill` +
  `object-cover` image whose box is taller than the photo — otherwise the browser gets a box-width file that is upscaled
  (soft / pixelated).
- Services cards (`home/StackingCards` + `ServiceCard`), two modes from one markup (`.stack-*`):
  STACK at `(min-width:768px) and (min-height:600px)` (every laptop incl. 1366×657): sticky at header + 16px + i × 10px,
  `min-height: min(100svh − header − 16 − (n − 1) × 10 − 24, 520px)` (the last card ends 24px above the fold; a min-height,
  never a clipping height); copy capped (title 2 lines in stack mode only, excerpt 2 / 1 line below 700px tall, ONE row of
  tags via `ServiceTags` + "+N", first tag always shown truncated), button pinned. GSAP: previous card scale .94 + y −12 +
  shade (`[data-stack-shade]`, `--stack-shade`) fade-in; incoming copy fades up. CAROUSEL on phones / < 600px tall:
  horizontal scroll-snap, one card per view with a peek, full-bleed (`--gutter`), dots. Card layout follows the CARD width
  (container queries `@2xl:`, photo 40%). The count var is `--stack-n` — `--n` is the stat counter's registered
  non-inheriting property. Photos load eagerly with the `thumb` conversion as background placeholder.
- Process: geometry is pure CSS (`.process-*`: one `.process-seg` per step, marker centre → next marker centre, markers
  on the icon chip via `--chip-x` / `--marker-y`). `home/ProcessProgress` links it to the scroll: row = progress 0 when the
  cards row's top reaches 85% of the viewport, 1 when its bottom does (step 4 always completes while visible); vertical
  timeline = the tip follows the 85% line per segment from the marker positions. Writes `--f{i}` per frame (only while
  visible); `ProcessStep` reads the reached count from context → `data-active` (marker pops with `--ease-pop`, card rises).
  Server HTML / reduced motion = all drawn + active. A glow pulse loops along completed segments (keyframes generated per
  step count in `ProcessSection`). Title: `SectionHeading wide` (one line from 1280).
- Brand name: `settings.site_name` is localized ("Pixellap" / "بكسل لاب") — use it everywhere (title suffix via
  `withSiteSuffix`, OG site_name, JSON-LD `name` + `alternateName` from `alternateSiteName(locale)`, footer, WhatsApp chat).
  `withSiteName(text, siteName)` (`lib/site/brand.ts`) still swaps a Latin "Pixellap" left in CMS copy.
- Hero: H1 = `settings.tagline` (the hero has no title); CMS buttons 1 + 2 (defaults Start a project → /contact,
  Explore our services → /services); the "Watch the reel" button is separate and automatic when `showreel_url` is set.
  The services link label comes from the services section `cta` (fallback ui string `actions.view_all_services`).
- Share previews: `buildMetadata` always uses the site sharing image (Settings → SEO, else `public/og-default.jpg`,
  1200×630 JPG) with width/height/alt/type; og:locale `en_US` / `ar_AE` + alternate; twitter summary_large_image.
  Pre-launch, link-preview bots pass the basic auth (API runbook §13).
- Home renders `/home` sections in API order (`app/[locale]/page.tsx` → `renderSection`). The stats render inside the
  About section (`AboutTeaser`: a full-width strip of 4 tiles under the image | text columns); the standalone `StatsSection` only shows on home when About is hidden (and on /about).
  Sections live in `components/sections/{home,about}`; shared: `SectionHeading`, `ContactCtaBand`, `PageHero`, `ui/CtaLink`.
- **Reveal on scroll:** add `data-reveal` (stagger with `style={{'--reveal-i': n}}`). Pure CSS scroll-driven animation
  (`animation-timeline: view()`, in `@supports` + no-preference motion): no JS, never touches server HTML; on-screen
  content is already in its final state; unsupported browsers just show it. Ancestors of `[data-reveal]` must use
  `overflow-clip`, never `overflow-hidden` (that makes them the scroll container `view()` tracks).
  Never mutate server-rendered DOM from outside React (attributes before hydration → hydration mismatch).
- **Above-the-fold text is always plain server HTML** (no JS-gated or opacity-0 animations). The hero title reveal is
  pure CSS and starts at opacity 0.001. Phones: the hero visual is an inline SVG until first interaction
  (keeps the headline as LCP).
- Islands: `useInView` / `observe()` (`lib/hooks/useInView.ts`) share observers; GSAP is only ever `import()`ed after
  idle (`StackingCards`, `HeroStage`, `SmoothScroll`). Never import gsap/motion statically in always-loaded code.
- Fonts: brand font RH-Zak (Arabic + Latin, `next/font/local`): Regular 400 + Bold 700 preloaded — use `font-normal` /
  `font-bold`. Thin 100 is a separate, non-preloaded face for large display text only (`font-display-thin`, ≥ 2.5rem).
  RH-Zak has no "·", "…", arrows or tabular figures: never put "·" in copy/UI; `.stat-count` stacks the CSS counter and
  the final number in ONE grid cell (counter end-aligned, final `visibility: hidden`), so the box keeps its final width.
  Both must stay in flow: the About numerals use the parent's `background-clip: text` (masks with in-flow glyphs only).
  `StatCount` adds an sr-only copy of the value; count-up = 1.4s ease-out-cubic.
  No letter-spacing in Arabic (forced to 0 globally).
- Numbers inside RTL text: wrap in `<bdi dir="ltr">`. Stats read "120+" in both languages (prefix/suffix inside the bdi,
  `.stat-affix` = accent, 0.72em, no gap). About stat tiles: chip + label row, number below, subgrid rows so numbers align. Pixel numerals: `brand/PixelDigits`.
- Page transitions: `motion/PageTransition` (CSS pixel grid, same-locale internal links only, focus → `<main>`).
- FAQ = `home/FaqList` (client, exclusive disclosure accordion: grid-rows 0fr→1fr height animation in every browser,
  `visibility` after close, open card highlighted, + → ×), inside `home/FaqSection` (reused on category pages).
- Prefer zero-JS patterns:
  stat counters = CSS `@property --n` + `.stat-count`, triggered by the tiny `home/StatCount` island (`data-count` in React state).
- Plurals: `plural(t, locale, 'services.count', n)` (`lib/site/format.ts`) picks `{base}_{Intl.PluralRules category}`
  — Arabic needs zero/one/two/few/many/other keys in the seeder. `interpolate()` fills `{placeholders}`.
- Services: `/services` = `services/ServicesBento` (fixed 2-large + 4-medium layout); `/services/[slug]` = CategoryHero
  (breadcrumb + BreadcrumbList), overview (`.prose-rich`), sticky `ServiceIndex` / mobile `ServiceChips`, `ServiceItemCard`
  ("Request this service" → `/contact?service=&item=` prefills the form), FAQ, `CategoryRail`, CTA, Service JSON-LD.
- Contact (`/contact`, `components/contact/*`): `ContactHero` (centred eyebrow/title/subtitle, `.contact-glow`, CSS
  `.hero-rise`) → `QuickContact` (glass cards `.glass-card` WhatsApp / email / call overlapping the hero; each hidden when
  its setting is empty/TODO; WhatsApp = widget prefill with the page title; phone via `formatPhone` + `<bdi dir="ltr">`) →
  form (7/12) + `ContactInfoCard` (5/12, sticky: response chip, hours, address, `layout/SocialLinks`, map `.map-embed`) →
  `NextSteps` (process markup, `ProcessProgress trigger="enter"`) → `ContactFaq` (first 3 home FAQs, `FaqList`, → `/#faq`).
  `ContactForm`: no animation library; floating labels (`.float-*`, placeholder=" "), "Optional" tag in the label,
  service = native radios as chips (`.chip`, "Other" = `OTHER_SERVICE` → sent as null), auto-growing textarea + counter,
  shake on failed submit (`data-attempt` odd/even), error summary (role=alert) and focus on the first invalid field in
  VISUAL order (`shouldFocusError: false` + `focusFirst`), success = `.form-swap` + CSS `PixelCheck` + WhatsApp.
  JSON-LD: `contactPageJsonLd` (ContactPage + Organization contact point). Footer and contact show the phone formatted.
- SEO: `app/sitemap.ts` (from GET /sitemap, en/ar alternates) and `app/robots.ts`. `buildMetadata` falls back to
  `settings.og_image` for pages without their own image.
- After seeding new ui strings, the Next data cache may still hold the old `/site`: POST the `site` tag to
  `/api/revalidate` (the API's webhook does this automatically for admin edits, not for seeders).

## Production

- Domain: `https://ppixelmedia.com` (www → apex); API at `https://api.ppixelmedia.com/api/v1` (brand name stays "Pixellap").
- Pre-launch: `PRELAUNCH=true` (server env, read at build, `src/lib/prelaunch.ts`) → robots.txt `Disallow: /` and
  `robots: noindex, nofollow` in `buildMetadata()`. Nginx adds basic auth + X-Robots-Tag. Go-live steps: API runbook §13.
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
- Fonts: only `src/styles/fonts.ts` (woff2 files in `public/fonts/`; metric overrides re-centre text in buttons/pills).
- Icons: `src/app/{favicon.ico,icon.svg,apple-icon.png}` + `app/manifest.ts` (`public/icons/`). Fallback share image:
  `public/og-default.jpg` (used by `buildMetadata` after the page image and `settings.og_image`).
- Brand assets: `public/brand/` (logo / mark, color and white variants).
