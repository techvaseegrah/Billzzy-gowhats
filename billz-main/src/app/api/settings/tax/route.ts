import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

// ✅ POST: Save or update tax settings
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    console.log('Received tax data:', data);

    const organisationId = Number(session.user.id);
    const parsedValue = parseFloat(data.value);

    if (!data.name || !data.type || isNaN(parsedValue)) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    try {
    await prisma.tax.deleteMany({ where: { organisationId } });

    const tax = await prisma.tax.create({
        data: {
        name: data.name,
        type: data.type,
        value: parsedValue,
        autoApply: data.autoApply === true,
        organisationId,
        },
    });

    return NextResponse.json({ message: 'Tax saved', tax });
    } catch (error) {
    console.error('Error saving tax:', error);
    return NextResponse.json({ error: 'Failed to save tax value' }, { status: 500 });
    }
}

// ✅ GET: Fetch tax settings
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organisationId = Number(session.user.id);

    try {
    const tax = await prisma.tax.findFirst({
    where: { organisationId },
    });

    return NextResponse.json({ tax });
    } catch (error) {
    console.error('Error fetching tax:', error);
    return NextResponse.json({ error: 'Failed to fetch tax' }, { status: 500 });
    }
}