"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { userAPI } from '@/lib/api';
import { useI18n } from '@/lib/i18n';

function VerifyEmailContent() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage(t('verify.noToken'));
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await userAPI.verifyEmail(token);
        setStatus('success');
        setMessage(response.data.message || t('verify.successMessage'));
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login?verified=true');
        }, 3000);
      } catch (err: any) {
        setStatus('error');
        const errorMsg = err.response?.data?.error || t('verify.failedMessage');
        setMessage(errorMsg);
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0b] flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-[450px] bg-white dark:bg-neutral-900 rounded-[32px] shadow-sm border border-gray-100 dark:border-neutral-800 p-8 md:p-12">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg ${
            status === 'loading' ? 'bg-blue-100' :
            status === 'success' ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {status === 'loading' && <Loader2 className="text-blue-600 w-8 h-8 animate-spin" />}
            {status === 'success' && <CheckCircle className="text-green-600 w-8 h-8" />}
            {status === 'error' && <XCircle className="text-red-600 w-8 h-8" />}
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-neutral-100 tracking-tight">
            {status === 'loading' && t('verify.verifying')}
            {status === 'success' && t('verify.verified')}
            {status === 'error' && t('verify.failedHeading')}
          </h1>
          
          <p className="text-gray-500 dark:text-neutral-400 mt-3 text-sm">
            {message}
          </p>
        </div>

        {/* Actions */}
        {status === 'success' && (
          <div className="text-center">
            <p className="text-xs text-gray-400 dark:text-neutral-500 mb-4">{t('verify.redirecting')}</p>
            <button
              onClick={() => router.push('/login?verified=true')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"
            >
              {t('verify.continueToLogin')}
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-700 dark:text-neutral-300 font-bold py-4 rounded-2xl transition-all active:scale-[0.98]"
            >
              {t('verify.backToLogin')}
            </button>
            <button
              onClick={() => router.push('/register')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"
            >
              {t('verify.createAccount')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  const { t } = useI18n();
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0b] flex flex-col justify-center items-center px-4">
        <div className="w-full max-w-[450px] bg-white dark:bg-neutral-900 rounded-[32px] shadow-sm border border-gray-100 dark:border-neutral-800 p-8 md:p-12 text-center">
          <Loader2 className="text-blue-600 w-8 h-8 animate-spin mx-auto" />
          <p className="text-gray-500 dark:text-neutral-400 mt-4">{t('verify.loading')}</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
