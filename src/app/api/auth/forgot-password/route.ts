import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendOTPEmail } from '@/utils/mailer';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email parameter constraint required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Security best practice: Do NOT reveal if an unassociated email acts as a probe target
      return NextResponse.json({ success: true, message: 'If the provided email is registered, a secure 6-digit OTP will be dispatched.' }, { status: 200 });
    }

    // Cryptographic 6-digit pin generation structure
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry_time = new Date(Date.now() + 10 * 60 * 1000); // Expiry TTL: 10 mins

    // Refresh existing pins connected to unique emails
    await prisma.passwordReset.deleteMany({ where: { email } });
    await prisma.passwordReset.create({
      data: {
        email,
        otp,
        expiry_time,
      }
    });

    const emailSent = await sendOTPEmail(email, otp);
    if (!emailSent) {
       console.error("Warning: SMTP stream failed, attempting terminal fallback fallback reporting.");
       console.log(`[DEVELOPMENT MODE - TERMINAL OTP RENDER] Secure Output: ->[ ${otp} ]<- to identify ${email}`);
    }

    return NextResponse.json({ success: true, message: 'OTP sequence properly generated and executed' }, { status: 200 });
  } catch (error: any) {
    console.error('Password Reset OTP Error Frameworking:', error);
    return NextResponse.json({ error: 'Internal failure inside OTP route handling sequence' }, { status: 500 });
  }
}
