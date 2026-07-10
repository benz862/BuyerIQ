import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PropertyEditForm } from "@/components/properties/property-edit-form";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import type { Property } from "@/lib/types/database";

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: property } = await supabase.from("properties").select("*").eq("id", id).eq("user_id", user?.id ?? "").single();
  if (!property) notFound();

  return <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6"><Button variant="ghost" size="sm" asChild><Link href={`/dashboard/properties/${id}`}><ArrowLeft className="size-4" />Back to property</Link></Button><div><h1 className="text-3xl font-semibold tracking-tight">Edit property information</h1><p className="mt-1 text-muted-foreground">Add verified information to improve comparison accuracy. New evidence can raise or lower the score.</p></div><PropertyEditForm property={property as Property} /></div>;
}
