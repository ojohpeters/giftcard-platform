"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Zap, ArrowUpRight, Globe, LayoutDashboard, ShoppingCart, Shield, Home } from "lucide-react";
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const cartCount = useCartStore((state) => state.getCartCount());
  const fetchCart = useCartStore((state) => state.fetchCart);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  const mainLinks = [
    { name: "Home", href: "/" },
    { name: "Market", href: "/marketplace" },
    ...(isAuthenticated ? [{ name: "Manifest", href: "/cart" }] : []),
  ];

  const dashboardLinks = [
    { name: "Overview", href: "/dashboard" },
    { name: "Orders", href: "/dashboard/orders" },
    { name: "Withdraw", href: "/dashboard/withdraw" },
    { name: "Settings", href: "/dashboard/settings" },
  ];

  return (
    <nav className="relative z-[150] bg-white border-b-4 border-black font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex justify-between items-center h-20 md:h-24">
          
          {/* LOGO - UPDATED AESTHETIC */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-blue-600 text-white p-2 md:p-2.5 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] group-hover:rotate-6 group-hover:bg-black transition-all duration-300">
              <Zap size={22} fill="currentColor" />
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic leading-none text-black">HiGc</span>
              <span className="text-blue-600 font-black text-3xl leading-none">.</span>
            </div>
          </Link>

          {/* DESKTOP LINKS - REFINED SPACING */}
          <div className="hidden lg:flex items-center gap-10">
            {mainLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:text-blue-600 relative py-2 ${
                  pathname === link.href ? 'text-blue-600 after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-1 after:bg-blue-600' : 'text-black'
                }`}
              >
                {link.name}
              </Link>
            ))}
            {isAuthenticated && (
              <>
                <div className="h-8 w-[3px] bg-black mx-2 opacity-10" />
                <Link href="/cart" className="relative flex items-center gap-2 bg-black text-white px-6 py-3.5 rounded-xl font-black uppercase text-[10px] tracking-widest border-2 border-black hover:bg-blue-600 hover:border-blue-600 transition-all shadow-[5px_5px_0px_0px_rgba(0,0,0,0.2)] active:shadow-none active:translate-x-1 active:translate-y-1">
                  <ShoppingCart size={14} strokeWidth={3} /> 
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[8px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-black">
                      {cartCount}
                    </span>
                  )}
                </Link>
                {user?.is_staff ? (
                  <Link href="/admin" className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3.5 rounded-xl font-black uppercase text-[10px] tracking-widest border-2 border-blue-600 hover:bg-black hover:border-black transition-all shadow-[5px_5px_0px_0px_rgba(0,0,0,0.2)] active:shadow-none active:translate-x-1 active:translate-y-1">
                    <Shield size={14} strokeWidth={3} /> Admin
                  </Link>
                ) : (
                  <Link href="/dashboard" className="flex items-center gap-2 bg-black text-white px-6 py-3.5 rounded-xl font-black uppercase text-[10px] tracking-widest border-2 border-black hover:bg-blue-600 hover:border-blue-600 transition-all shadow-[5px_5px_0px_0px_rgba(0,0,0,0.2)] active:shadow-none active:translate-x-1 active:translate-y-1">
                    <LayoutDashboard size={14} strokeWidth={3} /> Dashboard
                  </Link>
                )}
              </>
            )}
            {!isAuthenticated && (
              <>
                <div className="h-8 w-[3px] bg-black mx-2 opacity-10" />
                <Link href="/login" className="flex items-center gap-2 bg-black text-white px-6 py-3.5 rounded-xl font-black uppercase text-[10px] tracking-widest border-2 border-black hover:bg-blue-600 hover:border-blue-600 transition-all shadow-[5px_5px_0px_0px_rgba(0,0,0,0.2)] active:shadow-none active:translate-x-1 active:translate-y-1">
                  Login
                </Link>
              </>
            )}
          </div>

          {/* MOBILE TOGGLE */}
          <button 
            onClick={() => setIsOpen(true)}
            className="lg:hidden p-4 border-2 border-black rounded-2xl bg-gray-50 active:bg-yellow-400 transition-all"
          >
            <Menu size={24} strokeWidth={4} />
          </button>
        </div>
      </div>

      {/* MOBILE OVERLAY MENU */}
      <div className={`fixed inset-0 bg-white z-[200] transition-transform duration-700 ease-[cubic-bezier(0.8,0,0.2,1)] overflow-y-auto ${isOpen ? 'translate-y-0' : '-translate-y-full'}`}>
        
        {/* MOBILE HEADER */}
        <div className="sticky top-0 bg-white flex justify-between items-center p-6 border-b-4 border-black z-[210]">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-black">Security Protocol</span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-5 bg-black text-white rounded-2xl border-2 border-black active:scale-90 transition-transform"
          >
            <X size={26} strokeWidth={3} />
          </button>
        </div>

        {/* MOBILE CONTENT */}
        <div className="p-8 pb-32 space-y-12">
          <div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.5em] mb-8 text-left border-l-4 border-blue-600 pl-3">Main Terminals</p>
            <div className="grid grid-cols-1 gap-6">
              {mainLinks.map((link, i) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="group flex justify-between items-center border-b-4 border-black pb-5 text-left"
                >
                  <div className="flex items-center gap-5">
                    <span className="text-sm font-black text-blue-600 opacity-40 italic">0{i+1}</span>
                    <span className="text-5xl font-black uppercase italic tracking-tighter group-hover:text-blue-600 transition-colors">
                      {link.name}
                    </span>
                  </div>
                  <ArrowUpRight size={32} className="opacity-10 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 p-8 rounded-[40px] border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.5em] mb-8 text-left">Dashboard Sub-Node</p>
            <div className="grid grid-cols-2 gap-4">
              {dashboardLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`p-5 rounded-2xl border-2 border-black font-black uppercase text-[10px] tracking-widest text-center transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none ${
                    pathname === link.href ? 'bg-blue-600 text-white border-blue-600' : 'bg-white'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 w-full p-8 bg-white border-t-4 border-black">
           <button 
             onClick={async () => {
               await logout();
               setIsOpen(false);
             }}
             className="w-full bg-red-500 text-white py-6 rounded-[24px] border-4 border-black font-black uppercase text-sm tracking-widest shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
           >
             Terminate Session
           </button>
        </div>
      </div>
    </nav>
  );
}