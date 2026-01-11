import { 
  LayoutGrid, 
  History, 
  ArrowUpRight, 
  Settings, 
  LogOut, 
  Wallet 
} from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white font-sans selection:bg-blue-50">
      
      {/* SIDEBAR - ICON CENTRIC & SLEEK */}
      <aside className="w-64 bg-white border-r border-gray-100 hidden lg:flex flex-col p-8 sticky top-0 h-screen">
        
        {/* TOP SPACER (Logo Removed) */}
        <div className="h-10 mb-12"></div>
        
        <nav className="flex-1 space-y-12">
          {/* Operations Group */}
          <div className="space-y-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-300 ml-1">Main</p>
            <div className="space-y-1">
              <a href="/dashboard" className="flex items-center gap-4 px-3 py-2 text-sm font-bold text-gray-900 bg-gray-50 rounded-xl group">
                <LayoutGrid size={18} className="text-blue-600" />
                Overview
              </a>
              <a href="/dashboard/orders" className="flex items-center gap-4 px-3 py-2 text-sm font-bold text-gray-400 hover:text-gray-900 transition-all group">
                <History size={18} className="group-hover:text-gray-900" />
                History
              </a>
            </div>
          </div>
          
          {/* Finance Group */}
          <div className="space-y-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-300 ml-1">Finance</p>
            <div className="space-y-1">
              <a href="/dashboard/withdraw" className="flex items-center gap-4 px-3 py-2 text-sm font-bold text-gray-400 hover:text-gray-900 transition-all group">
                <ArrowUpRight size={18} className="group-hover:text-blue-600" />
                Payout
              </a>
              <a href="/dashboard/settings" className="flex items-center gap-4 px-3 py-2 text-sm font-bold text-gray-400 hover:text-gray-900 transition-all group">
                <Settings size={18} className="group-hover:text-gray-900" />
                Settings
              </a>
            </div>
          </div>
        </nav>

        {/* BOTTOM SECTION - WALLET & LOGOUT */}
        <div className="space-y-6">
          <div className="bg-[#fcfcfd] border border-gray-100 p-6 rounded-3xl">
            <div className="flex items-center gap-2 mb-3">
              <Wallet size={14} className="text-gray-400" />
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Balance</p>
            </div>
            <p className="text-xl font-black text-gray-900 tracking-tighter">
              ₦124,500<span className="text-gray-300">.00</span>
            </p>
          </div>
          
          <button className="flex items-center gap-4 px-3 py-2 text-sm font-bold text-gray-400 hover:text-red-600 transition-all w-full">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 bg-[#fcfcfd]/50">
        <div className="p-8 md:p-16 max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}