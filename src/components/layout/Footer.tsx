import { CallAction } from "@/features/dealership/components/CallAction";
import { WhatsAppAction } from "@/features/dealership/components/WhatsAppAction";
import { localDealershipRepository } from "@/features/dealership/repository/localDealershipRepository";
import { navLinks } from "@/constants/navigation";

export function Footer() {
  const dealership = localDealershipRepository.get();

  return (
    <footer
      id="about"
      className="border-t border-border px-5 py-12 md:px-10 lg:px-14"
    >
      <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-sm font-semibold tracking-[0.38em]">
            {dealership.name}
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
            A cinematic automotive house. Machines, light, and presence —
            composed for those who expect more than a catalogue.
          </p>
          <p className="mt-4 text-sm text-muted">
            {dealership.address}, {dealership.city}
          </p>
        </div>

        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-8 gap-y-3">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-[0.68rem] tracking-[0.24em] text-muted uppercase transition-colors duration-200 hover:text-foreground"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
        <WhatsAppAction
          dealership={dealership}
          message={`Hello, I would like to speak with ${dealership.name}.`}
        />
        <CallAction dealership={dealership} />
        <a
          href={`mailto:${dealership.email}`}
          className="text-[0.62rem] tracking-[0.22em] text-muted uppercase transition-colors hover:text-foreground"
        >
          {dealership.email}
        </a>
      </div>

      <p className="mt-12 text-[0.65rem] tracking-[0.2em] text-muted uppercase">
        © {new Date().getFullYear()} {dealership.name}. All rights reserved.
      </p>
    </footer>
  );
}
