import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { createToken, chargeTokenMobile } from '@/lib/dpo';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://axisliving.co.zm';

export async function POST(req: Request) {
    try {
        const { name, email, phone, network, amount, currency } = await req.json();

        if (!phone || !network || !amount || !currency) {
            return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
        }

        const reference = `ALV-${Date.now()}-${randomBytes(4).toString('hex')}`;

        const nameParts = (name ?? '').trim().split(/\s+/);
        const firstName = nameParts[0] || undefined;
        const lastName = nameParts.slice(1).join(' ') || undefined;

        const { transactionToken } = await createToken({
            amount,
            currency,
            reference,
            redirectUrl: `${SITE_URL}/booking`,
            backUrl: `${SITE_URL}/booking`,
            customerFirstName: firstName,
            customerLastName: lastName,
            customerEmail: email || undefined,
            customerPhone: phone || undefined,
        });

        await chargeTokenMobile(transactionToken, phone, network);

        return NextResponse.json({ success: true, transactionToken, reference });
    } catch (error) {
        console.error('Payment initiation error:', error);
        return NextResponse.json(
            { success: false, message: error instanceof Error ? error.message : 'Failed to initiate payment' },
            { status: 500 },
        );
    }
}
