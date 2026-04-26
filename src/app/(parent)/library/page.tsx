import type { Metadata } from "next";
import EmptyState from "@/components/states/EmptyState";

export const metadata: Metadata = {
  title: "Library",
  description:
    "Browse Wanderlearn Stories' public-domain literary worlds.",
};

export default function LibraryPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-20 sm:py-28">
      <EmptyState
        title="Library — coming soon"
        description="One book is playable today: Alice's Adventures in Wonderland. The full library view, with hub previews and progress per child, ships with the parent dashboard."
        action={{ label: "Try Alice now", href: "/alice" }}
      />
    </div>
  );
}
