import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    const secret = process.env.REVALIDATE_SECRET;
    if (!secret || req.headers.get('x-revalidate-secret') !== secret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const paths = ['/', '/portfolio', '/journal', '/about']
    paths.forEach((path) => revalidatePath(path))
    return NextResponse.json({ revalidated: true, now: Date.now() })
}
