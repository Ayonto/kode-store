import type { Metadata } from "next";
import { Cormorant, Montserrat } from "next/font/google";
import "./globals.css";
import { RevealInit } from "@/components/site/RevealInit";

const cormorant = Cormorant({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "KODE — Modern Clothing, Made in Bangladesh",
    template: "%s · KODE",
  },
  description:
    "KODE is a premium Bangladeshi clothing label. Considered design, honest fabric, delivered nationwide. Cash on delivery available.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${montserrat.variable}`}>
      <body className="min-h-screen bg-cream text-ink antialiased">
        <RevealInit />
        {children}
      </body>
    </html>
  );
}
