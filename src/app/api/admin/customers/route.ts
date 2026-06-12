import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const customers = await prisma.user.findMany({
      where: { role: 'USER' },
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        created_at: true,
        profile: {
          select: { mobile: true }
        },
        _count: {
          select: { orders: true }
        }
      }
    });

    return NextResponse.json({ success: true, customers });
  } catch (error) {
    console.error('Customers Fetch Error:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}
