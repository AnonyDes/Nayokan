import type { Metadata } from "next";
import type { ReactNode } from "react";
import { IBM_Plex_Mono, Inter, Manrope } from "next/font/google";
import { ScrollReveal } from "@/ui/components/reveal";
import { PreviewLinkInterceptor } from "@/platform/sites/preview-nav";
import "./globals.css";

// Fonts via next/font (not CSS @import, which Tailwind v4 does not support).
const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-manrope", display: "swap" });
const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-inter", display: "swap" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-plex-mono", display: "swap" });

// Fallback title so not-found/edge renders always produce a <title>;
// each site layout overrides via buildSiteMetadata.
export const metadata: Metadata = { title: "Nayokan" };

// Root layout is shared by all three public sites and the admin. Each site
// layout (app/(sites)/<site>/layout.tsx) sets its own metadata, theme, nav
// and footer. English is primary; French routes arrive later (ADR-003).
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${inter.variable} ${plexMono.variable}`}>
      <body>
        <PreviewLinkInterceptor />
        <ScrollReveal />
        {children}
      </body>
    </html>
  );
}
