import type { ReactNode } from "react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { AnalyticsProviders } from "@/features/analytics/components/AnalyticsProviders";
import { CompareProvider } from "@/features/compare/components/CompareProvider";
import { EntryRoot } from "@/features/entry/components/EntryRoot";
import { ENTRY_BOOT_SCRIPT } from "@/features/entry/constants";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: ENTRY_BOOT_SCRIPT }} />
      <AnalyticsProviders />
      <EntryRoot>
        <CompareProvider>
          <a
            href="#main"
            className="bg-accent text-background sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[60] focus:px-4 focus:py-2"
          >
            Skip to content
          </a>
          <Header />
          {children}
          <Footer />
        </CompareProvider>
      </EntryRoot>
    </>
  );
}
