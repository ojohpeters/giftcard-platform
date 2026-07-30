"use client";
import React from "react";
import { Globe } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuthStore } from "@/store/authStore";
import { userAPI } from "@/lib/api";

/**
 * Native EN⇄FA switcher. Uses the bundled i18n (no Google Translate, which is
 * blocked in Iran). Also best-effort persists the choice to the account so
 * emails match.
 */
export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { lang, setLang } = useI18n();

  const toggle = () => {
    const next = lang === "fa" ? "en" : "fa";
    setLang(next);
    try {
      if (useAuthStore.getState().isAuthenticated) {
        userAPI.updateProfile({ language_preference: next }).catch(() => {});
      }
    } catch {
      /* noop */
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label="Change language"
      title={lang === "fa" ? "Switch to English" : "تغییر به فارسی"}
      className={`inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-black dark:text-neutral-200 hover:text-blue-600 transition-colors ${className}`}
    >
      <Globe size={15} strokeWidth={2.5} />
      {lang === "fa" ? "EN" : "FA"}
    </button>
  );
}
