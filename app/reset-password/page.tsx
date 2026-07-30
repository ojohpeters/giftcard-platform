"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Eye, EyeOff, CheckCircle, XCircle, Loader2, ArrowRight } from "lucide-react";
import { userAPI } from '@/lib/api';
import { useI18n } from '@/lib/i18n';

function ResetPasswordContent() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [status, setStatus] = useState<string>('form');
  const [error, setError] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setStatus('invalid');
      setError(t('reset.invalidNoToken'));
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== passwordConfirm) {
      setError(t('reset.passwordsMismatch'));
      return;
    }

    if (password.length < 8) {
      setError(t('reset.passwordTooShort'));
      return;
    }

    setStatus('submitting');

    try {
      await userAPI.confirmPasswordReset({ token, new_password: password });
      setStatus('success');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login?reset=true');
      }, 3000);
    } catch (err: any) {
      setStatus('form');
      const errorMsg = err.response?.data?.error || t('reset.resetFailed');
      setError(errorMsg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0b] flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-[450px] bg-white dark:bg-neutral-900 rounded-[32px] shadow-sm border border-gray-100 dark:border-neutral-800 p-8 md:p-12">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg ${
            status === 'success' ? 'bg-green-100' :
            status === 'invalid' ? 'bg-red-100' : 'bg-blue-100'
          }`}>
            {status === 'success' && <CheckCircle className="text-green-600 w-8 h-8" />}
            {status === 'invalid' && <XCircle className="text-red-600 w-8 h-8" />}
            {(status === 'form' || status === 'submitting') && <Lock className="text-blue-600 w-8 h-8" />}
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-neutral-100 tracking-tight">
            {status === 'success' && t('reset.successTitle')}
            {status === 'invalid' && t('reset.invalidTitle')}
            {(status === 'form' || status === 'submitting') && t('reset.createTitle')}
          </h1>

          <p className="text-gray-500 dark:text-neutral-400 mt-2 text-sm">
            {status === 'success' && t('reset.successDesc')}
            {status === 'invalid' && error}
            {(status === 'form' || status === 'submitting') && t('reset.formDesc')}
          </p>
        </div>

        {/* Error Message */}
        {error && status !== 'invalid' && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl">
            <p className="text-xs text-red-600 dark:text-red-300 font-bold">{error}</p>
          </div>
        )}

        {/* Form */}
        {(status === 'form' || status === 'submitting') && (
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500 ml-1">{t('reset.newPasswordLabel')}</label>
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
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500 ml-1">{t('reset.confirmPasswordLabel')}</label>
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

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={status === 'submitting'}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-100 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              {status === 'submitting' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('reset.resetting')}
                </>
              ) : (
                <>
                  {t('reset.resetButton')} <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Success State */}
        {status === 'success' && (
          <div className="space-y-4">
            <p className="text-xs text-gray-400 dark:text-neutral-500 text-center">{t('reset.redirecting')}</p>
            <button
              onClick={() => router.push('/login?reset=true')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"
            >
              {t('reset.continueToLogin')}
            </button>
          </div>
        )}

        {/* Invalid State */}
        {status === 'invalid' && (
          <div className="space-y-4">
            <button
              onClick={() => router.push('/forgot-password')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"
            >
              {t('reset.requestNewLink')}
            </button>
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-700 dark:text-neutral-300 font-bold py-4 rounded-2xl transition-all active:scale-[0.98]"
            >
              {t('reset.backToLogin')}
            </button>
          </div>
        )}
      </div>

      {/* Security Note */}
      <p className="mt-8 text-[11px] text-gray-400 dark:text-neutral-500 uppercase tracking-widest font-medium">
        {t('reset.secureNote')}
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  const { t } = useI18n();
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0b] flex flex-col justify-center items-center px-4">
        <div className="w-full max-w-[450px] bg-white dark:bg-neutral-900 rounded-[32px] shadow-sm border border-gray-100 dark:border-neutral-800 p-8 md:p-12 text-center">
          <Loader2 className="text-blue-600 w-8 h-8 animate-spin mx-auto" />
          <p className="text-gray-500 dark:text-neutral-400 mt-4">{t('reset.loading')}</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
