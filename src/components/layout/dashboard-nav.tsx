"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  GitCompare,
  Home,
  MessageSquareText,
  Menu,
  UserRound,
} from "lucide-react";
import { Logo } from "@/components/branding/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/actions/properties";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/profile", label: "Buyer Profile", icon: UserRound },
  { href: "/dashboard/properties", label: "Properties", icon: Building2 },
  { href: "/dashboard/questions", label: "Questions", icon: MessageSquareText },
  { href: "/dashboard/compare", label: "Compare", icon: GitCompare },
];

function NavLink({
  href,
  label,
  icon: Icon,
  soon,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  soon?: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const active =
    href === "/dashboard"
      ? pathname === href
      : pathname.startsWith(href);

  if (soon) {
    return (
      <span className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground/70">
        <Icon className="size-4" />
        {label}
        <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide">
          Soon
        </span>
      </span>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
        active
          ? "bg-primary/10 font-medium text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon className="size-4" />
      {label}
    </Link>
  );
}

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-border/60 bg-card/30 md:flex md:flex-col">
        <div className="border-b border-border/60 px-5 py-5">
          <Logo size="sm" />
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>
        <div className="border-t border-border/60 p-3">
          <form action={signOut}>
            <Button variant="ghost" className="w-full justify-start" type="submit">
              Sign out
            </Button>
          </form>
        </div>
      </aside>

      <header className="flex items-center justify-between border-b border-border/60 px-4 py-3 md:hidden">
        <Logo size="sm" />
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="size-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav className="mt-6 flex flex-col gap-1">
              {navItems.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
            </nav>
            <form action={signOut} className="mt-6">
              <Button variant="ghost" className="w-full justify-start" type="submit">
                Sign out
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </header>

      <div className="hidden border-b border-border/60 px-6 py-4 md:block">
        <p className="text-sm text-muted-foreground">
          {navItems.find((item) =>
            item.href === "/dashboard"
              ? pathname === item.href
              : pathname.startsWith(item.href)
          )?.label ?? "Dashboard"}
        </p>
      </div>
    </>
  );
}
