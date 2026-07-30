"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu, X, Zap, ArrowUpRight, Globe, LayoutDashboard, ShoppingCart,
  Shield, Home, ShoppingBag, Upload, LogOut, CheckCircle2, AlertCircle, ChevronRight, Lock, Newspaper,
  History, MessageSquare, Gift, Settings, Wallet,
} from "lucide-react";
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { userAPI } from '@/lib/api';
import { formatIRRShort } from '@/lib/currency';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import { useI18n } from '@/lib/i18n';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const cartCount = useCartStore((state) => state.getCartCount());
  const fetchCart = useCartStore((state) => state.fetchCart);
  const { t } = useI18n();

  // Only trust auth state after mount so SSR and the first client paint agree
  // (avoids a hydration flash where the nav shows the wrong auth UI).
  useEffect(() => setMounted(true), []);
  const authed = mounted && isAuthenticated;
  const isStaff = authed && !!user?.is_staff;

  // Wallet balance for the mobile account panel (parity with the dashboard sidebar).
  const [wallet, setWallet] = useState<{ balance: string } | null>(null);
  useEffect(() => {
    if (authed) {
      userAPI.getWallet().then((r) => setWallet(r.data)).catch(() => {});
    }
  }, [authed]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    if (isAuthenticated) fetchCart();
  }, [isAuthenticated, fetchCart]);

  // Close the mobile menu whenever the route changes.
  useEffect(() => { setIsOpen(false); }, [pathname]);

  // Buy & Sell require an account — logged-out users are routed to login first
  // (which returns them to the intended page via ?redirect=).
  const mainLinks = [
    { name: t("nav.home"), href: "/", icon: Home, authRequired: false },
    { name: t("nav.market"), href: "/marketplace", icon: Globe, authRequired: false },
    { name: t("nav.blog"), href: "/blog", icon: Newspaper, authRequired: false },
    { name: t("nav.buy"), href: "/buy", icon: ShoppingBag, authRequired: true },
    { name: t("nav.sell"), href: "/sell", icon: Upload, authRequired: true },
  ];

  // Full parity with the desktop dashboard sidebar so mobile users get every section.
  const dashboardLinks = [
    { name: t("dashNav.overview"), href: "/dashboard", icon: LayoutDashboard },
    { name: t("dashNav.history"), href: "/dashboard/orders", icon: History },
    { name: t("dashNav.submissions"), href: "/dashboard/submissions", icon: Upload },
    { name: t("dashNav.support"), href: "/dashboard/support", icon: MessageSquare },
    { name: t("dashNav.giftCodes"), href: "/dashboard/codes", icon: Gift },
    { name: t("dashNav.payout"), href: "/dashboard/withdraw", icon: ArrowUpRight },
    { name: t("dashNav.settings"), href: "/dashboard/settings", icon: Settings },
  ];

  const initial = (user?.first_name?.[0] || user?.email?.[0] || 'U').toUpperCase();
  const isActive = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(href));
  // Gate auth-only links behind login while preserving the destination.
  const gated = (link: { href: string; authRequired: boolean }) => link.authRequired && !authed;
  const hrefFor = (link: { href: string; authRequired: boolean }) =>
    gated(link) ? `/login?redirect=${encodeURIComponent(link.href)}` : link.href;

  return (
    <nav className="relative z-[150] bg-white dark:bg-neutral-950 border-b-4 border-black dark:border-neutral-800 font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex justify-between items-center h-20 md:h-24">

          {/* LOGO */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="bg-blue-600 text-white p-2 md:p-2.5 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.15)] group-hover:rotate-6 group-hover:bg-black dark:group-hover:bg-white dark:group-hover:text-black transition-all duration-300">
              <Zap size={22} fill="currentColor" />
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic leading-none text-black dark:text-neutral-100">HiGc</span>
              <span className="text-blue-600 font-black text-3xl leading-none">.</span>
            </div>
          </Link>

          {/* DESKTOP LINKS */}
          <div className="hidden lg:flex items-center gap-7">
            {mainLinks.map((link) => (
              <Link
                key={link.href}
                href={hrefFor(link)}
                title={gated(link) ? 'Sign in to continue' : undefined}
                className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:text-blue-600 relative py-2 inline-flex items-center gap-1.5 ${
                  isActive(link.href) ? 'text-blue-600 after:content-[""] after:absolute after:-bottom-0.5 after:left-0 after:w-full after:h-1 after:bg-blue-600' : 'text-black dark:text-neutral-200'
                }`}
              >
                {link.name}
                {gated(link) && <Lock size={11} strokeWidth={3} className="text-gray-400 dark:text-neutral-500" aria-label="Login required" />}
              </Link>
            ))}

            <LanguageSwitcher />
            <ThemeToggle />

            <div className="h-8 w-px bg-black/10 dark:bg-white/15 mx-1" />

            {/* Auth-dependent cluster */}
            {authed ? (
              <>
                <Link href="/cart" aria-label="Cart" className="relative flex items-center justify-center w-12 h-12 bg-gray-50 dark:bg-neutral-900 text-black dark:text-neutral-100 rounded-xl border-2 border-black dark:border-neutral-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all">
                  <ShoppingCart size={16} strokeWidth={3} />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[9px] font-black min-w-5 h-5 px-1 rounded-full flex items-center justify-center border-2 border-white dark:border-neutral-950">
                      {cartCount}
                    </span>
                  )}
                </Link>

                {isStaff && (
                  <Link href="/admin" className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest border-2 border-blue-600 hover:bg-black hover:border-black dark:hover:bg-white dark:hover:text-black dark:hover:border-white transition-all">
                    <Shield size={14} strokeWidth={3} /> {t('nav.admin')}
                  </Link>
                )}

                {/* Profile chip -> dashboard */}
                <Link href="/dashboard" className="flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-full border-2 border-black dark:border-neutral-700 hover:border-blue-600 bg-white dark:bg-neutral-900 transition-all group">
                  <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-sm group-hover:bg-black dark:group-hover:bg-white dark:group-hover:text-black transition-colors">{initial}</span>
                  <span className="text-[11px] font-black uppercase tracking-wider text-black dark:text-neutral-100 max-w-[100px] truncate">{user?.first_name || t('nav.account')}</span>
                </Link>
              </>
            ) : mounted ? (
              <>
                <Link href="/login" className="text-[11px] font-black uppercase tracking-[0.2em] text-black dark:text-neutral-200 hover:text-blue-600 transition-colors">
                  {t('nav.login')}
                </Link>
                <Link href="/register" className="flex items-center gap-2 bg-black dark:bg-white dark:text-black text-white px-5 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest border-2 border-black dark:border-white hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5">
                  {t('nav.getStarted')} <ArrowUpRight size={14} strokeWidth={3} className="rtl:rotate-180" />
                </Link>
              </>
            ) : (
              // pre-mount placeholder keeps layout stable
              <div className="w-32 h-11" aria-hidden="true" />
            )}
          </div>

          {/* MOBILE TOGGLE */}
          <div className="lg:hidden flex items-center gap-2">
            {authed && (
              <Link href="/cart" aria-label="Cart" className="relative flex items-center justify-center w-12 h-12 border-2 border-black dark:border-neutral-700 rounded-2xl bg-gray-50 dark:bg-neutral-900">
                <ShoppingCart size={20} strokeWidth={3} className="text-black dark:text-neutral-100" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[9px] font-black min-w-5 h-5 px-1 rounded-full flex items-center justify-center border-2 border-white dark:border-neutral-950">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}
            <LanguageSwitcher className="px-2 py-2 border-2 border-black dark:border-neutral-700 rounded-2xl bg-gray-50 dark:bg-neutral-900" />
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(true)}
              className="p-3.5 border-2 border-black dark:border-neutral-700 rounded-2xl bg-gray-50 dark:bg-neutral-900 active:bg-blue-600 active:text-white transition-all"
              aria-label="Open menu"
              aria-expanded={isOpen}
            >
              <Menu size={22} strokeWidth={3.5} aria-hidden="true" className="text-black dark:text-neutral-100" />
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE OVERLAY MENU */}
      <div
        className={`lg:hidden fixed inset-0 bg-white dark:bg-neutral-950 z-[200] flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.7,0,0.2,1)] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
      >
        {/* MOBILE HEADER */}
        <div className="shrink-0 bg-white dark:bg-neutral-950 flex justify-between items-center px-6 h-20 border-b-4 border-black dark:border-neutral-800">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="bg-blue-600 text-white p-2 rounded-xl">
              <Zap size={18} fill="currentColor" />
            </div>
            <span className="text-2xl font-black uppercase tracking-tighter italic text-black dark:text-neutral-100">HiGc<span className="text-blue-600">.</span></span>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="p-3.5 bg-black dark:bg-white text-white dark:text-black rounded-2xl active:scale-90 transition-transform"
            aria-label="Close menu"
          >
            <X size={22} strokeWidth={3} aria-hidden="true" />
          </button>
        </div>

        {/* MOBILE CONTENT (scrolls) */}
        <div className="flex-1 overflow-y-auto px-6 py-7 space-y-8">

          {/* Account card OR sign-in CTAs */}
          {authed ? (
            <Link href="/dashboard" className="flex items-center gap-4 p-4 rounded-3xl border-4 border-black dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-none active:translate-x-1 active:translate-y-1 active:shadow-none transition-all">
              <span className="w-14 h-14 shrink-0 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-2xl">{initial}</span>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-black uppercase tracking-tight text-black dark:text-neutral-100 truncate leading-tight">{user?.first_name || t('nav.account')}</p>
                <p className="text-xs text-gray-500 dark:text-neutral-400 truncate">{user?.email}</p>
                <span className={`inline-flex items-center gap-1 mt-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${user?.email_verified ? 'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300' : 'bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-300'}`}>
                  {user?.email_verified ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                  {user?.email_verified ? t('nav.verified') : t('nav.unverified')}
                </span>
              </div>
              <ChevronRight size={22} className="text-gray-300 dark:text-neutral-600 shrink-0" />
            </Link>
          ) : mounted ? (
            <div className="grid grid-cols-2 gap-3">
              <Link href="/login" className="py-5 rounded-2xl border-4 border-black dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-neutral-100 font-black uppercase text-xs tracking-widest text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-none active:translate-x-1 active:translate-y-1 active:shadow-none transition-all">
                {t('nav.login')}
              </Link>
              <Link href="/register" className="py-5 rounded-2xl border-4 border-blue-600 bg-blue-600 text-white font-black uppercase text-xs tracking-widest text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-none active:translate-x-1 active:translate-y-1 active:shadow-none transition-all">
                {t('nav.signup')}
              </Link>
            </div>
          ) : null}

          {/* Primary navigation */}
          <div>
            <p className="text-[9px] font-black text-gray-400 dark:text-neutral-500 uppercase tracking-[0.4em] mb-4 border-l-4 border-blue-600 pl-3">{t('nav.navigate')}</p>
            <div className="space-y-2.5">
              {mainLinks.map((link, i) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                const isGated = gated(link);
                return (
                  <Link
                    key={link.href}
                    href={hrefFor(link)}
                    className={`group flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                      active
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-black dark:border-neutral-800 bg-white dark:bg-neutral-900 text-black dark:text-neutral-100 active:border-blue-600'
                    }`}
                  >
                    <span className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center ${active ? 'bg-white/20' : 'bg-gray-100 dark:bg-neutral-800'}`}>
                      <Icon size={20} strokeWidth={2.5} />
                    </span>
                    <span className="text-2xl font-black uppercase italic tracking-tighter flex-1">{link.name}</span>
                    {isGated ? (
                      <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-gray-400 dark:text-neutral-500">
                        <Lock size={13} strokeWidth={3} /> {t('nav.loginTag')}
                      </span>
                    ) : (
                      <>
                        <span className={`text-xs font-black italic ${active ? 'text-white/50' : 'text-blue-600/40'}`}>0{i + 1}</span>
                        <ArrowUpRight size={22} className={`transition-all ${active ? 'opacity-80' : 'opacity-20 group-hover:opacity-100'}`} />
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Account area (only when signed in) */}
          {authed && (
            <div>
              <p className="text-[9px] font-black text-gray-400 dark:text-neutral-500 uppercase tracking-[0.4em] mb-4 border-l-4 border-blue-600 pl-3">{t('nav.myAccount')}</p>

              {/* Wallet balance (parity with the desktop sidebar) */}
              <div className="flex items-center justify-between gap-3 p-4 mb-3 rounded-2xl border-2 border-black dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900">
                <div className="flex items-center gap-2 min-w-0">
                  <Wallet size={16} className="text-gray-400 dark:text-neutral-500 shrink-0" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500">{t('dashNav.balance')}</span>
                </div>
                <span className="text-lg font-black text-gray-900 dark:text-neutral-100 truncate">{formatIRRShort(wallet?.balance || '0')} تومان</span>
              </div>

              {isStaff && (
                <Link href="/admin" className="flex items-center gap-3 p-4 mb-3 rounded-2xl border-2 border-blue-600 bg-blue-600 text-white font-black uppercase text-xs tracking-widest">
                  <Shield size={18} strokeWidth={3} /> {t('nav.admin')} {t('nav.dashboard')} <ArrowUpRight size={18} className="ml-auto rtl:rotate-180" />
                </Link>
              )}

              <div className="grid grid-cols-2 gap-3">
                {dashboardLinks.map((link) => {
                  const Icon = link.icon;
                  const active = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-2.5 p-4 rounded-2xl border-2 font-black uppercase text-[11px] tracking-widest transition-all ${
                        active
                          ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                          : 'bg-white dark:bg-neutral-900 text-black dark:text-neutral-100 border-black dark:border-neutral-800 active:border-blue-600'
                      }`}
                    >
                      <Icon size={16} className={`shrink-0 ${active ? '' : 'text-blue-600'}`} />
                      <span className="truncate">{link.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sticky footer action */}
        {authed && (
          <div className="shrink-0 p-6 bg-white dark:bg-neutral-950 border-t-4 border-black dark:border-neutral-800">
            <button
              onClick={async () => { await logout(); setIsOpen(false); }}
              className="w-full flex items-center justify-center gap-3 bg-red-500 text-white py-5 rounded-2xl border-4 border-black dark:border-red-900 font-black uppercase text-sm tracking-widest shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-none active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
            >
              <LogOut size={18} strokeWidth={3} /> {t('nav.signOut')}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
