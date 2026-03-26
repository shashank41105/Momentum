import type { Metadata } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import { ThemeProvider } from "@/components/theme-provider";
import { STORAGE_KEYS } from "@/lib/constants";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["700", "800", "900"]
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: "Momentum - Daily Productivity Tracker",
  description: "Track work, gym, and diet momentum with one focused daily check-in."
};

function ThemeScript() {
  const script = `
    (function () {
      var saved = localStorage.getItem('${STORAGE_KEYS.theme}');
      var mode = saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system';
      var resolved = mode === 'system'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : mode;
      document.documentElement.classList.toggle('dark', resolved === 'dark');
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${playfair.variable} ${manrope.variable}`}>
        <ThemeScript />
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
