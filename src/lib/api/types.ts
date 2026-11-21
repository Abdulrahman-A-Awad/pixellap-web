/**
 * Pixellap public API v1 — response types.
 *
 * Source of truth: pixellap-api (app/Http/Resources/V1). Copy this file into the
 * Next.js app unchanged; update it here whenever a resource changes. See docs/API.md.
 *
 * Conventions:
 *  - Every string is already in the requested locale (missing Arabic falls back to English).
 *  - `Html` = sanitised HTML from the admin rich editor. `PlainText` = plain text where
 *    paragraphs are separated by a blank line ("\n\n").
 *  - Dates are ISO 8601 strings with offset, e.g. "2026-11-13T16:04:26+04:00".
 *  - Hidden rows never appear. Lists are already in display order.
 */

export type Locale = 'en' | 'ar';

/** Alias for documentation only. */
export type Html = string;
export type PlainText = string;
export type IsoDate = string;

/* ───────────────────────────── Envelope & errors ───────────────────────────── */

export interface ApiMeta {
  locale: Locale;
  /** When this payload was generated (responses are cached server-side for up to 1 hour). */
  generated_at: IsoDate;
}

export interface ApiEnvelope<T> {
  data: T;
  meta: ApiMeta;
}

/** 401 (bad site key), 404, 429 and 5xx bodies. */
export interface ApiError {
  message: string;
}

/** 422 body. `message` is the first error (+ a localised "and N more" suffix). */
export interface ApiValidationError extends ApiError {
  errors: Partial<Record<keyof ContactPayload, string[]>>;
}

/* ───────────────────────────────── Shared ─────────────────────────────────── */

export interface MediaAsset {
  /** Absolute URL of the original file. */
  url: string;
  mime: string;
  /** Pixel size of raster images; null for SVG/video or when unknown. */
  width: number | null;
  height: number | null;
  /** Owner's title (or client name) in the current locale; may be "". */
  alt: string;
  /** WebP renditions (400 / 1024 / 1920 px wide). null for SVG and video. */
  conversions: { thumb: string; md: string; lg: string } | null;
}

export interface Link {
  label: string;
  /** Relative path ("/contact"), hash ("#reel") or absolute URL — as typed in the admin. */
  url: string;
}

export interface Seo {
  /** null → fall back to Site.settings.seo_default_title. */
  title: string | null;
  /** null → fall back to Site.settings.seo_default_description. */
  description: string | null;
}

export interface Faq {
  id: number;
  question: string;
  answer: Html;
}

/* ────────────────────────────────── /site ─────────────────────────────────── */

export interface SiteSettings {
  site_name: string;
  tagline: string;
  /** YouTube, Vimeo or direct .mp4 URL; "" when not set. */
  showreel_url: string;
  email: string;
  phone: string;
  /** International format, digits (wa.me link: `https://wa.me/${digits}`). */
  whatsapp: string;
  address: string;
  /** Google Maps embed src; "" when not set. */
  map_embed_url: string;
  working_hours: string;
  vat_number: string;
  response_time: string;
  /** Profile URLs; "" when not set. */
  socials: {
    instagram: string;
    linkedin: string;
    tiktok: string;
    youtube: string;
    x: string;
    behance: string;
  };
  seo_default_title: string;
  seo_default_description: string;
  /** Absolute URL of the default social sharing image (1200×630), or null when not uploaded. */
  og_image: string | null;
}

export interface NavCategory {
  slug: string;
  title: string;
  sort: number;
}

export interface Site {
  settings: SiteSettings;
  /** Flat map of interface strings, e.g. { "nav.services": "Services", "form.success": "…" }. */
  ui_strings: Record<string, string>;
  nav: { categories: NavCategory[] };
  locales: Locale[];
}

export type SiteResponse = ApiEnvelope<Site>;

/* ────────────────────────────────── /home ─────────────────────────────────── */

export type HomeSectionKey = 'hero' | 'stats' | 'services' | 'process' | 'clients' | 'about' | 'faq' | 'contact_cta';

/** Fields every section carries. Unused fields for a section are always null. */
interface HomeSectionBase<K extends HomeSectionKey> {
  key: K;
  /** every section except hero and contact_cta */
  eyebrow: string | null;
  title: string | null;
  subtitle: PlainText | null;
  /** hero, services, about, contact_cta */
  cta: Link | null;
  /** hero only */
  cta2: Link | null;
  /** about only */
  image: MediaAsset | null;
}

export interface HomeStat {
  value: number;
  prefix: string | null;
  suffix: string | null;
  label: string;
}

export interface HomeCategoryCard {
  slug: string;
  title: string;
  excerpt: string;
  icon: MediaAsset | null;
  cover: MediaAsset | null;
  /** Titles of the category's visible services (for tags). */
  services: string[];
}

export interface ProcessStep {
  title: string;
  description: PlainText;
}

export interface ClientLogo {
  name: string;
  url: string | null;
  logo: MediaAsset | null;
}

/** One orientation of the hero loop video: absolute URLs, null when not uploaded. */
export interface HeroLoopVideo {
  /** video/webm — list first in <source>. */
  webm: string | null;
  /** video/mp4 (H.264) — fallback <source>. */
  mp4: string | null;
  /** First frame (webp/jpeg/png): the video poster and the static hero. */
  poster: string | null;
}

