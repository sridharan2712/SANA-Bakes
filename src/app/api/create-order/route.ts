import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(request: Request) {
  try {
    const { amount } = await request.json();

    if (!amount) {
      return NextResponse.json({ error: 'Amount is required' }, { status: 400 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy_key',
      key_secret: process.env.RAZORPAY_SECRET || 'dummy_secret',
    });

    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in smallest currency unit (paisa)
      currency: 'INR',
      receipt: `receipt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    };

    if (process.env.RAZORPAY_SECRET?.includes('dummy') || process.env.RAZORPAY_SECRET === 'dummy_secret') {
      return NextResponse.json({
        order_id: 'order_dummy_' + Date.now(),
        amount: Math.round(amount * 100),
        currency: 'INR',
        key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy_key',
      });
    }

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy_key',
    });
  } catch (error: any) {
    console.error('Razorpay Create Order Error:', error);
    return NextResponse.json(
      { error: error.error?.description || error.message || 'Failed to securely create payment order Server-Side via Razorpay' },
      { status: 500 }
    );
  }
}
