# Archive

Historical reference. **Not authoritative.** The authoritative spec for
Wanderlearn Stories is the parent [plans/](../README.md) directory.

## Contents

| File                            | What it was                                                                 |
|---------------------------------|-----------------------------------------------------------------------------|
| `source-doc-v2.md`              | Original product spec mixed with Gemini Gem authoring artifacts.            |
| `gemini-code-instructions.md`   | The Gem's own role-prompt — "Sole Code Writer" persona.                     |

## Why these are archived, not deleted

- They show the design's history, including assumptions (Unity, Firebase,
  middle-school content for kindergarten, "Sole Code Writer" persona)
  that the plans now explicitly reject.
- Cross-references in the plans (especially [09-source-doc-cleanup.md](../09-source-doc-cleanup.md))
  point at specific sections of these docs.

## Why they aren't in `plans/` proper

- Mixing tool-authoring instructions with product spec is what produced
  the contradictions in the first place. Keeping them in a sub-directory
  prevents them from being read as current spec.
- Future readers (or future Claude sessions) will see the `_archive/`
  prefix and know not to treat the contents as authoritative.

If a fresh contributor wants to understand "where this product came
from," start with [11-conversation-handoff.md](../11-conversation-handoff.md),
not these.
