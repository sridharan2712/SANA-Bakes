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

export async function POST(request: NextRequest) {
  const userId = await getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { address, is_default } = body;

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    // If this is set as default, unset others for this user
    if (is_default) {
      await prisma.address.updateMany({
        where: { userId },
        data: { is_default: false },
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId,
        address,
        is_default: is_default || false,
      },
    });

    return NextResponse.json({ address: newAddress, message: 'Address added successfully' });
  } catch (error) {
    console.error('Error adding address:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
