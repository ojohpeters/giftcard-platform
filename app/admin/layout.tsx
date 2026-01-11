"use client";
import { useState } from 'react';
import { RefreshCw, ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react';

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-6 md:space-y-10">
      
      {/* HEADER: Responsive layout from Col to Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight uppercase italic">System Control</h1>
          <p className="text-xs md:text-sm text-gray-500 font-medium uppercase tracking-widest mt-1">Real-time trade monitor</p>
        </div>
        
        <div className="flex w-full sm:w-auto gap-2">
          <input 
            type="text"
            placeholder="Search..."
            className="flex-1 sm:w-64 bg-white border border-gray-200 px-4 py-3 rounded-2xl text-sm font-bold outline-none focus:border-blue-600 transition-all shadow-sm"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="bg-blue-600 text-white p-3 md:px-6 md:py-3 rounded-2xl font-black transition-all hover:bg-black flex items-center gap-2 uppercase text-[10px] tracking-widest shadow-lg shadow-blue-100">
            <RefreshCw size={16} /> <span className="hidden md:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* STATS GRID: 1 col on mobile, 2 on tablet, 4 on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: "Total Volume", value: "₦12.4M", trend: "+12%", up: true },
          { label: "Pending Trades", value: "24", trend: "Critical", up: false },
          { label: "Active Users", value: "1,204", trend: "+3%", up: true },
          { label: "Payouts Today", value: "₦2.1M", trend: "Standard", up: true }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm group hover:border-blue-600 transition-all">
            <div className="flex justify-between items-start mb-4">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">{stat.label}</p>
              <div className={`p-1.5 rounded-lg ${stat.up ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              </div>
            </div>
            <p className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter italic">{stat.value}</p>
            <p className={`text-[9px] font-black uppercase mt-2 ${stat.up ? 'text-green-500' : 'text-orange-500'}`}>{stat.trend}</p>
          </div>
        ))}
      </div>

      {/* RATE MANAGER: 1 col on small mobile, 2 on tablet/large mobile, 4 on desktop */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
          <h2 className="text-[10px] md:text-xs font-black text-gray-900 uppercase tracking-[0.2em] flex items-center gap-2">
            <Zap size={14} className="text-blue-600" fill="currentColor" /> Exchange Matrix
          </h2>
        </div>
        <div className="grid grid-cols-1 min-[450px]:grid-cols-2 lg:grid-cols-4 divide-y min-[450px]:divide-y-0 min-[450px]:divide-x divide-gray-100">
          {[
            { name: "Amazon USD", rate: "1450" },
            { name: "Steam USD", rate: "1200" },
            { name: "Apple EUR", rate: "1550" },
            { name: "Google Play", rate: "1100" }
          ].map((item, i) => (
            <div key={i} className="p-6 md:p-10 hover:bg-blue-50/10 transition-colors">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">{item.name}</p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-gray-300 italic">₦</span>
                <input 
                  type="number" 
                  defaultValue={item.rate} 
                  className="bg-transparent font-black text-3xl md:text-4xl w-full outline-none focus:text-blue-600 transition-colors tracking-tighter italic"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TRADE QUEUE: Added horizontal scroll wrapper for mobile table safety */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-gray-50 bg-gray-50/30">
          <h2 className="text-[10px] md:text-xs font-black text-gray-900 uppercase tracking-[0.2em]">Incoming Trades</h2>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[800px]"> {/* Ensures table doesn't crush on tiny screens */}
            <table className="w-full text-left">
              {/* ... table content remains same as before ... */}
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}