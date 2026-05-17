import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_secret_key_for_development_purposes'
);

async function isAdmin(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.role === 'ADMIN';
  } catch (error) {
    return false;
  }
}

export async function GET(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payments = await prisma.order.findMany({
      where: {
        payment_status: {
          in: ['SCREENSHOT_UPLOADED', 'VERIFIED', 'REJECTED']
        }
      },
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return NextResponse.json({ success: true, payments });
  } catch (error) {
    console.error('Error fetching admin payments:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}
