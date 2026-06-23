import { NextResponse } from 'next/server';
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
            return NextResponse.json(
                { success: false, message: 'Failed to save booking', detail: dbError.message },
                { status: 500 }
            );
        }

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://noalivingstudio.co.zm';
        const cancellationUrl = booking?.id ? `${siteUrl}/booking/cancel?id=${booking.id}` : null;

        // 2. Send confirmation emails
        const resend = getResend();
        const icsContent = generateICS(name, email, date, time, meetingLink);
        const { data: tpl } = await db.from('email_templates').select('*').eq('id', 'booking_confirmation').single();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { subject, html } = (emailTemplates as any).bookingConfirmation(name, date, time, meetingLink, cancellationUrl, tpl ?? {});

        const [clientResult, adminResult] = await Promise.allSettled([
            resend.emails.send({
                from: FROM,
                to: [email],
                subject,
                html,
                attachments: [{ filename: 'noa-living-studio-consultation.ics', content: Buffer.from(icsContent) }],
            }),
            resend.emails.send({
                from: FROM,
                to: [process.env.ADMIN_EMAIL || process.env.RESEND_FROM_EMAIL || 'hello@noalivingstudio.co.zm'],
                subject: `New Consultation Booked: ${name}`,
                text: [
                    'New booking received!',
                    '',
                    `Client:       ${name}`,
                    `Email:        ${email}`,
                    phone ? `Phone:        ${phone}` : null,
                    `Date:         ${date}`,
                    `Time:         ${time} (CAT)`,
                    consultationType ? `Consultation: ${consultationType}` : null,
                    `Project Type: ${projectType || 'Not specified'}`,
                    `Message:      ${message || 'No message provided'}`,
                    cancellationUrl ? `Cancel link:  ${cancellationUrl}` : null,
                ].filter(Boolean).join('\n'),
            }),
        ]);

        if (clientResult.status === 'rejected') console.error('Client email error:', clientResult.reason);
        if (adminResult.status === 'rejected') console.error('Admin email error:', adminResult.reason);

        // 3. Add to Resend audience
        if (AUDIENCE_ID) {
            const [firstName, ...rest] = name.split(' ');
            resend.contacts.create({ email, firstName, lastName: rest.join(' '), audienceId: AUDIENCE_ID })
                .catch((e: unknown) => console.error('Resend contact error:', e));
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
