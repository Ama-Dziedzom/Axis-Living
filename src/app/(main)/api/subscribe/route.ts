import { NextResponse } from 'next/server';
import { getResend, FROM, AUDIENCE_ID } from '@/lib/resend';
import { getSupabase } from '@/lib/supabase';
import { emailTemplates } from '@/lib/emailTemplates';

export async function POST(req: Request) {
    try {
        const { email, name } = await req.json();

        if (!email || !email.includes('@')) {
            return NextResponse.json(
                { success: false, message: 'Invalid email address' },
                { status: 400 }
            );
        }

        const displayName = name || email.split('@')[0];

        // Add to Resend audience
        if (AUDIENCE_ID) {
            getResend().contacts.create({ email, audienceId: AUDIENCE_ID })
                .catch((e: unknown) => console.error('Resend contact error:', e));
        }

        // Save to nurture_subscribers
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (getSupabase() as any)
                .from('nurture_subscribers')
                .upsert({ email, name: displayName }, { onConflict: 'email', ignoreDuplicates: true });
        } catch (e) {
            console.error('Nurture subscriber error:', e);
        }

        // Send lookbook email
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: tpl } = await (getSupabase() as any).from('email_templates').select('*').eq('id', 'lookbook_delivery').single();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { subject, html } = (emailTemplates as any).lookbookDelivery(displayName, tpl ?? {});
        const { error } = await getResend().emails.send({ from: FROM, to: [email], subject, html });

        if (error) {
            console.error('Lookbook email error:', error);
            return NextResponse.json(
                { success: false, message: 'Registration successful, but failed to send email. Please contact us.' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, message: 'Lookbook is on its way!' });

    } catch (error) {
        console.error('Subscription route error:', error);
        return NextResponse.json(
            { success: false, message: 'Something went wrong. Please try again.' },
            { status: 500 }
        );
    }
}
