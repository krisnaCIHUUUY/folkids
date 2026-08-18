import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Geist, Geist_Mono, Literata } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { AuthUrlHandler } from "@/components/auth/auth-url-handler";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wayang Folkids",
  description: "Aplikasi literasi cerita rakyat dan wayang untuk siswa Sekolah Dasar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} ${literata.variable} h-full antialiased`}
    >
      <head>
        <link rel="dns-prefetch" href="https://gghdnrnjlyvmmfosierc.supabase.co" />
        <link rel="preconnect" href="https://gghdnrnjlyvmmfosierc.supabase.co" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded focus:bg-clay-rose focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white"
        >
          Lewati ke konten utama
        </a>
        {children}
        <AuthUrlHandler />
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
