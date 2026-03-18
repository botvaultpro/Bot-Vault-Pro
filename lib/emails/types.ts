export interface EmailPayload {
  from: string;
  to: string;
  subject: string;
  html: string;
}

export const FROM_ADDRESS =
  process.env.RESEND_FROM_EMAIL ?? "Bot Vault Pro <noreply@botvaultpro.com>";
