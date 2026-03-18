const REQUIRED_ENV_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
  "ANTHROPIC_API_KEY",
  "INNGEST_EVENT_KEY",
  "INNGEST_SIGNING_KEY",
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
] as const;

export function validateEnv(): void {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(
      `[env] Missing required environment variables: ${missing.join(", ")}`
    );
  }
}
