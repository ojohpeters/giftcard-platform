"use client";
import React from 'react';
import { 
  Search, 
  Filter, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  XCircle,
  ArrowDownLeft,
  ArrowUpRight
} from "lucide-react";

const ORDERS = [
  { id: "TRX-9902", asset: "Amazon Card", amount: "₦450,000", date: "Jan 09, 14:20", status: "Completed", type: "Sell" },
  { id: "TRX-9841", asset: "Steam Wallet", amount: "₦12,500", date: "Jan 09, 09:15", status: "Pending", type: "Sell" },
  { id: "TRX-9810", asset: "Apple Store", amount: "₦85,000", date: "Jan 08, 22:45", status: "Rejected", type: "Sell" },
  { id: "TRX-9755", asset: "Google Play", amount: "₦200,000", date: "Jan 08, 11:30", status: "Completed", type: "Sell" },
  { id: "TRX-9701", asset: "Bank Transfer", amount: "₦100,000", date: "Jan 07, 18:10", status: "Completed", type: "Withdraw" },
];

export default function OrdersPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700 px-4 md:px-0 pb-20">
      
      {/* HEADER: DATA MODE */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-1 w-4 bg-blue-600"></div>
            <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.4em]">Transaction Logs</p>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter italic uppercase leading-none">
            Orders<span className="text-gray-200">/</span>History
          </h1>
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative group flex-1 md:flex-none">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-focus-within:text-black transition-colors" />
            <input 
              type="text" 
              placeholder="SEARCH ID..." 
              className="bg-gray-50 border border-gray-100 py-3 pl-11 pr-4 rounded-xl text-[10px] font-bold tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all w-full md:w-64"
            />
          </div>
          <button className="p-3 bg-white border border-gray-100 rounded-xl hover:bg-black hover:text-white transition-all shadow-sm">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* --- DESKTOP TABLE VIEW (Hidden on Mobile) --- */}
      <div className="hidden md:block bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-50">
              <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">ID / Timestamp</th>
              <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">Asset Type</th>
              <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">Value</th>
              <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 text-center">Status</th>
              <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {ORDERS.map((order) => (
              <tr key={order.id} className="group hover:bg-gray-50/50 transition-colors cursor-pointer">
                <td className="px-8 py-6">
                  <div className="space-y-1">
                    <p className="text-[11px] font-black text-gray-900 tracking-wider font-mono uppercase">{order.id}</p>
                    <p className="text-[9px] font-medium text-gray-400 uppercase tracking-tight">{order.date}</p>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-white transition-colors">
                      {order.type === 'Sell' ? <ArrowDownLeft size={14} className="text-blue-600" /> : <ArrowUpRight size={14} className="text-gray-400" />}
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-gray-800">{order.asset}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <p className="text-sm font-black text-gray-900 tabular-nums tracking-tighter">{order.amount}</p>
                </td>
                <td className="px-8 py-6 text-center">
                  <div className="inline-block">
                    <StatusBadge status={order.status} />
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <button className="p-2 text-gray-300 hover:text-black hover:bg-gray-100 rounded-lg transition-all">
                    <ChevronRight size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MOBILE CARD VIEW (Hidden on Desktop) --- */}
      <div className="md:hidden space-y-4">
        {ORDERS.map((order) => (
          <div key={order.id} className="bg-white border border-gray-100 p-5 rounded-[24px] space-y-4 shadow-sm active:scale-[0.98] transition-all">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 rounded-lg">
                   {order.type === 'Sell' ? <ArrowDownLeft size={14} className="text-blue-600" /> : <ArrowUpRight size={14} className="text-gray-400" />}
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-gray-900">{order.asset}</p>
                  <p className="text-[9px] font-mono font-bold text-gray-400">{order.id}</p>
                </div>
              </div>
              <StatusBadge status={order.status} />
            </div>

            <div className="flex items-end justify-between border-t border-gray-50 pt-4">
              <div>
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Settlement Value</p>
                <p className="text-xl font-black text-gray-900 tracking-tighter italic">{order.amount}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold text-gray-400 uppercase">{order.date}</p>
                <button className="flex items-center gap-1 text-[9px] font-black text-blue-600 uppercase tracking-tighter mt-1">
                  Details <ChevronRight size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER ACTION */}
      <div className="flex justify-center pt-4">
        <button className="w-full md:w-auto px-8 py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/10 active:scale-95">
          Sync Database
        </button>
      </div>

    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Completed: "bg-green-50 text-green-600 border-green-100",
    Pending: "bg-orange-50 text-orange-600 border-orange-100",
    Rejected: "bg-red-50 text-red-600 border-red-100",
  };

  const icons: Record<string, React.ReactNode> = {
    Completed: <CheckCircle2 size={10} />,
    Pending: <Clock size={10} />,
    Rejected: <XCircle size={10} />,
  };

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[8px] md:text-[9px] font-black uppercase tracking-widest ${styles[status]}`}>
      {icons[status]}
      {status}
    </div>
  );
}