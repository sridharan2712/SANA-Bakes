import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_secret_key_for_development_purposes'
);

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Incomplete credentials input' }, { status: 400 });
    }

    // Authenticate identity origin mappings
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Invalid user credentials. No origin mapped to value.' }, { status: 401 });
    }

    // Confirm computational hashes directly
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid user credentials. Hash mismatch anomaly detected.' }, { status: 401 });
    }

    // Generates edge runtime secure compact JWTs
    const token = await new SignJWT({ id: user.id, email: user.email, role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    const response = NextResponse.json({ 
      success: true, 
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });

    // Enforces explicit XSS defenses using an inaccessible HttpOnly structure Cookie 
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('API Context Authentication Error:', error);
    return NextResponse.json({ error: 'Verification execution failed dynamically' }, { status: 500 });
  }
}
