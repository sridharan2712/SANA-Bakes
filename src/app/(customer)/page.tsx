'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Star, Clock, Truck, Loader2, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function HomePage() {
  const router = useRouter();
  const [featured, setFeatured] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await axios.get('/api/products');
        setFeatured(res.data.products.slice(0, 4));
      } catch (err) {
        console.error('Failed to load featured products');
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="bg-white">
      {/* HERO SECTION */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 scale-105">
          <Image
            src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=2000&q=80"
            alt="Premium Bakery Background"
            fill
            className="object-cover opacity-100"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/60 to-slate-900/80" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-black text-white tracking-tighter mb-8 shadow-black/20">
              Artisanal Luxury, <br />
              <span className="text-rose-500 italic font-light drop-shadow-lg">Baked to Order.</span>
            </h1>
            <p className="mt-4 text-xl md:text-2xl text-slate-200 max-w-3xl mx-auto mb-12 font-medium tracking-tight">
              Indulge in our curated collection of enterprise-grade signature bakes, delivered with pristine precision across the city.
            </p>
            <div className="flex justify-center">
              <Button size="lg" className="text-xl h-16 px-12 rounded-full shadow-2xl shadow-rose-500/20" onClick={() => router.push('/shop')}>
                Explore The Collection
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* VALUE PROPS */}
      <section className="py-20 bg-slate-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: Star, title: "Artisanal Grace", desc: "Finest global ingredients, hand-whipped to perfection daily." },
              { icon: Truck, title: "Pristine Transit", desc: "Temperature-locked delivery ensures restaurant-grade presentation." },
              { icon: Clock, title: "Time Honored", desc: "Precise delivery windows synced to your most important milestones." }
            ].map((prop, i) => (
              <div key={i} className="flex flex-col items-center text-center p-8 bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
                <div className="h-16 w-16 rounded-2xl bg-rose-50 flex items-center justify-center mb-6 text-rose-600 shadow-inner">
                  <prop.icon className="h-8 w-8" />
                </div>
                <h3 className="font-black text-slate-900 text-xl uppercase tracking-widest">{prop.title}</h3>
                <p className="text-slate-400 mt-4 text-sm leading-relaxed font-medium">{prop.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16">
          <div>
            <span className="text-rose-600 font-black text-xs uppercase tracking-[0.3em] mb-3 block">Selected Works</span>
            <h2 className="text-4xl md:text-5xl font-serif font-black text-slate-900 tracking-tighter">Featured Creations</h2>
          </div>
          <Link href="/shop" className="hidden sm:flex items-center text-slate-900 font-black text-sm uppercase tracking-widest h-12 px-8 border-2 border-slate-900 rounded-full hover:bg-slate-900 hover:text-white transition-all">
            The Full View <ArrowRight className="ml-3 h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="h-96 flex flex-col items-center justify-center text-slate-300">
             <Loader2 className="h-10 w-10 animate-spin mb-4 text-rose-500" />
             <p className="font-bold uppercase tracking-widest text-xs">Fetching Masterpieces...</p>
          </div>
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {featured.map((product) => (
              <Link href={`/product/${product.id}`} key={product.id}>
                <motion.div
                  whileHover={{ y: -10 }}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-slate-100 mb-6 shadow-lg border border-gray-100">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-slate-300">
                        <Package className="h-12 w-12" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xl">
                      {product.category}
                    </div>
                  </div>
                  <div className="flex justify-between items-start pt-2">
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg tracking-tight leading-tight">{product.name}</h3>
                      <div className="flex items-center mt-2 space-x-1">
                        <Star className="h-3 w-3 fill-rose-500 text-rose-500" />
                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">4.9 Rare Selection</span>
                      </div>
                    </div>
                    <div className="text-xl font-black text-rose-600">₹{product.price.toLocaleString()}</div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
             <Package className="h-16 w-16 mx-auto mb-4 text-slate-200" />
             <h3 className="text-xl font-bold text-slate-900">Catalogue Coming Soon</h3>
             <p className="text-slate-500 mt-2">We're currently perfecting our next set of signature bakes.</p>
          </div>
        )}
      </section>
    </div>
  );
}
