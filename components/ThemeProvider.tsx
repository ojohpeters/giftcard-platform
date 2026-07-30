"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

type Theme = "light" | "dark";

interface ThemeCtx {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeCtx>({ theme: "light", toggle: () => {}, setTheme: () => {} });

export const useTheme = () => useContext(ThemeContext);

/**
 * Applies the persisted theme to <html> and exposes a toggle. The initial class
 * is set by an inline script in the layout (see ThemeScript) so there is no
 * flash of the wrong theme on first paint.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const stored = (localStorage.getItem("theme") as Theme | null);
    const initial: Theme = stored || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setThemeState(initial);
    // Enable transitions only after mount so the first paint doesn't animate.
    requestAnimationFrame(() => document.documentElement.classList.add("theme-ready"));
  }, []);

  const apply = useCallback((t: Theme) => {
    const root = document.documentElement;
    root.classList.toggle("dark", t === "dark");
    localStorage.setItem("theme", t);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    apply(t);
  }, [apply]);

  const toggle = useCallback(() => setTheme(theme === "dark" ? "light" : "dark"), [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Inline script that sets the `.dark` class before React hydrates, preventing a
 * flash of light theme. Rendered in the layout <head> area (via a Script-less
 * inline tag is not allowed in app dir head, so we render it at the top of body).
 */
export function ThemeScript() {
  const code = `(function(){try{var t=localStorage.getItem('theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}if(t==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
