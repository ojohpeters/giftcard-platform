import "./globals.css";
import type { Metadata } from "next";
import { Geist, Vazirmatn } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/components/AuthProvider";
import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider, ThemeScript } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "600", "700", "800", "900"],
});

// Persian/Arabic font — self-hosted by next/font at build time (works in Iran).
// Browsers use it per-glyph for Persian/Arabic characters that Geist lacks.
const vazir = Vazirmatn({
  variable: "--font-vazir",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "HiGc — Buy & Sell Gift Cards",
    template: "%s · HiGc",
  },
  description:
    "HiGc — secure, instant gift card trading. Buy and sell gift cards at the best rates with encrypted settlement.",
  openGraph: {
    title: "HiGc — Buy & Sell Gift Cards",
    description: "Secure, instant gift card trading at the best rates.",
    type: "website",
  },
  // Tell Chrome/Google NOT to auto-translate: we have our own fa/en switcher, and
  // the browser translator mutates React's DOM → "removeChild" / React #310 crashes.
  other: { google: "notranslate" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" translate="no" className={`notranslate scroll-smooth ${geistSans.variable} ${vazir.variable}`}>
      <body className="bg-white dark:bg-[#0a0a0b] text-[#0A0A0A] dark:text-neutral-100 antialiased font-sans min-h-screen flex flex-col overflow-x-hidden w-full relative">
        <ThemeScript />
        <ThemeProvider>
        <AuthProvider>
        <I18nProvider>
          {/* GLOBAL HEADER */}
          <Header />

          {/* MAIN CONTENT */}
          <main className="flex-grow pt-10 md:pt-16 pb-20 w-full overflow-x-hidden">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
              {children}
            </div>
          </main>

          <Footer />
        </I18nProvider>
        </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
