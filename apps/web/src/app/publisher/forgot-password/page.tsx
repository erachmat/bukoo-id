import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { safeCallbackUrl, defaultRedirectForRole } from '@/lib/auth-helpers';
import { PublisherForgotPassword } from '@/components/publisher/publisher-forgot-password';

export const metadata = {
  title: 'BUKOO Publisher — Reset Password',
  description: 'Reset password akun penerbit BUKOO dengan kode verifikasi email.',
};

export default async function PublisherForgotPasswordPage(props: {
  searchParams: Promise<{
    callbackUrl?: string;
    email?: string;
    error?: string;
    message?: string;
    sentAt?: string;
    step?: string;
  }>;
}) {
  const params = await props.searchParams;
  const session = await auth();
  if (session) {
    const role = (session.user as { role?: string } | undefined)?.role;
    redirect(safeCallbackUrl(params.callbackUrl, defaultRedirectForRole(role)));
  }

  return (
    <main className="publisher-forgot-standalone">
      <PublisherForgotPassword
        callbackUrl={safeCallbackUrl(params.callbackUrl, '/publisher/dashboard')}
        email={params.email}
        error={params.error}
        message={params.message}
        sentAt={params.sentAt}
        step={params.step}
      />
    </main>
  );
}
