// Shared error catalog for the auth pages (login / register / forgot-password).
//
// Server actions redirect with a KEY (e.g. `?error=EMAIL_TAKEN`) and pages map
// the key to Indonesian copy via ERROR_MESSAGES. NextAuth OAuth error codes
// (e.g. `OAuthCallback`) arrive from the auth callback URL and use the same map.
// Unknown keys fall through as raw strings for forward compatibility.

export const ERROR_MESSAGES: Record<string, string> = {
  // NextAuth OAuth / sign-in error codes
  OAuthAccountNotLinked:
    'Email ini sudah digunakan pada metode masuk lain. Silakan masuk menggunakan metode yang sama dengan pendaftaran awal.',
  OAuthSignin: 'Gagal mengawali login dengan Google. Silakan coba lagi.',
  OAuthCallback: 'Gagal menyelesaikan otentikasi Google. Silakan coba lagi.',
  OAuthCreateAccount: 'Gagal membuat akun baru dengan Google.',
  CredentialsSignin: 'Email atau password yang Anda masukkan salah.',
  AccessDenied: 'Akses ditolak.',
  SessionRequired: 'Silakan masuk terlebih dahulu.',

  // Server-action validation / flow codes
  NAME_REQUIRED: 'Nama lengkap wajib diisi.',
  EMAIL_INVALID: 'Format email tidak valid.',
  PASSWORD_TOO_SHORT: 'Password minimal 6 karakter.',
  EMAIL_TAKEN: 'Akun dengan email ini sudah terdaftar. Silakan masuk.',
  PASSWORDLESS: 'Akun ini terdaftar dengan Google. Silakan masuk menggunakan Google.',
  RESET_FAILED: 'Terjadi kesalahan. Silakan coba lagi.',
  RESET_DONE: 'Kata sandi berhasil diperbarui. Silakan masuk.',
  SIGNUP_SIGNIN_FAILED: 'Pendaftaran berhasil. Silakan masuk.',
  GENERIC_ERROR: 'Terjadi kesalahan. Silakan coba lagi.',
};

/** Map an error/message key to Indonesian copy; unknown keys pass through raw. */
export function mapError(key: string | undefined | null): string | null {
  if (!key) return null;
  return ERROR_MESSAGES[key] ?? key;
}
