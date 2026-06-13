import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getResend, FROM } from '@/lib/resend';
import { emailTemplates } from '@/lib/emailTemplates';

interface BookingRow {
    id: string;
    name: string;
    email: string;
    date: string;
    time: string;
    status: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = () => getSupabase() as any;

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Missing booking ID' }, { status: 400 });
    }

    const { data: booking, error } = await db()
        .from('bookings')
        .select('id, name, email, date, time, status')
        .eq('id', id)
        .single() as { data: BookingRow | null; error: unknown };

    if (error || !booking) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ booking });
}

export async function POST(req: Request) {
    try {
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ error: 'Missing booking ID' }, { status: 400 });
        }

        // Fetch booking to validate it exists and is not already cancelled
        const { data: booking, error: fetchError } = await db()
            .from('bookings')
            .select('id, name, email, date, time, status')
            .eq('id', id)
            .single() as { data: BookingRow | null; error: unknown };

        if (fetchError || !booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        if (booking.status === 'cancelled') {
            return NextResponse.json({ error: 'already_cancelled' }, { status: 409 });
        }

        // Mark as cancelled
        const { error: updateError } = await db()
            .from('bookings')
            .update({ status: 'cancelled' })
            .eq('id', id) as { error: unknown };

        if (updateError) {
            console.error('Supabase update error:', updateError);
            return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 });
        }

        // Send cancellation emails
        const resend = getResend();
        const { data: tpl } = await db().from('email_templates').select('*').eq('id', 'booking_cancelled').single();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { subject, html } = (emailTemplates as any).bookingCancelled(booking.name, booking.date, booking.time, tpl ?? {});

        await Promise.allSettled([
            resend.emails.send({ from: FROM, to: [booking.email], subject, html }),
            resend.emails.send({
                from: FROM,
                to: [process.env.ADMIN_EMAIL || process.env.RESEND_FROM_EMAIL || 'hello@axisliving.co.zm'],
                subject: `Booking Cancelled: ${booking.name}`,
                text: [
                    'A client has cancelled their booking.',
                    '',
                    `Client: ${booking.name}`,
                    `Email:  ${booking.email}`,
                    `Date:   ${booking.date}`,
                    `Time:   ${booking.time} (CAT)`,
                ].join('\n'),
            }),
        ]);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Cancel booking error:', error);
        return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
    }
}
