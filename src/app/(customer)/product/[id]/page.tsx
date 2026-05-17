'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Star, Heart, Share2, Info, ChevronRight, Check, Truck, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAppDispatch } from '@/hooks/useRedux';
import { addToCart } from '@/store/cartSlice';
import axios from 'axios';

export default function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedWeight, setSelectedWeight] = useState(0);
  const [isEggless, setIsEggless] = useState(false);
  const [selectedShape, setSelectedShape] = useState(0);
  const [message, setMessage] = useState('');
  const dispatch = useAppDispatch();

  const weights = [
    { label: '0.5 Kg', multiplier: 1 },
    { label: '1 Kg', multiplier: 1.8 },
    { label: '2 Kg', multiplier: 3.5 },
  ];
  const shapes = ['Round', 'Heart', 'Square'];
  const egglessSurcharge = 150;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/api/products/${id}`);
        setProduct(res.data.product);
      } catch (err) {
        console.error('Failed to load product details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="h-10 w-10 animate-spin mb-4 text-rose-500" />
        <p className="animate-pulse">Preparing your luxury bake details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-slate-400 p-4">
        <AlertCircle className="h-12 w-12 mb-4 text-rose-500" />
        <h2 className="text-xl font-bold text-slate-900">Bake Not Found</h2>
        <p className="mt-2 text-center">We couldn't find the product you're looking for. It might have been sold out or moved.</p>
        <Button className="mt-6" onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }
  
  const currentPrice = 
    (product.price * weights[selectedWeight].multiplier) + 
    (isEggless ? egglessSurcharge : 0);

  const images = product.image_url ? [product.image_url] : ['/placeholder-cake.jpg'];

  return (
    <div className="bg-white min-h-screen pb-24">
      <div className="bg-slate-50 py-3 border-b border-gray-100 uppercase tracking-widest text-[10px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center text-gray-500">
          <span>Home</span>
          <ChevronRight className="h-3 w-3 mx-2" />
          <span>Shop</span>
          <ChevronRight className="h-3 w-3 mx-2" />
          <span className="text-slate-900 font-bold">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-12">
          
          <div className="w-full lg:w-1/2 flex flex-col gap-4">
            <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-slate-50 border border-gray-100 shadow-sm">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImage}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  <Image 
                    src={images[activeImage]} 
                    alt={product.name} 
                    fill 
                    className="object-cover" 
                    priority
                  />
                </motion.div>
              </AnimatePresence>
              <div className="absolute top-6 right-6 flex flex-col gap-3">
                <button className="h-12 w-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-slate-700 hover:text-rose-600 shadow-xl transition-all cursor-pointer">
                  <Heart className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/2 flex flex-col">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-black rounded-full uppercase tracking-widest">{product.category}</span>
                <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-black rounded-full uppercase tracking-widest">Premium</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-serif font-black text-slate-900 tracking-tighter leading-tight">{product.name}</h1>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                  <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                  <span className="ml-1.5 font-bold text-amber-900 text-sm">4.9/5.0</span>
                </div>
                <div className="h-4 w-px bg-gray-200"></div>
                <span className="text-green-600 font-bold text-sm flex items-center">
                  <Check className="h-4 w-4 mr-1" /> Handcrafted Fresh
                </span>
              </div>
            </div>

            <div className="mb-8 p-6 bg-slate-50 rounded-2xl border border-gray-100">
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-black text-rose-600">₹{currentPrice.toLocaleString()}</span>
                <span className="text-lg text-slate-400 line-through">₹{(currentPrice * 1.2).toLocaleString()}</span>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 ml-1">Limited Time Launch Invitation</p>
            </div>

            <p className="text-slate-600 leading-relaxed font-light text-lg mb-8 italic">
              "{product.description || 'A masterpiece of artisanal baking, meticulously crafted to elevate your celebrations into timeless memories.'}"
            </p>

            <div className="space-y-8">
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">Configuration</h3>
                <div className="grid grid-cols-3 gap-3">
                  {weights.map((wt, idx) => (
                    <button
                      key={wt.label}
                      onClick={() => setSelectedWeight(idx)}
                      className={`h-16 rounded-xl border-2 flex items-center cursor-pointer justify-center font-bold transition-all ${
                        selectedWeight === idx 
                          ? 'border-slate-900 bg-slate-900 text-white' 
                          : 'border-gray-200 bg-white text-slate-500 hover:border-slate-400'
                      }`}
                    >
                      {wt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-5 border-2 border-rose-100 rounded-2xl bg-rose-50/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">Eggless Experience</p>
                    <p className="text-xs text-rose-500 font-medium">Pure vegetarian masterpiece (+₹150)</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={isEggless} onChange={(e) => setIsEggless(e.target.checked)} />
                    <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-rose-600"></div>
                  </label>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">The Artistic Shape</h3>
                <div className="flex gap-4">
                  {shapes.map((shape, idx) => (
                    <button
                      key={shape}
                      onClick={() => setSelectedShape(idx)}
                      className={`flex-1 py-4 rounded-xl border-2 text-sm cursor-pointer font-bold transition-all ${
                        selectedShape === idx
                          ? 'border-slate-900 bg-slate-900 text-white shadow-xl'
                          : 'border-gray-100 bg-slate-50 text-slate-400 hover:border-gray-300'
                      }`}
                    >
                      {shape}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">Message on cake</h3>
                <Input 
                  placeholder="e.g. For My Forever..." 
                  maxLength={30}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="h-14 bg-white border-2 border-slate-100 focus:border-rose-500 text-lg font-medium rounded-xl"
                />
              </div>

            </div>

            <div className="mt-12 flex gap-4">
              <Button size="lg" className="flex-1 text-xl h-20 shadow-2xl shadow-rose-200" onClick={() => {
                dispatch(addToCart({
                  id: `${product.id}-${weights[selectedWeight].label}-${isEggless ? 'eggless' : 'with-egg'}-${shapes[selectedShape]}`,
                  productId: product.id,
                  name: product.name,
                  price: currentPrice,
                  quantity: 1,
                  image: images[0],
                  weightLabel: weights[selectedWeight].label,
                  isEggless,
                  shape: shapes[selectedShape],
                  message
                }));
              }}>
                <ShoppingCart className="h-6 w-6 mr-3" /> Order Now — ₹{currentPrice.toLocaleString()}
              </Button>
            </div>

            <div className="mt-8 flex items-center justify-center gap-8 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 py-4 rounded-full">
              <span className="flex items-center"><Truck className="h-4 w-4 mr-2 text-rose-500" /> Express Delivery</span>
              <span className="flex items-center"><Star className="h-4 w-4 mr-2 text-rose-500" /> Artisanal Grade</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
