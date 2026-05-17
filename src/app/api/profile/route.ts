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

export async function GET(request: NextRequest) {
  const userId = await getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    const addresses = await prisma.address.findMany({
      where: { userId },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    return NextResponse.json({
      profile: profile || {},
      addresses: addresses || [],
      user: user,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const userId = await getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      mobile,
      alternate_mobile,
      address_line_1,
      address_line_2,
      city,
      state,
      pincode,
      country,
      name,
    } = body;

    // Optional: Also update user name if provided
    if (name) {
      await prisma.user.update({
        where: { id: userId },
        data: { name },
      });
    }

    const profile = await prisma.userProfile.upsert({
      where: { userId },
      update: {
        mobile,
        alternate_mobile,
        address_line_1,
        address_line_2,
        city,
        state,
        pincode,
        country,
      },
      create: {
        userId,
        mobile,
        alternate_mobile,
        address_line_1,
        address_line_2,
        city,
        state,
        pincode,
        country,
      },
    });

    return NextResponse.json({ profile, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
