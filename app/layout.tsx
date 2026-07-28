import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ThemeScript } from "@/components/ThemeScript";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Savora — Save Together. Grow Together.",
  description:
    "Savora is a decentralized community savings platform that brings transparency, security and trust to traditional savings groups through blockchain technology. Smart contracts automate contributions and payouts so your money is always safe, fair and accessible.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeScript />
        {children}
      </body>
    </html>
  );
}
