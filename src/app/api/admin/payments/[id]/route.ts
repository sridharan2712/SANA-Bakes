import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jwtVerify } from 'jose';
import { sendOrderApprovalEmail, sendOrderCancellationEmail } from '@/utils/mailer';

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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await (params as any);
    const body = await request.json();
    const { action } = body; // 'approve' or 'reject'

    if (action === 'approve') {
      const order = await prisma.order.update({
        where: { id },
        data: {
          payment_status: 'VERIFIED',
          status: 'CONFIRMED'
        },
        include: {
          user: true,
          items: true
        }
      });

      // Dispatch professional confirmation email asynchronously
      sendOrderApprovalEmail(order.user.email, order.user.name, order).catch((err) => {
        console.error('Failed to send order approval email:', err);
      });

      return NextResponse.json({ success: true, order });
    } else if (action === 'reject') {
      const order = await prisma.order.update({
        where: { id },
        data: {
          payment_status: 'REJECTED',
          status: 'PAYMENT_FAILED'
        },
        include: {
          user: true,
          items: true
        }
      });

      // Dispatch professional cancellation email asynchronously
      sendOrderCancellationEmail(order.user.email, order.user.name, order).catch((err) => {
        console.error('Failed to send order cancellation email:', err);
      });

      return NextResponse.json({ success: true, order });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error updating payment status:', error);
    return NextResponse.json({ error: 'Failed to update payment status' }, { status: 500 });
  }
}
