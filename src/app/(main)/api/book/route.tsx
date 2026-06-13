import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const { name, email, phone, date, time, projectType, consultationType, message, currency, amount, paymentReference } = await req.json();

        if (!name || !email || !date || !time) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields' },
                { status: 400 }
            );
        }

        const meetingLink = process.env.MEETING_LINK || 'https://meet.google.com/owu-zhiz-bns';

        // 1. Persist booking to Supabase
        let cancellationUrl: string | null = null;
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const db = getSupabase() as any;
            const { data: booking, error: dbError } = await db
                .from('bookings')
                .insert({
                    name,
                    email,
                    phone: phone || null,
                    date,
                    time,
                    project_type: projectType || null,
                    consultation_type: consultationType || null,
                    message: message || null,
                    currency: currency || 'ZMW',
                    amount: amount || null,
                    payment_reference: paymentReference || null,
                    status: 'confirmed',
                })
                .select('id')
                .single();
            if (dbError) {
                console.error('Supabase insert error:', dbError);
            } else if (booking?.id) {
                const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://axisliving.co.zm';
                cancellationUrl = `${siteUrl}/booking/cancel?id=${booking.id}`;
            }
        } catch (e) {
            console.error('Supabase error:', e);
        }

        // 2. Delegate email sending to portal (fire-and-forget)
        const portalUrl = process.env.PORTAL_URL;
        const emailSecret = process.env.EMAIL_SECRET;
        if (portalUrl && emailSecret) {
            fetch(`${portalUrl}/api/email/booking-confirmation`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${emailSecret}` },
                body: JSON.stringify({ name, email, phone, date, time, projectType, consultationType, message, meetingLink, cancellationUrl }),
            }).catch((e) => console.error('Portal email error:', e));
        }

        return NextResponse.json({ success: true, message: 'Booking confirmed' });

    } catch (error) {
        console.error('Booking API error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to process booking' },
            { status: 500 }
        );
    }
}
