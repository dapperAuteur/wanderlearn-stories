import type { Metadata } from "next";
import EmptyState from "@/components/states/EmptyState";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Wanderlearn Stories — 360° public-domain literary worlds for ages 4–7, mapped to Indiana Kindergarten standards.",
};

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-20 sm:py-28">
      <EmptyState
        title="About — coming soon"
        description="Wanderlearn Stories rebuilds public-domain children's books as 360° worlds with kindergarten-readiness curriculum baked in. The full About page is being written; for now, the home page covers the basics."
        action={{ label: "Back home", href: "/" }}
      />
    </div>
  );
}
