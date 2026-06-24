import { DashboardNav } from "@/components/layout/dashboard-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col md:flex-row">
      <DashboardNav />
      <main className="flex-1 bg-muted/10">{children}</main>
    </div>
  );
}
