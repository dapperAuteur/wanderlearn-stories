// A-Frame component attached to each egg entity by the curriculum
// loader. Listens for click (which A-Frame fires after a fused gaze
// or an actual mouse/tap), picks the Tier 1 interaction, plays its
// audio, dispatches the overlay event, and persists progress.
//
// The component is deliberately tier-agnostic in shape, even though
// only Tier 1 is implemented at MVP — adding Tier 2/3 later means a
// new case here, not a refactor of the dispatch site (plan 03).

import "aframe";
import type { Hub, Interaction } from "@/curriculum/schemas/curriculum";
import { markEggComplete } from "../lib/progress";

interface EggComponent {
  data: { eggId: string };
  el: HTMLElement & { sceneEl?: { activeHub?: Hub } | null };
  completed: boolean;
  handleTrigger: () => void;
}

function pickInteraction(interactions: Interaction[]): Interaction | undefined {
  // MVP: Tier 1 only. Falls through gracefully if a non-Tier-1 ever ships.
  return (
    interactions.find((i) => i.tier === 1) ??
    interactions.find((i) => i.tier === 2) ??
    interactions.find((i) => i.tier === 3)
  );
}

if (typeof window !== "undefined" && window.AFRAME) {
  window.AFRAME.registerComponent("easter-egg", {
    schema: { eggId: { type: "string" } },

    init(this: EggComponent) {
      this.completed = false;
      this.handleTrigger = this.handleTrigger.bind(this);
      this.el.addEventListener("click", this.handleTrigger);
    },

    remove(this: EggComponent) {
      this.el.removeEventListener("click", this.handleTrigger);
    },

    handleTrigger(this: EggComponent) {
      if (this.completed) return;

      const hub = this.el.sceneEl?.activeHub;
      const egg = hub?.eggs.find((e) => e.eggId === this.data.eggId);
      if (!egg) return;

      const interaction = pickInteraction(egg.interactions);
      if (!interaction || interaction.tier !== 1) return;

      // Play audio best-effort. Cloudinary URLs are placeholders at
      // this stage; 404s are expected until plan-10 §D2 lands real assets.
      const audio = new Audio(interaction.audioUrl);
      audio.play().catch(() => undefined);

      // Tell the React overlay island what to render.
      document.dispatchEvent(
        new CustomEvent("wls:overlay-show", {
          detail: {
            eggId: egg.eggId,
            title: interaction.cardTitle,
            body: interaction.cardBody,
            imageUrl: interaction.cardImageUrl,
            standards: egg.standards,
          },
        }),
      );

      this.completed = true;
      this.el.setAttribute(
        "material",
        "color: #B8B0A4; metalness: 0; roughness: 0.9",
      );

      markEggComplete(this.data.eggId).catch((err) =>
        console.error("[easter-egg] progress write failed", err),
      );
    },
  });
}
