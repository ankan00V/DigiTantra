import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="main-container flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">404</p>
      <h1 className="mt-3 font-headline text-4xl font-bold tracking-tight text-foreground">Page not found</h1>
      <p className="mt-4 max-w-xl text-muted-foreground">
        The page you requested does not exist or was moved. Return to the homepage to continue.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center rounded-xl border border-primary/40 bg-primary/15 px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/25"
      >
        Go to Home
      </Link>
    </div>
  );
}
