import { Logo } from '@/components/brand/Logo';

/** Same footprint as <Header /> while it streams in (routes with request-time pathnames). */
export function HeaderFallback({ siteName }: { siteName: string }) {
  return (
    <div className="fixed inset-x-0 top-0 z-40 border-b border-transparent">
      <div className="container-page flex h-18 items-center">
        <Logo variant="logo" height={44} alt={siteName} className="hidden sm:inline-flex" />
        <Logo variant="mark" height={34} alt={siteName} className="sm:hidden" />
      </div>
    </div>
  );
}
