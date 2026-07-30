"use client";
import { useState } from "react";
import {
  ArrowRight,
  Zap,
  ShieldCheck,
  BadgePercent,
  Headphones,
  ShoppingBag,
  DollarSign,
  Wallet,
  CheckCircle2,
  CreditCard,
  Lock,
  Plus,
  Minus,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

const BRANDS = [
  "Amazon", "Apple", "Google Play", "Steam", "Netflix", "Spotify",
  "PlayStation", "Xbox", "iTunes", "Razer Gold", "Nike", "Visa",
  "eBay", "Sephora", "Walmart", "Roblox",
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 dark:border-neutral-800 rounded-2xl overflow-hidden bg-white dark:bg-neutral-900">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 p-5 md:p-6 text-start hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
      >
        <span className="font-black text-sm md:text-base text-gray-900 dark:text-neutral-100">{q}</span>
        <span className="shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
          {open ? <Minus size={16} /> : <Plus size={16} />}
        </span>
      </button>
      {open && <p className="px-5 md:px-6 pb-6 -mt-1 text-sm text-gray-500 dark:text-neutral-400 leading-relaxed">{a}</p>}
    </div>
  );
}

export default function HiGcPage() {
  const { t } = useI18n();

  const STATS = [
    { val: "200+", label: t("home.statBrands") },
    { val: t("home.instant"), label: t("home.statEcode") },
    { val: "256-bit", label: t("home.statEncryption") },
    { val: "24/7", label: t("home.statSupport") },
  ];

  const FEATURES = [
    { icon: Zap, title: t("home.f1t"), body: t("home.f1b") },
    { icon: ShieldCheck, title: t("home.f2t"), body: t("home.f2b") },
    { icon: BadgePercent, title: t("home.f3t"), body: t("home.f3b") },
    { icon: Headphones, title: t("home.f4t"), body: t("home.f4b") },
  ];

  const BUY_STEPS = [
    { icon: ShoppingBag, title: t("home.b1t"), body: t("home.b1b") },
    { icon: Lock, title: t("home.b2t"), body: t("home.b2b") },
    { icon: Zap, title: t("home.b3t"), body: t("home.b3b") },
  ];

  const SELL_STEPS = [
    { icon: CreditCard, title: t("home.s1t"), body: t("home.s1b") },
    { icon: CheckCircle2, title: t("home.s2t"), body: t("home.s2b") },
    { icon: Wallet, title: t("home.s3t"), body: t("home.s3b") },
  ];

  const FAQS = [
    { q: t("home.q1"), a: t("home.a1") },
    { q: t("home.q2"), a: t("home.a2") },
    { q: t("home.q3"), a: t("home.a3") },
    { q: t("home.q4"), a: t("home.a4") },
    { q: t("home.q5"), a: t("home.a5") },
  ];

  return (
    <main className="w-full bg-white dark:bg-[#0a0a0b] text-[#0A0A0B] dark:text-neutral-100 antialiased selection:bg-blue-600 selection:text-white font-sans">

      {/* 01. HERO */}
      <section className="px-5 pt-10 md:pt-24 pb-14 md:pb-20 border-b border-gray-50 dark:border-neutral-900">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-10 md:gap-20 items-start">
          <div className="lg:col-span-8 space-y-6 md:space-y-8">
            <div className="flex items-center gap-3">
              <div className="h-[1px] w-6 md:w-8 bg-blue-600" />
              <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] text-blue-600">
                {t("home.heroBadge")}
              </p>
            </div>

            <h1 className="text-[38px] sm:text-6xl md:text-[84px] font-black tracking-[-0.04em] leading-[0.95] md:leading-[0.88] uppercase">
              {t("home.heroTitle1")} <br />
              <span className="text-gray-300 dark:text-neutral-600 italic font-light tracking-tight lowercase font-serif pe-2">{t("home.heroFor")}</span>
              {t("home.heroTitle2")}
            </h1>

            <p className="max-w-lg text-sm md:text-lg text-gray-500 dark:text-neutral-400 leading-relaxed font-medium">
              {t("home.heroSubtitle")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <a href="/buy"
                className="h-12 md:h-14 px-8 bg-black dark:bg-white text-white dark:text-black rounded-full font-bold uppercase text-[10px] md:text-[11px] tracking-widest flex items-center justify-center gap-4 hover:bg-blue-600 hover:text-white transition-all shadow-xl shadow-gray-200 dark:shadow-none group">
                {t("home.buyCard")} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform rtl:rotate-180" />
              </a>
              <a href="/sell"
                className="h-12 md:h-14 px-8 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-neutral-200 rounded-full font-bold uppercase text-[10px] md:text-[11px] tracking-widest flex items-center justify-center gap-3 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-all">
                <DollarSign size={15} /> {t("home.sellCard")}
              </a>
            </div>
          </div>

          <div className="lg:col-span-4 lg:pt-8">
            <div className="p-6 md:p-8 bg-gray-50 dark:bg-neutral-900 rounded-[24px] border border-gray-100/50 dark:border-neutral-800">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-neutral-500 mb-6">{t("home.whyHigc")}</p>
              <div className="space-y-5">
                {[
                  { label: t("home.delivery"), val: t("home.instant"), color: "text-green-600" },
                  { label: t("home.encryption"), val: "256-bit", color: "text-blue-600" },
                  { label: t("home.support"), val: "24/7", color: "text-black dark:text-neutral-100" },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-end border-b border-gray-200/50 dark:border-neutral-800 pb-2">
                    <span className="text-[10px] font-bold text-gray-500 dark:text-neutral-400 uppercase tracking-tight">{item.label}</span>
                    <span className={`text-[11px] font-mono font-black ${item.color}`}>{item.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 02. BRAND STRIP */}
      <section className="px-5 py-8 md:py-10 border-b border-gray-50 dark:border-neutral-900 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-neutral-500 mb-6">
            {t("home.brandStrip")}
          </p>
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            {BRANDS.map((b) => (
              <span key={b} className="px-4 py-2 rounded-full bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 text-xs md:text-sm font-bold text-gray-600 dark:text-neutral-300">
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 03. STATS */}
      <section className="px-5 py-12 md:py-16 border-b border-gray-50 dark:border-neutral-900">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {STATS.map((s) => (
            <div key={s.label} className="text-center md:text-start">
              <p className="text-3xl md:text-5xl font-black tracking-tighter">{s.val}</p>
              <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-neutral-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 04. FEATURES */}
      <section className="px-5 py-16 md:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-10 md:mb-16">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-[1px] w-6 bg-blue-600" />
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-blue-600">{t("home.featuresBadge")}</p>
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">
              {t("home.featuresTitle1")}<br /><span className="text-gray-300 dark:text-neutral-600">{t("home.featuresTitle2")}</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="p-6 md:p-8 bg-gray-50 dark:bg-neutral-900 rounded-[24px] border border-gray-100/50 dark:border-neutral-800 hover:border-blue-200 dark:hover:border-blue-900 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-all">
                <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-5">
                  <f.icon size={20} />
                </div>
                <h3 className="font-black text-base md:text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-neutral-400 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 05. HOW IT WORKS */}
      <section className="px-5 py-16 md:py-24 bg-gray-50/60 dark:bg-neutral-900/40 border-y border-gray-100 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-[1px] w-6 bg-blue-600" />
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-blue-600">{t("home.howBadge")}</p>
              <div className="h-[1px] w-6 bg-blue-600" />
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase">{t("home.howTitle")}</h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
            {/* BUY */}
            <div className="bg-white dark:bg-neutral-900 rounded-[32px] border border-gray-100 dark:border-neutral-800 p-6 md:p-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center"><ShoppingBag size={18} /></div>
                <h3 className="text-xl font-black uppercase tracking-tight">{t("home.buyTitle")}</h3>
              </div>
              <div className="space-y-6">
                {BUY_STEPS.map((s, i) => (
                  <div key={s.title} className="flex gap-4">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center font-black text-sm">{i + 1}</div>
                    <div>
                      <p className="font-black text-sm md:text-base">{s.title}</p>
                      <p className="text-sm text-gray-500 dark:text-neutral-400 leading-relaxed">{s.body}</p>
                    </div>
                  </div>
                ))}
              </div>
              <a href="/buy" className="mt-8 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-600 hover:gap-3 transition-all">
                {t("home.startBuying")} <ArrowRight size={14} className="rtl:rotate-180" />
              </a>
            </div>

            {/* SELL */}
            <div className="bg-white dark:bg-neutral-900 rounded-[32px] border border-gray-100 dark:border-neutral-800 p-6 md:p-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-green-600 text-white flex items-center justify-center"><DollarSign size={18} /></div>
                <h3 className="text-xl font-black uppercase tracking-tight">{t("home.sellTitle")}</h3>
              </div>
              <div className="space-y-6">
                {SELL_STEPS.map((s, i) => (
                  <div key={s.title} className="flex gap-4">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center font-black text-sm">{i + 1}</div>
                    <div>
                      <p className="font-black text-sm md:text-base">{s.title}</p>
                      <p className="text-sm text-gray-500 dark:text-neutral-400 leading-relaxed">{s.body}</p>
                    </div>
                  </div>
                ))}
              </div>
              <a href="/sell" className="mt-8 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-green-600 hover:gap-3 transition-all">
                {t("home.startSelling")} <ArrowRight size={14} className="rtl:rotate-180" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 06. FAQ */}
      <section className="px-5 py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-[1px] w-6 bg-blue-600" />
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-blue-600">{t("home.faqBadge")}</p>
              <div className="h-[1px] w-6 bg-blue-600" />
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase">{t("home.faqTitle")}</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>

      {/* 07. FINAL CTA */}
      <section className="px-5 pb-24 md:pb-32 max-w-7xl mx-auto">
        <div className="bg-[#0A0A0B] dark:bg-neutral-900 rounded-[32px] md:rounded-[48px] p-8 md:p-20 text-center space-y-8 relative overflow-hidden border border-transparent dark:border-neutral-800">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600 rounded-full blur-[120px] opacity-10 pointer-events-none" />
          <h2 className="text-3xl md:text-6xl font-black text-white tracking-tighter leading-none relative z-10">
            {t("home.ctaTitle1")} <br /> <span className="text-blue-500 italic font-serif lowercase font-light">{t("home.ctaStart")}</span>
          </h2>
          <p className="text-gray-400 max-w-md mx-auto text-sm md:text-base relative z-10 font-medium">
            {t("home.ctaSubtitle")}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10 pt-4">
            <a href="/buy"
              className="h-14 px-10 bg-blue-600 text-white rounded-full font-bold uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-white hover:text-black transition-all">
              {t("home.buyCard")} <ArrowRight size={16} className="rtl:rotate-180" />
            </a>
            <a href="/register"
              className="h-14 px-10 bg-white/10 text-white rounded-full font-bold uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-white/20 transition-all">
              {t("home.createAccount")}
            </a>
          </div>
        </div>
      </section>

    </main>
  );
}
