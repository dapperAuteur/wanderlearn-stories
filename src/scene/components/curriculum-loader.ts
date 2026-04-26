// A-Frame component: fetches the curriculum payload from the route
// handler, finds the active hub, and spawns one entity per egg with
// the easter-egg component attached.
//
// Per plan 03, the loader is what wires the data layer to the scene
// — the rest of the scene code never reads JSON files directly.

import "aframe";
import type { Curriculum, Egg, Hub } from "@/curriculum/schemas/curriculum";

interface SceneElLike extends HTMLElement {
  curriculum?: Curriculum;
  activeHub?: Hub;
  emit?: (name: string, detail?: unknown) => void;
}

interface LoaderComponent {
  data: { bookId: string; hubId: string };
  el: {
    sceneEl: SceneElLike | null;
  };
}

const subjectColor: Record<Egg["subject"], string> = {
  math: "#C73E5C", // Easter rose
  ela: "#7AC0A4", // mint
  science: "#B89AD6", // lavender
  social: "#E0B85F", // butter
  art: "#7BBAD4", // sky
};

function spawnEgg(scene: SceneElLike, egg: Egg) {
  const entity = document.createElement("a-entity");
  entity.setAttribute("id", egg.eggId);
  entity.setAttribute("position", egg.position.join(" "));

  // Primitive geometry per plan 00 (no custom modeling at MVP).
  if (egg.meshType === "primitive-sphere") {
    entity.setAttribute("geometry", "primitive: sphere; radius: 0.25");
  } else if (egg.meshType === "primitive-cube") {
    entity.setAttribute(
      "geometry",
      "primitive: box; width: 0.4; height: 0.4; depth: 0.4",
    );
  }

  entity.setAttribute(
    "material",
    `color: ${subjectColor[egg.subject]}; metalness: 0.1; roughness: 0.6`,
  );

  // Subtle bob so the egg reads as "alive" without burning frame budget.
  const [x, y, z] = egg.position;
  entity.setAttribute(
    "animation__bob",
    `property: position; dir: alternate; loop: true; from: ${x} ${y} ${z}; to: ${x} ${y + 0.08} ${z}; dur: 2200; easing: easeInOutSine`,
  );

  entity.classList.add("gaze-target");
  entity.setAttribute("easter-egg", `eggId: ${egg.eggId}`);

  scene.appendChild(entity);
}

if (typeof window !== "undefined" && window.AFRAME) {
  window.AFRAME.registerComponent("curriculum-loader", {
    schema: {
      bookId: { type: "string" },
      hubId: { type: "string", default: "h1-descent" },
    },

    async init(this: LoaderComponent) {
      const scene = this.el.sceneEl;
      if (!scene) return;

      try {
        const res = await fetch(`/api/curriculum/${this.data.bookId}`);
        if (!res.ok) {
          console.error("[curriculum-loader] fetch failed", res.status);
          return;
        }
        const curriculum: Curriculum = await res.json();
        const hub = curriculum.hubs.find((h) => h.hubId === this.data.hubId);
        if (!hub) {
          console.error(
            `[curriculum-loader] hub ${this.data.hubId} not in curriculum`,
          );
          return;
        }

        scene.curriculum = curriculum;
        scene.activeHub = hub;

        for (const egg of hub.eggs) {
          spawnEgg(scene, egg);
        }

        scene.emit?.("curriculum-ready", { hub });
      } catch (err) {
        console.error("[curriculum-loader] error", err);
      }
    },
  });
}
