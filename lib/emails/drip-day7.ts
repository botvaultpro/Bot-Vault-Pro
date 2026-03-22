import { EmailPayload, FROM_ADDRESS } from "./types";

export function buildDripDay7Email(
  firstName: string,
  toEmail: string,
  discountCode?: string
): EmailPayload {
  const code = discountCode ?? "WELCOME20";
  return {
    from: FROM_ADDRESS,
    to: toEmail,
    subject: "Last email — 20% off your first month (code inside)",
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
                This is my last email about subscribing. I don't want to spam you — but I do want to make it easy for you to say yes.
              </p>
              <p style="margin:0 0 28px;font-size:16px;color:#a0a0b8;line-height:1.6;">
                Here's a one-time discount code for 20% off your first month:
              </p>

              <!-- Discount code -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
                <tr>
                  <td align="center" style="padding:28px;background-color:#0d0d14;border:2px dashed rgba(0,200,255,0.4);border-radius:12px;">
                    <p style="margin:0 0 8px;font-size:13px;color:#a0a0b8;text-transform:uppercase;letter-spacing:1px;">Your discount code</p>
                    <p style="margin:0 0 12px;font-size:32px;font-weight:700;color:#00c8ff;letter-spacing:4px;font-family:monospace;">${code}</p>
                    <p style="margin:0;font-size:13px;color:#5a5a7a;">20% off your first month · Any bot · Any plan</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 20px;font-size:16px;color:#a0a0b8;line-height:1.6;">
                After this, I'll stop sending conversion emails (you'll still get product updates if you want them).
              </p>
              <p style="margin:0 0 28px;font-size:16px;color:#a0a0b8;line-height:1.6;">
                If you have any hesitation or questions about whether Bot Vault Pro is right for your situation, just reply to this email. I'll give you an honest answer.
              </p>

              <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
                <tr>
                  <td style="background-color:#00c8ff;border-radius:8px;">
                    <a href="https://botvaultpro.com/pricing"
                       style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#0a0a0f;text-decoration:none;">
                      Claim 20% Off Now →
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
                Code expires 48 hours from receipt. One use per account.
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
