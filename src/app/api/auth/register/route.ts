import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required payload parameters' }, { status: 400 });
    }

    // Applying structural input validations
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address formatting' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password does not meet minimum complexity lengths (8 characters)' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Account identity already registered in database' }, { status: 409 });
    }

    // Cryptographic application (Salt Rounds = 10)
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: (email.endsWith('@admin.com') || email.endsWith('@sana.com')) ? 'ADMIN' : 'USER',
      },
    });

    return NextResponse.json({ success: true, message: "Account Generated Successfully!" }, { status: 201 });
  } catch (error: any) {
    console.error('Registration Architecture Error:', error);
    return NextResponse.json({ error: 'Internal User Persistence Block' }, { status: 500 });
  }
}
