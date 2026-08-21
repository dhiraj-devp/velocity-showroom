"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { MagneticButton } from "@/components/common/MagneticButton";
import { navLinks, primaryCta, SITE_NAME } from "@/constants/navigation";
import { cn } from "@/lib/cn";

export function Header() {
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    function onResize() {
      if (window.matchMedia("(min-width: 1024px)").matches) {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div className="pointer-events-auto relative z-20 flex items-center justify-between px-5 py-5 md:px-10 lg:px-14">
        <Link
          href="/"
          className="font-display text-sm font-semibold tracking-[0.38em] text-foreground"
        >
          {SITE_NAME}
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-9 lg:flex"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[0.7rem] tracking-[0.26em] text-muted uppercase transition-colors duration-200 hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:block">
          <MagneticButton href={primaryCta.href}>{primaryCta.label}</MagneticButton>
        </div>

        <button
          type="button"
          className="relative flex h-11 w-11 items-center justify-center lg:hidden"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          <span
            className={cn(
              "absolute h-px w-5 bg-foreground transition-transform duration-200",
              open ? "translate-y-0 rotate-45" : "-translate-y-1.5",
            )}
          />
          <span
            className={cn(
              "absolute h-px w-5 bg-foreground transition-transform duration-200",
              open ? "translate-y-0 -rotate-45" : "translate-y-1.5",
            )}
          />
        </button>
      </div>

      <div
        id={menuId}
        hidden={!open}
        className="pointer-events-auto fixed inset-0 z-10 bg-background lg:hidden"
      >
        <nav
          aria-label="Mobile"
          className="flex h-dvh flex-col gap-2 px-5 pt-24 pb-16"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="font-display border-b border-border py-5 text-3xl tracking-[-0.03em]"
            >
              {link.label}
            </a>
          ))}
          <a
            href={primaryCta.href}
            onClick={() => setOpen(false)}
            className="mt-8 inline-flex w-fit items-center border border-accent bg-accent px-7 py-3.5 text-[0.7rem] tracking-[0.28em] text-background uppercase"
          >
            {primaryCta.label}
          </a>
        </nav>
      </div>
    </header>
  );
}
