import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PropertyForm } from "@/components/properties/property-form";
import { PropertySearchAdd } from "@/components/properties/property-search-add";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function NewPropertyPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/dashboard/properties">
          <ArrowLeft className="size-4" />
          Back to properties
        </Link>
      </Button>

      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Add property</h1>
        <p className="mt-1 text-muted-foreground">
          Search live listings, select a property, and add it to your BuyerIQ property list.
        </p>
      </div>

      <PropertySearchAdd />

      <Card>
        <CardHeader>
          <CardTitle>Manual entry</CardTitle>
        </CardHeader>
        <CardContent>
          <PropertyForm />
        </CardContent>
      </Card>
    </div>
  );
}
