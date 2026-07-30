"use client";
import React, { useState } from 'react';
import { Plus, X, Save, Edit2, Trash2, Zap, ZapOff, TrendingUp } from "lucide-react";
import { formatIRRShort } from '@/lib/currency';

export default function RatesPage() {
  // 1. STATE FOR RATES DATA
  const [rates, setRates] = useState([
    { id: 1, currency: "USD", type: "Amazon", buy: 1450, sell: 1520, status: "Active" },
    { id: 2, currency: "USD", type: "Steam", buy: 1300, sell: 1400, status: "Active" },
    { id: 3, currency: "EUR", type: "Apple", buy: 1550, sell: 1650, status: "Paused" },
  ]);

  // 2. STATE FOR ADDING/EDITING
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newRate, setNewRate] = useState({ currency: 'USD', type: '', buy: '', sell: '', status: 'Active' });

  // --- LOGIC: ADD NEW PAIR ---
  const handleAddPair = () => {
    if (!newRate.type || !newRate.buy) return;
    const entry = {
      id: Date.now(),
      ...newRate,
      buy: Number(newRate.buy),
      sell: Number(newRate.sell)
    };
    setRates([...rates, entry]);
    setIsAdding(false);
    setNewRate({ currency: 'USD', type: '', buy: '', sell: '', status: 'Active' });
  };

  // --- LOGIC: TOGGLE STATUS ---
  const toggleStatus = (id: number) => {
    setRates(rates.map(r => 
      r.id === id ? { ...r, status: r.status === "Active" ? "Paused" : "Active" } : r
    ));
  };

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none">Global Rates</h1>
          <p className="text-gray-500 dark:text-neutral-400 font-medium mt-2 uppercase text-[11px] tracking-widest">Adjust Profit Margins & Asset Value</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={`px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all ${
            isAdding ? 'bg-red-500 text-white' : 'bg-black text-white hover:bg-blue-600 shadow-xl shadow-blue-100'
          }`}
        >
          {isAdding ? <X size={16}/> : <Plus size={16}/>} {isAdding ? 'Cancel' : 'Add New Pair'}
        </button>
      </div>

      {/* ADD NEW RATE FORM */}
      {isAdding && (
        <div className="bg-white dark:bg-neutral-900 border-4 border-black dark:border-neutral-700 p-8 rounded-[40px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-none animate-in slide-in-from-top-4">
          <h2 className="text-xl font-black uppercase italic mb-6 flex items-center gap-2">
            <TrendingUp className="text-blue-600" /> New Currency Pair
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <input 
              placeholder="Asset (e.g. Vanilla)" 
              className="border-2 border-black p-4 rounded-2xl font-black outline-none bg-gray-50 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100"
              value={newRate.type}
              onChange={(e) => setNewRate({...newRate, type: e.target.value})}
            />
            <input 
              type="number" 
              placeholder="Buy Rate (تومان)" 
              className="border-2 border-black p-4 rounded-2xl font-black outline-none bg-gray-50 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100"
              value={newRate.buy}
              onChange={(e) => setNewRate({...newRate, buy: e.target.value})}
            />
            <input 
              type="number" 
              placeholder="Sell Rate (تومان)" 
              className="border-2 border-black p-4 rounded-2xl font-black outline-none bg-gray-50 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100"
              value={newRate.sell}
              onChange={(e) => setNewRate({...newRate, sell: e.target.value})}
            />
            <button 
              onClick={handleAddPair}
              className="bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all"
            >
              Set Rates
            </button>
          </div>
        </div>
      )}

      {/* RATE TABLE */}
      <div className="bg-white dark:bg-neutral-900 border-2 border-black dark:border-neutral-700 rounded-[40px] overflow-x-auto shadow-[16px_16px_0px_0px_rgba(240,240,240,1)] dark:shadow-none">
        <table className="w-full min-w-[560px] text-left">
          <thead>
            <tr className="border-b-2 border-black dark:border-neutral-700 text-[11px] font-black uppercase tracking-[0.3em] bg-gray-50 dark:bg-neutral-800 text-gray-400 dark:text-neutral-500">
              <th className="p-8">Asset/Currency</th>
              <th className="p-8">Our Buy (تومان)</th>
              <th className="p-8">Our Sell (تومان)</th>
              <th className="p-8">System Status</th>
              <th className="p-8 text-right">Settings</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-neutral-900">
            {rates.map((rate) => (
              <tr key={rate.id} className="border-b border-gray-100 dark:border-neutral-800 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 transition-colors group">
                <td className="p-8 font-black italic text-lg uppercase">
                  {rate.currency} <span className="text-blue-600">/</span> {rate.type}
                </td>
                <td className="p-8">
                  <span className="font-black text-xl tabular-nums italic text-green-600">{formatIRRShort(rate.buy)} تومان</span>
                </td>
                <td className="p-8">
                  <span className="font-black text-xl tabular-nums italic text-blue-600">{formatIRRShort(rate.sell)} تومان</span>
                </td>
                <td className="p-8">
                  <button 
                    onClick={() => toggleStatus(rate.id)}
                    className={`px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
                      rate.status === "Active" ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                    }`}
                  >
                    {rate.status === "Active" ? <Zap size={10} fill="currentColor"/> : <ZapOff size={10}/>}
                    {rate.status}
                  </button>
                </td>
                <td className="p-8 text-right">
                  <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-3 bg-gray-50 dark:bg-neutral-800 text-gray-400 dark:text-neutral-500 hover:text-black dark:hover:text-neutral-100 hover:border-black dark:hover:border-neutral-700 border border-transparent rounded-xl transition-all">
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => setRates(rates.filter(r => r.id !== rate.id))}
                      className="p-3 bg-gray-50 dark:bg-neutral-800 text-gray-400 dark:text-neutral-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}