import type { Metadata } from "next";
import EmptyState from "@/components/states/EmptyState";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Parent sign-in for Wanderlearn Stories. Verifiable parental consent required before any child data is collected.",
};

export default function AccountPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-20 sm:py-28">
      <EmptyState
        title="Sign in — coming soon"
        description="Parent sign-in lands with the COPPA-compliant parent gate. We use email-plus verifiable consent (a magic link to confirm) — no third-party identity providers, no behavioral tracking. Until then, Hub 1 of Alice plays with no account."
        action={{ label: "Try Alice now", href: "/alice" }}
      />
    </div>
  );
}
