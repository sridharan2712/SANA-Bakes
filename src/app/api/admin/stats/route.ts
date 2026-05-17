import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Get total revenue
    const orders = await prisma.order.findMany({
      where: { status: { not: 'Cancelled' } },
      select: { total: true, created_at: true }
    });

    const totalRevenue = orders.reduce((sum: number, order: { total: number }) => sum + order.total, 0);
    const totalOrders = orders.length;

    // Get active customers (unique users who placed orders)
    const uniqueCustomers = await prisma.order.groupBy({
      by: ['userId'],
    });
    const activeCustomers = uniqueCustomers.length;

    // Get total products
    const totalProducts = await prisma.product.count();

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      include: {
        user: {
          select: { name: true }
        }
      }
    });

    // Prepare chart data (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const chartData = last7Days.map(date => {
      const dayTotal = orders
        .filter((o: { total: number, created_at: Date }) => o.created_at.toISOString().split('T')[0] === date)
        .reduce((sum: number, o: { total: number }) => sum + o.total, 0);
      return { date, value: dayTotal };
    });

    return NextResponse.json({
      success: true,
      stats: [
        { name: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, change: '+0%', icon: 'DollarSign' },
        { name: 'Total Orders', value: totalOrders.toString(), change: '+0%', icon: 'ShoppingBag' },
        { name: 'Active Customers', value: activeCustomers.toString(), change: '+0%', icon: 'Users' },
        { name: 'Total Products', value: totalProducts.toString(), change: '0%', icon: 'Package' },
      ],
      recentOrders: recentOrders.map((o: any) => ({
        id: o.id.substring(0, 8).toUpperCase(),
        customer: o.user.name,
        amount: o.total,
        status: o.status,
        time: o.created_at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })),
      chartData
    });
  } catch (error) {
    console.error('Stats API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
