import { Logo } from '@/components/brand/Logo';

/** Same footprint as <Header /> while it streams in (routes with request-time pathnames). */
export function HeaderFallback({ siteName }: { siteName: string }) {
  return (
    <div className="fixed inset-x-0 top-0 z-40 border-b border-transparent">
      <div className="container-page flex h-18 items-center md:h-19">
        <Logo variant="horizontal" height={40} alt={siteName} className="hidden md:inline-flex" />
        <Logo variant="horizontal" height={32} alt={siteName} className="md:hidden" />
      </div>
    </div>
  );
}
