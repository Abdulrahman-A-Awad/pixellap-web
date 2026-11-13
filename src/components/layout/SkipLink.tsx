export const MAIN_ID = 'main';

export function SkipLink({ label }: { label: string }) {
  return (
    <a
      href={`#${MAIN_ID}`}
      className="sr-only rounded-pill bg-primary px-5 py-3 text-on-primary focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[60]"
    >
      {label}
    </a>
  );
}
