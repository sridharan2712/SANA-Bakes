import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const settings = await prisma.setting.findMany({
      where: {
        key: { in: ['UPI_ID', 'UPI_QR_IMAGE'] }
      }
    });
    
    const formattedSettings = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);
    
    return NextResponse.json({ success: true, settings: formattedSettings });
  } catch (error) {
    console.error('Error fetching payment settings:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch payment settings' }, { status: 500 });
  }
}
