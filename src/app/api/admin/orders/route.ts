import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        user: { 
          select: { 
            name: true, 
            email: true,
            profile: {
              select: {
                mobile: true,
                alternate_mobile: true
              }
            }
          } 
        },
        items: true
      }
    });

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('Orders Fetch Error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
