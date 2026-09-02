import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteLoadingScreen } from "@/components/layout/site-loading-screen";
import { SiteShell } from "@/components/layout/site-shell";
import "@/app/globals.css";

const displayFont = Geist({
  variable: "--font-display",
  display: "swap"
});

const codeFont = Geist_Mono({
  variable: "--font-code",
  display: "swap"
});

export const metadata: Metadata = {
  title: {
    default: "JMCTE",
    template: "%s | JMCTE"
  },
  description:
    "Enterprise financial-services CIO and CTO portfolio for John McChesney TenEyck Jr., spanning transformation, architecture, infrastructure, operations, resilience, M&A, and AI."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-site-loader="visible"
      className={`${displayFont.variable} ${codeFont.variable}`}
    >
      <body className="antialiased">
        <a
          href="#main-content"
          className="sr-only fixed top-4 left-4 z-50 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg focus:not-sr-only"
        >
          Skip to main content
        </a>
        <SiteLoadingScreen />
        <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,hsl(var(--primary)/0.12),transparent_40%),radial-gradient(circle_at_85%_5%,hsl(var(--accent)/0.15),transparent_30%),radial-gradient(circle_at_30%_90%,hsl(var(--secondary)/0.24),transparent_35%)]"
            aria-hidden
          />
          <div className="site-loader-surface relative z-10 transition-[filter,opacity,transform] duration-700 ease-out">
            <SiteHeader />
            <SiteShell>{children}</SiteShell>
            <SiteFooter />
          </div>
        </div>
      </body>
    </html>
  );
}
