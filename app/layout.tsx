import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import CartToast from "./components/CartToast";
import Footer from "./components/Footer";
import Header from "./components/Header";
import "./globals.css";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TechStore",
  description:
    "Your one stop tech store — gadgets, laptops, phones and more at the best prices.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <Providers>
          <Header />

          <div className="flex flex-1 flex-col">{children}</div>

          <Footer />

          <CartToast />
        </Providers>
      </body>
    </html>
  );
}
