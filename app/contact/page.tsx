"use client";

import Link from "next/link";
import { Phone, MessageCircle, Clock, ShieldCheck, ArrowUpRight, LifeBuoy } from "lucide-react";
import { FaDiscord, FaTelegram, FaWhatsapp } from "react-icons/fa";
import EnamadSeal from "@/components/EnamadSeal";
import { useI18n } from "@/lib/i18n";

export default function ContactPage() {
  const { t } = useI18n();

  const CHANNELS = [
    { icon: FaWhatsapp, label: t("contact.channelWhatsapp"), value: "+98 935 848 5822", href: "https://wa.me/989358485822", accent: "text-green-500", ring: "hover:border-green-500" },
    { icon: FaTelegram, label: t("contact.channelTelegramSupport"), value: "@HiGcSup", href: "https://t.me/HiGcSup", accent: "text-blue-400", ring: "hover:border-blue-400" },
    { icon: FaTelegram, label: t("contact.channelTelegramChannel"), value: "@HiGcir", href: "https://t.me/HiGcir", accent: "text-blue-500", ring: "hover:border-blue-500" },
    { icon: FaDiscord, label: t("contact.channelDiscordHigc"), value: t("contact.joinServer"), href: "https://discord.gg/2mT3frPntH", accent: "text-indigo-500", ring: "hover:border-indigo-500" },
    { icon: FaDiscord, label: t("contact.channelDiscordCrown"), value: t("contact.joinServer"), href: "https://discord.gg/8cb8b7972A", accent: "text-purple-500", ring: "hover:border-purple-500" },
    { icon: Phone, label: t("contact.channelPhone"), value: "+98 935 848 5822", href: "tel:+989358485822", accent: "text-black dark:text-neutral-100", ring: "hover:border-blue-600" },
  ];

  return (
    <div className="space-y-20 md:space-y-28">
      {/* HERO */}
      <section className="pt-8 md:pt-12 text-center">
        <div className="inline-flex items-center gap-2 mb-6">
          <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
          <span className="text-[10px] font-black tracking-[0.4em] text-blue-600 uppercase">{t("contact.badge")}</span>
        </div>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase italic leading-[0.85] text-black dark:text-neutral-100">
          {t("contact.heroLine1")} <br />
          <span className="text-gray-200 dark:text-neutral-700">{t("contact.heroLine2")}</span>
        </h1>
        <p className="mt-8 text-base md:text-lg text-gray-600 dark:text-neutral-300 max-w-2xl mx-auto leading-relaxed">
          {t("contact.heroSubtitle")}
        </p>
      </section>

      {/* CHANNELS GRID */}
      <section>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CHANNELS.map((c) => {
            const Icon = c.icon;
            return (
              <a
                key={c.label}
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className={`group flex items-center gap-4 bg-white dark:bg-neutral-900 border-2 border-black dark:border-neutral-800 rounded-3xl p-6 transition-all ${c.ring} hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)]`}
              >
                <span className="w-14 h-14 shrink-0 rounded-2xl bg-gray-100 dark:bg-neutral-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon size={26} className={c.accent} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-neutral-500">{c.label}</p>
                  <p className="text-lg font-black tracking-tight text-black dark:text-neutral-100 truncate">{c.value}</p>
                </div>
                <ArrowUpRight size={20} className="text-gray-300 dark:text-neutral-600 group-hover:text-blue-600 transition-colors shrink-0" />
              </a>
            );
          })}
        </div>
      </section>

      {/* LOGGED-IN SUPPORT + HOURS */}
      <section className="grid md:grid-cols-2 gap-5">
        <div className="bg-blue-600 text-white rounded-[32px] p-8 md:p-10 flex flex-col justify-between">
          <div>
            <LifeBuoy size={32} className="mb-5" />
            <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic mb-3">{t("contact.haveAccountTitle")}</h2>
            <p className="text-blue-100 text-sm leading-relaxed">
              {t("contact.haveAccountText")}
            </p>
          </div>
          <Link href="/dashboard/support" className="mt-8 inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3.5 rounded-2xl font-black uppercase text-xs tracking-widest w-fit hover:bg-black hover:text-white transition-all">
            {t("contact.openTicket")} <ArrowUpRight size={16} strokeWidth={3} />
          </Link>
        </div>

        <div className="bg-gray-50 dark:bg-neutral-900 border-2 border-black dark:border-neutral-800 rounded-[32px] p-8 md:p-10 space-y-6">
          <div className="flex items-start gap-4">
            <span className="w-12 h-12 rounded-2xl bg-white dark:bg-neutral-800 border-2 border-black dark:border-neutral-700 flex items-center justify-center shrink-0">
              <Clock size={20} className="text-blue-600" />
            </span>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-neutral-500 mb-1">{t("contact.availabilityLabel")}</p>
              <p className="font-black text-black dark:text-neutral-100">{t("contact.availabilityValue")}</p>
              <p className="text-sm text-gray-600 dark:text-neutral-400">{t("contact.availabilityDesc")}</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <span className="w-12 h-12 rounded-2xl bg-white dark:bg-neutral-800 border-2 border-black dark:border-neutral-700 flex items-center justify-center shrink-0">
              <MessageCircle size={20} className="text-blue-600" />
            </span>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-neutral-500 mb-1">{t("contact.fastestReplyLabel")}</p>
              <p className="font-black text-black dark:text-neutral-100">{t("contact.fastestReplyValue")}</p>
              <p className="text-sm text-gray-600 dark:text-neutral-400">{t("contact.fastestReplyDesc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* BUSINESS / ENAMAD */}
      <section className="bg-white dark:bg-neutral-900 border-2 border-black dark:border-neutral-800 rounded-[40px] p-8 md:p-12">
        <div className="grid md:grid-cols-[1.4fr_1fr] gap-10 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2">
              <ShieldCheck size={18} className="text-blue-600" />
              <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.4em]">{t("contact.verifiedBusiness")}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic text-black dark:text-neutral-100">HiGc Technologies</h2>
            <p className="text-sm md:text-base text-gray-600 dark:text-neutral-300 leading-relaxed">
              {t("contact.businessRc")} 1029384. {t("contact.businessSeal")}
            </p>
          </div>
          <div className="flex justify-center md:justify-end">
            <div className="bg-white rounded-2xl p-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-2 border-black w-[150px]">
              <EnamadSeal className="block [&_img]:w-full [&_img]:h-auto" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
