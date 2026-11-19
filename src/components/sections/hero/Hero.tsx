import { ArrowRight, Play } from 'lucide-react';
import { buttonClasses } from '@/components/ui/Button';
import { CtaLink } from '@/components/ui/CtaLink';
import type { HeroSection, HomeStat, SiteSettings } from '@/lib/api/types';
import { settingValue } from '@/lib/site/settings';
import type { Translate } from '@/lib/site/translate';
import { HeroStage } from './HeroStage';
import { HERO_TITLE_ID } from './ids';
import { ScrollHint } from './ScrollHint';
import { WordReveal } from './WordReveal';

interface HeroProps {
  hero: HeroSection;
  stats: HomeStat[];
  settings: SiteSettings;
  t: Translate;
}

/**
 * Home hero. All copy is server-rendered (readable without JS — this is the LCP);
 * the 3D scene / video / poster is decided on the client by SceneGate.
 */
export function Hero({ hero, stats, settings, t }: HeroProps) {
  const showreel = settingValue(settings.showreel_url);
  const title = hero.title ?? settings.tagline;

  return (
    <HeroStage media={hero.media}>
      {/* Scrim: keeps the copy readable over the scene (start side on desktop, bottom on mobile). */}
      <div aria-hidden="true" className="hero-scrim pointer-events-none absolute inset-0 hidden lg:block" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[calc(max(42svh,16rem)-6rem)] h-24 bg-linear-to-b from-transparent to-bg lg:hidden light:hidden"
      />

      <div data-hero-copy className="relative lg:absolute lg:inset-0 lg:flex lg:items-center">
        <div className="container-page">
          <div className="max-w-2xl py-10 lg:py-0">
            {hero.eyebrow && (
              <p className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-link">
                <span aria-hidden="true" className="size-2 rounded-[2px] bg-primary" />
                {hero.eyebrow}
              </p>
            )}

            <WordReveal id={HERO_TITLE_ID} text={title} className="text-display" />

            {hero.subtitle && <p className="mt-6 max-w-xl text-lg text-muted md:text-xl">{hero.subtitle}</p>}

            <div className="mt-9 flex flex-wrap items-center gap-3">
              {hero.cta && (
                <CtaLink cta={hero.cta} className={buttonClasses('primary', 'px-6')}>
                  {hero.cta.label}
                  <ArrowRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
                </CtaLink>
              )}
              {hero.cta2 && showreel && (
                <CtaLink cta={hero.cta2} className={buttonClasses('ghost', 'border border-border px-5')}>
                  <span className="inline-flex size-7 items-center justify-center rounded-pill bg-primary text-on-primary">
                    <Play aria-hidden="true" className="size-3.5 translate-x-px fill-current" />
                  </span>
                  {hero.cta2.label}
                </CtaLink>
              )}
            </div>

            {stats.length > 0 && (
              <ul className="mt-10 flex flex-wrap gap-2.5">
                {stats.slice(0, 3).map((stat) => (
                  <li
                    key={stat.label}
                    className="inline-flex items-baseline gap-2 rounded-pill border border-border bg-surface/70 px-4 py-2 text-sm backdrop-blur"
                  >
                    <span className="font-bold text-text" dir="ltr">
                      {stat.prefix}
                      {stat.value}
                      {stat.suffix}
                    </span>
                    <span className="text-muted">{stat.label}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <ScrollHint label={t('misc.scroll')} />
    </HeroStage>
  );
}
