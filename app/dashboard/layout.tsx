"use client";
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  LayoutGrid, 
  History, 
  ArrowUpRight, 
  Settings, 
  LogOut, 
  Wallet,
  MessageSquare,
  Gift,
  Upload,
  Boxes
} from "lucide-react";
import { useAuthStore } from '@/store/authStore';
import { userAPI } from '@/lib/api';
import Link from 'next/link';
import { formatIRRShort } from '@/lib/currency';
import { useI18n } from '@/lib/i18n';

function NavLink({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
  
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-4 px-3 py-2 text-sm font-bold transition-all group ${
        isActive
          ? 'text-gray-900 dark:text-neutral-100 bg-gray-50 dark:bg-neutral-900 rounded-xl'
          : 'text-gray-400 dark:text-neutral-500 hover:text-gray-900 dark:hover:text-neutral-100'
      }`}
    >
      <Icon size={18} className={isActive ? 'text-blue-600' : 'group-hover:text-gray-900 dark:group-hover:text-neutral-100'} />
      {label}
    </Link>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const initialize = useAuthStore((state) => state.initialize);
  const [wallet, setWallet] = useState<{ balance: string } | null>(null);

  // Initialize auth on mount
  useEffect(() => {
    if (!isInitialized && typeof window !== 'undefined') {
      initialize();
    }
  }, [initialize, isInitialized]);

  // Fetch wallet balance
  useEffect(() => {
    if (user && isInitialized) {
      const fetchWallet = async () => {
        try {
          const response = await userAPI.getWallet();
          setWallet(response.data);
        } catch (error) {
          console.error('Failed to fetch wallet:', error);
        }
      };
      fetchWallet();
    }
  }, [user, isInitialized]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };
  return (
    <div className="flex min-h-screen bg-white dark:bg-[#0a0a0b] font-sans selection:bg-blue-50">
      
      {/* SIDEBAR - ICON CENTRIC & SLEEK */}
      <aside className="w-64 shrink-0 bg-white dark:bg-neutral-900 border-e border-gray-100 dark:border-neutral-800 hidden lg:flex flex-col p-8 sticky top-0 h-screen overflow-hidden">
        
        {/* TOP SPACER (Logo Removed) */}
        <div className="h-10 mb-12"></div>
        
        <nav className="flex-1 space-y-12">
          {/* Operations Group */}
          <div className="space-y-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-gray-300 dark:text-neutral-600 ml-1">{t('dashNav.main')}</p>
            <div className="space-y-1">
              <NavLink href="/dashboard" icon={LayoutGrid} label={t('dashNav.overview')} />
              <NavLink href="/dashboard/orders" icon={History} label={t('dashNav.history')} />
              <NavLink href="/dashboard/submissions" icon={Upload} label={t('dashNav.submissions')} />
              <NavLink href="/dashboard/support" icon={MessageSquare} label={t('dashNav.support')} />
              <NavLink href="/dashboard/codes" icon={Gift} label={t('dashNav.giftCodes')} />
              <NavLink href="/dashboard/inventory" icon={Boxes} label={t('dashNav.inventory')} />
            </div>
          </div>
          
          {/* Finance Group */}
          <div className="space-y-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-gray-300 dark:text-neutral-600 ml-1">{t('dashNav.finance')}</p>
            <div className="space-y-1">
              <NavLink href="/dashboard/withdraw" icon={ArrowUpRight} label={t('dashNav.payout')} />
              <NavLink href="/dashboard/settings" icon={Settings} label={t('dashNav.settings')} />
            </div>
          </div>
        </nav>

        {/* BOTTOM SECTION - WALLET & LOGOUT */}
        <div className="space-y-6">
          <div className="bg-[#fcfcfd] dark:bg-neutral-800 border border-gray-100 dark:border-neutral-800 p-6 rounded-3xl overflow-hidden">
            <div className="flex items-center gap-2 mb-3">
              <Wallet size={14} className="text-gray-400 dark:text-neutral-500 shrink-0" />
              <p className="text-[11px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-widest">{t('dashNav.balance')}</p>
            </div>
            <p className="text-xl font-black text-gray-900 dark:text-neutral-100 tracking-tighter truncate">
              {formatIRRShort(wallet?.balance || '0')} تومان
            </p>
            <p className="text-[11px] text-gray-400 dark:text-neutral-500 font-medium mt-1 truncate" title={user?.email}>
              {user?.email}
            </p>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 px-3 py-2 text-sm font-bold text-gray-400 dark:text-neutral-500 hover:text-red-600 transition-all w-full"
          >
            <LogOut size={18} />
            {t('dashNav.logout')}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 min-w-0 overflow-x-hidden bg-[#fcfcfd]/50 dark:bg-[#0a0a0b]">
        <div className="p-8 md:p-16 max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}