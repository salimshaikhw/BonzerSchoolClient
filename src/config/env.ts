/** The only place that reads import.meta.env. Everything else imports `env`. */
function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing environment variable ${name}. Copy .env.example to .env.local.`);
  return value;
}

export const env = {
  apiBaseUrl: required('VITE_API_BASE_URL', import.meta.env.VITE_API_BASE_URL as string | undefined).replace(/\/$/, ''),
  isDev: import.meta.env.DEV,
} as const;
