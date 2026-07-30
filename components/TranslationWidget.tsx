"use client";

import React, { useState, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { applyDirection } from './DirectionManager';
import { useAuthStore } from '@/store/authStore';
import { userAPI } from '@/lib/api';

export default function TranslationWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('EN');

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fa', name: 'فارسی', flag: '🇮🇷' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
  ];

  useEffect(() => {
    // Default to English until native Persian translations exist (the Google
    // Translate widget is blocked in Iran, so forcing RTL without real Persian
    // text just produces "inverted English"). An explicit saved choice wins.
    const saved = localStorage.getItem('higc_language');
    const initial = saved || 'en';

    setCurrentLang(initial.toUpperCase());
    applyDirection(initial);
    if (saved && saved !== 'en') {
      translatePage(saved);
    }
  }, []);

  // Close the dropdown on Escape for keyboard users.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  const translatePage = (langCode: string) => {
    // Flip layout direction immediately and notify the DirectionManager.
    applyDirection(langCode);
    window.dispatchEvent(new CustomEvent('higc-language-change', { detail: langCode }));

    // Keep the account's email language in sync (best-effort) so verification /
    // OTP / reset emails match the chosen UI language. Only en/fa/ar are
    // supported for email; anything else maps to English.
    try {
      if (useAuthStore.getState().isAuthenticated) {
        const emailLang = langCode === 'fa' || langCode === 'ar' ? langCode : 'en';
        userAPI.updateProfile({ language_preference: emailLang }).catch(() => {});
      }
    } catch { /* noop */ }

    if (langCode === 'en') {
      // Remember the explicit English choice (default is Persian, so we must
      // persist 'en' or the site would revert to Persian on the next load).
      localStorage.setItem('higc_language', 'en');
      // Clear the Google Translate cookie so the original English is shown.
      const expire = 'expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = `googtrans=; ${expire}`;
      document.cookie = `googtrans=; ${expire} domain=${window.location.hostname};`;
      document.cookie = `googtrans=; ${expire} domain=.${window.location.hostname};`;
      setCurrentLang('EN');
      window.location.href = window.location.pathname;
      return;
    }

    // Use Google Translate widget
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      localStorage.setItem('higc_language', langCode);
      setCurrentLang(langCode.toUpperCase());
    } else {
      // If Google Translate not loaded, use URL-based translation
      loadGoogleTranslate(langCode);
    }
  };

  const loadGoogleTranslate = (langCode: string) => {
    // Create Google Translate element if not exists
    const container = document.getElementById('google_translate_element');
    if (!container) return;

    // Load Google Translate script
    if (!(window as any).googleTranslateElementInit) {
      (window as any).googleTranslateElementInit = () => {
        new (window as any).google.translate.TranslateElement(
          { pageLanguage: 'en', includedLanguages: 'en,fa,ar,tr,ru,zh-CN' },
          'google_translate_element'
        );
      };

      const script = document.createElement('script');
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }

    // Apply translation
    setTimeout(() => {
      const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (select) {
        select.value = langCode;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        localStorage.setItem('higc_language', langCode);
        setCurrentLang(langCode.toUpperCase());
      }
    }, 1500);
  };

  const handleLanguageSelect = (langCode: string) => {
    setIsOpen(false);
    translatePage(langCode);
  };

  return (
    <div className="relative">
      {/* Translate Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-widest border-2 border-black dark:border-neutral-700 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all bg-white dark:bg-neutral-900 dark:text-neutral-100"
        title="Translate Website / ترجمه سایت"
        aria-label="Change language"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <Globe size={14} className="text-blue-600" aria-hidden="true" />
        <span className="hidden md:inline">{currentLang}</span>
        <ChevronDown size={12} aria-hidden="true" className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Language Selection Dropdown */}
      {isOpen && (
        <div role="menu" aria-label="Select language" className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-neutral-900 border-4 border-black dark:border-neutral-700 rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-none z-[300] overflow-hidden">
          <div className="flex justify-between items-center p-3 border-b-2 border-black dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900">
            <span className="text-[9px] font-black uppercase tracking-wider text-gray-600 dark:text-neutral-300">
              زبان / Language
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-neutral-800 dark:text-neutral-300 rounded"
              aria-label="Close language menu"
            >
              <span aria-hidden="true">✕</span>
            </button>
          </div>
          
          <div className="max-h-64 overflow-y-auto py-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                role="menuitem"
                onClick={() => handleLanguageSelect(lang.code)}
                className="w-full px-4 py-3 text-start text-xs font-bold hover:bg-blue-50 dark:hover:bg-neutral-800 border-b border-gray-100 dark:border-neutral-800 transition-colors flex items-center gap-3 dark:text-neutral-200"
              >
                <span className="text-lg" aria-hidden="true">{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>

          {/* Auto-translate hint */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border-t-2 border-black dark:border-neutral-700">
            <p className="text-[9px] font-medium text-gray-600 dark:text-neutral-300">
              🌐 صفحه به صورت خودکار زبان شما را تشخیص می‌دهد
            </p>
          </div>
        </div>
      )}

      {/* Hidden Google Translate Element */}
      <div id="google_translate_element" style={{ position: 'absolute', left: '-9999px', visibility: 'hidden' }}></div>
    </div>
  );
}
