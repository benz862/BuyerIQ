import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto flex min-h-full max-w-xl items-center px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Checkout canceled</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your purchase was not completed. You can return to pricing when ready.
          </p>
          <Button asChild>
            <Link href="/pricing">Back to pricing</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
