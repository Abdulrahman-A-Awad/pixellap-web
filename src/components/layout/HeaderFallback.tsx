import { Logo } from '@/components/brand/Logo';

/** Same footprint as <Header /> (the glass pill) while it streams in (routes with request-time pathnames). */
export function HeaderFallback({ siteName }: { siteName: string }) {
  return (
    <div className="nav-shell">
      <div className="nav-pill flex items-center ps-5 pe-2 lg:ps-6">
        <Logo variant="horizontal" height={36} alt={siteName} className="hidden lg:inline-flex" />
        <Logo variant="horizontal" height={30} alt={siteName} className="lg:hidden" />
      </div>
    </div>
  );
}
