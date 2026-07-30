"use client";
import Link from "next/link";
import {
  ShieldCheck, Zap, Lock, TrendingUp, Globe, Headphones, ArrowUpRight, BadgeCheck,
} from "lucide-react";
import EnamadSeal from "@/components/EnamadSeal";
import { useI18n } from "@/lib/i18n";

export default function AboutPage() {
  const { t } = useI18n();

  const VALUES = [
    { icon: ShieldCheck, title: t("about.v1t"), text: t("about.v1b") },
    { icon: Zap, title: t("about.v2t"), text: t("about.v2b") },
    { icon: TrendingUp, title: t("about.v3t"), text: t("about.v3b") },
    { icon: Lock, title: t("about.v4t"), text: t("about.v4b") },
    { icon: Globe, title: t("about.v5t"), text: t("about.v5b") },
    { icon: Headphones, title: t("about.v6t"), text: t("about.v6b") },
  ];

  return (
    <div className="space-y-24 md:space-y-32">
      {/* HERO */}
      <section className="pt-8 md:pt-12 text-center">
        <div className="inline-flex items-center gap-2 mb-6">
          <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
          <span className="text-[10px] font-black tracking-[0.4em] text-blue-600 uppercase">{t("about.badge")}</span>
        </div>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase italic leading-[0.85] text-black dark:text-neutral-100">
          {t("about.heroTitle1")} <br />
          <span className="text-gray-200 dark:text-neutral-700">{t("about.heroTitle2")}</span>
        </h1>
        <p className="mt-8 text-base md:text-lg text-gray-600 dark:text-neutral-300 max-w-2xl mx-auto leading-relaxed">
          {t("about.heroSubtitle")}
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/register" className="inline-flex items-center gap-2 bg-blue-600 text-white px-7 py-4 rounded-2xl font-black uppercase text-xs tracking-widest border-2 border-blue-600 hover:bg-black hover:border-black dark:hover:bg-white dark:hover:text-black dark:hover:border-white transition-all shadow-[5px_5px_0px_0px_rgba(0,0,0,0.15)] active:shadow-none active:translate-x-1 active:translate-y-1">
            {t("about.getStarted")} <ArrowUpRight size={16} strokeWidth={3} className="rtl:rotate-180" />
          </Link>
          <Link href="/marketplace" className="inline-flex items-center gap-2 bg-white dark:bg-neutral-900 text-black dark:text-neutral-100 px-7 py-4 rounded-2xl font-black uppercase text-xs tracking-widest border-2 border-black dark:border-neutral-700 hover:border-blue-600 transition-all">
            {t("about.exploreMarket")}
          </Link>
        </div>
      </section>

      {/* MISSION */}
      <section className="grid md:grid-cols-[1fr_1.2fr] gap-10 md:gap-16 items-center">
        <div className="space-y-4">
          <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.4em]">{t("about.ourMission")}</p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic leading-tight text-black dark:text-neutral-100">
            {t("about.missionTitle1")} <br /> {t("about.missionTitle2")}
          </h2>
        </div>
        <div className="space-y-5 text-gray-600 dark:text-neutral-300 text-sm md:text-base leading-relaxed">
          <p>{t("about.missionP1")}</p>
          <p>{t("about.missionP2")}</p>
        </div>
      </section>

      {/* VALUES GRID */}
      <section>
        <div className="text-center mb-14">
          <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.4em] mb-3">{t("about.whyHigc")}</p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic text-black dark:text-neutral-100">{t("about.builtOnTrust")}</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {VALUES.map((v) => {
            const Icon = v.icon;
            return (
              <div key={v.title} className="group bg-white dark:bg-neutral-900 border-2 border-black dark:border-neutral-800 rounded-3xl p-7 hover:border-blue-600 transition-all hover:shadow-[6px_6px_0px_0px_rgba(37,99,235,0.2)]">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Icon size={22} strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight text-black dark:text-neutral-100 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-600 dark:text-neutral-400 leading-relaxed">{v.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* TRUST / ENAMAD */}
      <section className="bg-gray-50 dark:bg-neutral-900 border-2 border-black dark:border-neutral-800 rounded-[40px] p-8 md:p-14">
        <div className="grid md:grid-cols-[1.4fr_1fr] gap-10 items-center">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2">
              <BadgeCheck size={18} className="text-blue-600" />
              <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.4em]">{t("about.verifiedLicensed")}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic text-black dark:text-neutral-100">
              {t("about.trustedBusinessTitle")}
            </h2>
            <p className="text-sm md:text-base text-gray-600 dark:text-neutral-300 leading-relaxed">
              {t("about.trustedBusinessTextPrefix")}
            </p>
            <Link href="/contact" className="inline-flex items-center gap-2 text-blue-600 font-black uppercase text-xs tracking-widest hover:gap-3 transition-all">
              {t("about.talkToUs")} <ArrowUpRight size={16} strokeWidth={3} className="rtl:rotate-180" />
            </Link>
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
