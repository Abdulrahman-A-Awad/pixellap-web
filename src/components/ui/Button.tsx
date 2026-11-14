import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'ghost' | 'outline';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-on-primary hover:bg-primary-hover shadow-[0_8px_30px_-12px_var(--accent-glow)]',
  outline: 'border border-border text-text hover:border-primary hover:text-primary',
  ghost: 'text-text hover:bg-surface-2',
};

/** Class string for pill buttons, usable on <button>, <a> and <Link>. */
export function buttonClasses(variant: ButtonVariant = 'primary', className?: string): string {
  return cn(
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-pill px-5 py-2.5 text-sm font-bold',
    'transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60',
    VARIANTS[variant],
    className,
  );
}
