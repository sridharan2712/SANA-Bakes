import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, otp, newPassword } = await request.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: 'Payload missing required validation constraints' }, { status: 400 });
    }

    const resetRecord = await prisma.passwordReset.findFirst({
      where: { email, otp },
      orderBy: { created_at: 'desc' },
    });

    if (!resetRecord) {
      return NextResponse.json({ error: 'Invalid or misreported Secure OTP mapping' }, { status: 400 });
    }

    if (new Date() > resetRecord.expiry_time) {
      return NextResponse.json({ error: 'OTP validation TTL has systematically expired' }, { status: 400 });
    }

    // Passwords hashed using bcryptjs (Round Value: 10)
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Write mutation to database mappings
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });

    // Cleanup logic preventing OTP abuse mappings
    await prisma.passwordReset.deleteMany({ where: { email } });

    return NextResponse.json({ success: true, message: 'Secure User Access Reset properly finalized' }, { status: 200 });
  } catch (error: any) {
    console.error('Reset Password Reinitialization Error:', error);
    return NextResponse.json({ error: 'Internal processing framework halted on reset operations' }, { status: 500 });
  }
}
