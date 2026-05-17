import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_secret_key_for_development_purposes'
);

async function isAdmin(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.role === 'ADMIN';
  } catch (error) {
    return false;
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await (params as any);

  try {
    const { name, price, stock, category, description, image_url } = await request.json();

    const product = await prisma.product.update({
      where: { id },
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
    console.error('Product Update Error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await (params as any);

  try {
    await prisma.product.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Product Delete Error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
