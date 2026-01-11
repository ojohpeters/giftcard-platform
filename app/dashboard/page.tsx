"use client";
import React, { useState } from 'react';
import { Check, Edit2, X, AlertCircle, Plus, Save, Trash2, Zap, ArrowUpRight, Filter } from "lucide-react";

export default function AdminDashboard() {
  const [trades, setTrades] = useState([
    { id: 1, user: "@davido_01", asset: "Amazon $100", value: 148000, status: "VERIFYING" },
    { id: 2, user: "@wizzy_tech", asset: "Steam $50", value: 65500, status: "PAID" },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [newTrade, setNewTrade] = useState({ user: '', asset: '', value: '', status: 'VERIFYING' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState(0);
  const [editStatus, setEditStatus] = useState("");

  const handleAddTrade = () => {
    if (!newTrade.user || !newTrade.value) return;
    const entry = {
      id: Date.now(),
      user: newTrade.user.startsWith('@') ? newTrade.user : `@${newTrade.user}`,
      asset: newTrade.asset || "Manual Entry",
      value: Number(newTrade.value),
      status: newTrade.status
    };
    setTrades([entry, ...trades]);
    setNewTrade({ user: '', asset: '', value: '', status: 'VERIFYING' });
    setIsAdding(false);
  };

  const startEdit = (trade: any) => {
    setEditingId(trade.id);
    setEditValue(trade.value);
    setEditStatus(trade.status);
  };

  const saveEdit = (id: number) => {
    setTrades(trades.map(t => t.id === id ? { ...t, value: editValue, status: editStatus } : t));
    setEditingId(null);
  };

  const deleteTrade = (id: number) => {
    if(confirm("Delete this entry?")) setTrades(trades.filter(t => t.id !== id));
  };

  const stats = [
    { label: "Volume", value: "4.2M", color: "text-blue-600" },
    { label: "Pending", value: "18", color: "text-orange-500" },
    { label: "Active", value: "1.2K", color: "text-green-600" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-[#0A0A0A] font-sans antialiased pb-32">
      
      {/* STICKY TOP HEADER */}
      <div className="sticky top-0 z-[60] bg-white/80 backdrop-blur-md border-b-4 border-black p-4 md:p-8 mb-6 md:mb-12">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl md:text-7xl font-black tracking-tighter uppercase italic leading-none">Node</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 text-left">Control Terminal v4.0</span>
            </div>
          </div>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="bg-black text-white p-4 md:px-8 md:py-5 rounded-2xl md:rounded-[24px] border-2 md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
          >
            {isAdding ? <X size={20} /> : <Plus size={20} />}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-8">
        
        {/* MOBILE-OPTIMIZED STATS GRID */}
        <div className="grid grid-cols-3 gap-3 md:gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white border-2 md:border-4 border-black p-4 md:p-8 rounded-2xl md:rounded-[40px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-[8px] md:text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2">{stat.label}</div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xs md:text-3xl font-black italic">₦</span>
                <span className="text-xl md:text-6xl font-black tracking-tighter leading-none">{stat.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ADD FORM - FULL WIDTH MOBILE */}
        {isAdding && (
          <div className="bg-white border-4 border-black p-6 md:p-10 rounded-[32px] md:rounded-[40px] shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-black uppercase italic mb-6 flex items-center gap-2">
              <Zap className="text-blue-600" size={20} /> Manual Entry
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input 
                placeholder="Username" 
                className="bg-gray-50 border-2 md:border-4 border-black p-4 md:p-5 rounded-xl font-black outline-none focus:bg-blue-50"
                value={newTrade.user}
                onChange={(e) => setNewTrade({...newTrade, user: e.target.value})}
              />
              <input 
                placeholder="Asset" 
                className="bg-gray-50 border-2 md:border-4 border-black p-4 md:p-5 rounded-xl font-black outline-none focus:bg-blue-50"
                value={newTrade.asset}
                onChange={(e) => setNewTrade({...newTrade, asset: e.target.value})}
              />
              <input 
                type="number"
                placeholder="Naira Value" 
                className="bg-gray-50 border-2 md:border-4 border-black p-4 md:p-5 rounded-xl font-black outline-none focus:bg-blue-50"
                value={newTrade.value}
                onChange={(e) => setNewTrade({...newTrade, value: e.target.value})}
              />
              <button 
                onClick={handleAddTrade}
                className="bg-blue-600 text-white p-4 md:p-5 border-2 md:border-4 border-black rounded-xl font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
              >
                Deploy
              </button>
            </div>
          </div>
        )}

        {/* DATA LISTING */}
        <div className="bg-white border-4 border-black rounded-[32px] md:rounded-[40px] overflow-hidden shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-6 md:p-8 border-b-4 border-black bg-gray-50 flex justify-between items-center">
            <h2 className="font-black uppercase italic text-lg md:text-2xl">Manifest</h2>
            <Filter size={20} />
          </div>

          <div className="divide-y-2 md:divide-y-4 divide-black">
            {trades.map((trade) => (
              <div key={trade.id} className="p-5 md:p-10 group transition-colors hover:bg-gray-50">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  
                  {/* USER INFO */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-black text-white flex items-center justify-center rounded-2xl font-black italic text-xl">
                      {trade.user.substring(1,2).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <div className="font-black italic text-xl md:text-3xl leading-none">{trade.user}</div>
                      <div className="text-[9px] md:text-xs font-black text-gray-400 uppercase mt-1 tracking-widest">{trade.asset}</div>
                    </div>
                  </div>

                  {/* VALUE & STATUS */}
                  <div className="flex items-center justify-between md:justify-end gap-4 md:gap-12">
                    <div className="text-left md:text-right">
                      <div className="text-[8px] font-black uppercase text-gray-400 mb-1">Settlement</div>
                      {editingId === trade.id ? (
                        <input type="number" value={editValue} onChange={(e) => setEditValue(Number(e.target.value))} className="border-2 border-black rounded-lg px-2 py-1 w-24 font-black bg-blue-50" />
                      ) : (
                        <div className="font-black text-xl md:text-4xl italic">₦{trade.value.toLocaleString()}</div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {editingId === trade.id ? (
                        <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="border-2 border-black rounded-lg p-2 font-black text-[10px] uppercase bg-white">
                          <option value="VERIFYING">VERIFYING</option>
                          <option value="PAID">PAID</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      ) : (
                        <span className={`px-4 py-2 rounded-xl text-[8px] md:text-[10px] font-black uppercase border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
                          trade.status === 'PAID' ? 'bg-green-400' : trade.status === 'CANCELLED' ? 'bg-red-400' : 'bg-orange-400'
                        }`}>
                          {trade.status}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex justify-end gap-2 border-t-2 border-black pt-4 md:pt-0 md:border-0">
                    {editingId === trade.id ? (
                      <button onClick={() => saveEdit(trade.id)} className="flex-1 md:flex-none bg-black text-white p-4 rounded-xl border-2 border-black"><Save size={18}/></button>
                    ) : (
                      <>
                        <button onClick={() => startEdit(trade)} className="flex-1 md:flex-none p-4 border-2 border-black rounded-xl hover:bg-black hover:text-white transition-all"><Edit2 size={18}/></button>
                        <button onClick={() => deleteTrade(trade.id)} className="flex-1 md:flex-none p-4 border-2 border-black rounded-xl text-red-600 hover:bg-red-50"><Trash2 size={18}/></button>
                      </>
                    )}
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MOBILE FAB - ALWAYS ACCESSIBLE */}
      <div className="md:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[90%]">
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={`w-full p-5 rounded-[24px] border-4 border-black font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all ${
            isAdding ? 'bg-red-500 text-white' : 'bg-blue-600 text-white'
          }`}
        >
          {isAdding ? <X size={20} /> : <Plus size={20} />}
          {isAdding ? "Close Panel" : "Quick Entry"}
        </button>
      </div>

    </div>
  );
}