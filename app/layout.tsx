import type { Metadata } from "next";
import { Bebas_Neue, Familjen_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400"],
  display: "swap",
});

const familjenGrotesk = Familjen_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BVP — AI Automation for Skilled Trades",
  description:
    "Stop drowning in paperwork. Bot Vault Pro puts your estimating, follow-ups, and job management on autopilot.",
  metadataBase: new URL("https://botvaultpro.com"),
  keywords: ["ai automation trades", "contractor automation", "plumber business software", "electrician tools", "hvac business automation"],
  openGraph: {
    type: "website",
    siteName: "Bot Vault Pro",
    title: "BVP — AI Automation for Skilled Trades",
    description: "Stop drowning in paperwork. BVP puts your estimating, follow-ups, and job management on autopilot.",
    url: "https://botvaultpro.com",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Bot Vault Pro" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "BVP — AI Automation for Skilled Trades",
    description: "Stop drowning in paperwork. BVP puts your estimating, follow-ups, and job management on autopilot.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${bebasNeue.variable} ${familjenGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-bg text-text font-body antialiased">
        {children}
      </body>
    </html>
  );
}
