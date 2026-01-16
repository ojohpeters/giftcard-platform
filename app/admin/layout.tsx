"use client";
import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
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
  Shield
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

  // Initialize auth on mount
  useEffect(() => {
    if (!isInitialized && typeof window !== 'undefined') {
      initialize();
    }
  }, [initialize, isInitialized]);

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400 font-bold uppercase tracking-widest">Access Denied</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans selection:bg-blue-50">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col p-6 sticky top-0 h-screen">
        
        {/* LOGO */}
        <div className="mb-12">
          <h1 className="text-2xl font-black uppercase italic tracking-tighter">
            Admin<span className="text-blue-600">.</span>
          </h1>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">
            Control Panel
          </p>
        </div>
        
        <nav className="flex-1 space-y-2">
          <Link 
            href="/admin" 
            className={`flex items-center gap-3 px-3 py-2 text-sm font-bold rounded-xl transition-all group ${
              pathname === '/admin' || pathname === '/admin/'
                ? 'text-gray-900 bg-blue-50'
                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <LayoutGrid size={18} className={pathname === '/admin' || pathname === '/admin/' ? 'text-blue-600' : 'group-hover:text-gray-900'} />
            Overview
          </Link>
          <Link 
            href="/admin/products" 
            className={`flex items-center gap-3 px-3 py-2 text-sm font-bold rounded-xl transition-all group ${
              pathname === '/admin/products'
                ? 'text-gray-900 bg-blue-50'
                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Package size={18} className={pathname === '/admin/products' ? 'text-blue-600' : 'group-hover:text-gray-900'} />
            Products
          </Link>
          <Link 
            href="/admin/orders" 
            className={`flex items-center gap-3 px-3 py-2 text-sm font-bold rounded-xl transition-all group ${
              pathname === '/admin/orders'
                ? 'text-gray-900 bg-blue-50'
                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <ShoppingBag size={18} className={pathname === '/admin/orders' ? 'text-blue-600' : 'group-hover:text-gray-900'} />
            Orders
          </Link>
          <Link 
            href="/admin/users" 
            className={`flex items-center gap-3 px-3 py-2 text-sm font-bold rounded-xl transition-all group ${
              pathname === '/admin/users'
                ? 'text-gray-900 bg-blue-50'
                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Users size={18} className={pathname === '/admin/users' ? 'text-blue-600' : 'group-hover:text-gray-900'} />
            Users
          </Link>
          <Link 
            href="/admin/settings" 
            className={`flex items-center gap-3 px-3 py-2 text-sm font-bold rounded-xl transition-all group ${
              pathname === '/admin/settings'
                ? 'text-gray-900 bg-blue-50'
                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Settings size={18} className={pathname === '/admin/settings' ? 'text-blue-600' : 'group-hover:text-gray-900'} />
            Settings
          </Link>
          <Link 
            href="/admin/logs" 
            className={`flex items-center gap-3 px-3 py-2 text-sm font-bold rounded-xl transition-all group ${
              pathname === '/admin/logs'
                ? 'text-gray-900 bg-blue-50'
                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <FileText size={18} className={pathname === '/admin/logs' ? 'text-blue-600' : 'group-hover:text-gray-900'} />
            Action Logs
          </Link>
        </nav>

        {/* BOTTOM */}
        <div className="space-y-4 pt-6 border-t border-gray-200">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Admin</p>
            <p className="text-sm font-black text-gray-900 truncate">{user?.email}</p>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 text-sm font-bold text-gray-400 hover:text-red-600 transition-all w-full"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 bg-gray-50">
        <div className="p-6 md:p-12 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
