import 'server-only';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name} (see .env.example).`);
  return value;
}

/** Server-only configuration. Never import from client components. */
export const serverEnv = {
  get apiUrl(): string {
    return required('API_URL').replace(/\/+$/, '');
  },
  get apiSiteKey(): string {
    return required('API_SITE_KEY');
  },
  get revalidateSecret(): string {
    return required('REVALIDATE_SECRET');
  },
};
