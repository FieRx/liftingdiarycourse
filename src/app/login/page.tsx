import { SignIn } from "@clerk/nextjs";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirect_url?: string };
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-50 px-4 dark:bg-black">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          You need to log in to access this page
        </h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Sign in to continue to your destination.
        </p>
      </div>
      <SignIn
        forceRedirectUrl={searchParams.redirect_url ?? "/dashboard"}
        routing="hash"
      />
    </div>
  );
}
