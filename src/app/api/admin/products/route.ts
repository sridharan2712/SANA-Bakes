import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { created_at: 'desc' }
    });
    return NextResponse.json({ success: true, products });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, price, stock, category, description, image_url } = await request.json();

    const product = await prisma.product.create({
      data: {
        name,
        price: parseFloat(price),
        stock: parseInt(stock),
        category,
        description,
        image_url,
        status: parseInt(stock) > 0 ? 'Active' : 'Out of Stock'
      }
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Product Create Error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
