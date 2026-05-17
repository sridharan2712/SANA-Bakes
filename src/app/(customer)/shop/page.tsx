'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Filter, ChevronDown, Loader2, Package } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('/api/products');
        setProducts(res.data.products);
      } catch (err) {
        console.error('Failed to load shop products');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="h-10 w-10 animate-spin mb-4 text-rose-500" />
        <p className="animate-pulse">Curating our signature collection...</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center uppercase tracking-widest">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">The Collection</h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg lowercase font-light">handcrafted luxury bakes delivered pristine to your doorstep.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="flex items-center justify-between font-semibold text-slate-900 mb-6 pb-4 border-b">
              Filters <Filter className="h-5 w-5" />
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold text-slate-900 mb-3 uppercase tracking-widest">Categories</h3>
                <div className="space-y-2">
                  {['All', 'Cakes', 'Pastries', 'Cookies', 'Gift Boxes'].map(cat => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500" />
                      <span className="text-sm text-slate-600 group-hover:text-slate-900">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
              <span className="text-slate-500 text-sm">Showing {products.length} units</span>
              <button className="flex items-center text-sm font-bold text-slate-900 bg-white border border-gray-200 rounded-lg px-4 py-2 hover:bg-slate-50 cursor-pointer">
                Sort: Featured <ChevronDown className="ml-2 h-4 w-4" />
              </button>
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map(product => (
                  <Link href={`/product/${product.id}`} key={product.id}>
                    <div className="group cursor-pointer">
                      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-slate-50 mb-4 border border-gray-100 shadow-sm group-hover:shadow-md transition-shadow duration-300">
                        {product.image_url ? (
                          <Image src={product.image_url} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-slate-50 text-slate-300">
                            <Package className="h-12 w-12" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-slate-900 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                          {product.category}
                        </div>
                      </div>
                      <div className="flex justify-between items-start pt-2">
                        <div>
                          <h3 className="font-bold text-slate-900 tracking-tight">{product.name}</h3>
                          <p className="text-xs text-slate-400 mt-0.5">{product.stock > 0 ? 'In Stock' : 'Limited Edition'}</p>
                        </div>
                        <div className="text-lg font-black text-rose-600">₹{product.price.toLocaleString()}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <Package className="h-16 w-16 mx-auto mb-4 text-slate-200" />
                <h3 className="text-xl font-bold text-slate-900">Catalogue Updating</h3>
                <p className="text-slate-500 mt-2">We're currently handcrafting our new collection. Please check back shortly.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
