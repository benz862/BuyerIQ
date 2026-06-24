import { SiteHeader } from "@/components/layout/site-header";

type LegalSection = {
  title: string;
  body?: string[];
  bullets?: string[];
};

type LegalPageProps = {
  eyebrow?: string;
  title: string;
  description: string;
  sections: LegalSection[];
};

export function LegalPage({ eyebrow = "BuyerIQ", title, description, sections }: LegalPageProps) {
  return (
    <div className="flex min-h-full flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-16">
            <p className="text-sm font-medium tracking-wide text-primary uppercase">{eyebrow}</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-balance">{title}</h1>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl space-y-8 px-4 py-12 sm:px-6">
          {sections.map((section) => (
            <article key={section.title} className="rounded-xl border border-border/70 bg-card p-6">
              <h2 className="text-xl font-semibold tracking-tight">{section.title}</h2>
              {section.body?.map((paragraph) => (
                <p key={paragraph} className="mt-3 leading-relaxed text-muted-foreground">
                  {paragraph}
                </p>
              ))}
              {section.bullets && (
                <ul className="mt-4 list-disc space-y-2 pl-5 text-muted-foreground">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
