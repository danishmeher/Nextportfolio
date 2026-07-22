import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

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
  return (<AuthProvider>
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-white text-slate-800 antialiased">{children}
        <Toaster richColors position="top-right" />
      </body>
    </html></AuthProvider>
  );
}
