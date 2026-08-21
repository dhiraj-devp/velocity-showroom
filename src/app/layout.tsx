import type { Metadata } from "next";
import { Outfit, Syne } from "next/font/google";
import { siteUrl } from "@/lib/siteUrl";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: "VELOCITY | The Future of Driving",
  description: "Step inside a new generation of automotive experiences.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${outfit.variable} ${syne.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased">
        {children}
        <div className="noise-overlay" aria-hidden="true" />
      </body>
    </html>
  );
}
