"use client";
import React, { useState } from 'react';
import { Plus, X, Package, Tag, DollarSign, Save, Edit2, Trash2, Zap } from "lucide-react";

export default function AdminDashboard() {
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'Gift Card' });

  const [trades, setTrades] = useState([
    { id: 1, user: "@davido_01", asset: "Amazon $100", value: 148000, status: "VERIFYING" },
    { id: 2, user: "@wizzy_tech", asset: "Steam $50", value: 65500, status: "PAID" },
  ]);

  const stats = [
    { label: "Total Volume", value: "₦4.2M", change: "+12.5%", color: "text-green-600" },
    { label: "Pending Cards", value: "18", change: "Action Needed", color: "text-orange-500" },
    { label: "Active Users", value: "1,204", change: "+43 today", color: "text-blue-600" },
  ];

  return (
    <div className="space-y-8 pb-20">
      {/* HEADER: Stacked on mobile, row on desktop */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">Overview</h1>
          <p className="text-gray-400 font-bold mt-2 uppercase text-[10px] tracking-[0.3em]">Global Trade Control</p>
        </div>
        <button 
          onClick={() => setIsAddingProduct(!isAddingProduct)}
          className={`w-full md:w-auto flex items-center justify-center gap-3 px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 ${
            isAddingProduct ? 'bg-red-500 text-white' : 'bg-black text-white'
          }`}
        >
          {isAddingProduct ? <X size={20} /> : <Plus size={20} />}
          {isAddingProduct ? "Close" : "Add Asset"}
        </button>
      </div>

      {/* ADD ASSET FORM: Optimized for thumbs */}
      {isAddingProduct && (
        <div className="bg-white border-4 border-black p-6 md:p-10 rounded-[40px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] animate-in slide-in-from-top-5">
          <h2 className="text-2xl font-black uppercase italic mb-8 flex items-center gap-3">
            <Package className="text-blue-600" size={28} /> New Entry
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Asset Name</label>
              <input 
                type="text"
                placeholder="e.g. Razer Gold"
                className="w-full bg-gray-50 border-4 border-black rounded-2xl p-5 font-black outline-none focus:bg-yellow-50 transition-all"
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Rate (₦/$)</label>
              <input 
                type="number"
                placeholder="1450"
                className="w-full bg-gray-50 border-4 border-black rounded-2xl p-5 font-black outline-none focus:bg-yellow-50 transition-all"
                value={newProduct.price}
                onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
              />
            </div>
            <div className="flex items-end">
              <button className="w-full bg-blue-600 text-white h-[76px] border-4 border-black rounded-2xl font-black uppercase text-sm tracking-[0.2em] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                Deploy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATS HUB: Stacked perfectly like your screenshot */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white border-4 border-black p-8 rounded-[40px] shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-50 transition-all group">
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6 group-hover:text-black">{stat.label}</p>
            <p className="text-6xl font-black mb-4 tracking-tighter italic leading-none">{stat.value}</p>
            <p className={`text-[12px] font-black uppercase tracking-widest ${stat.color}`}>{stat.change}</p>
          </div>
        ))}
      </div>

      {/* TRANSACTION LEDGER: Horizontal scroll for mobile safety */}
      <div className="bg-white border-4 border-black rounded-[40px] overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
        <div className="p-8 border-b-4 border-black bg-gray-50 flex justify-between items-center">
          <h2 className="font-black uppercase tracking-tight italic text-2xl flex items-center gap-2">
            <Zap size={20} fill="currentColor" /> Manifest
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="border-b-4 border-black text-[10px] font-black uppercase tracking-[0.3em] bg-white">
                <th className="p-8">Handle</th>
                <th className="p-8">Asset</th>
                <th className="p-8">Value</th>
                <th className="p-8">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white font-black italic">
              {trades.map((trade) => (
                <tr key={trade.id} className="border-b-2 border-black last:border-0 hover:bg-blue-50 transition-colors">
                  <td className="p-8 text-gray-900">{trade.user}</td>
                  <td className="p-8 text-[12px] uppercase text-gray-400">{trade.asset}</td>
                  <td className="p-8 text-2xl">₦{trade.value.toLocaleString()}</td>
                  <td className="p-8">
                    <div className="flex gap-4">
                      <button className="p-4 border-2 border-black rounded-xl hover:bg-black hover:text-white transition-all"><Edit2 size={18}/></button>
                      <button className="p-4 border-2 border-black rounded-xl text-red-600 hover:bg-red-600 hover:text-white transition-all"><Trash2 size={18}/></button>
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