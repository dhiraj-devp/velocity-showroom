import type { Metadata } from "next";
import { Outfit, Syne } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { EntryRoot } from "@/features/entry/components/EntryRoot";
import { ENTRY_BOOT_SCRIPT } from "@/features/entry/constants";
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
  title: "VELOCITY | The Future of Driving",
  description: "Step inside a new generation of automotive experiences.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${outfit.variable} ${syne.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <script dangerouslySetInnerHTML={{ __html: ENTRY_BOOT_SCRIPT }} />
        <EntryRoot>
          <a
            href="#main"
            className="bg-accent text-background sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[60] focus:px-4 focus:py-2"
          >
            Skip to content
          </a>
          <Header />
          {children}
          <Footer />
        </EntryRoot>
        <div className="noise-overlay" aria-hidden="true" />
      </body>
    </html>
  );
}
