import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { createToken, getPaymentUrl } from '@/lib/dpo';
import { getSupabase } from '@/lib/supabase';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://noalivingstudio.co.zm';

export async function POST(req: Request) {
    try {
        const {
            name, email, phone,
            date, time, projectType, consultationType, message,
            amount, currency,
        } = await req.json();

        if (!name || !email || !date || !time || !amount || !currency) {
            return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
        }

        const reference = `NOA-${Date.now()}-${randomBytes(4).toString('hex')}`;
        const nameParts = name.trim().split(/\s+/);
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || undefined;

        const { transactionToken } = await createToken({
            amount,
            currency,
            reference,
            redirectUrl: `${SITE_URL}/booking/success`,
            backUrl: `${SITE_URL}/booking/cancel`,
            customerFirstName: firstName,
            customerLastName: lastName,
            customerEmail: email,
            customerPhone: phone || undefined,
        });

        // Persist pending booking — confirmed only after verifyToken succeeds
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const db = getSupabase() as any;
        const { error: dbError } = await db.from('bookings').insert({
            name,
            email,
            phone: phone || null,
            date,
            time,
            project_type: projectType || null,
            consultation_type: consultationType || null,
            message: message || null,
            currency,
            amount,
            payment_reference: transactionToken,
            status: 'pending_payment',
        });

        if (dbError) {
            console.error('Supabase pending booking error:', dbError);
            return NextResponse.json({ success: false, message: 'Failed to create booking' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            paymentUrl: getPaymentUrl(transactionToken),
        });
    } catch (error) {
        console.error('Card payment initiation error:', error);
        return NextResponse.json(
            { success: false, message: error instanceof Error ? error.message : 'Failed to initiate payment' },
            { status: 500 },
        );
    }
}