export interface HeroMedia {
  /** Desktop / landscape. */
  wide: HeroLoopVideo;
  /** Phones / portrait. */
  vertical: HeroLoopVideo;
}

export interface HeroSection extends HomeSectionBase<'hero'> {
  media: HeroMedia;
}
export type AboutSection = HomeSectionBase<'about'>;
export interface StatsSection extends HomeSectionBase<'stats'> {
  items: HomeStat[];
}
export interface ServicesSection extends HomeSectionBase<'services'> {
  categories: HomeCategoryCard[];
}
export interface ProcessSection extends HomeSectionBase<'process'> {
  steps: ProcessStep[];
}
export interface ClientsSection extends HomeSectionBase<'clients'> {
  items: ClientLogo[];
}
export interface FaqSection extends HomeSectionBase<'faq'> {
  faqs: Faq[];
}
export interface ContactCtaSection extends HomeSectionBase<'contact_cta'> {
  response_time: string | null;
  whatsapp: string | null;
}

/** Discriminated by `key`. Only visible sections, in display order. */
export type HomeSection =
  | HeroSection
  | StatsSection
  | ServicesSection
  | ProcessSection
  | ClientsSection
  | AboutSection
  | FaqSection
  | ContactCtaSection;

export type HomeResponse = ApiEnvelope<HomeSection[]>;

/* ─────────────────────────────── /pages/{key} ─────────────────────────────── */

export type PageKey = 'about' | 'services' | 'contact';

export type PageBlockType = 'text' | 'image_text' | 'mission_vision' | 'values' | 'cta';

interface PageBlockBase<T extends PageBlockType> {
  id: number;
  type: T;
  title: string | null;
}

export interface PageBlockItem {
  title: string;
  text: PlainText;
}

export interface TextBlock extends PageBlockBase<'text'> {
  body: PlainText | null;
}
export interface CtaBlock extends PageBlockBase<'cta'> {
  body: PlainText | null;
}
export interface ImageTextBlock extends PageBlockBase<'image_text'> {
  body: PlainText | null;
  image: MediaAsset | null;
}
/** Exactly 2 items (mission, vision). */
export interface MissionVisionBlock extends PageBlockBase<'mission_vision'> {
  items: PageBlockItem[];
}
/** 1–6 items. */
export interface ValuesBlock extends PageBlockBase<'values'> {
  items: PageBlockItem[];
}

/** Discriminated by `type`. */
export type PageBlock = TextBlock | CtaBlock | ImageTextBlock | MissionVisionBlock | ValuesBlock;

export interface Page {
  key: PageKey;
  title: string;
  subtitle: PlainText | null;
  seo: Seo;
  hero: MediaAsset | null;
  /** Visible blocks in display order. */
  blocks: PageBlock[];
  updated_at: IsoDate | null;
}

export type PageResponse = ApiEnvelope<Page>;

/* ─────────────────────────── /service-categories ──────────────────────────── */

export interface ServiceCategory {
  slug: string;
  title: string;
  excerpt: string;
  /** SVG */
  icon: MediaAsset | null;
  cover: MediaAsset | null;
  /** Number of visible services. */
  services_count: number;
}

export type ServiceCategoriesResponse = ApiEnvelope<ServiceCategory[]>;

export interface Service {
  id: number;
  title: string;
  description: PlainText;
  features: string[];
  icon: MediaAsset | null;
  image: MediaAsset | null;
}

export interface ServiceCategoryDetail {
  slug: string;
  title: string;
  excerpt: string;
  description: Html;
  seo: Seo;
  icon: MediaAsset | null;
  cover: MediaAsset | null;
  hero_video: MediaAsset | null;
  services: Service[];
  faqs: Faq[];
  updated_at: IsoDate | null;
}

export type ServiceCategoryResponse = ApiEnvelope<ServiceCategoryDetail>;

/* ──────────────────────────────── /sitemap ────────────────────────────────── */

export interface SitemapEntry {
  /** "/en", "/ar/about", "/en/services/brand-identity-design", … */
  path: string;
  locale: Locale;
  updated_at: IsoDate | null;
}

export type SitemapResponse = ApiEnvelope<SitemapEntry[]>;

/* ──────────────────────────────── /contact ────────────────────────────────── */

export interface ContactPayload {
  /** required, max 120 */
  name: string;
  /** required, RFC email, max 190 */
  email: string;
  /** optional, max 30, digits/spaces/+()- only */
  phone?: string | null;
  /** optional, max 120 */
  company?: string | null;
  /** optional: a visible ServiceCategory slug */
  service?: string | null;
  /** required, 10–5000 chars */
  message: string;
  /** Language of the visitor; also selects the language of validation messages. */
  locale?: Locale;
  /** Honeypot. Render as a hidden input and always send "" — a filled value is silently discarded. */
  website?: string;
}

export type ContactResponse = ApiEnvelope<{ message: string }>;

/* ───────────────────────── Revalidation webhook (in) ──────────────────────── */

/** Cache tags the API sends to the frontend revalidate route. */
export type CacheTag = 'site' | 'home' | 'categories' | 'sitemap' | `category:${string}` | `page:${PageKey}`;

/** Body of POST {FRONTEND_REVALIDATE_URL} (header X-Revalidate-Secret). */
export interface RevalidatePayload {
  tags: CacheTag[];
}
