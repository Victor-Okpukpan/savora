import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ThemeScript } from "@/components/ThemeScript";
import { Toaster } from "@/components/Toaster";
import { siteUrl } from "@/lib/urls";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const title = "Savora — Save Together. Grow Together.";
const description =
  "Savora is a decentralized community savings platform that brings transparency, security and trust to traditional savings groups through blockchain technology. Smart contracts automate contributions and payouts so your money is always safe, fair and accessible.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: title,
    template: "%s | Savora",
  },
  description,
  applicationName: "Savora",
  keywords: [
    "Savora",
    "Ajo",
    "Esusu",
    "rotating savings",
    "community savings",
    "Stacks blockchain",
    "Bitcoin",
    "STX",
    "smart contract savings",
    "decentralized finance",
  ],
  authors: [{ name: "Savora" }],
  openGraph: {
    title,
    description,
    url: siteUrl(),
    siteName: "Savora",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  icons: {
    icon: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
  },
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
        <Toaster />
      </body>
    </html>
  );
}
