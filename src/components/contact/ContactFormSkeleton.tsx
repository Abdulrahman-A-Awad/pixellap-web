/** Placeholder with the form's footprint while the client form hydrates (no layout shift). */
export function ContactFormSkeleton() {
  const field = 'h-14 rounded-[14px] bg-surface-2 motion-safe:animate-pulse';
  return (
    <div aria-hidden="true" className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={field} />
        ))}
      </div>
      <div className="flex flex-col gap-3">
        <div className="h-6 w-40 rounded bg-surface-2" />
        <div className="flex flex-wrap gap-2">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-11 w-28 rounded-pill bg-surface-2" />
          ))}
        </div>
      </div>
      <div className="h-[160px] rounded-[14px] bg-surface-2 motion-safe:animate-pulse" />
      <div className="h-11 w-full rounded-pill bg-surface-2 sm:w-48" />
    </div>
  );
}
