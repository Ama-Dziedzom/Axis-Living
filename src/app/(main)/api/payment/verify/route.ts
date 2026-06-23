import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/dpo';
import { getSupabase } from '@/lib/supabase';
import { getResend, FROM, AUDIENCE_ID } from '@/lib/resend';
import { emailTemplates } from '@/lib/emailTemplates';

function generateICS(name: string, email: string, date: string, time: string, meetingLink: string): string {
    const dateObj = new Date(`${date} ${time}`);
    const endObj = new Date(dateObj.getTime() + 30 * 60 * 1000);
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const uid = `${Date.now()}-${email.replace('@', '-at-')}@noalivingstudio.co.zm`;
    return [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//NOA Living Studio//Booking//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:REQUEST',
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTART:${fmt(dateObj)}`,
        `DTEND:${fmt(endObj)}`,
        'SUMMARY:Discovery Call — NOA Living Studio',
        `DESCRIPTION:Your discovery consultation with NOA Living Studio.\\nJoin here: ${meetingLink}`,
        `LOCATION:${meetingLink}`,
        `ORGANIZER;CN=NOA Living Studio:mailto:${process.env.RESEND_FROM_EMAIL || 'hello@noalivingstudio.co.zm'}`,
        `ATTENDEE;ROLE=REQ-PARTICIPANT;CN=${name}:mailto:${email}`,
        'STATUS:CONFIRMED',
        'SEQUENCE:0',
        'END:VEVENT',
        'END:VCALENDAR',
    ].join('\r\n');
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
        return NextResponse.json({ success: false, message: 'Missing token' }, { status: 400 });
    }

    try {
        const { result } = await verifyToken(token);

        if (result !== '000') {
            const status = result === '900' ? 'pending' : 'failed';
            return NextResponse.json({ success: true, status });
        }

        // Payment confirmed — find the pending booking
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const db = getSupabase() as any;

        const { data: booking, error: fetchError } = await db
            .from('bookings')
            .select('*')
            .eq('payment_reference', token)
            .single();

        if (fetchError || !booking) {
            return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
        }

        // Idempotent — if already confirmed (webhook beat us), just return the booking
        if (booking.status === 'confirmed') {
            return NextResponse.json({ success: true, status: 'succeeded', booking });
        }

        // Update booking status to confirmed
        const { error: updateError } = await db
            .from('bookings')
            .update({ status: 'confirmed' })
            .eq('payment_reference', token);

        if (updateError) {
            console.error('Booking confirm error:', updateError);
            return NextResponse.json({ success: false, message: 'Failed to confirm booking' }, { status: 500 });
        }

        // Send confirmation emails
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://noalivingstudio.co.zm';
        const meetingLink = process.env.MEETING_LINK || 'https://meet.google.com/owu-zhiz-bns';
        const cancellationUrl = booking.id ? `${siteUrl}/cancel?id=${booking.id}` : null;

        const resend = getResend();
        const icsContent = generateICS(booking.name, booking.email, booking.date, booking.time, meetingLink);
        const { data: tpl } = await db.from('email_templates').select('*').eq('id', 'booking_confirmation').single();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { subject, html } = (emailTemplates as any).bookingConfirmation(
            booking.name, booking.date, booking.time, meetingLink, cancellationUrl, tpl ?? {}
        );

        const [clientResult, adminResult] = await Promise.allSettled([
            resend.emails.send({
                from: FROM,
                to: [booking.email],
                subject,
                html,
                attachments: [{ filename: 'noa-living-studio-consultation.ics', content: Buffer.from(icsContent) }],
            }),
            resend.emails.send({
                from: FROM,
                to: [process.env.ADMIN_EMAIL || process.env.RESEND_FROM_EMAIL || 'hello@noalivingstudio.co.zm'],
                subject: `New Consultation Booked: ${booking.name}`,
                text: [
                    'New booking received (payment confirmed).',
                    '',
                    `Client:       ${booking.name}`,
                    `Email:        ${booking.email}`,
                    booking.phone ? `Phone:        ${booking.phone}` : null,
                    `Date:         ${booking.date}`,
                    `Time:         ${booking.time} (CAT)`,
                    booking.consultation_type ? `Consultation: ${booking.consultation_type}` : null,
                    `Project Type: ${booking.project_type || 'Not specified'}`,
                    `Message:      ${booking.message || 'No message provided'}`,
                    `Currency:     ${booking.currency} ${booking.amount}`,
                    cancellationUrl ? `Cancel link:  ${cancellationUrl}` : null,
                ].filter(Boolean).join('\n'),
            }),
        ]);

        if (clientResult.status === 'rejected') console.error('Client email error:', clientResult.reason);
        if (adminResult.status === 'rejected') console.error('Admin email error:', adminResult.reason);

        // Add to Resend audience
        if (AUDIENCE_ID) {
            const [firstName, ...rest] = booking.name.split(' ');
            resend.contacts.create({
                email: booking.email,
                firstName,
                lastName: rest.join(' '),
                audienceId: AUDIENCE_ID,
            }).catch((e: unknown) => console.error('Resend contact error:', e));
        }

        return NextResponse.json({ success: true, status: 'succeeded', booking });

    } catch (error) {
        console.error('Payment verify error:', error);
        return NextResponse.json({ success: false, message: 'Failed to verify payment' }, { status: 500 });
    }
}
