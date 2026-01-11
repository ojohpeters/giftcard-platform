"use client";
import "./globals.css";
import { Twitter, Instagram, Globe } from "lucide-react";
import { Geist } from "next/font/google";
import Header from "@/components/Header"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "600", "700", "800", "900"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`scroll-smooth ${geistSans.variable}`}>
      <body className="bg-white text-[#0A0A0A] antialiased font-sans min-h-screen flex flex-col overflow-x-hidden w-full relative">
        
        {/* GLOBAL HEADER */}
        <Header />

        {/* MAIN CONTENT */}
        <main className="flex-grow pt-10 md:pt-16 pb-20 w-full overflow-x-hidden">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            {children}
          </div>
        </main>

        {/* BRUTALIST FOOTER */}
        <footer className="w-full bg-white border-t-4 border-black mt-auto overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 pb-12 border-b-2 border-black/5">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black italic shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    G
                  </div>
                  <span className="text-2xl font-black tracking-tighter uppercase italic text-gray-900">
                    Giftly<span className="text-blue-600">.</span>
                  </span>
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] max-w-xs leading-relaxed">
                  Institutional Digital Asset Liquidation. <br />
                  Secure • Encrypted • Instant Settlement.
                </p>
              </div>

              <div className="flex flex-wrap gap-10 md:gap-16 text-left">
                <div className="space-y-3">
                  <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.4em]">Infrastructure</p>
                  <div className="flex flex-col gap-2 text-[11px] font-black uppercase tracking-widest text-black">
                    <a href="/marketplace" className="hover:text-blue-600 transition-colors">Market</a>
                    <a href="/admin" className="hover:text-blue-600 transition-colors">Terminal</a>
                    <a href="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</a>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.4em]">Security</p>
                  <div className="flex flex-col gap-2 text-[11px] font-black uppercase tracking-widest text-black">
                    <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
                    <a href="#" className="hover:text-blue-600 transition-colors">Protocol</a>
                  </div>
                </div>
              </div>
            </div>

            {/* STATUS BAR */}
            <div className="pt-10 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center w-full md:w-auto">
                <div className="flex items-center gap-3 text-[10px] font-black text-green-600 bg-green-50 px-4 py-2 rounded-xl border-2 border-green-200">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  GIFTLY NODES ONLINE
                </div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] text-center italic">
                  © 2026 GIFTLY TECHNOLOGIES • RC: 1029384
                </div>
              </div>

              <div className="flex items-center gap-6 w-full md:w-auto justify-center md:justify-end border-t-2 border-black/5 md:border-none pt-8 md:pt-0">
                <Twitter size={18} className="hover:text-blue-500 transition-all cursor-pointer" />
                <Instagram size={18} className="hover:text-blue-500 transition-all cursor-pointer" />
                <div className="h-4 w-[2px] bg-black hidden md:block" />
                <p className="text-[10px] font-black uppercase tracking-widest italic text-gray-500">
                  Lagos, Nigeria
                </p>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}