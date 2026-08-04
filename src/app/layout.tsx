import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Danish | Frontend Developer Portfolio",
  description:
    "Frontend developer specializing in React, Next.js, TypeScript, and modern web applications. Building clean digital experiences and scalable UI systems.",
  keywords: [
    "Frontend Developer",
    "React",
    "Next.js",
    "TypeScript",
    "Portfolio",
    "Danish",
  ],
  icons: {
    icon: "/Danish Fav.png",
    shortcut: "/Danish Fav.png",
    apple: "/Danish Fav.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`scroll-smooth dark ${inter.variable}`}>
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white transition-colors duration-300">
        <AuthProvider>
          <ThemeProvider>
            {children}
            <Toaster richColors position="top-right" />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
