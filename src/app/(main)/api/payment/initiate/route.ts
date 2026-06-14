import { NextResponse } from 'next/server';
import { createCustomer, createMobileMoneyPaymentMethod, createCharge } from '@/lib/flutterwave';
import { randomBytes } from 'crypto';

export async function POST(req: Request) {
    try {
        const { name, email, phone, network, amount, currency } = await req.json();

        if (!name || !email || !phone || !network || !amount || !currency) {
            return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
        }

        const customer = await createCustomer(email, name, phone);
        const customerId = customer.data?.id;
        if (!customerId) throw new Error('Failed to create customer');

        const paymentMethod = await createMobileMoneyPaymentMethod(network, phone, customerId);
        const paymentMethodId = paymentMethod.data?.id;
        if (!paymentMethodId) throw new Error('Failed to create payment method');

        const reference = `ALV-${Date.now()}-${randomBytes(4).toString('hex')}`;
        const charge = await createCharge(customerId, paymentMethodId, amount, currency, reference);

        return NextResponse.json({
            success: true,
            chargeId: charge.data?.id,
            reference,
            status: charge.data?.status,
        });
    } catch (error) {
        console.error('Payment initiation error:', error);
        return NextResponse.json(
            { success: false, message: error instanceof Error ? error.message : 'Failed to initiate payment' },
            { status: 500 },
        );
    }
}
