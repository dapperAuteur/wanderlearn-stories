import type { Metadata } from "next";
import EmptyState from "@/components/states/EmptyState";

export const metadata: Metadata = {
  title: "Parent dashboard",
  description:
    "Track your child's progress, manage consent, and review collected data.",
};

export default function DashboardPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-20 sm:py-28">
      <EmptyState
        title="Parent dashboard — coming soon"
        description="The dashboard will show which Indiana K standards your child has been exposed to, their FlashLearn-AI mastery, and your COPPA controls (review, export, delete, refuse further). Sign-in lands when the parent gate is built."
        action={{ label: "Back home", href: "/" }}
      />
    </div>
  );
}
