import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_secret_key_for_development_purposes'
);

async function getUserId(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.id as string;
  } catch (error) {
    return null;
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const userId = await getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { id } = await (params as any);

  try {
    const body = await request.json();
    const { address, is_default } = body;

    // Verify ownership
    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Address not found or unauthorized' }, { status: 404 });
    }

    if (is_default) {
      await prisma.address.updateMany({
        where: { userId },
        data: { is_default: false },
      });
    }

    const updated = await prisma.address.update({
      where: { id },
      data: {
        ...(address && { address }),
        ...(typeof is_default === 'boolean' && { is_default }),
      },
    });

    return NextResponse.json({ address: updated, message: 'Address updated successfully' });
  } catch (error) {
    console.error('Error updating address:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const userId = await getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { id } = await (params as any);

  try {
    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Address not found or unauthorized' }, { status: 404 });
    }

    await prisma.address.delete({ where: { id } });

    return NextResponse.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Error deleting address:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
