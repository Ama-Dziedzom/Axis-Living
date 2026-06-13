import { Resend } from 'resend'

let _resend: Resend | null = null

export function getResend(): Resend {
    if (!_resend) {
        _resend = new Resend(process.env.RESEND_API_KEY)
    }
    return _resend
}

export const FROM = `${process.env.RESEND_FROM_NAME || 'Axis Living'} <${process.env.RESEND_FROM_EMAIL || 'hello@axisliving.co.zm'}>`
export const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID
