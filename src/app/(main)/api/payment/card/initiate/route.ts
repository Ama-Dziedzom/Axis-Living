import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { createToken, getPaymentUrl } from '@/lib/dpo';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://noalivingstudio.co.zm';

export async function POST(req: Request) {
    try {
        const { name, email, phone, amount, currency } = await req.json();

        if (!name || !email || !amount || !currency) {
            return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
        }

        const reference = `ALV-${Date.now()}-${randomBytes(4).toString('hex')}`;

        const nameParts = name.trim().split(/\s+/);
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || undefined;

        const { transactionToken } = await createToken({
            amount,
            currency,
            reference,
            redirectUrl: `${SITE_URL}/booking`,
            backUrl: `${SITE_URL}/booking`,
            customerFirstName: firstName,
            customerLastName: lastName,
            customerEmail: email,
            customerPhone: phone || undefined,
        });

        return NextResponse.json({
            success: true,
            transactionToken,
            reference,
            paymentUrl: getPaymentUrl(transactionToken),
        });
    } catch (error) {
        console.error('Card payment initiation error:', error);
        return NextResponse.json(
            { success: false, message: error instanceof Error ? error.message : 'Failed to initiate card payment' },
            { status: 500 },
        );
    }
}
