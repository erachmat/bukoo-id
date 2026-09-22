'use client';

import { useActionState, useEffect, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, X } from 'lucide-react';
import {
  signInPublisher,
} from '@/app/(auth)/actions';
import {
  INITIAL_PUBLISHER_LOGIN_STATE,
  type PublisherLoginState,
} from '@/lib/publisher-login-state';
import { mapError } from '@/app/(auth)/errors';

type PublisherLoginFormProps = {
  callbackUrl: string;
  message?: string;
  onClose?: () => void;
  standalone?: boolean;
};

export function PublisherLoginForm({ callbackUrl, message, onClose, standalone = false }: PublisherLoginFormProps) {
  const router = useRouter();
  const [state, action, pending] = useActionState<PublisherLoginState, FormData>(
    signInPublisher,
    INITIAL_PUBLISHER_LOGIN_STATE,
  );
  const [showPassword, setShowPassword] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  const close = () => {
    if (onClose) {
      onClose();
      return;
    }
    if (standalone) router.push('/publisher/daftar');
  };

  useEffect(() => {
    if (state.error && emailRef.current) emailRef.current.focus();
  }, [state.error]);

  return (
    <div className="publisher-login-form" data-standalone={standalone ? 'true' : undefined}>
      <div className="publisher-login-heading-row">
        <h1 id={standalone ? undefined : 'publisher-login-dialog-title'}>Masuk</h1>
        <button type="button" className="publisher-login-close" onClick={close} aria-label="Tutup login">
          <X aria-hidden="true" />
        </button>
      </div>

      <form action={action} noValidate={false}>
        <input type="hidden" name="callbackUrl" value={callbackUrl} />

        {message && <p className="publisher-login-success" role="status">{mapError(message)}</p>}

        <div className="publisher-login-field">
          <label htmlFor="publisher-login-email">email<span aria-hidden="true">*</span></label>
          <input
            ref={emailRef}
            id="publisher-login-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Email"
            required
            aria-invalid={Boolean(state.emailError)}
            aria-describedby={state.emailError ? 'publisher-login-email-error' : undefined}
          />
          {state.emailError && <p id="publisher-login-email-error" className="publisher-login-field-error">{state.emailError}</p>}
        </div>

        <div className="publisher-login-field">
          <label htmlFor="publisher-login-password">kata sandi<span aria-hidden="true">*</span></label>
          <div className="publisher-login-password-wrap">
            <input
              id="publisher-login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              aria-invalid={Boolean(state.passwordError)}
              aria-describedby={state.passwordError ? 'publisher-login-password-error' : undefined}
            />
            <button
              type="button"
              className="publisher-login-password-toggle"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
            >
              {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
            </button>
          </div>
          {state.passwordError && <p id="publisher-login-password-error" className="publisher-login-field-error">{state.passwordError}</p>}
        </div>

        <div className="publisher-login-forgot-row">
          <a href={`/publisher/forgot-password?callbackUrl=${encodeURIComponent(callbackUrl)}`}>
            Lupa password?
          </a>
        </div>

        {state.error && !state.emailError && (
          <p className="publisher-login-alert" role="alert">{state.error}</p>
        )}

        <button type="submit" className="publisher-login-submit" disabled={pending}>
          {pending ? 'Memproses...' : 'Masuk'}
        </button>
      </form>

      <p className="publisher-login-terms">
        Dengan melanjutkan, Anda menyetujui <a href="/syarat-ketentuan">syarat dan ketentuan</a> serta <a href="/privasi">kebijakan privasi</a> BUKOO.
      </p>
      <p className="publisher-login-register-link">
        Belum punya akun? <a href={`/publisher/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}>Daftar di sini</a>
      </p>
      <p className="publisher-login-copyright">© 2026 PT BUKOO DIGITAL INDONESIA · Semua hak dilindungi</p>
    </div>
  );
}

type PublisherLoginModalProps = {
  callbackUrl: string;
  onClose: () => void;
};

function PublisherLoginModal({ callbackUrl, onClose }: PublisherLoginModalProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  return (
    <div className="publisher-login-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="publisher-login-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="publisher-login-dialog-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <PublisherLoginForm callbackUrl={callbackUrl} onClose={onClose} />
      </div>
    </div>
  );
}

type PublisherLoginTriggerProps = {
  callbackUrl: string;
  children?: ReactNode;
  className?: string;
};

export function PublisherLoginTrigger({ callbackUrl, children = 'Masuk', className }: PublisherLoginTriggerProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = () => {
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  return (
    <>
      <button ref={triggerRef} type="button" className={className} onClick={() => setOpen(true)}>
        {children}
      </button>
      {open && <PublisherLoginModal callbackUrl={callbackUrl} onClose={close} />}
    </>
  );
}
