import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/dpo';
import { getSupabase } from '@/lib/supabase';

// DPO sends a GET to this URL when a hosted-page card payment completes.
// Query params: TransactionToken, CompanyRef, CompanyToken (their token, used for validation)
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const transactionToken = searchParams.get('TransactionToken');
    const companyRef = searchParams.get('CompanyRef');
    const incomingToken = searchParams.get('CompanyToken');

    if (!transactionToken || !companyRef || incomingToken !== process.env.DPO_COMPANY_TOKEN) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { result } = await verifyToken(transactionToken);

        if (result === '000') {
            const db = getSupabase();
            await (db as any)
                .from('bookings')
                .update({ status: 'confirmed', payment_reference: companyRef })
                .eq('payment_reference', companyRef)
                .eq('status', 'pending_payment');
        }

        return NextResponse.json({ received: true, result });
    } catch (error) {
        console.error('DPO webhook error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
