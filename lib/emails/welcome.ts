import { EmailPayload, FROM_ADDRESS } from "./types";

export function buildWelcomeEmail(
  firstName: string,
  toEmail: string
): EmailPayload {
  return {
    from: FROM_ADDRESS,
    to: toEmail,
    subject: "You're in. Here's how to get your first bot running today.",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Bot Vault Pro</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0a0a0f;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#13131a;border:1px solid #1e1e2e;border-radius:12px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #1e1e2e;">
              <span style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
                <span style="color:#00c8ff;">Bot</span> Vault Pro
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 20px;font-size:16px;color:#a0a0b8;line-height:1.6;">
                Hey ${firstName},
              </p>
              <p style="margin:0 0 20px;font-size:16px;color:#a0a0b8;line-height:1.6;">
                Your account is live. Bot Vault Pro is ready to run.
              </p>
              <p style="margin:0 0 28px;font-size:16px;color:#a0a0b8;line-height:1.6;">
                Here's what to do right now:
              </p>

              <!-- Steps -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
                <tr>
                  <td style="padding:16px 20px;background-color:#0d0d14;border:1px solid #1e1e2e;border-radius:8px;margin-bottom:12px;">
                    <p style="margin:0 0 4px;font-size:13px;color:#00c8ff;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Step 1</p>
                    <p style="margin:0;font-size:15px;color:#ffffff;font-weight:600;">Go to your dashboard</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#a0a0b8;">Log in and explore the bots available to you.</p>
                  </td>
                </tr>
                <tr><td style="height:10px;"></td></tr>
                <tr>
                  <td style="padding:16px 20px;background-color:#0d0d14;border:1px solid #1e1e2e;border-radius:8px;">
                    <p style="margin:0 0 4px;font-size:13px;color:#00c8ff;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Step 2</p>
                    <p style="margin:0;font-size:15px;color:#ffffff;font-weight:600;">Pick a bot and start your free trial</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#a0a0b8;">Every bot includes a free trial — no card required to start.</p>
                  </td>
                </tr>
                <tr><td style="height:10px;"></td></tr>
                <tr>
                  <td style="padding:16px 20px;background-color:#0d0d14;border:1px solid #1e1e2e;border-radius:8px;">
                    <p style="margin:0 0 4px;font-size:13px;color:#00c8ff;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Step 3</p>
                    <p style="margin:0;font-size:15px;color:#ffffff;font-weight:600;">Let it run</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#a0a0b8;">Bot Vault Pro does the work. You check the output.</p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
                <tr>
                  <td style="background-color:#00c8ff;border-radius:8px;">
                    <a href="https://botvaultpro.com/dashboard"
                       style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#0a0a0f;text-decoration:none;letter-spacing:-0.2px;">
                      Open Your Dashboard →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;font-size:15px;color:#a0a0b8;line-height:1.6;">
                Any questions — reply to this email. I read every one.
              </p>
              <p style="margin:0;font-size:15px;color:#a0a0b8;line-height:1.6;">
                — Wes<br/>
                <span style="font-size:13px;color:#5a5a7a;">Founder, Bot Vault Pro</span>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #1e1e2e;">
              <p style="margin:0;font-size:12px;color:#5a5a7a;line-height:1.6;">
                You're receiving this because you created an account at
                <a href="https://botvaultpro.com" style="color:#00c8ff;text-decoration:none;">botvaultpro.com</a>.
                &nbsp;·&nbsp;
                <a href="https://botvaultpro.com/privacy" style="color:#5a5a7a;text-decoration:none;">Privacy Policy</a>
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
