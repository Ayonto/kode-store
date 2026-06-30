import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KODE — Modern Clothing, Made in Bangladesh",
  description:
    "KODE is a premium Bangladeshi clothing label. Considered design, honest fabric, delivered nationwide.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-cream text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
