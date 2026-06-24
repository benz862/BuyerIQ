"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/branding/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  signInWithEmail,
  signInWithGoogle,
  type AuthFormState,
} from "@/lib/actions/auth";

const initialState: AuthFormState = {};

export function LoginForm({
  redirectTo,
  errorMessage,
}: {
  redirectTo?: string;
  errorMessage?: string;
}) {
  const [state, formAction, pending] = useActionState(signInWithEmail, initialState);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-8 px-4 py-12">
      <div className="flex flex-col items-center gap-4 text-center">
        <Logo size="md" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to your BuyerIQ command center
          </p>
        </div>
      </div>

      <form action={formAction} className="space-y-4">
        {redirectTo && <input type="hidden" name="redirect" value={redirectTo} />}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        {(state.error || errorMessage) && (
          <p className="text-sm text-destructive">{state.error ?? errorMessage}</p>
        )}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending && <Loader2 className="animate-spin" />}
          Sign in
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <form action={signInWithGoogle}>
        <Button type="submit" variant="outline" className="w-full">
          Continue with Google
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-primary hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
