import type { Metadata } from "next";
import EmptyState from "@/components/states/EmptyState";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "Wanderlearn Stories privacy policy. COPPA-compliant.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-20 sm:py-28">
      <EmptyState
        title="Privacy policy — under counsel review"
        description="Our privacy policy is being finalized by qualified counsel before public launch. Until then: we collect nothing from anonymous visitors, we never collect from children without verifiable parental consent, and we never share with behavioral advertising vendors. Reach privacy@witus.online with questions."
        action={{ label: "Email privacy@witus.online", href: "mailto:privacy@witus.online" }}
      />
    </div>
  );
}
