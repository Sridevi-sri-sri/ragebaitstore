import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import CartDrawer from "@/components/CartDrawer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | RageBait Store",
    default: "RageBait Store — Streetwear That Starts Conversations",
  },
  description:
    "Shop bold streetwear, graphic tees, hoodies, and accessories from RageBait Store. Unapologetic designs for people who refuse to blend in.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    siteName: "RageBait Store",
    title: "RageBait Store — Streetwear That Starts Conversations",
    description:
      "Bold graphic tees, hoodies, and accessories. Shop the drop at RageBait Store.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "RageBait Store — Streetwear That Starts Conversations",
    description:
      "Bold graphic tees, hoodies, and accessories. Shop the drop at RageBait Store.",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
