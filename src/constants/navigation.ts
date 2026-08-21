import { dealership } from "@/features/dealership/data/dealership";

export const SITE_NAME = dealership.name;

export const navLinks = [
  { label: "Experience", href: "/#experience" },
  { label: "Vehicles", href: "/cars" },
  { label: "Showroom", href: "/#showroom" },
  { label: "About", href: "/#about" },
] as const;

export type NavLink = (typeof navLinks)[number];

export const primaryCta = {
  label: "Explore Cars",
  href: "/cars",
} as const;
