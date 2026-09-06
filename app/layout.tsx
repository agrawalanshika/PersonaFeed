import type { Metadata } from "next";
import "./globals.css";
import StoreProvider from "@/components/providers/StoreProvider";

export const metadata: Metadata = {
  title: "Personalized Content Dashboard",
  description:
    "A unified, personalized feed of news, movie recommendations, and social content.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
