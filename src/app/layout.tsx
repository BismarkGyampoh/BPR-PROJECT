import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist_Mono, Lora, Source_Sans_3 } from "next/font/google";
import { getSessionUser } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  display: "swap",
});
const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
});
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FreshCrate — Farm-fresh produce delivered",
  description:
    "Weekly subscription crates of fresh Ghanaian produce, delivered within 48h of harvest. Direct from smallholder farms to your door in Accra.",
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getSessionUser();
  return (
    <html lang="en" className={`${sourceSans.variable} ${lora.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-screen flex flex-col bg-canvas text-ink font-sans">
        <Navbar user={user} />
        <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 py-5 sm:px-6 lg:px-10 lg:py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
