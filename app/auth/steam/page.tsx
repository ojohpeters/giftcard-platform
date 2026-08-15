"use client";
import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { resetRefreshState } from '@/lib/api';

function SteamCallback() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const access = params.get('access');
    const refresh = params.get('refresh');
    const isNew = params.get('new') === '1';
    (async () => {
      if (access && refresh && typeof window !== 'undefined') {
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        resetRefreshState();
        try { await useAuthStore.getState().fetchUser(); } catch { /* ignore */ }
        useAuthStore.setState({ isAuthenticated: true, isInitialized: true });
        // Clean the tokens out of the URL history entry.
        router.replace(isNew ? '/dashboard/settings?steam=connected' : '/dashboard');
      } else {
        router.replace('/login?steam=failed');
      }
    })();
  }, [params, router]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0b] flex items-center justify-center">
      <div className="text-center">
        <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 dark:text-neutral-400 font-bold uppercase tracking-widest text-sm">Signing you in…</p>
      </div>
    </div>
  );
}

export default function SteamAuthPage() {
  return (
    <Suspense fallback={null}>
      <SteamCallback />
    </Suspense>
  );
}
