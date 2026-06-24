import { Info } from "lucide-react";

type WhyWeAskProps = {
  why: string;
  how: string;
  optional?: boolean;
};

export function WhyWeAsk({ why, how, optional = true }: WhyWeAskProps) {
  return (
    <details className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2 text-sm">
      <summary className="flex cursor-pointer list-none items-center gap-2 font-medium text-foreground">
        <Info className="size-4 text-primary" />
        Why We Ask
      </summary>
      <div className="mt-3 grid gap-3 text-muted-foreground">
        <div>
          <p className="font-medium text-foreground">Why This Matters</p>
          <p className="mt-1">{why}</p>
        </div>
        <div>
          <p className="font-medium text-foreground">How BuyerIQ Uses The Information</p>
          <p className="mt-1">{how}</p>
        </div>
        <div>
          <p className="font-medium text-foreground">Can I Skip It?</p>
          <p className="mt-1">{optional ? "Yes. This question is optional." : "No. This is required to use this feature."}</p>
        </div>
      </div>
    </details>
  );
}

export function PrivacyCommitment() {
  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
      <p className="font-medium text-foreground">Privacy Commitment</p>
      <p className="mt-2">
        BuyerIQ uses your information only to personalize recommendations, reports,
        and property analysis. BuyerIQ does not sell personal information to
        advertisers, brokers, agents, landlords, property managers, or third parties.
      </p>
    </div>
  );
}
