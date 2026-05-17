'use client';

import { TrendingUp, Users, ShoppingBag, DollarSign, Package, Loader2, BarChart3 } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/admin/stats');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load stats');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'DollarSign': return DollarSign;
      case 'ShoppingBag': return ShoppingBag;
      case 'Users': return Users;
      case 'Package': return Package;
      default: return TrendingUp;
    }
  };

  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="h-10 w-10 animate-spin mb-4 text-rose-500" />
        <p className="animate-pulse">Loading live analytics...</p>
      </div>
    );
  }

  const { stats, recentOrders, chartData } = data || { stats: [], recentOrders: [], chartData: [] };

  // Simple SVG Chart implementation
  const maxValue = Math.max(...chartData.map((d: any) => d.value), 100);
  const points = chartData.map((d: any, i: number) => {
    const x = (i / (chartData.length - 1)) * 100;
    const y = 100 - (d.value / maxValue) * 80; // Scale to 80% height
    return `${x},${y}`;
  }).join(' ');

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-sm text-slate-500">Welcome back, here's what's happening today.</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={() => alert('Export Report sequence initializing...')} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer">
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat: any) => {
          const Icon = getIcon(stat.icon);
          return (
            <div key={stat.name} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center">
              <div className="h-12 w-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 mr-4 flex-shrink-0">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{stat.name}</p>
                <div className="flex items-baseline space-x-2">
                  <h2 className="text-2xl font-bold text-slate-900">{stat.value}</h2>
                  <span className={`text-xs font-medium flex items-center ${stat.change.startsWith('+') ? 'text-green-600' : 'text-slate-400'}`}>
                    <TrendingUp className="h-3 w-3 mr-1" /> {stat.change}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-900">Revenue Analytics</h2>
            <div className="flex space-x-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
              <span>Last 7 Days</span>
            </div>
          </div>
          <div className="h-80 w-full relative group">
            <svg 
               viewBox="0 0 100 100" 
               className="w-full h-full overflow-visible preserve-3d" 
               preserveAspectRatio="none"
            >
              {/* Grid Lines */}
              {[0, 25, 50, 75, 100].map(val => (
                <line 
                  key={val} 
                  x1="0" y1={val} x2="100" y2={val} 
                  stroke="#f1f5f9" strokeWidth="0.5" 
                />
              ))}
              {/* Gradient Fill */}
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e11d48" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#e11d48" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path 
                d={`M 0,100 L ${points} L 100,100 Z`} 
                fill="url(#chartGradient)" 
              />
              {/* Main Line */}
              <polyline
                fill="none"
                stroke="#e11d48"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
                className="drop-shadow-sm"
              />
              {/* Data Points */}
              {chartData.map((d: any, i: number) => {
                const x = (i / (chartData.length - 1)) * 100;
                const y = 100 - (d.value / maxValue) * 80;
                return (
                  <circle 
                    key={i} 
                    cx={x} cy={y} r="1.5" 
                    fill="#fff" stroke="#e11d48" strokeWidth="1" 
                  />
                );
              })}
            </svg>
            
            {/* Legend / Tooltips placeholder simulation */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 pt-4 border-t border-slate-50">
               {chartData.map((d: any, i: number) => (
                 <span key={i} className="text-[10px] text-slate-400 transform -rotate-45 sm:rotate-0">
                   {d.date.split('-').slice(1).join('/')}
                 </span>
               ))}
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-900">Recent Orders</h2>
            <button onClick={() => alert('Viewing all orders...')} className="text-sm text-rose-600 font-medium hover:text-rose-700 cursor-pointer">View All</button>
          </div>
          <div className="space-y-6">
            {recentOrders.length > 0 ? (
              recentOrders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between pb-6 border-b border-gray-50 last:border-0 last:pb-0">
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">#{order.id}</p>
                    <p className="text-xs text-slate-500 mt-1">{order.customer} • {order.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">₹{order.amount.toLocaleString()}</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium mt-1 ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center">
                <BarChart3 className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-400">No recent orders found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
