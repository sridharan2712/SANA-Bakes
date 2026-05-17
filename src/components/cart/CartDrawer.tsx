'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X, Plus, Minus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { closeCart, removeFromCart, updateQuantity } from '@/store/cartSlice';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export function CartDrawer() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isOpen, items } = useAppSelector((state) => state.cart);

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(closeCart())}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-serif font-bold text-slate-900 flex items-center">
                <ShoppingCart className="mr-2 h-5 w-5" /> Your Cart
              </h2>
              <button
                onClick={() => dispatch(closeCart())}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                    <ShoppingCart className="h-10 w-10" />
                  </div>
                  <p className="text-slate-500">Your cart is empty.</p>
                  <Button variant="outline" onClick={() => dispatch(closeCart())}>
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900 line-clamp-1">{item.name}</h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {item.weightLabel} {item.isEggless && '• Eggless'} {item.shape && `• ${item.shape}`}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-gray-200 rounded-lg">
                            <button
                              onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}
                              className="px-2 py-1 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                            <button
                              onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                              className="px-2 py-1 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-slate-900">₹{(item.price * item.quantity).toLocaleString()}</span>
                            <button
                              onClick={() => dispatch(removeFromCart(item.id))}
                              className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-gray-100 bg-slate-50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="text-lg font-bold text-slate-900">₹{total.toLocaleString()}</span>
                </div>
                <p className="text-xs text-slate-500 mb-6">Taxes and shipping calculated at checkout.</p>
                <Button className="w-full h-12 text-base shadow-sm" onClick={() => {
                  dispatch(closeCart());
                  router.push('/checkout');
                }}>
                  Proceed to Checkout
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
