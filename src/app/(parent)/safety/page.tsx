import type { Metadata } from "next";
import EmptyState from "@/components/states/EmptyState";

export const metadata: Metadata = {
  title: "Child safety",
  description:
    "How Wanderlearn Stories protects children — COPPA compliance, data minimization, no behavioral tracking.",
};

export default function SafetyPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-20 sm:py-28">
      <EmptyState
        title="Child safety — coming soon"
        description="A plain-language summary of how Wanderlearn Stories protects children: data minimization, verifiable parental consent before any collection, no third-party advertising, no behavioral tracking, and your rights as a parent. Drafting now; the full privacy policy follows after counsel review."
        action={{ label: "Email privacy@witus.online", href: "mailto:privacy@witus.online" }}
      />
    </div>
  );
}
