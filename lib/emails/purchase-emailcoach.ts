import { EmailPayload, FROM_ADDRESS } from "./types";

export function buildEmailCoachEmail(
  firstName: string,
  toEmail: string,
  tier: string
): EmailPayload {
  const isPro = tier === "pro";
  return {
    from: FROM_ADDRESS,
    to: toEmail,
    subject: "EmailCoach is active — paste your first draft and watch it improve.",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>EmailCoach — Subscription Confirmed</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0a0a0f;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#13131a;border:1px solid #1e1e2e;border-radius:12px;overflow:hidden;">

          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #1e1e2e;">
              <span style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
                <span style="color:#00c8ff;">Bot</span> Vault Pro
              </span>
            </td>
          </tr>

          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 8px;font-size:13px;color:#00c8ff;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Subscription Confirmed</p>
              <h1 style="margin:0 0 24px;font-size:28px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">EmailCoach ${isPro ? "Pro" : "Starter"} is live.</h1>

              <p style="margin:0 0 20px;font-size:16px;color:#a0a0b8;line-height:1.6;">
                Hey ${firstName}, EmailCoach is now active. Never send a weak email again.
              </p>
              <p style="margin:0 0 28px;font-size:16px;color:#a0a0b8;line-height:1.6;">
                ${isPro ? "Pro gives you unlimited email rewrites, tone analysis, and subject line variants — use it for every important email you send." : "Starter gives you 30 email rewrites per month to sharpen your outreach, follow-ups, and proposals."}
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;background-color:#0d0d14;border:1px solid #1e1e2e;border-radius:8px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#ffffff;">What EmailCoach does:</p>
                    <p style="margin:0 0 8px;font-size:14px;color:#a0a0b8;">✓ Rewrites your drafts to be clearer, stronger, and more persuasive</p>
                    <p style="margin:0 0 8px;font-size:14px;color:#a0a0b8;">✓ Adjusts tone for your specific audience (cold outreach, clients, investors)</p>
                    <p style="margin:0;font-size:14px;color:#a0a0b8;">✓ Generates high-converting subject line options</p>
                  </td>
                </tr>
              </table>

              <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
                <tr>
                  <td style="background-color:#00c8ff;border-radius:8px;">
                    <a href="https://botvaultpro.com/dashboard/emailcoach"
                       style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#0a0a0f;text-decoration:none;">
                      Open EmailCoach →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:14px;color:#5a5a7a;line-height:1.6;">
                Questions? Reply to this email — we're here.<br/>
                — The Bot Vault Pro Team
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 40px;border-top:1px solid #1e1e2e;">
              <p style="margin:0;font-size:12px;color:#5a5a7a;line-height:1.6;">
                <a href="https://botvaultpro.com/privacy" style="color:#5a5a7a;text-decoration:none;">Privacy Policy</a>
                &nbsp;·&nbsp;
                <a href="https://botvaultpro.com/terms" style="color:#5a5a7a;text-decoration:none;">Terms of Service</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  };
}
