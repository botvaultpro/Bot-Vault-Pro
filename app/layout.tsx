import type { Metadata } from "next";
import { Syne, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bot Vault Pro — AI Automation Bots",
  description:
    "Six AI bots that run the parts of your business you're handling manually right now. Stop prompting. Start automating.",
  metadataBase: new URL("https://botvaultpro.com"),
  keywords: ["ai business automation", "ai tools for small business", "invoice automation", "contract review ai", "email ai", "business analytics"],
  openGraph: {
    type: "website",
    siteName: "Bot Vault Pro",
    title: "Bot Vault Pro — AI Business Automation",
    description: "6 AI bots that handle invoicing, email, contracts, analytics, reviews, and client acquisition. Set them up once. They run forever.",
    url: "https://botvaultpro.com",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Bot Vault Pro — AI Business Automation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bot Vault Pro — AI Business Automation",
    description: "6 AI bots that handle invoicing, email, contracts, analytics, reviews, and client acquisition.",
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
      className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-vault-bg text-vault-text font-body antialiased">
        {children}
      </body>
    </html>
  );
}
