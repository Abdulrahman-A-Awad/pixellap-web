import { createHash, timingSafeEqual } from 'node:crypto';
import { revalidateTag } from 'next/cache';
import { z } from 'zod';
import { serverEnv } from '@/lib/env';

/**
 * Webhook from pixellap-api (App\Jobs\RevalidateFrontend):
 * POST /api/revalidate  X-Revalidate-Secret: …  {"tags": ["home", "category:slug"]}
 */
const bodySchema = z.object({
  tags: z.array(z.string().min(1).max(256)).min(1).max(128),
});

/** Constant-time comparison (hashing first makes the lengths equal). */
function secretMatches(provided: string | null): boolean {
  if (!provided) return false;
  const a = createHash('sha256').update(provided).digest();
  const b = createHash('sha256').update(serverEnv.revalidateSecret).digest();
  return timingSafeEqual(a, b);
}

export async function POST(request: Request): Promise<Response> {
  if (!secretMatches(request.headers.get('x-revalidate-secret'))) {
    return Response.json({ message: 'Invalid secret.' }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ message: 'Invalid JSON body.' }, { status: 422 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json(
      { message: 'Invalid body.', errors: z.flattenError(parsed.error).fieldErrors },
      { status: 422 },
    );
  }

  const tags = [...new Set(parsed.data.tags)];
  // Webhook (not a Server Action): expire immediately so the next request gets fresh data.
  for (const tag of tags) revalidateTag(tag, { expire: 0 });

  return Response.json({ revalidated: true, tags });
}
