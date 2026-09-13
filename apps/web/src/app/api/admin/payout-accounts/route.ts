import { getAdminPayoutAccounts } from '@/app/admin/royalty/payout-actions';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const accounts = await getAdminPayoutAccounts();
    return NextResponse.json(accounts);
  } catch (e) {
    console.error('Payout accounts fetch failed:', e);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}