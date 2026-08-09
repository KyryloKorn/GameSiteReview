import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getSession } from "@/lib/session";
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
  openGraph: {
    title: "GameRank — Rate, Rank & Review Your Games",
    description: "Build custom game tier lists, write reviews, track your backlog, and share with friends.",
    siteName: "GameRank",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GameRank — Rate, Rank & Review Your Games",
    description: "Build custom game tier lists, write reviews, track your backlog, and share with friends.",
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await getSession();

  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body>
        <Navbar user={session ? { username: session.username } : null} />
        <main className="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
