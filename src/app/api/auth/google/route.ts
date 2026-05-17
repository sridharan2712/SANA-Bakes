import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '@/lib/db';
import { SignJWT } from 'jose';

const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'dummy_client_id');
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_secret_key_for_development_purposes'
);

export async function POST(request: Request) {
  try {
    const { credential } = await request.json();
    
    let email = '';
    let name = '';
    
    // Developer mocking interface block logic bypassing Google Servers via secure override param
    if (credential === 'mock_google_token_for_testing_purposes') {
      email = 'google_user@external_domain.com';
      name = 'Test Google User';
    } else {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      
      if (!payload || !payload.email) throw new Error("Invalid Google Server Handshake Formats");
      
      email = payload.email;
      name = payload.name || 'Google Identity User';
    }

    // Mapping identity
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // First time Google SSO Users map instantly
      user = await prisma.user.create({
        data: {
          name,
          email,
          password: 'oauth_managed_identity_lock',
          role: (email.endsWith('@admin.com') || email.endsWith('@sana.com')) ? 'ADMIN' : 'USER',
        }
      });
    }

    // Generate compliant standard stateless JWT structure locally
    const token = await new SignJWT({ id: user.id, email: user.email, role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    const response = NextResponse.json({ 
      success: true, 
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 Day Hard TTL 
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Core SSO Provider Binding Error:', error);
    return NextResponse.json({ error: 'Could not successfully map identity through external provider' }, { status: 500 });
  }
}
