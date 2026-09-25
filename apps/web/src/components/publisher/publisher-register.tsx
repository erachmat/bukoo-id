'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, X } from 'lucide-react';
import { signUpPublisher } from '@/app/(auth)/actions';
import {
  INITIAL_PUBLISHER_REGISTER_STATE,
  type PublisherRegisterState,
} from '@/lib/publisher-register-state';

type PublisherRegisterFormProps = {
  callbackUrl: string;
  modal?: boolean;
  onClose?: () => void;
  onLogin?: () => void;
};

export function PublisherRegisterForm({ callbackUrl, modal = false, onClose, onLogin }: PublisherRegisterFormProps) {
  const [state, action, pending] = useActionState<PublisherRegisterState, FormData>(
    signUpPublisher,
    INITIAL_PUBLISHER_REGISTER_STATE,
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if ((state.formError || Object.keys(state.fieldErrors).length > 0) && nameRef.current) {
      nameRef.current.focus();
    }
  }, [state]);

  return (
    <div className="publisher-register-form" data-modal={modal ? 'true' : undefined}>
      <div className="publisher-register-heading-row">
        <div className="publisher-register-heading">
          <span className="publisher-register-eyebrow">Publisher Portal</span>
          <h1 id={modal ? 'publisher-register-dialog-title' : undefined}>Buat akun portal penerbit</h1>
          <p>Buat akun untuk mengakses portal dan mengajukan judul. Kerja sama dan publikasi judul tetap melalui proses peninjauan tim BUKOO.</p>
        </div>
        {onClose && (
          <button type="button" className="publisher-login-close" onClick={onClose} aria-label="Tutup pendaftaran">
            <X aria-hidden="true" />
          </button>
        )}
      </div>

      <form action={action}>
        <input type="hidden" name="callbackUrl" value={callbackUrl} />

        <div className="publisher-register-field">
          <label htmlFor="publisher-register-name">nama / nama penerbit<span aria-hidden="true">*</span></label>
          <input
            ref={nameRef}
            id="publisher-register-name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="mis. Penerbit Nusantara"
            required
            aria-invalid={Boolean(state.fieldErrors.name)}
            aria-describedby={state.fieldErrors.name ? 'publisher-register-name-error' : undefined}
          />
          {state.fieldErrors.name && <p id="publisher-register-name-error" className="publisher-register-field-error">{state.fieldErrors.name}</p>}
        </div>

        <div className="publisher-register-field">
          <label htmlFor="publisher-register-email">email<span aria-hidden="true">*</span></label>
          <input
            id="publisher-register-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="nama@penerbit.id"
            required
            aria-invalid={Boolean(state.fieldErrors.email)}
            aria-describedby={state.fieldErrors.email ? 'publisher-register-email-error' : undefined}
          />
          {state.fieldErrors.email && <p id="publisher-register-email-error" className="publisher-register-field-error">{state.fieldErrors.email}</p>}
        </div>

        <div className="publisher-register-field">
          <label htmlFor="publisher-register-password">password<span aria-hidden="true">*</span></label>
          <div className="publisher-register-password-wrap">
            <input
              id="publisher-register-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Minimal 6 karakter"
              minLength={6}
              required
              aria-invalid={Boolean(state.fieldErrors.password)}
              aria-describedby={state.fieldErrors.password ? 'publisher-register-password-error' : undefined}
            />
            <button
              type="button"
              className="publisher-register-password-toggle"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
            >
              {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
            </button>
          </div>
          {state.fieldErrors.password && <p id="publisher-register-password-error" className="publisher-register-field-error">{state.fieldErrors.password}</p>}
        </div>

        <div className="publisher-register-field">
          <label htmlFor="publisher-register-confirm-password">konfirmasi password<span aria-hidden="true">*</span></label>
          <div className="publisher-register-password-wrap">
            <input
              id="publisher-register-confirm-password"
              name="confirmPassword"
              type={showConfirmation ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Ulangi password"
              minLength={6}
              required
              aria-invalid={Boolean(state.fieldErrors.confirmPassword)}
              aria-describedby={state.fieldErrors.confirmPassword ? 'publisher-register-confirm-password-error' : undefined}
            />
            <button
              type="button"
              className="publisher-register-password-toggle"
              onClick={() => setShowConfirmation((visible) => !visible)}
              aria-label={showConfirmation ? 'Sembunyikan konfirmasi password' : 'Tampilkan konfirmasi password'}
            >
              {showConfirmation ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
            </button>
          </div>
          {state.fieldErrors.confirmPassword && <p id="publisher-register-confirm-password-error" className="publisher-register-field-error">{state.fieldErrors.confirmPassword}</p>}
        </div>

        {state.formError && <p className="publisher-register-alert" role="alert">{state.formError}</p>}

        <button type="submit" className="publisher-login-submit publisher-register-submit" disabled={pending}>
          {pending ? 'Membuat akun...' : 'Buat akun penerbit'}
        </button>
      </form>

      <p className="publisher-login-terms">
        Dengan mendaftar, Anda menyetujui <a href="/syarat-ketentuan">syarat dan ketentuan</a> serta <a href="/privasi">kebijakan privasi</a> BUKOO.
      </p>
      <p className="publisher-register-switch">
        Sudah punya akun? <Link
          href={`/publisher/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          onClick={(event) => {
            if (onLogin) {
              event.preventDefault();
              onLogin();
            }
          }}
        >Masuk di sini</Link>
      </p>
      <p className="publisher-login-copyright">© 2026 PT BUKOO DIGITAL INDONESIA · Semua hak dilindungi</p>
    </div>
  );
}
