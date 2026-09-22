'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { requestPublisherPasswordReset, verifyPublisherPasswordReset } from '@/app/(auth)/actions';
import { mapError } from '@/app/(auth)/errors';
import { PasswordInput } from '@/components/auth/password-input';
import { SubmitButton } from '@/components/auth/submit-button';

type PublisherForgotPasswordProps = {
  callbackUrl: string;
  email?: string;
  error?: string;
  message?: string;
  sentAt?: string;
  step?: string;
};

export function PublisherForgotPassword({
  callbackUrl,
  email = '',
  error,
  message,
  sentAt,
  step,
}: PublisherForgotPasswordProps) {
  const isCodeStep = step === 'code';
  const errorMessage = mapError(error);
  const infoMessage = mapError(message);

  return (
    <div className="publisher-forgot-form">
      <div className="publisher-forgot-heading">
        <span className="publisher-register-eyebrow">Publisher Portal</span>
        <h1>Lupa password?</h1>
        <p>
          {isCodeStep
            ? 'Masukkan kode dari email Anda dan buat password baru untuk akun penerbit.'
            : 'Masukkan email akun penerbit Anda. Kami akan mengirimkan kode verifikasi.'}
        </p>
      </div>

      {errorMessage && <p className="publisher-forgot-alert" role="alert">{errorMessage}</p>}
      {infoMessage && <p className="publisher-forgot-success" role="status">{infoMessage}</p>}

      {isCodeStep ? (
        <PublisherVerifyForm email={email} callbackUrl={callbackUrl} sentAt={sentAt} />
      ) : (
        <form action={requestPublisherPasswordReset}>
          <div className="publisher-forgot-field">
            <label htmlFor="publisher-forgot-email">email<span aria-hidden="true">*</span></label>
            <input
              id="publisher-forgot-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="nama@penerbit.id"
              required
            />
          </div>
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <SubmitButton className="publisher-login-submit publisher-forgot-submit">
            Kirim kode verifikasi
          </SubmitButton>
        </form>
      )}

      <p className="publisher-forgot-back-link">
        <Link href={`/publisher/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}>
          Kembali ke masuk
        </Link>
      </p>
    </div>
  );
}

function PublisherVerifyForm({ email, callbackUrl, sentAt }: { email: string; callbackUrl: string; sentAt?: string }) {
  return (
    <>
      <div className="publisher-forgot-email-note">
        Kode dikirim ke <strong>{email}</strong>
      </div>
      <form action={verifyPublisherPasswordReset}>
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="callbackUrl" value={callbackUrl} />

        <div className="publisher-forgot-field">
          <label htmlFor="publisher-forgot-code">kode verifikasi<span aria-hidden="true">*</span></label>
          <input
            id="publisher-forgot-code"
            name="code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            placeholder="123456"
            required
          />
        </div>

        <div className="publisher-forgot-field">
          <label htmlFor="publisher-forgot-password">password baru<span aria-hidden="true">*</span></label>
          <PasswordInput
            id="publisher-forgot-password"
            name="password"
            minLength={6}
            autoComplete="new-password"
            placeholder="Minimal 6 karakter"
            required
            className="publisher-forgot-input"
          />
        </div>

        <div className="publisher-forgot-field">
          <label htmlFor="publisher-forgot-confirm-password">konfirmasi password<span aria-hidden="true">*</span></label>
          <PasswordInput
            id="publisher-forgot-confirm-password"
            name="confirmPassword"
            minLength={6}
            autoComplete="new-password"
            placeholder="Ulangi password"
            required
            className="publisher-forgot-input"
          />
        </div>

        <SubmitButton className="publisher-login-submit publisher-forgot-submit">
          Simpan password baru
        </SubmitButton>
      </form>

      <ResendOtpButton email={email} callbackUrl={callbackUrl} sentAt={sentAt} />
    </>
  );
}

function ResendOtpButton({ email, callbackUrl, sentAt }: { email: string; callbackUrl: string; sentAt?: string }) {
  const [secondsLeft, setSecondsLeft] = useState(() => {
    if (!sentAt) return 0;
    return Math.max(0, 60 - Math.floor((Date.now() - Number(sentAt)) / 1000));
  });

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = window.setInterval(() => setSecondsLeft((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [secondsLeft]);

  return (
    <form action={requestPublisherPasswordReset} className="publisher-forgot-resend-form">
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <button type="submit" className="publisher-forgot-resend" disabled={secondsLeft > 0}>
        {secondsLeft > 0 ? `Kirim ulang dalam ${secondsLeft} detik` : 'Kirim ulang kode'}
      </button>
    </form>
  );
}
