import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { promises as dnsPromises } from 'dns';

export interface MailTestResult {
  success: boolean;
  message: string;
  stack?: string;
  code?: string;
  command?: string;
}

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    // Trigger asynchronous pre-initialization of the SMTP transporter
    this.getTransporter().catch((err) => {
      console.error('MailService: Background SMTP initialization error:', err);
    });
  }

  private async getTransporter(): Promise<nodemailer.Transporter | null> {
    if (this.transporter) {
      return this.transporter;
    }

    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS?.replace(/\s+/g, '');

    if (host && port && user && pass) {
      let resolvedHost = host;

      // If the host is a domain, resolve it to an IPv4 address to bypass Alpine getaddrinfo IPv6 prioritization
      if (host.includes('.')) {
        try {
          const addresses = await dnsPromises.resolve4(host);
          if (addresses && addresses.length > 0) {
            resolvedHost = addresses[0];
            console.log(`MailService: Resolved ${host} to IPv4 ${resolvedHost}`);
          }
        } catch (dnsErr) {
          console.error(`MailService: DNS resolution failed for ${host}, using hostname directly:`, dnsErr);
        }
      }

      this.transporter = nodemailer.createTransport({
        host: resolvedHost,
        port: parseInt(port, 10),
        secure: port === '465',
        auth: {
          user,
          pass,
        },
        family: 4,
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
        tls: {
          servername: host, // Critical for SSL validation against the domain when connecting to IP
          rejectUnauthorized: true,
        },
      } as unknown as nodemailer.TransportOptions);
      console.log('MailService: SMTP transporter initialized successfully.');
      return this.transporter;
    }

    return null;
  }

  async testMailConnection(): Promise<MailTestResult> {
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        const response = await fetch('https://api.resend.com/domains', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
          },
        });
        if (response.ok) {
          return { success: true, message: 'Resend API connection verified successfully.' };
        } else {
          const errText = await response.text();
          if (errText.includes('restricted_api_key') || errText.includes('only send emails')) {
            return { success: true, message: 'Resend API connection verified (restricted send-only key).' };
          }
          return { success: false, message: `Resend API returned status ${response.status}: ${errText}`, code: 'RESEND_ERR' };
        }
      } catch (err: unknown) {
        const error = err as Error;
        return { success: false, message: `Resend connection failed: ${error.message}`, stack: error.stack, code: 'RESEND_CONN_TIMEOUT' };
      }
    }

    const transporter = await this.getTransporter();
    if (!transporter) {
      return { success: false, message: 'SMTP Transporter is not initialized (check environment variables).' };
    }
    try {
      await transporter.verify();
      return { success: true, message: 'SMTP Connection verified successfully.' };
    } catch (err: unknown) {
      const error = err as Error & { code?: string; command?: string };
      return { success: false, message: error.message, stack: error.stack, code: error.code, command: error.command };
    }
  }

  async sendPasswordResetOtp(email: string, otp: string): Promise<boolean> {
    const resendKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM || process.env.SMTP_FROM || '"BUKOO" <onboarding@resend.dev>';
    const subject = 'Atur Ulang Password BUKOO';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #FAF8F5;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #1B3A2D; margin: 0;">BUKOO</h2>
          <p style="color: #8E8E93; font-size: 14px; margin: 5px 0 0 0;">Teman Membaca Terbaik Anda</p>
        </div>
        <hr style="border: 0; border-top: 1px solid #e0e0e0; margin-bottom: 20px;" />
        <p style="font-size: 16px; color: #1B3A2D;">Halo,</p>
        <p style="font-size: 15px; color: #1B3A2D; line-height: 1.5;">
          Kami menerima permintaan untuk mengatur ulang password akun BUKOO Anda. Gunakan kode verifikasi (OTP) di bawah ini untuk melanjutkan:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #C8541F; background-color: #FAF8F5; border: 2px dashed #C8541F; padding: 10px 20px; border-radius: 8px; display: inline-block;">
            ${otp}
          </span>
        </div>
        <p style="font-size: 14px; color: #8E8E93; line-height: 1.5;">
          Kode verifikasi ini berlaku selama 15 menit. Jika Anda tidak meminta pengaturan ulang password ini, Anda dapat mengabaikan email ini dengan aman.
        </p>
        <hr style="border: 0; border-top: 1px solid #e0e0e0; margin-top: 30px; margin-bottom: 20px;" />
        <div style="text-align: center; font-size: 12px; color: #8E8E93;">
          <p style="margin: 0 0 5px 0;">&copy; ${new Date().getFullYear()} BUKOO. All rights reserved.</p>
        </div>
      </div>
    `;

    if (resendKey) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from,
            to: email,
            subject,
            html,
          }),
        });

        if (response.ok) {
          console.log(`MailService: Password reset OTP sent to ${email} successfully via Resend API.`);
          return true;
        } else {
          const errText = await response.text();
          console.error(`MailService: Resend API returned error status ${response.status}: ${errText}`);
          return false;
        }
      } catch (err) {
        console.error(`MailService: Failed to send email via Resend API:`, err);
        return false;
      }
    }

    const transporter = await this.getTransporter();
    if (transporter) {
      try {
        await transporter.sendMail({
          from,
          to: email,
          subject,
          html,
        });
        console.log(`MailService: Password reset OTP sent to ${email} successfully.`);
        return true;
      } catch (err) {
        console.error(`MailService: Failed to send password reset OTP to ${email}:`, err);
        return false;
      }
    } else {
      console.log(`\n======================================================`);
      console.log(`[MOCK EMAIL SENT TO: ${email}]`);
      console.log(`Subject: ${subject}`);
      console.log(`OTP Code: ${otp}`);
      console.log(`======================================================\n`);
      return true;
    }
  }
}
