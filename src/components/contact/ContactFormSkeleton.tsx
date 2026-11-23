/** Placeholder with the form's footprint while the client form hydrates (no layout shift). */
export function ContactFormSkeleton() {
  const field = 'h-14 rounded-[14px] bg-surface-2 motion-safe:animate-pulse';
  return (
    <div aria-hidden="true" className="flex flex-col gap-5">
      {/* Name, email, phone, company, then the service select (full width). */}
      <div className="grid gap-5 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={field} />
        ))}
        <div className={`${field} sm:col-span-2`} />
      </div>
      <div className="h-[160px] rounded-[14px] bg-surface-2 motion-safe:animate-pulse" />
      <div className="h-11 w-full rounded-pill bg-surface-2 sm:w-48" />
    </div>
  );
}
