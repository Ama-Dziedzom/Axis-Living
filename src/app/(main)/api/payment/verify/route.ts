import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/dpo';

function mapDpoResult(result: string): 'succeeded' | 'pending' | 'failed' {
    if (result === '000') return 'succeeded';
    if (result === '900') return 'pending';
    return 'failed';
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
        return NextResponse.json({ success: false, message: 'Missing token' }, { status: 400 });
    }

    try {
        const { result } = await verifyToken(token);
        return NextResponse.json({ success: true, status: mapDpoResult(result) });
    } catch (error) {
        console.error('Payment verify error:', error);
        return NextResponse.json({ success: false, message: 'Failed to verify payment' }, { status: 500 });
    }
}
