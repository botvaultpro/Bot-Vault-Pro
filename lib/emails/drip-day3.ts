import { EmailPayload, FROM_ADDRESS } from "./types";

export function buildDripDay3Email(
  firstName: string,
  toEmail: string
): EmailPayload {
  return {
    from: FROM_ADDRESS,
    to: toEmail,
    subject: "What $49/month actually buys you (real math inside)",
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
              <p style="margin:0 0 20px;font-size:16px;color:#a0a0b8;line-height:1.6;">
                Let me give you the honest math on what Bot Vault Pro actually costs vs. what it replaces.
              </p>

              <!-- Math table -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;border-radius:8px;overflow:hidden;border:1px solid #1e1e2e;">
                <tr style="background-color:#1e1e2e;">
                  <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#a0a0b8;">What you're replacing</td>
                  <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#a0a0b8;text-align:right;">Old cost</td>
                  <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#00c8ff;text-align:right;">Bot Vault Pro</td>
                </tr>
                <tr style="border-top:1px solid #1e1e2e;">
                  <td style="padding:12px 16px;font-size:14px;color:#ffffff;">Contract review (lawyer, 1 contract)</td>
                  <td style="padding:12px 16px;font-size:14px;color:#a0a0b8;text-align:right;">$200–500</td>
                  <td style="padding:12px 16px;font-size:14px;color:#00c8ff;font-weight:600;text-align:right;">$29/mo</td>
                </tr>
                <tr style="border-top:1px solid #1e1e2e;background-color:#0d0d14;">
                  <td style="padding:12px 16px;font-size:14px;color:#ffffff;">Invoice software + follow-up tool</td>
                  <td style="padding:12px 16px;font-size:14px;color:#a0a0b8;text-align:right;">$40–80/mo</td>
                  <td style="padding:12px 16px;font-size:14px;color:#00c8ff;font-weight:600;text-align:right;">$29/mo</td>
                </tr>
                <tr style="border-top:1px solid #1e1e2e;">
                  <td style="padding:12px 16px;font-size:14px;color:#ffffff;">Email writing assistant</td>
                  <td style="padding:12px 16px;font-size:14px;color:#a0a0b8;text-align:right;">$20–30/mo</td>
                  <td style="padding:12px 16px;font-size:14px;color:#00c8ff;font-weight:600;text-align:right;">$19/mo</td>
                </tr>
                <tr style="border-top:1px solid #1e1e2e;background-color:#0d0d14;">
                  <td style="padding:12px 16px;font-size:14px;color:#ffffff;">Business analyst (weekly reports)</td>
                  <td style="padding:12px 16px;font-size:14px;color:#a0a0b8;text-align:right;">$500–1,500/mo</td>
                  <td style="padding:12px 16px;font-size:14px;color:#00c8ff;font-weight:600;text-align:right;">$19/mo</td>
                </tr>
              </table>

              <p style="margin:0 0 20px;font-size:16px;color:#a0a0b8;line-height:1.6;">
                The bots don't just do one thing once. They run continuously, remember your history, and get better each time you use them. That's the difference between a one-shot ChatGPT prompt and a system that actually runs your operation.
              </p>

              <p style="margin:0 0 28px;font-size:16px;color:#ffffff;font-weight:600;line-height:1.6;">
                Your free trial is still active. Now's the time to use it — before it runs out.
              </p>

              <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
                <tr>
                  <td style="background-color:#00c8ff;border-radius:8px;">
                    <a href="https://botvaultpro.com/dashboard"
                       style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#0a0a0f;text-decoration:none;">
                      Use Your Free Trial →
                    </a>
                  </td>
                </tr>
              </table>

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
