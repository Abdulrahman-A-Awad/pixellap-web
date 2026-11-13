/** Main navigation. Labels are ui_strings keys (GET /site). */
export const NAV_ITEMS = [
  { href: '/', label: 'nav.home' },
  { href: '/about', label: 'nav.about' },
  { href: '/services', label: 'nav.services' },
  { href: '/contact', label: 'nav.contact' },
] as const;

export function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}
