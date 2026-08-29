/**
 * Email sender using the MailChannels HTTP API — web copy.
 *
 * Mirrors `apps/api/src/lib/mail.ts` (byte-compatible payload/endpoint) but
 * reads secrets via `process.env` (NextAuth does the same for the Google
 * provider; `wrangler secret put` exposes them to the deployed worker and
 * `apps/web/.dev.vars` to `wrangler dev`).
 *
 * Sends BOTH auth headers (`X-Api-Key` current + legacy `X-Auth-Api-Key`) so
 * newly-created MailChannels keys and older 2023-era keys both work.
 *
 * Docs: https://docs.mailchannels.com/email-api/
 */

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

function mailEnv(): { MAILCHANNELS_API_KEY?: string; MAIL_FROM?: string } {
  return {
    MAILCHANNELS_API_KEY: process.env.MAILCHANNELS_API_KEY,
    MAIL_FROM: process.env.MAIL_FROM,
  };
}

/**
 * Sends a transactional email via the MailChannels HTTP API.
 * Throws on non-2xx response. Without MAILCHANNELS_API_KEY the request is
 * still attempted (MailChannels accepts unauthenticated sends when the domain
 * has DKIM/SPF via the legacy flow); callers should catch and not fail the
 * user-facing flow on mail errors.
 */
export async function sendEmail(opts: SendEmailOptions): Promise<void> {
  const env = mailEnv();
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
    // Current MailChannels Email API header + legacy header for older keys.
    headers['X-Api-Key'] = env.MAILCHANNELS_API_KEY;
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
export async function sendOtpEmail(email: string, code: string): Promise<void> {
  return sendEmail({
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
  });
}