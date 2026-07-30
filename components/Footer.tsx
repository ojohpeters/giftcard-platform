"use client";
import React from "react";
import { Phone } from "lucide-react";
import { FaDiscord, FaTelegram, FaWhatsapp } from "react-icons/fa";
import EnamadSeal from "@/components/EnamadSeal";
import { useI18n } from "@/lib/i18n";

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer className="w-full bg-white dark:bg-neutral-950 border-t-4 border-black dark:border-neutral-800 mt-auto overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 pb-12 border-b-2 border-black/5">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black italic shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                G
              </div>
              <span className="text-2xl font-black tracking-tighter uppercase italic text-gray-900 dark:text-neutral-100">
                HiGc<span className="text-blue-600">.</span>
              </span>
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] max-w-xs leading-relaxed">
              {t("footer.tagline1")} <br />
              {t("footer.tagline2")}
            </p>
          </div>

          <div className="flex flex-wrap gap-10 md:gap-16 text-start">
            <div className="space-y-3">
              <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.4em]">{t("footer.infrastructure")}</p>
              <div className="flex flex-col gap-2 text-[11px] font-black uppercase tracking-widest text-black dark:text-neutral-200">
                <a href="/marketplace" className="hover:text-blue-600 transition-colors">{t("footer.market")}</a>
                <a href="/admin" className="hover:text-blue-600 transition-colors">{t("footer.terminal")}</a>
                <a href="/dashboard" className="hover:text-blue-600 transition-colors">{t("footer.dashboard")}</a>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.4em]">{t("footer.company")}</p>
              <div className="flex flex-col gap-2 text-[11px] font-black uppercase tracking-widest text-black dark:text-neutral-200">
                <a href="/about" className="hover:text-blue-600 transition-colors">{t("footer.about")}</a>
                <a href="/contact" className="hover:text-blue-600 transition-colors">{t("footer.contact")}</a>
                <a href="/blog" className="hover:text-blue-600 transition-colors">{t("footer.blog")}</a>
              </div>
            </div>
          </div>
        </div>

        {/* STATUS BAR */}
        <div className="pt-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center w-full md:w-auto">
            <div className="flex items-center gap-3 text-[10px] font-black text-green-600 bg-green-50 px-4 py-2 rounded-xl border-2 border-green-200">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {t("footer.nodesOnline")}
            </div>
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] text-center italic" dir="ltr">
              © 2026 HIGC TECHNOLOGIES • RC: 1029384
            </div>
          </div>

          {/* Social Links */}
          <div className="flex flex-col gap-4 w-full md:w-auto items-center md:items-end border-t-2 border-black/5 md:border-none pt-8 md:pt-0">
            <div className="flex items-center gap-4">
              <a href="https://discord.gg/2mT3frPntH" target="_blank" rel="noopener noreferrer" title="HiGc Discord Server" className="hover:text-blue-500 transition-all">
                <FaDiscord size={18} />
              </a>
              <a href="https://t.me/HiGcir" target="_blank" rel="noopener noreferrer" title="Telegram Channel" className="hover:text-blue-500 transition-all">
                <FaTelegram size={18} />
              </a>
              <a href="https://t.me/HiGcSup" target="_blank" rel="noopener noreferrer" title="Telegram Support" className="hover:text-blue-500 transition-all">
                <FaTelegram size={18} className="text-blue-400" />
              </a>
              <a href="https://wa.me/989358485822" target="_blank" rel="noopener noreferrer" title="WhatsApp Support" className="hover:text-green-500 transition-all">
                <FaWhatsapp size={18} />
              </a>
              <a href="tel:+989358485822" title="Phone: +989358485822" className="hover:text-blue-500 transition-all">
                <Phone size={18} />
              </a>
            </div>
            <div className="text-sm font-bold text-gray-600 text-center md:text-end">
              <span className="block" dir="ltr">{t("footer.waTg")}: +989358485822</span>
              <span className="block mt-1">
                {t("footer.discordLabel")}: <a href="https://discord.gg/2mT3frPntH" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">HiGc Server</a> • <a href="https://discord.gg/8cb8b7972A" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Crown Server</a>
              </span>
            </div>
            {/* Enamad trust seal */}
            <div className="mt-2 inline-block bg-white rounded-xl p-1.5 shadow-sm w-[100px]">
              <EnamadSeal className="block [&_img]:w-full [&_img]:h-auto" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
