/** Placeholder with the form's footprint while the client form hydrates (no layout shift). */
export function ContactFormSkeleton() {
  const bar = 'rounded-xl bg-surface-2 motion-safe:animate-pulse';
  return (
    <div aria-hidden="true" className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="h-5 w-24 rounded bg-surface-2" />
            <div className={`h-[50px] ${bar}`} />
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-5 w-32 rounded bg-surface-2" />
        <div className={`h-[50px] ${bar}`} />
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-5 w-40 rounded bg-surface-2" />
        <div className={`h-[170px] ${bar}`} />
      </div>
      <div className="h-11 w-44 rounded-pill bg-surface-2" />
    </div>
  );
}
