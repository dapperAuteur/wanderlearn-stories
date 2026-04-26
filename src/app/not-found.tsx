import type { Metadata } from "next";
import ErrorActions from "@/components/ErrorActions";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20 sm:py-28">
      <p className="text-sm font-medium text-primary tracking-wide uppercase">
        404
      </p>
      <h1 className="mt-3 text-4xl sm:text-5xl font-semibold tracking-tight text-foreground">
        We can&apos;t find that page.
      </h1>
      <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
        The page you tried to open isn&apos;t here. Maybe the link is old,
        or maybe it never existed. Try heading back, or pick something
        from the home page.
      </p>
      <ErrorActions />
    </div>
  );
}
