"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { supportAPI } from '@/lib/api';
import { BrutalistLoader } from '@/components/Loading';
import { 
  LayoutGrid, 
  Package, 
  ShoppingBag, 
  Users, 
  Settings, 
  FileText,
  TrendingUp,
  LogOut,
  Shield,
  Gift,
  ArrowUpRight,
  Fingerprint,
  MessageSquare,
  Layers,
  PenTool,
  Ticket
} from "lucide-react";
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const initialize = useAuthStore((state) => state.initialize);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const logout = useAuthStore((state) => state.logout);
  const [unreadSupport, setUnreadSupport] = useState(0);

  // Initialize auth on mount
  useEffect(() => {
    if (!isInitialized && typeof window !== 'undefined') {
      initialize();
    }
  }, [initialize, isInitialized]);

  // Poll unread support messages (staff view = user messages awaiting reply).
  useEffect(() => {
    if (!isAuthenticated || !user?.is_staff) return;
    let active = true;
    const load = () => supportAPI.getUnreadCount()
      .then((r) => { if (active) setUnreadSupport(r.data?.unread_count || 0); })
      .catch(() => {});
    load();
    const id = setInterval(load, 30000);
    return () => { active = false; clearInterval(id); };
  }, [isAuthenticated, user?.is_staff, pathname]);

  useEffect(() => {
    // Wait for auth to initialize before checking
    if (isLoading || !isInitialized) return;

    if (!isAuthenticated) {
      router.push('/login?redirect=/admin');
      return;
    }
    
    // Check if user is admin
    if (user && !user.is_staff) {
      router.push('/dashboard');
      return;
    }
  }, [isAuthenticated, user, router, isLoading, isInitialized]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // Show loading while checking auth
  if (isLoading) {
    return <BrutalistLoader fullScreen message="Initializing Admin Terminal" />;
  }

  if (!isAuthenticated || !user?.is_staff) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-300 dark:text-neutral-600 mx-auto mb-4" />
          <p className="text-gray-400 dark:text-neutral-500 font-bold uppercase tracking-widest">Access Denied</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#0a0a0b] font-sans selection:bg-blue-50">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white dark:bg-neutral-950 border-r border-gray-200 dark:border-neutral-800 hidden lg:flex flex-col p-6 sticky top-0 h-screen">
        
        {/* LOGO */}
        <div className="mb-12">
          <h1 className="text-2xl font-black uppercase italic tracking-tighter dark:text-neutral-100">
            Admin<span className="text-blue-600">.</span>
          </h1>
          <p className="text-[9px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-widest mt-1">
            Control Panel
          </p>
        </div>
        
        <nav className="flex-1 space-y-2">
          <Link 
            href="/admin" 
            className={`flex items-center gap-3 px-3 py-2 text-sm font-bold rounded-xl transition-all group ${
              pathname === '/admin' || pathname === '/admin/'
                ? 'text-gray-900 bg-blue-50 dark:text-neutral-100 dark:bg-blue-950/40'
                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50 dark:text-neutral-500 dark:hover:text-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <LayoutGrid size={18} className={pathname === '/admin' || pathname === '/admin/' ? 'text-blue-600' : 'group-hover:text-gray-900 dark:group-hover:text-neutral-100'} />
            Overview
          </Link>
          <Link 
            href="/admin/products" 
            className={`flex items-center gap-3 px-3 py-2 text-sm font-bold rounded-xl transition-all group ${
              pathname === '/admin/products'
                ? 'text-gray-900 bg-blue-50 dark:text-neutral-100 dark:bg-blue-950/40'
                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50 dark:text-neutral-500 dark:hover:text-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Package size={18} className={pathname === '/admin/products' ? 'text-blue-600' : 'group-hover:text-gray-900 dark:group-hover:text-neutral-100'} />
            Products
          </Link>
          <Link
            href="/admin/catalog"
            className={`flex items-center gap-3 px-3 py-2 text-sm font-bold rounded-xl transition-all group ${
              pathname === '/admin/catalog'
                ? 'text-gray-900 bg-blue-50 dark:text-neutral-100 dark:bg-blue-950/40'
                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50 dark:text-neutral-500 dark:hover:text-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Layers size={18} className={pathname === '/admin/catalog' ? 'text-blue-600' : 'group-hover:text-gray-900 dark:group-hover:text-neutral-100'} />
            Catalog
          </Link>
          <Link
            href="/admin/purchase-requests" 
            className={`flex items-center gap-3 px-3 py-2 text-sm font-bold rounded-xl transition-all group ${
              pathname === '/admin/purchase-requests'
                ? 'text-gray-900 bg-blue-50 dark:text-neutral-100 dark:bg-blue-950/40'
                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50 dark:text-neutral-500 dark:hover:text-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <ShoppingBag size={18} className={pathname === '/admin/purchase-requests' ? 'text-blue-600' : 'group-hover:text-gray-900 dark:group-hover:text-neutral-100'} />
            Buy Orders
          </Link>
          <Link 
            href="/admin/submissions" 
            className={`flex items-center gap-3 px-3 py-2 text-sm font-bold rounded-xl transition-all group ${
              pathname === '/admin/submissions'
                ? 'text-gray-900 bg-blue-50 dark:text-neutral-100 dark:bg-blue-950/40'
                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50 dark:text-neutral-500 dark:hover:text-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <TrendingUp size={18} className={pathname === '/admin/submissions' ? 'text-blue-600' : 'group-hover:text-gray-900 dark:group-hover:text-neutral-100'} />
            Submissions
          </Link>
          <Link 
            href="/admin/withdrawals" 
            className={`flex items-center gap-3 px-3 py-2 text-sm font-bold rounded-xl transition-all group ${
              pathname === '/admin/withdrawals'
                ? 'text-gray-900 bg-blue-50 dark:text-neutral-100 dark:bg-blue-950/40'
                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50 dark:text-neutral-500 dark:hover:text-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <ArrowUpRight size={18} className={pathname === '/admin/withdrawals' ? 'text-blue-600' : 'group-hover:text-gray-900 dark:group-hover:text-neutral-100'} />
            Withdrawals
          </Link>
          <Link
            href="/admin/kyc"
            className={`flex items-center gap-3 px-3 py-2 text-sm font-bold rounded-xl transition-all group ${
              pathname === '/admin/kyc'
                ? 'text-gray-900 bg-blue-50 dark:text-neutral-100 dark:bg-blue-950/40'
                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50 dark:text-neutral-500 dark:hover:text-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Fingerprint size={18} className={pathname === '/admin/kyc' ? 'text-blue-600' : 'group-hover:text-gray-900 dark:group-hover:text-neutral-100'} />
            KYC Review
          </Link>
          <Link
            href="/admin/support"
            className={`flex items-center gap-3 px-3 py-2 text-sm font-bold rounded-xl transition-all group ${
              pathname === '/admin/support'
                ? 'text-gray-900 bg-blue-50 dark:text-neutral-100 dark:bg-blue-950/40'
                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50 dark:text-neutral-500 dark:hover:text-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <MessageSquare size={18} className={pathname === '/admin/support' ? 'text-blue-600' : 'group-hover:text-gray-900 dark:group-hover:text-neutral-100'} />
            Support
            {unreadSupport > 0 && (
              <span className="ml-auto min-w-[20px] h-5 px-1.5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center">
                {unreadSupport > 99 ? '99+' : unreadSupport}
              </span>
            )}
          </Link>
          <Link
            href="/admin/blog"
            className={`flex items-center gap-3 px-3 py-2 text-sm font-bold rounded-xl transition-all group ${
              pathname === '/admin/blog' || pathname.startsWith('/admin/blog/')
                ? 'text-gray-900 bg-blue-50 dark:text-neutral-100 dark:bg-blue-950/40'
                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50 dark:text-neutral-500 dark:hover:text-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <PenTool size={18} className={pathname === '/admin/blog' || pathname.startsWith('/admin/blog/') ? 'text-blue-600' : 'group-hover:text-gray-900 dark:group-hover:text-neutral-100'} />
            Blog
          </Link>
          <Link 
            href="/admin/users" 
            className={`flex items-center gap-3 px-3 py-2 text-sm font-bold rounded-xl transition-all group ${                                                                                                      
              pathname === '/admin/users'
                ? 'text-gray-900 bg-blue-50 dark:text-neutral-100 dark:bg-blue-950/40'
                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50 dark:text-neutral-500 dark:hover:text-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Users size={18} className={pathname === '/admin/users' ? 'text-blue-600' : 'group-hover:text-gray-900 dark:group-hover:text-neutral-100'} />                                                                                             
            Users
          </Link>
          <Link 
            href="/admin/send-code" 
            className={`flex items-center gap-3 px-3 py-2 text-sm font-bold rounded-xl transition-all group ${                                                                                                      
              pathname === '/admin/send-code'
                ? 'text-gray-900 bg-blue-50 dark:text-neutral-100 dark:bg-blue-950/40'
                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50 dark:text-neutral-500 dark:hover:text-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Gift size={18} className={pathname === '/admin/send-code' ? 'text-blue-600' : 'group-hover:text-gray-900 dark:group-hover:text-neutral-100'} />
            Send Code
          </Link>
          <Link
            href="/admin/discounts"
            className={`flex items-center gap-3 px-3 py-2 text-sm font-bold rounded-xl transition-all group ${
              pathname === '/admin/discounts'
                ? 'text-gray-900 bg-blue-50 dark:text-neutral-100 dark:bg-blue-950/40'
                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50 dark:text-neutral-500 dark:hover:text-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Ticket size={18} className={pathname === '/admin/discounts' ? 'text-blue-600' : 'group-hover:text-gray-900 dark:group-hover:text-neutral-100'} />
            Discounts
          </Link>
          <Link 
            href="/admin/settings" 
            className={`flex items-center gap-3 px-3 py-2 text-sm font-bold rounded-xl transition-all group ${                                                                                                      
              pathname === '/admin/settings'
                ? 'text-gray-900 bg-blue-50 dark:text-neutral-100 dark:bg-blue-950/40'
                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50 dark:text-neutral-500 dark:hover:text-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Settings size={18} className={pathname === '/admin/settings' ? 'text-blue-600' : 'group-hover:text-gray-900 dark:group-hover:text-neutral-100'} />                                                                                       
            Settings
          </Link>
          <Link 
            href="/admin/logs" 
            className={`flex items-center gap-3 px-3 py-2 text-sm font-bold rounded-xl transition-all group ${
              pathname === '/admin/logs'
                ? 'text-gray-900 bg-blue-50 dark:text-neutral-100 dark:bg-blue-950/40'
                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50 dark:text-neutral-500 dark:hover:text-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <FileText size={18} className={pathname === '/admin/logs' ? 'text-blue-600' : 'group-hover:text-gray-900 dark:group-hover:text-neutral-100'} />
            Action Logs
          </Link>
        </nav>

        {/* BOTTOM */}
        <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-neutral-800">
          <div className="bg-gray-50 dark:bg-neutral-900 rounded-xl p-4">
            <p className="text-[9px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-widest mb-1">Admin</p>
            <p className="text-sm font-black text-gray-900 dark:text-neutral-100 truncate">{user?.email}</p>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 text-sm font-bold text-gray-400 dark:text-neutral-500 hover:text-red-600 transition-all w-full"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 bg-gray-50 dark:bg-[#0a0a0b]">
        <div className="p-6 md:p-12 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
