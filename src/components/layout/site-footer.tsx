import Link from "next/link";

const productLinks = [
  { href: "/#features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/#buyer-mode", label: "Buyer Mode" },
  { href: "/#rental-mode", label: "Rental Mode" },
  { href: "/#relocation-mode", label: "Relocation Mode" },
] as const;

const supportLinks = [
  { href: "/contact#support", label: "Contact Support" },
  { href: "/contact#help-center", label: "Help Center" },
  { href: "/contact#faq", label: "Frequently Asked Questions" },
  { href: "/contact#report-problem", label: "Report a Problem" },
] as const;

const legalLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Use" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/refund-policy", label: "Refund Policy" },
] as const;

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { href: string; label: string }[];
}) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <ul className="mt-4 space-y-3 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-muted-foreground transition-colors hover:text-foreground">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 md:grid-cols-4">
        <div>
          <h2 className="text-base font-semibold">BuyerIQ</h2>
          <p className="mt-3 text-sm font-medium text-foreground">
            Smarter Real Estate Decisions.
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Helping buyers, renters, and relocators organize information, identify risks,
            and make more informed decisions.
          </p>
        </div>
        <FooterColumn title="Product" links={productLinks} />
        <FooterColumn title="Support" links={supportLinks} />
        <FooterColumn title="Legal" links={legalLinks} />
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-sm text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between">
          <p>© 2026 Epoxy Dogs LLC, DBA SkillBinder. All Rights Reserved.</p>
          <p>BuyerIQ is a SkillBinder product.</p>
        </div>
      </div>
    </footer>
  );
}
