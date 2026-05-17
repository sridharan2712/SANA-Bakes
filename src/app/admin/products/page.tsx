'use client';

import { Plus, Search, Edit2, Trash2, X, Upload, Loader2, Package } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import axios from 'axios';

export default function AdminProductsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newProduct, setNewProduct] = useState({ 
    name: '', 
    price: '', 
    stock: '', 
    category: 'Cakes', 
    description: '',
    image_url: '' 
  });

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await axios.delete(`/api/admin/products/${id}`);
      if (res.data.success) {
        fetchProducts();
      }
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.put(`/api/admin/products/${editingProduct.id}`, editingProduct);
      if (res.data.success) {
        setEditingProduct(null);
        fetchProducts();
      }
    } catch (err) {
      alert('Failed to update product');
    }
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('/api/admin/products');
      setProducts(res.data.products);
    } catch (err) {
      console.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/admin/products', newProduct);
      if (res.data.success) {
        setIsAddModalOpen(false);
        setNewProduct({ name: '', price: '', stock: '', category: 'Cakes', description: '', image_url: '' });
        fetchProducts();
      }
    } catch (err) {
      alert('Failed to save product to database');
    }
  };

  if (isLoading && products.length === 0) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="h-10 w-10 animate-spin mb-4 text-rose-500" />
        <p className="animate-pulse">Loading bakery inventory...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-sm text-slate-500">Manage your bakery inventory and catalog.</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center">
          <Plus className="h-4 w-4 mr-2" /> Add Product
        </Button>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Add New Product</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <Input 
                label="Product Name" 
                required 
                placeholder="e.g. Signature Truffle Cake"
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Price (₹)" 
                  type="number" 
                  required 
                  placeholder="0.00"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                />
                <Input 
                  label="Initial Stock" 
                  type="number" 
                  required 
                  placeholder="0"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select 
                  className="w-full h-11 px-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                >
                  <option>Cakes</option>
                  <option>Pastries</option>
                  <option>Cookies</option>
                  <option>Gift Boxes</option>
                </select>
              </div>
              <Input 
                label="Product Image URL" 
                placeholder="https://images.unsplash.com/..."
                value={newProduct.image_url}
                onChange={(e) => setNewProduct({...newProduct, image_url: e.target.value})}
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
                <textarea 
                  className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm h-24"
                  placeholder="Delicious details about this bake..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                />
              </div>
              <div className="pt-4 flex space-x-3">
                <Button variant="outline" type="button" className="flex-1" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="flex-1">Save to Database</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Edit Product</h2>
              <button onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleEditProduct} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <Input 
                label="Product Name" 
                required 
                placeholder="e.g. Signature Truffle Cake"
                value={editingProduct.name}
                onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Price (₹)" 
                  type="number" 
                  required 
                  placeholder="0.00"
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})}
                />
                <Input 
                  label="Initial Stock" 
                  type="number" 
                  required 
                  placeholder="0"
                  value={editingProduct.stock}
                  onChange={(e) => setEditingProduct({...editingProduct, stock: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select 
                  className="w-full h-11 px-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
                  value={editingProduct.category}
                  onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                >
                  <option>Cakes</option>
                  <option>Pastries</option>
                  <option>Cookies</option>
                  <option>Gift Boxes</option>
                </select>
              </div>
              <Input 
                label="Product Image URL" 
                placeholder="https://images.unsplash.com/..."
                value={editingProduct.image_url}
                onChange={(e) => setEditingProduct({...editingProduct, image_url: e.target.value})}
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
                <textarea 
                  className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm h-24"
                  placeholder="Delicious details about this bake..."
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                />
              </div>
              <div className="pt-4 flex space-x-3">
                <Button variant="outline" type="button" className="flex-1" onClick={() => setEditingProduct(null)}>Cancel</Button>
                <Button type="submit" className="flex-1">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-100 text-xs uppercase tracking-wider text-slate-500">
                <th className="p-4 font-semibold">Product</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">Price</th>
                <th className="p-4 font-semibold">Stock</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.length > 0 ? (
                products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                    <td className="p-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded bg-slate-100 mr-3 flex-shrink-0 overflow-hidden border border-gray-100">
                          {prod.image_url ? (
                            <img src={prod.image_url} alt={prod.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-slate-300">
                              <Upload className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{prod.name}</div>
                          <div className="text-[10px] text-slate-400">ID: {prod.id.substring(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">{prod.category}</td>
                    <td className="p-4 font-bold text-slate-900">₹{prod.price.toLocaleString()}</td>
                    <td className="p-4 text-slate-600">{prod.stock} left</td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-0.5 text-[10px] rounded-full font-medium ${
                        prod.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {prod.status}
                      </span>
                    </td>
                    <td className="p-4 flex items-center justify-end space-x-3">
                      <button 
                        onClick={() => setEditingProduct({
                          id: prod.id,
                          name: prod.name,
                          price: prod.price.toString(),
                          stock: prod.stock.toString(),
                          category: prod.category,
                          description: prod.description || '',
                          image_url: prod.image_url || ''
                        })}
                        className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Edit Product"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(prod.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                        title="Delete Product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    <Package className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    Your catalogue is currently empty. Add your first product!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
