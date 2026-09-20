
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/components/providers/StoreProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Personalized Content Dashboard",
  description:
    "A unified, personalized feed of news, movie recommendations, and social content.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-full flex flex-col font-sans`}
      >
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}