/**
 * Email sender using the MailChannels HTTP API.
 *
 * MailChannels is the recommended transactional email solution for Cloudflare Workers.
 * It does NOT require Nodemailer (which cannot run in Workers).
 *
 * Two modes:
 *  1. If MAILCHANNELS_API_KEY is set → uses the authenticated MailChannels API (recommended)
 *  2. Fallback: domain must have MailChannels SPF/DKIM configured on Cloudflare DNS
 *
 * Docs: https://developers.cloudflare.com/workers/tutorials/send-emails-with-mailchannels/
 */

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Sends a transactional email via the MailChannels HTTP API.
 * Throws on non-2xx response.
 */
export async function sendEmail(
  opts: SendEmailOptions,
  env: { MAILCHANNELS_API_KEY?: string; MAIL_FROM?: string },
): Promise<void> {
  const from = env.MAIL_FROM ?? 'noreply@bukoo.id';
  const payload = {
    personalizations: [{ to: [{ email: opts.to }] }],
    from: { email: from, name: 'Bukoo' },
    subject: opts.subject,
    content: [
      { type: 'text/plain', value: opts.text ?? opts.subject },
      { type: 'text/html', value: opts.html },
    ],
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (env.MAILCHANNELS_API_KEY) {
    headers['X-Auth-Api-Key'] = env.MAILCHANNELS_API_KEY;
  }

  const response = await fetch('https://api.mailchannels.net/tx/v1/send', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`MailChannels send failed (${response.status}): ${body}`);
  }
}

/**
 * Sends a 6-digit OTP email for password reset.
 */
export async function sendOtpEmail(
  email: string,
  code: string,
  env: { MAILCHANNELS_API_KEY?: string; MAIL_FROM?: string },
): Promise<void> {
  return sendEmail(
    {
      to: email,
      subject: `${code} — Kode Reset Password Bukoo`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
          <h2>Reset Password Bukoo</h2>
          <p>Gunakan kode verifikasi berikut untuk mereset password Anda:</p>
          <div style="font-size:32px;font-weight:bold;letter-spacing:8px;padding:16px;background:#f4f4f4;text-align:center;border-radius:8px">
            ${code}
          </div>
          <p style="color:#888;font-size:13px;margin-top:16px">
            Kode ini berlaku selama 15 menit. Jangan bagikan kode ini kepada siapapun.
          </p>
        </div>
      `,
      text: `Kode reset password Bukoo Anda: ${code}\nBerlaku 15 menit.`,
    },
    env,
  );
}
