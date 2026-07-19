import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "cCarbon — GHG Accounting Platform",
  description: "Regulatory-compliant carbon accounting: GHG Protocol, ISO 14064, TCFD, CSRD, CDP",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="h-full bg-gray-50">{children}</body>
    </html>
  );
}
