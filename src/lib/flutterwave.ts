const BASE_URL = process.env.FLUTTERWAVE_SANDBOX === 'false'
    ? 'https://api.flutterwave.com/v4'
    : 'https://developersandbox-api.flutterwave.com/v4';

const IDP_URL = 'https://idp.flutterwave.com/realms/flutterwave/protocol/openid-connect/token';

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
    if (cachedToken && Date.now() < cachedToken.expiresAt - 30_000) {
        return cachedToken.token;
    }

    const res = await fetch(IDP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: process.env.FLUTTERWAVE_CLIENT_ID!,
            client_secret: process.env.FLUTTERWAVE_CLIENT_SECRET!,
            grant_type: 'client_credentials',
        }),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Flutterwave auth failed (${res.status}): ${text}`);
    }

    const data = await res.json();
    cachedToken = {
        token: data.access_token,
        expiresAt: Date.now() + data.expires_in * 1000,
    };
    return cachedToken.token;
}

async function flwFetch(path: string, options: RequestInit = {}, idempotencyKey?: string) {
    const token = await getAccessToken();
    const traceId = crypto.randomUUID().replace(/-/g, '').slice(0, 16);

    const headers: Record<string, string> = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Trace-Id': traceId,
        ...(options.headers as Record<string, string>),
    };

    if (idempotencyKey) {
        headers['X-Idempotency-Key'] = idempotencyKey;
    }

    const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Flutterwave API error ${res.status} on ${path}: ${text}`);
    }

    return res.json();
}

// Strips +260 or 260 prefix and leading 0 → returns bare 9-digit local number
function normalizeZambianPhone(raw: string): string {
    const digits = raw.replace(/\D/g, '');
    if (digits.startsWith('260')) return digits.slice(3);
    if (digits.startsWith('0')) return digits.slice(1);
    return digits;
}

async function findCustomerByEmail(email: string) {
    // No email filter on GET /customers — paginate until we find a match
    for (let page = 1; page <= 10; page++) {
        const res = await flwFetch(`/customers?page=${page}&size=50`);
        const customers: Array<{ id: string; email: string }> = res.data ?? [];
        const match = customers.find((c) => c.email === email);
        if (match) return { data: match };
        if (customers.length < 50) break; // no more pages
    }
    throw new Error(`Could not locate existing customer for email: ${email}`);
}

export async function createCustomer(email: string, fullName: string, phone?: string) {
    const parts = fullName.trim().split(/\s+/);
    const first = parts[0];
    const last = parts.length > 1 ? parts.slice(1).join(' ') : parts[0];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body: Record<string, any> = {
        email,
        name: { first, last },
    };

    if (phone) {
        body.phone = { country_code: '260', number: normalizeZambianPhone(phone) };
    }

    try {
        return await flwFetch('/customers', { method: 'POST', body: JSON.stringify(body) });
    } catch (error) {
        // Customer already exists — look them up instead of failing
        if (error instanceof Error && error.message.includes('409')) {
            return findCustomerByEmail(email);
        }
        throw error;
    }
}

export async function createMobileMoneyPaymentMethod(
    network: string,
    phoneNumber: string,
    customerId?: string,
) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body: Record<string, any> = {
        type: 'mobile_money',
        mobile_money: {
            country_code: '260',
            network: network.toUpperCase(),
            phone_number: normalizeZambianPhone(phoneNumber),
        },
    };

    if (customerId) body.customer_id = customerId;

    return flwFetch('/payment-methods', { method: 'POST', body: JSON.stringify(body) });
}

// ─── Card helpers ───────────────────────────────────────────────────────────

import { createCipheriv, randomBytes } from 'crypto';

export function generateNonce(): string {
    return randomBytes(6).toString('hex'); // 12 hex chars = valid 12-char nonce
}

export function encryptField(value: string, keyBase64: string, nonce: string): string {
    const key = Buffer.from(keyBase64, 'base64');
    const iv = Buffer.from(nonce, 'utf8');
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([encrypted, tag]).toString('base64');
}

export async function createCardPaymentMethod(
    encryptedCardNumber: string,
    encryptedExpiryMonth: string,
    encryptedExpiryYear: string,
    encryptedCvv: string,
    nonce: string,
    customerId?: string,
) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body: Record<string, any> = {
        type: 'card',
        card: {
            encrypted_card_number: encryptedCardNumber,
            encrypted_expiry_month: encryptedExpiryMonth,
            encrypted_expiry_year: encryptedExpiryYear,
            encrypted_cvv: encryptedCvv,
            nonce,
        },
    };

    if (customerId) body.customer_id = customerId;

    return flwFetch('/payment-methods', { method: 'POST', body: JSON.stringify(body) });
}

export async function authorizeChargeWithPin(
    chargeId: string,
    encryptedPin: string,
    nonce: string,
) {
    return flwFetch(`/charges/${chargeId}`, {
        method: 'PUT',
        body: JSON.stringify({
            authorization: {
                type: 'pin',
                pin: { nonce, encrypted_pin: encryptedPin },
            },
        }),
    });
}

export async function authorizeChargeWithOtp(chargeId: string, code: string) {
    return flwFetch(`/charges/${chargeId}`, {
        method: 'PUT',
        body: JSON.stringify({
            authorization: {
                type: 'otp',
                otp: { code },
            },
        }),
    });
}

// ────────────────────────────────────────────────────────────────────────────

export async function createCharge(
    customerId: string,
    paymentMethodId: string,
    amount: number,
    currency: string,
    reference: string,
) {
    return flwFetch('/charges', {
        method: 'POST',
        body: JSON.stringify({ customer_id: customerId, payment_method_id: paymentMethodId, amount, currency, reference }),
    }, reference);
}

export async function getCharge(chargeId: string) {
    return flwFetch(`/charges/${chargeId}`);
}
