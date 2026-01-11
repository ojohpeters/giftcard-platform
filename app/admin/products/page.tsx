"use client";
import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Save, X, DollarSign, Package, Search } from "lucide-react";

export default function AdminProducts() {
  // Local state for products (In a real app, this comes from your DB)
  const [products, setProducts] = useState([
    { id: 1, name: "Amazon US Receipt", price: 1250, category: "Gift Card", status: "Active" },
    { id: 2, name: "Steam Global", price: 1100, category: "Gift Card", status: "Active" },
    { id: 3, name: "Razer Gold", price: 1300, category: "Gaming", status: "Inactive" },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'Gift Card' });

  const addProduct = () => {
    if (!newProduct.name || !newProduct.price) return;
    const item = {
      id: Date.now(),
      name: newProduct.name,
      price: Number(newProduct.price),
      category: newProduct.category,
      status: "Active"
    };
    setProducts([item, ...products]);
    setIsAdding(false);
    setNewProduct({ name: '', price: '', category: 'Gift Card' });
  };

  const deleteProduct = (id: number) => {
    setProducts(products.filter(p => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">Inventory<span className="text-blue-600">.</span></h1>
            <p className="text-gray-500 text-sm font-medium uppercase tracking-widest mt-1">Control rates and asset availability</p>
          </div>
          
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-blue-100 transition-all active:scale-95"
          >
            <Plus size={18} /> Add New Asset
          </button>
        </div>

        {/* Quick Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search assets by name or category..."
            className="w-full bg-white border border-gray-100 rounded-2xl py-5 pl-14 pr-6 outline-none focus:ring-2 focus:ring-blue-600/10 transition-all font-medium text-sm shadow-sm"
          />
        </div>

        {/* Add Product Form (Conditional) */}
        {isAdding && (
          <div className="bg-white border-2 border-blue-600 rounded-[32px] p-8 mb-8 animate-in slide-in-from-top-4 duration-300 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black uppercase italic tracking-tight">Register New Asset</h3>
              <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-black"><X size={20}/></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Asset Name</label>
                <input 
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 outline-none focus:border-blue-600 transition-all"
                  placeholder="e.g. Apple Gift Card"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Rate (₦/$)</label>
                <input 
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 outline-none focus:border-blue-600 transition-all"
                  placeholder="1200"
                />
              </div>
              <div className="flex items-end">
                <button 
                  onClick={addProduct}
                  className="w-full bg-black text-white h-[58px] rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-all"
                >
                  Confirm Asset
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white rounded-[40px] border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Asset</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Category</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Live Rate</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                <th className="px-8 py-6 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white text-[10px] font-black italic">
                        {product.name.substring(0, 3).toUpperCase()}
                      </div>
                      <span className="font-black uppercase italic tracking-tight text-sm">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-xs font-bold text-gray-500 uppercase">{product.category}</td>
                  <td className="px-8 py-6 font-black tabular-nums text-blue-600">₦{product.price.toLocaleString()}</td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      product.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"><Edit3 size={16}/></button>
                      <button 
                        onClick={() => deleteProduct(product.id)}
                        className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                      >
                        <Trash2 size={16}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}