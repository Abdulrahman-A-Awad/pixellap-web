import { Reveal } from '@/components/motion/Reveal';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { splitLead } from '@/lib/site/lead';

/**
 * Overview as a statement: the shared section header on the start side; the description's first
 * sentence as a large lead (title scale), the rest as rich body text at a 65ch measure.
 */
export function CategoryOverview({ title, description }: { title: string; description: string }) {
  const { lead, body } = splitLead(description);
  if (!lead && !body) return null;

  return (
    <section aria-labelledby="overview-title" className="section-y">
      <div className="container-page grid gap-8 lg:grid-cols-12 lg:gap-16">
        <SectionHeading title={title} id="overview-title" className="lg:col-span-4" />
        <div className="flex flex-col gap-6 lg:col-span-8">
          {lead && (
            <Reveal>
              <p className="measure text-title text-pretty">{lead}</p>
            </Reveal>
          )}
          {body && (
            <Reveal index={1}>
              <div
                className="prose-rich measure text-lead text-pretty text-muted"
                // Trusted HTML from the CMS rich editor.
                dangerouslySetInnerHTML={{ __html: body }}
              />
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
