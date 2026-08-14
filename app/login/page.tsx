"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, ArrowRight, Eye, EyeOff, CheckCircle, Loader2, Phone } from "lucide-react";
import { FaGoogle, FaDiscord } from 'react-icons/fa';
import { useAuthStore } from '@/store/authStore';
import { resetRefreshState, authAPI, userAPI } from '@/lib/api';
import Turnstile, { TURNSTILE_ENABLED, TurnstileHandle } from '@/components/Turnstile';
import { useI18n } from '@/lib/i18n';

function LoginContent() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const turnstileRef = React.useRef<TurnstileHandle>(null);
  const login = useAuthStore((state) => state.login);
  const smsVerify = useAuthStore((state) => state.smsVerify);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  // SMS (phone OTP) login
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [authMode, setAuthMode] = useState<'email' | 'sms'>('email');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [smsLoading, setSmsLoading] = useState(false);
  const [smsError, setSmsError] = useState('');
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (resendIn <= 0) return;
    const id = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [resendIn]);

  // Show the SMS-login option only when the backend has sms.ir configured.
  useEffect(() => {
    authAPI.smsStatus().then((r) => setSmsEnabled(!!r.data?.enabled)).catch(() => setSmsEnabled(false));
  }, []);

  const goAfterLogin = () => {
    const redirect = searchParams.get('redirect');
    const currentUser = useAuthStore.getState().user;
    if (currentUser?.is_staff) router.push('/admin');
    else if (redirect) router.push(redirect);
    else router.push('/dashboard');
  };

  const handleSendOtp = async () => {
    setSmsError(''); setError('');
    if (!phone.trim()) { setSmsError(t('login.enterPhone')); return; }
    setSmsLoading(true);
    try {
      const res = await authAPI.smsRequestOtp(phone.trim());
      setOtpSent(true);
      setResendIn(Math.min(res.data?.expires_in || 60, 60));
    } catch (err: any) {
      setSmsError(err.response?.data?.error || t('login.smsFailed'));
    } finally {
      setSmsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setSmsError('');
    if (otpCode.trim().length < 4) { setSmsError(t('login.enterCode')); return; }
    setSmsLoading(true);
    try {
      await smsVerify(phone.trim(), otpCode.trim());
      await new Promise((r) => setTimeout(r, 150));
      goAfterLogin();
    } catch (err: any) {
      setSmsError(err.response?.data?.error || t('login.invalidCode'));
    } finally {
      setSmsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) return;
    if (TURNSTILE_ENABLED && !captchaToken) {
      setResendMessage(t('login.captchaFirst'));
      return;
    }
    setResending(true);
    setResendMessage('');
    try {
      const res = await userAPI.resendVerification(email, captchaToken);
      setResendMessage(res.data?.message || t('login.verificationSent'));
    } catch (err: any) {
      setResendMessage(err.response?.data?.error || t('login.resendFailed'));
    } finally {
      turnstileRef.current?.reset();
      setCaptchaToken('');
      setResending(false);
    }
  };

  // Handle Google OAuth login
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await authAPI.googleLogin();
      if (response.data.redirect_to) {
        // Redirect to Google OAuth
        window.location.href = response.data.redirect_to;
      } else {
        // Fallback: open in popup
        const width = 500;
        const height = 600;
        const left = (window.innerWidth - width) / 2;
        const top = (window.innerHeight - height) / 2;
        window.open(
          response.data.auth_url,
          'google_login',
          `width=${width},height=${height},left=${left},top=${top}`
        );
      }
    } catch (err: any) {
      setError(t('login.googleFailed'));
      setLoading(false);
    }
  };

  // Handle Discord OAuth login
  const handleDiscordLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await authAPI.discordLogin();
      if (response.data.redirect_to) {
        // Redirect to Discord OAuth
        window.location.href = response.data.redirect_to;
      } else {
        // Fallback: open in popup
        const width = 500;
        const height = 600;
        const left = (window.innerWidth - width) / 2;
        const top = (window.innerHeight - height) / 2;
        window.open(
          response.data.auth_url,
          'discord_login',
          `width=${width},height=${height},left=${left},top=${top}`
        );
      }
    } catch (err: any) {
      setError(t('login.discordFailed'));
      setLoading(false);
    }
  };

  // Clear stale tokens ONLY when the user is genuinely logged out. Clearing on
  // mount unconditionally (the old behaviour) wiped a VALID session for anyone
  // who landed on /login while logged in — e.g. bounced here by a stale guard —
  // and raced the auth-store init that reads those very tokens.
  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated && typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      resetRefreshState();
    }
  }, [isInitialized, isAuthenticated]);

  // Check for success messages from redirects
  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      setSuccessMessage(t('login.emailVerifiedSuccess'));
    } else if (searchParams.get('reset') === 'true') {
      setSuccessMessage(t('login.passwordResetSuccess'));
    } else if (searchParams.get('registered') === 'true') {
      setSuccessMessage(t('login.registrationSuccess'));
    }
    
    // Handle OAuth callback
    const social = searchParams.get('social');
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    
    if (code && state) {
      // Process OAuth callback
      handleOAuthCallback(code, state);
    }
  }, [searchParams]);

  // Handle OAuth callback
  const handleOAuthCallback = async (code: string, state: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await authAPI.socialCallback(code, state);
      const { user: socialUser, tokens } = response.data;
      
      // Store tokens
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', tokens.access);
        localStorage.setItem('refresh_token', tokens.refresh);
      }
      
      // Update auth store
      await login(socialUser.email, '');
      
      // Redirect
      if (socialUser.is_staff) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || t('login.socialLoginFailed');
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirect = searchParams.get('redirect');
      if (user.is_staff) {
        router.push('/admin');
      } else if (redirect) {
        router.push(redirect);
      } else {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, user, router, searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0b] flex flex-col justify-center items-center px-4">
      
      {/* Container */}
      <div className="w-full max-w-[450px] bg-white dark:bg-neutral-900 rounded-[32px] shadow-sm border border-gray-100 dark:border-neutral-800 p-8 md:p-12">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
            <Lock className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-neutral-100 tracking-tight">{t('login.heading')}</h1>
          <p className="text-gray-500 dark:text-neutral-400 mt-2 text-sm">{t('login.subtitle')}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl">
            <p className="text-xs text-red-600 dark:text-red-300 font-bold">{error}</p>
            {needsVerification && (
              <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-900">
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resending}
                  className="w-full py-2.5 bg-red-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-700 disabled:opacity-50 transition-all"
                >
                  {resending ? t('login.resending') : t('login.resendButton')}
                </button>
                {resendMessage && (
                  <p className="text-[11px] text-gray-600 dark:text-neutral-300 font-medium mt-2 text-center">{resendMessage}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 rounded-2xl flex items-start gap-3">
            <CheckCircle className="text-green-600 w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-green-700 dark:text-green-300 font-medium">{successMessage}</p>
          </div>
        )}

        {/* Auth mode toggle: Email / Phone (SMS) — only when SMS is configured */}
        {smsEnabled && (
        <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-neutral-800 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => { setAuthMode('email'); setError(''); setSmsError(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${authMode === 'email' ? 'bg-white dark:bg-neutral-900 text-blue-600 shadow-sm' : 'text-gray-500 dark:text-neutral-400'}`}
          >
            <Mail size={16} /> {t('login.tabEmail')}
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('sms'); setError(''); setSmsError(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${authMode === 'sms' ? 'bg-white dark:bg-neutral-900 text-blue-600 shadow-sm' : 'text-gray-500 dark:text-neutral-400'}`}
          >
            <Phone size={16} /> {t('login.tabSms')}
          </button>
        </div>
        )}

        {smsEnabled && authMode === 'sms' ? (
          <div className="space-y-6">
            {!otpSent ? (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500 ml-1">{t('login.phoneLabel')}</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500 w-5 h-5" />
                    <input
                      type="tel"
                      inputMode="numeric"
                      dir="ltr"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSendOtp(); }}
                      placeholder="09123456789"
                      className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 dark:text-neutral-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-sm"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 dark:text-neutral-500 px-1">{t('login.smsHint')}</p>
                </div>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={smsLoading || !phone.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-100 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  {smsLoading ? <Loader2 size={20} className="animate-spin" /> : null}
                  {smsLoading ? t('login.sendingCode') : t('login.sendCode')} {!smsLoading && <ArrowRight size={20} />}
                </button>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-500 dark:text-neutral-400 text-center">
                  {t('login.codeSentTo')} <span dir="ltr" className="font-bold text-gray-700 dark:text-neutral-200">{phone}</span>
                </p>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500 ml-1">{t('login.codeLabel')}</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    dir="ltr"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleVerifyOtp(); }}
                    placeholder="·····"
                    className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 dark:text-neutral-100 rounded-2xl py-4 px-4 outline-none focus:border-blue-600 text-center text-2xl font-black tracking-[0.5em]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={smsLoading || otpCode.length < 4}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-100 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  {smsLoading ? <Loader2 size={20} className="animate-spin" /> : null}
                  {smsLoading ? t('login.verifying') : t('login.verifyLogin')} {!smsLoading && <ArrowRight size={20} />}
                </button>
                <div className="flex items-center justify-between text-xs">
                  <button type="button" onClick={() => { setOtpSent(false); setOtpCode(''); setSmsError(''); }} className="font-bold text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200">
                    {t('login.changeNumber')}
                  </button>
                  <button type="button" onClick={handleSendOtp} disabled={resendIn > 0 || smsLoading} className="font-bold text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed">
                    {resendIn > 0 ? `${t('login.resendIn')} ${resendIn}s` : t('login.resendCode')}
                  </button>
                </div>
              </>
            )}
            {smsError && <p className="text-xs text-red-600 dark:text-red-400 font-bold text-center">{smsError}</p>}
          </div>
        ) : (
        <>
        {/* Form */}
        <form className="space-y-6" onSubmit={async (e) => {
          e.preventDefault();
          setError('');
          if (TURNSTILE_ENABLED && !captchaToken) {
            setError(t('login.captchaBelow'));
            return;
          }
          setNeedsVerification(false);
          setResendMessage('');
          setLoading(true);
          try {
            await login(email, password, captchaToken);
            setCaptchaToken('');
            // Wait a moment for user state to update
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Get redirect from URL params or check user role
            const redirect = searchParams.get('redirect');
            const currentUser = useAuthStore.getState().user;
            
            // If user is admin, always redirect to admin dashboard
            if (currentUser?.is_staff) {
              router.push('/admin');
            } else if (redirect) {
              router.push(redirect);
            } else {
              router.push('/dashboard');
            }
          } catch (err: any) {
            turnstileRef.current?.reset();
            setCaptchaToken('');
            const data = err.response?.data;
            const errorMsg = data?.error || data?.detail || t('login.loginFailed');
            setError(errorMsg);
            // Backend flags the "email not verified" case so we can offer a resend.
            if (data?.email_verified === false) {
              setNeedsVerification(true);
            }
          } finally {
            setLoading(false);
          }
        }}>
          
          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500 ml-1">{t('login.emailLabel')}</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('login.emailPlaceholder')}
                required
                className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 dark:text-neutral-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-sm"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500">{t('login.passwordLabel')}</label>
              <button
                type="button"
                onClick={() => router.push('/forgot-password')}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                {t('login.forgot')}
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500 w-5 h-5" />
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
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

          {/* Captcha */}
          <Turnstile ref={turnstileRef} onVerify={setCaptchaToken} onExpire={() => setCaptchaToken('')} className="flex justify-center" />

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-100 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            {loading ? t('login.signingIn') : t('login.signIn')} <ArrowRight size={20} />
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-neutral-700"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-neutral-900 px-4 text-gray-400 dark:text-neutral-500 font-bold">{t('login.orContinueWith')}</span>
          </div>
        </div>

        {/* Social Login Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleGoogleLogin()}
            disabled={loading}
            className="flex items-center justify-center gap-3 bg-white dark:bg-neutral-900 border-2 border-gray-200 dark:border-neutral-700 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-neutral-300 font-bold py-3.5 rounded-2xl transition-all active:scale-[0.98]"
          >
            <FaGoogle className="text-xl" />
            <span className="text-sm">Google</span>
          </button>
          <button
            type="button"
            onClick={() => handleDiscordLogin()}
            disabled={loading}
            className="flex items-center justify-center gap-3 bg-[#5865F2] hover:bg-[#4752C4] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-2xl transition-all active:scale-[0.98]"
          >
            <FaDiscord className="text-xl" />
            <span className="text-sm">Discord</span>
          </button>
        </div>
        </>
        )}

        {/* Footer */}
        <div className="mt-10 text-center">
          <p className="text-sm text-gray-500 dark:text-neutral-400">
            {t('login.newHere')} {' '}
            <button
              onClick={() => router.push('/register')}
              className="font-bold text-blue-600 hover:underline"
            >
              {t('login.createAccount')}
            </button>
          </p>
        </div>
      </div>

      {/* Security Note */}
      <p className="mt-8 text-[11px] text-gray-400 dark:text-neutral-500 uppercase tracking-widest font-medium">
        {t('login.securityNote')}
      </p>
    </div>
  );
}

export default function LoginPage() {
  const { t } = useI18n();
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0b] flex flex-col justify-center items-center px-4">
        <div className="w-full max-w-[450px] bg-white dark:bg-neutral-900 rounded-[32px] shadow-sm border border-gray-100 dark:border-neutral-800 p-8 md:p-12 text-center">
          <Loader2 className="text-blue-600 w-8 h-8 animate-spin mx-auto" />
          <p className="text-gray-500 dark:text-neutral-400 mt-4">{t('login.loading')}</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
