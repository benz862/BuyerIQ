import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="flex min-h-full flex-col justify-center bg-muted/20">
      <LoginForm
        redirectTo={params.redirect}
        errorMessage={params.error}
      />
    </main>
  );
}
