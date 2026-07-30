"use client";
import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, ArrowRight, Send, CheckCircle, Loader2 } from "lucide-react";
import { userAPI } from '@/lib/api';
import Turnstile, { TURNSTILE_ENABLED, TurnstileHandle } from '@/components/Turnstile';
import { useI18n } from '@/lib/i18n';

function ForgotPasswordContent() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [status, setStatus] = useState<'form' | 'sending' | 'sent'>('form');
  const [error, setError] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const turnstileRef = React.useRef<TurnstileHandle>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (TURNSTILE_ENABLED && !captchaToken) {
      setError(t('forgot.captchaRequired'));
      return;
    }
    setStatus('sending');

    try {
      await userAPI.requestPasswordReset(email, captchaToken);
      setStatus('sent');
    } catch (err: any) {
      setStatus('form');
      turnstileRef.current?.reset();
      setCaptchaToken('');
      const errorMsg = err.response?.data?.error || t('forgot.sendFailed');
      setError(errorMsg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0b] flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-[450px] bg-white dark:bg-neutral-900 rounded-[32px] shadow-sm border border-gray-100 dark:border-neutral-800 p-8 md:p-12">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg ${
            status === 'sent' ? 'bg-green-100' : 'bg-blue-100'
          }`}>
            {status === 'sent' ? (
              <CheckCircle className="text-green-600 w-8 h-8" />
            ) : (
              <Mail className="text-blue-600 w-8 h-8" />
            )}
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-neutral-100 tracking-tight">
            {status === 'sent' ? t('forgot.checkYourEmail') : t('forgot.resetPassword')}
          </h1>

          <p className="text-gray-500 dark:text-neutral-400 mt-2 text-sm">
            {status === 'sent'
              ? `${t('forgot.sentTo')} ${email}. ${t('forgot.checkInbox')}`
              : t('forgot.enterEmailPrompt')
            }
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl">
            <p className="text-xs text-red-600 dark:text-red-300 font-bold">{error}</p>
          </div>
        )}

        {/* Form */}
        {(status === 'form' || status === 'sending') && (
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500 ml-1">{t('forgot.emailLabel')}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500 w-5 h-5" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('forgot.emailPlaceholder')}
                  required
                  disabled={status === 'sending'}
                  className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 dark:text-neutral-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-sm disabled:opacity-50"
                />
              </div>
            </div>

            {/* Captcha */}
            <Turnstile ref={turnstileRef} onVerify={setCaptchaToken} onExpire={() => setCaptchaToken('')} className="flex justify-center" />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-100 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              {status === 'sending' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('forgot.sending')}
                </>
              ) : (
                <>
                  {t('forgot.sendResetLink')} <Send size={20} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Sent State */}
        {status === 'sent' && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 rounded-2xl">
              <p className="text-xs text-green-700 dark:text-green-300">
                {t('forgot.notReceived')}
              </p>
            </div>
            
            <button
              onClick={() => setStatus('form')}
              className="w-full bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-700 dark:text-neutral-300 font-bold py-4 rounded-2xl transition-all active:scale-[0.98]"
            >
              {t('forgot.tryAnotherEmail')}
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <button 
            onClick={() => router.push('/login')}
            className="text-sm text-blue-600 font-bold hover:underline flex items-center justify-center gap-1 mx-auto"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            {t('forgot.backToLogin')}
          </button>
        </div>
      </div>

      {/* Security Note */}
      <p className="mt-8 text-[11px] text-gray-400 dark:text-neutral-500 uppercase tracking-widest font-medium">
        {t('forgot.secureConnection')}
      </p>
    </div>
  );
}

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0b] flex flex-col justify-center items-center px-4">
        <div className="w-full max-w-[450px] bg-white dark:bg-neutral-900 rounded-[32px] shadow-sm border border-gray-100 dark:border-neutral-800 p-8 md:p-12 text-center">
          <Loader2 className="text-blue-600 w-8 h-8 animate-spin mx-auto" />
          <p className="text-gray-500 dark:text-neutral-400 mt-4">{t('forgot.loading')}</p>
        </div>
      </div>
    }>
      <ForgotPasswordContent />
    </Suspense>
  );
}
