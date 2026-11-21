import { Logo } from '@/components/brand/Logo';

/** Same footprint as <Header /> while it streams in (routes with request-time pathnames). */
export function HeaderFallback({ siteName }: { siteName: string }) {
  return (
    <div className="fixed inset-x-0 top-0 z-40 border-b border-transparent">
      <div className="container-page flex h-(--header-h) items-center">
        <Logo variant="horizontal" height={40} alt={siteName} className="hidden lg:inline-flex" />
        <Logo variant="horizontal" height={32} alt={siteName} className="lg:hidden" />
      </div>
    </div>
  );
}
