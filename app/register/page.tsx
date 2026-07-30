"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, Mail, ArrowRight, Eye, EyeOff, ShieldCheck, CheckCircle, Gift } from "lucide-react";
import { useAuthStore } from '@/store/authStore';
import { userAPI } from '@/lib/api';
import Turnstile, { TURNSTILE_ENABLED, TurnstileHandle } from '@/components/Turnstile';
import { useI18n } from '@/lib/i18n';

export default function RegisterPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const turnstileRef = React.useRef<TurnstileHandle>(null);
  const register = useAuthStore((state) => state.register);

  // Capture a referral code from the invite link (?ref=CODE) and remember it
  // across navigation so the referrer link is credited on sign-up.
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const fromUrl = new URLSearchParams(window.location.search).get('ref');
    const stored = localStorage.getItem('higc_referral_code');
    const code = (fromUrl || stored || '').trim();
    if (code) {
      setReferralCode(code);
      localStorage.setItem('higc_referral_code', code);
    }
  }, []);

  const handleResendVerification = async () => {
    if (TURNSTILE_ENABLED && !captchaToken) {
      setResendMessage(t('register.captchaFirst'));
      return;
    }
    setResending(true);
    setResendMessage('');
    try {
      const response = await userAPI.resendVerification(email, captchaToken);
      setResendMessage(response.data.message);
      turnstileRef.current?.reset();
      setCaptchaToken('');
    } catch (err: any) {
      turnstileRef.current?.reset();
      setCaptchaToken('');
      const errorMsg = err.response?.data?.error || t('register.resendFailed');
      setResendMessage(errorMsg);
    } finally {
      setResending(false);
    }
  };

  // Show success message after registration
  if (registered) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0b] flex flex-col justify-center items-center px-4 py-12">
        <div className="w-full max-w-[450px] bg-white dark:bg-neutral-900 rounded-[32px] shadow-sm border border-gray-100 dark:border-neutral-800 p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle className="text-green-600 w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-neutral-100 tracking-tight">{t('register.checkEmailTitle')}</h1>
            <p className="text-gray-500 dark:text-neutral-400 mt-3 text-sm">
              {t('register.verificationSentPrefix')} <strong className="text-gray-700 dark:text-neutral-300">{email}</strong>{t('register.verificationSentSuffix')}
            </p>
          </div>

          {resendMessage && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-2xl mb-6">
              <p className="text-xs text-blue-700 dark:text-blue-300">{resendMessage}</p>
            </div>
          )}

          <div className="p-4 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-2xl mb-6">
            <p className="text-xs text-gray-600 dark:text-neutral-300">
              {t('register.didntReceive')}
            </p>
          </div>

          <div className="space-y-3">
            <Turnstile ref={turnstileRef} onVerify={setCaptchaToken} onExpire={() => setCaptchaToken('')} className="flex justify-center" />
            <button
              onClick={handleResendVerification}
              disabled={resending}
              className="w-full bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 disabled:opacity-50 text-gray-700 dark:text-neutral-300 font-bold py-4 rounded-2xl transition-all active:scale-[0.98]"
            >
              {resending ? t('register.sending') : t('register.resendButton')}
            </button>
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"
            >
              {t('register.continueToLogin')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0b] flex flex-col justify-center items-center px-4 py-12">
      
      {/* Container */}
      <div className="w-full max-w-[450px] bg-white dark:bg-neutral-900 rounded-[32px] shadow-sm border border-gray-100 dark:border-neutral-800 p-8 md:p-12">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
            <ShieldCheck className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-neutral-100 tracking-tight">{t('register.title')}</h1>
          <p className="text-gray-500 dark:text-neutral-400 mt-2 text-sm">{t('register.subtitle')}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl">
            <p className="text-xs text-red-600 dark:text-red-300 font-bold">{error}</p>
          </div>
        )}

        {/* Form */}
        <form className="space-y-5" onSubmit={async (e) => {
          e.preventDefault();
          setError('');
          if (TURNSTILE_ENABLED && !captchaToken) {
            setError(t('register.captchaBelow'));
            return;
          }
          setLoading(true);
          try {
            if (password !== passwordConfirm) {
              setError(t('register.passwordsMismatch'));
              setLoading(false);
              return;
            }
            // Persist the UI language so emails (verification, OTP, reset) match.
            // Persian-first: default to fa unless the user explicitly chose en/ar.
            const uiLang = typeof window !== 'undefined' ? localStorage.getItem('higc_language') : null;
            const language_preference = uiLang === 'en' ? 'en' : (uiLang === 'ar' ? 'ar' : 'fa');
            await register({
              first_name: firstName,
              last_name: lastName,
              email,
              password,
              password_confirm: passwordConfirm,
              turnstile_token: captchaToken,
              language_preference,
              ...(referralCode ? { referral_code: referralCode } : {}),
            });
            setCaptchaToken('');
            localStorage.removeItem('higc_referral_code');
            setRegistered(true);
          } catch (err: any) {
            turnstileRef.current?.reset();
            setCaptchaToken('');
            const errorData = err.response?.data;
            let errorMessage = t('register.registrationFailed');
            if (errorData) {
              if (errorData.detail) {
                errorMessage = errorData.detail;
              } else if (errorData.password) {
                errorMessage = Array.isArray(errorData.password) ? errorData.password[0] : errorData.password;
              } else if (errorData.email) {
                errorMessage = Array.isArray(errorData.email) ? errorData.email[0] : errorData.email;
              } else if (errorData.password_confirm) {
                errorMessage = Array.isArray(errorData.password_confirm) ? errorData.password_confirm[0] : errorData.password_confirm;
              } else if (typeof errorData === 'object') {
                // Get first error message from any field
                const firstError = Object.values(errorData)[0];
                errorMessage = Array.isArray(firstError) ? firstError[0] : String(firstError);
              }
            }
            setError(errorMessage);
          } finally {
            setLoading(false);
          }
        }}>
          
          {/* First Name Field */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500 ml-1">{t('register.firstNameLabel')}</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500 w-5 h-5" />
              <input 
                type="text" 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={t('register.firstNamePlaceholder')}
                required
                className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 dark:text-neutral-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-sm"
              />
            </div>
          </div>

          {/* Last Name Field */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500 ml-1">{t('register.lastNameLabel')}</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500 w-5 h-5" />
              <input 
                type="text" 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder={t('register.lastNamePlaceholder')}
                required
                className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 dark:text-neutral-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-sm"
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500 ml-1">{t('register.emailLabel')}</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500 w-5 h-5" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('register.emailPlaceholder')}
                required
                className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 dark:text-neutral-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-sm"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500 ml-1">{t('register.passwordLabel')}</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500 w-5 h-5" />
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 dark:text-neutral-100 rounded-2xl py-4 pl-12 pr-12 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-sm"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500 hover:text-gray-600 dark:hover:text-neutral-300"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500 ml-1">{t('register.confirmPasswordLabel')}</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500 w-5 h-5" />
              <input 
                type={showPassword ? "text" : "password"} 
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 dark:text-neutral-100 rounded-2xl py-4 pl-12 pr-12 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-sm"
              />
            </div>
          </div>

          {/* Referral Code Field (optional, prefilled from invite link) */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500 ml-1">{t('register.referralLabel')}</label>
            <div className="relative">
              <Gift className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500 w-5 h-5" />
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder={t('register.referralPlaceholder')}
                className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 dark:text-neutral-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-sm uppercase tracking-wider"
              />
            </div>
          </div>

          {/* Terms Note */}
          <p className="text-[11px] text-gray-400 dark:text-neutral-500 px-1 leading-relaxed">
            {t('register.termsPrefix')} <span className="text-blue-600 font-bold cursor-pointer">{t('register.termsOfService')}</span> {t('register.termsAnd')} <span className="text-blue-600 font-bold cursor-pointer">{t('register.privacyPolicy')}</span>.
          </p>

          {/* Captcha */}
          <Turnstile ref={turnstileRef} onVerify={setCaptchaToken} onExpire={() => setCaptchaToken('')} className="flex justify-center" />

          {/* Register Button */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-100 flex items-center justify-center gap-2 transition-all active:scale-[0.98] mt-2"
          >
            {loading ? t('register.creatingAccount') : t('register.getStarted')} <ArrowRight size={20} />
          </button>
        </form>

        {/* Footer */}
        <div className="mt-10 text-center">
          <p className="text-sm text-gray-500 dark:text-neutral-400">
            {t('register.alreadyHaveAccount')} {' '}
            <button
              onClick={() => router.push('/login')}
              className="font-bold text-blue-600 hover:underline"
            >
              {t('register.signInHere')}
            </button>
          </p>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="mt-8 flex items-center gap-6 opacity-40 grayscale">
        <div className="flex items-center gap-2">
            <ShieldCheck size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">{t('register.verifiedSecure')}</span>
        </div>
      </div>
    </div>
  );
}