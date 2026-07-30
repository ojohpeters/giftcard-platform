"use client";
import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

/**
 * Cloudflare Turnstile CAPTCHA widget.
 *
 * Key-gated: if NEXT_PUBLIC_TURNSTILE_SITE_KEY is not set at build time, this
 * renders nothing and TURNSTILE_ENABLED is false — so forms behave exactly as
 * before until the key is configured. Parents should skip the token check when
 * TURNSTILE_ENABLED is false.
 */
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
export const TURNSTILE_ENABLED = !!SITE_KEY;

export interface TurnstileHandle {
  reset: () => void;
}

interface Props {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  className?: string;
}

const Turnstile = forwardRef<TurnstileHandle, Props>(function Turnstile(
  { onVerify, onExpire, className = "" },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  // Keep latest callbacks in a ref so the widget mounts exactly once.
  const cb = useRef({ onVerify, onExpire });
  cb.current = { onVerify, onExpire };

  useImperativeHandle(ref, () => ({
    reset() {
      const w = (window as any).turnstile;
      if (w && widgetId.current !== null) {
        try { w.reset(widgetId.current); } catch { /* noop */ }
      }
    },
  }), []);

  useEffect(() => {
    if (!SITE_KEY) return;
    let cancelled = false;
    let poll: ReturnType<typeof setInterval> | undefined;

    const render = () => {
      const w = (window as any).turnstile;
      if (cancelled || !containerRef.current || !w || widgetId.current !== null) return;
      widgetId.current = w.render(containerRef.current, {
        sitekey: SITE_KEY,
        callback: (token: string) => cb.current.onVerify?.(token),
        "expired-callback": () => cb.current.onExpire?.(),
        "error-callback": () => cb.current.onExpire?.(),
        theme: "auto",
      });
    };

    if ((window as any).turnstile) {
      render();
    } else {
      if (!document.getElementById("cf-turnstile-script")) {
        const s = document.createElement("script");
        s.id = "cf-turnstile-script";
        s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        s.async = true;
        s.defer = true;
        document.head.appendChild(s);
      }
      // The script may already be loading; poll until the global is ready.
      poll = setInterval(() => {
        if ((window as any).turnstile) {
          if (poll) clearInterval(poll);
          render();
        }
      }, 300);
      setTimeout(() => poll && clearInterval(poll), 12000);
    }

    return () => {
      cancelled = true;
      if (poll) clearInterval(poll);
      const w = (window as any).turnstile;
      if (w && widgetId.current !== null) {
        try { w.remove(widgetId.current); } catch { /* noop */ }
      }
      widgetId.current = null;
    };
  }, []);

  if (!SITE_KEY) return null;
  return <div ref={containerRef} className={className} />;
});

export default Turnstile;
