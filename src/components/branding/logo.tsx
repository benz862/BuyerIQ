import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  showTagline?: boolean;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "h-10 w-auto sm:h-11",
  md: "h-14 w-auto sm:h-16",
  lg: "h-32 w-auto sm:h-40 md:h-48",
};

export function Logo({ className, showTagline = false, size = "md" }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn("inline-flex shrink-0 items-center", className)}
    >
      <Image
        src="/buyeriq-logo.png"
        alt="BuyerIQ — Know More. Buy Smarter."
        width={538}
        height={576}
        priority
        className={cn("object-contain object-left", sizeClasses[size])}
      />
      {showTagline && (
        <span className="sr-only">Know More. Buy Smarter.</span>
      )}
    </Link>
  );
}
