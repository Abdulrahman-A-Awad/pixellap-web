import type { ReactNode } from 'react';
import { Link } from '@/i18n/navigation';
import type { Link as CmsLink } from '@/lib/api/types';

/** CMS link: internal paths use the locale-aware Link; hashes and absolute URLs stay plain anchors. */
export function CtaLink({ cta, className, children }: { cta: CmsLink; className?: string; children: ReactNode }) {
  if (cta.url.startsWith('/')) {
    return (
      <Link href={cta.url} className={className}>
        {children}
      </Link>
    );
  }
  const external = /^https?:\/\//.test(cta.url);
  return (
    <a href={cta.url} className={className} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
      {children}
    </a>
  );
}
