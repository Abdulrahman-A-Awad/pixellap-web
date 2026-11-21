import { ArrowRight, Play } from 'lucide-react';
import { buttonClasses } from '@/components/ui/Button';
import { CtaLink } from '@/components/ui/CtaLink';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';
import type { HeroSection, SiteSettings } from '@/lib/api/types';
import { settingValue } from '@/lib/site/settings';
import type { Translate } from '@/lib/site/translate';
import { HeroStage } from './HeroStage';
import { HERO_TITLE_ID } from './ids';
import { ScrollHint } from './ScrollHint';
import { WordReveal } from './WordReveal';

interface HeroProps {
  hero: HeroSection;
  settings: SiteSettings;
  t: Translate;
}

const secondaryClass = buttonClasses('ghost', 'border border-border px-5 backdrop-blur-sm hover:border-primary');

/**
 * Home hero: H1 + CMS subtitle + two CTAs (primary "Start a project", secondary "Watch the reel"
 * when a showreel exists, otherwise "Explore our services"). All copy is server-rendered
 * (readable without JS — this is the LCP); the 3D scene / video / poster is decided on the
 * client by SceneGate. No eyebrow and no stat chips: the hero stays calm.
 */
export function Hero({ hero, settings, t }: HeroProps) {
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

      {/* Desktop: vertically centred in the space below the fixed header. */}
      <div data-hero-copy className="relative lg:absolute lg:inset-0 lg:flex lg:items-center lg:pt-19">
        <div className="container-page">
          {/* Desktop: capped so the copy stays in the start half, clear of the cube (.hero-frame-wide). */}
          <div className="max-w-2xl pt-6 pb-14 lg:max-w-[min(46vw,620px)] lg:py-0">
            <WordReveal id={HERO_TITLE_ID} text={title} className="text-display text-balance" />

            {hero.subtitle && <p className="mt-6 max-w-[34rem] text-lead text-pretty text-muted">{hero.subtitle}</p>}

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <CtaLink
                cta={hero.cta ?? { label: t('actions.start_project'), url: '/contact' }}
                className={buttonClasses('primary', 'px-6')}
              >
                {hero.cta?.label ?? t('actions.start_project')}
                <ArrowRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
              </CtaLink>

              {showreel && hero.cta2 ? (
                <CtaLink cta={hero.cta2} className={cn(secondaryClass, 'ps-2')}>
                  <span className="inline-flex size-7 items-center justify-center rounded-pill bg-primary text-on-primary">
                    <Play aria-hidden="true" className="size-3.5 translate-x-px fill-current" />
                  </span>
                  {hero.cta2.label}
                </CtaLink>
              ) : (
                <Link href="/services" className={secondaryClass}>
                  {t('actions.explore_services')}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <ScrollHint label={t('misc.scroll')} />
    </HeroStage>
  );
}
