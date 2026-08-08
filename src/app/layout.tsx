import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "GameRank — Rate, Rank & Review Your Games",
    template: "%s | GameRank",
  },
  description:
    "Build your personal tier lists, write reviews, track your gaming library, and connect with fellow gamers. Your gaming journey, ranked and reviewed.",
  keywords: [
    "game reviews",
    "tier list",
    "game ranking",
    "gaming community",
    "game tracker",
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body>
        <Navbar />
        <main className="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
