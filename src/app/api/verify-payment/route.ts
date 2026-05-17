import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ verified: false, error: 'Missing payment signature components' }, { status: 400 });
    }

    // HMAC SHA256 Signature Verification
    const secret = process.env.RAZORPAY_SECRET || 'dummy_secret';
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(text)
      .digest('hex');

    if (generated_signature === razorpay_signature) {
      // Signature verified successfully -> Payment authentic
      // In production, update Database (Orders -> Status: "PAID") here.
      return NextResponse.json({ verified: true, state: 'SUCCESS', message: 'Payment successfully verified against fraudulent submissions.' });
    } else {
      // Invalid signature
      return NextResponse.json({ verified: false, state: 'FAILED', error: 'Invalid Payment Signature! Suspected fake submission.' }, { status: 400 });
    }
  } catch (error) {
    console.error('Razorpay Verification Error:', error);
    return NextResponse.json(
      { verified: false, error: 'Internal Server Error during signature validation' },
      { status: 500 }
    );
  }
}
