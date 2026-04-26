import type { Metadata } from "next";
import EmptyState from "@/components/states/EmptyState";

export const metadata: Metadata = {
  title: "Terms of service",
  description: "Wanderlearn Stories terms of service.",
};

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-20 sm:py-28">
      <EmptyState
        title="Terms of service — under counsel review"
        description="The terms of service are being finalized by qualified counsel before public launch. The service is intended for children but use is permitted only by a parent or legal guardian on the child's behalf."
        action={{ label: "Back home", href: "/" }}
      />
    </div>
  );
}
