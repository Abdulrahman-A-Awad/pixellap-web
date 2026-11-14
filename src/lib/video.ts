export type VideoSource =
  { kind: 'iframe'; src: string; provider: 'youtube' | 'vimeo' } | { kind: 'file'; src: string; type: string };

/**
 * Showreel URL → embeddable source. YouTube and Vimeo use their privacy-enhanced embeds
 * with autoplay; direct .mp4 / .webm play in a <video>. Unknown URLs → null.
 */
export function parseVideoUrl(raw: string | null | undefined): VideoSource | null {
  if (!raw) return null;
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\.|^m\./, '');

  // YouTube: watch?v=, youtu.be/, /embed/, /shorts/, /live/
  let youtubeId: string | null = null;
  if (host === 'youtu.be') youtubeId = url.pathname.slice(1).split('/')[0] || null;
  else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    youtubeId = url.searchParams.get('v') ?? url.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]{6,})/)?.[1] ?? null;
  }
  if (youtubeId && /^[\w-]{6,}$/.test(youtubeId)) {
    const params = new URLSearchParams({ autoplay: '1', rel: '0', playsinline: '1', modestbranding: '1' });
    return {
      kind: 'iframe',
      provider: 'youtube',
      src: `https://www.youtube-nocookie.com/embed/${youtubeId}?${params}`,
    };
  }

  // Vimeo: vimeo.com/{id}[/{hash}], player.vimeo.com/video/{id}?h=
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const match = url.pathname.match(/(?:\/video)?\/(\d+)(?:\/([\da-f]+))?/);
    if (match) {
      const params = new URLSearchParams({ autoplay: '1', dnt: '1', title: '0', byline: '0', portrait: '0' });
      const hash = match[2] ?? url.searchParams.get('h');
      if (hash) params.set('h', hash);
      return { kind: 'iframe', provider: 'vimeo', src: `https://player.vimeo.com/video/${match[1]}?${params}` };
    }
  }

  // Direct files.
  const ext = url.pathname.toLowerCase().match(/\.(mp4|webm|m4v|mov)$/)?.[1];
  if (ext) {
    const type = ext === 'webm' ? 'video/webm' : ext === 'mov' ? 'video/quicktime' : 'video/mp4';
    return { kind: 'file', src: url.toString(), type };
  }

  return null;
}
