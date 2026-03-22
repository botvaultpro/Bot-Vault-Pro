import { EmailPayload, FROM_ADDRESS } from "./types";

export function buildDripDay5Email(
  firstName: string,
  toEmail: string
): EmailPayload {
  return {
    from: FROM_ADDRESS,
    to: toEmail,
    subject: "Your free trial is almost gone — here's exactly what you'll lose",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
              <p style="margin:0 0 20px;font-size:16px;color:#a0a0b8;line-height:1.6;">Hey ${firstName},</p>

              <!-- Urgency banner -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
                <tr>
                  <td style="padding:16px 20px;background-color:rgba(249,115,22,0.1);border:1px solid rgba(249,115,22,0.4);border-radius:8px;">
                    <p style="margin:0;font-size:15px;color:#f97316;font-weight:600;line-height:1.5;">
                      ⚠️ Your free trials run out in 2 days. After that, you'll need a subscription to use any bot.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 20px;font-size:16px;color:#a0a0b8;line-height:1.6;">
                Here's what stops working when your trial ends:
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
                <tr>
                  <td style="padding:14px 16px;background-color:#0d0d14;border:1px solid #1e1e2e;border-radius:8px 8px 0 0;border-bottom:none;">
                    <p style="margin:0;font-size:14px;color:#ef4444;">✗ ClauseCheck — contract uploads will be blocked</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 16px;background-color:#0d0d14;border:1px solid #1e1e2e;border-bottom:none;">
                    <p style="margin:0;font-size:14px;color:#ef4444;">✗ EmailCoach — email reply generation locked</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 16px;background-color:#0d0d14;border:1px solid #1e1e2e;border-bottom:none;">
                    <p style="margin:0;font-size:14px;color:#ef4444;">✗ WeeklyPulse — business reports will stop</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 16px;background-color:#0d0d14;border:1px solid #1e1e2e;border-bottom:none;">
                    <p style="margin:0;font-size:14px;color:#ef4444;">✗ InvoiceForge — invoice generation paused</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 16px;background-color:#0d0d14;border:1px solid #1e1e2e;border-radius:0 0 8px 8px;">
                    <p style="margin:0;font-size:14px;color:#ef4444;">✗ SiteBuilder Pro — site/proposal generation paused</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 20px;font-size:16px;color:#a0a0b8;line-height:1.6;">
                Subscribe to just one bot to keep it running. You only pay for what you use.
              </p>
              <p style="margin:0 0 28px;font-size:16px;color:#a0a0b8;line-height:1.6;">
                Most people start with <strong style="color:#ffffff;">ClauseCheck ($29/mo)</strong> or <strong style="color:#ffffff;">EmailCoach ($19/mo)</strong> — the ones that pay for themselves fastest.
              </p>

              <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td style="background-color:#00c8ff;border-radius:8px;">
                    <a href="https://botvaultpro.com/pricing"
                       style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#0a0a0f;text-decoration:none;">
                      Choose a Plan Before It Expires →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 32px;font-size:13px;color:#5a5a7a;">No lock-in. Cancel anytime from your dashboard.</p>

              <p style="margin:0;font-size:15px;color:#a0a0b8;line-height:1.6;">
                — Wes<br/>
                <span style="font-size:13px;color:#5a5a7a;">Founder, Bot Vault Pro</span>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #1e1e2e;">
              <p style="margin:0;font-size:12px;color:#5a5a7a;">
                <a href="https://botvaultpro.com" style="color:#00c8ff;text-decoration:none;">botvaultpro.com</a>
                &nbsp;·&nbsp;
                <a href="https://botvaultpro.com/privacy" style="color:#5a5a7a;text-decoration:none;">Privacy</a>
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
