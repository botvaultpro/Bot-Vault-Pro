import { EmailPayload, FROM_ADDRESS } from "./types";

export function buildDripDay1Email(
  firstName: string,
  toEmail: string
): EmailPayload {
  return {
    from: FROM_ADDRESS,
    to: toEmail,
    subject: "Did you try your first bot yet?",
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
                You signed up yesterday but I didn't see you run any bots yet. Totally fine — just making sure you know where to start.
              </p>
              <p style="margin:0 0 24px;font-size:16px;color:#ffffff;font-weight:600;line-height:1.6;">
                Here's the fastest win: ClauseCheck.
              </p>
              <p style="margin:0 0 20px;font-size:16px;color:#a0a0b8;line-height:1.6;">
                Upload any contract — a vendor agreement, freelance contract, lease, whatever you have — and ClauseCheck reads it in seconds, flags every risky clause in plain English, and tells you what to ask before you sign.
              </p>
              <p style="margin:0 0 20px;font-size:16px;color:#a0a0b8;line-height:1.6;">
                Most people have a contract sitting in their email right now they haven't read properly. This takes 30 seconds.
              </p>

              <!-- Bot Cards -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
                <tr>
                  <td style="padding:16px 20px;background-color:#0d0d14;border:1px solid rgba(255,150,50,0.3);border-radius:8px;margin-bottom:12px;">
                    <p style="margin:0 0 4px;font-size:13px;color:#f97316;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">ClauseCheck — 1 free analysis</p>
                    <p style="margin:0;font-size:15px;color:#ffffff;font-weight:600;">Upload a contract. Get flagged risks in 30 seconds.</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#a0a0b8;">No legal degree needed. No guessing. Just upload and read.</p>
                  </td>
                </tr>
                <tr><td style="height:10px;"></td></tr>
                <tr>
                  <td style="padding:16px 20px;background-color:#0d0d14;border:1px solid rgba(0,200,255,0.2);border-radius:8px;">
                    <p style="margin:0 0 4px;font-size:13px;color:#00c8ff;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">EmailCoach — 3 free replies</p>
                    <p style="margin:0;font-size:15px;color:#ffffff;font-weight:600;">Paste a difficult email. Get 3 ready-to-send replies.</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#a0a0b8;">The one with the angry client. The awkward negotiation. EmailCoach handles it.</p>
                  </td>
                </tr>
              </table>

              <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
                <tr>
                  <td style="background-color:#00c8ff;border-radius:8px;">
                    <a href="https://botvaultpro.com/dashboard"
                       style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#0a0a0f;text-decoration:none;">
                      Open Your Dashboard →
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
