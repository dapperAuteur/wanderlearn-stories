# 06 — Curriculum: Indiana Kindergarten Standards Mapping

Every shipping egg must map to a specific Indiana Academic Standard for
Kindergarten. Eggs that don't map get cut from MVP. "It's a charming
metaphor" is not a curriculum; it's marketing.

Standards drawn from the Indiana Department of Education
*Indiana Academic Standards: Kindergarten* (current adoption).
**Action item:** verify exact codes against the live IDOE PDF before
shipping. Codes below are the working assumption.

## Standard codes referenced

| Code        | Domain                  | Standard summary                                  |
|-------------|-------------------------|---------------------------------------------------|
| K.NS.1      | Math — Number Sense     | Count to 100 by ones and tens.                    |
| K.NS.2      | Math — Number Sense     | Count forward beginning from a given number.      |
| K.NS.4      | Math — Number Sense     | Cardinality: last number named tells how many.    |
| K.CA.1      | Math — Computation/Algebra | Represent addition with objects/fingers/sounds. |
| K.M.1       | Math — Measurement      | Compare two objects by length, height, weight.    |
| K.M.2       | Math — Measurement      | Describe measurable attributes of a single object.|
| K.G.1       | Math — Geometry         | Identify shapes regardless of orientation/size.   |
| K.RL.1      | ELA — Reading: Lit.     | With prompting, ask/answer questions about a text.|
| K.RL.2.2    | ELA — Reading: Lit.     | Retell familiar stories in sequence.              |
| K.RV.1      | ELA — Vocabulary        | Use new words from texts and conversations.       |
| K.PS.1      | Science — Physical Sci. | Plan/conduct investigations of motion of objects. |
| K.SE.1      | Social-Emotional        | Identify and manage emotions; turn-taking.        |

(If any code above is wrong against the live IDOE document, fix it
during the verification pass — but the *structure* of the mapping stands.)

## MVP egg list — keep / cut

The source doc proposed many "Easter Eggs." This list is the MVP-shipping
six (Hub 1 + Hub 2), each defended against a real standard. Everything
else is parked.

### Hub 1 — The Descent (Math focus)

| Egg ID            | Source-doc concept            | Maps to     | Verdict | Reasoning |
|-------------------|-------------------------------|-------------|---------|-----------|
| `h1-clocks-count` | "Floating clocks" → counting  | K.NS.1, K.NS.4 | **KEEP** | Reframe from "gravity" to counting clocks 1–10 as they float past. Real, age-appropriate, audio-deliverable. |
| `h1-bookshelves`  | "Falling bookshelves"         | K.RL.1      | **KEEP** | Reframe from "books are windows to other worlds" (metaphor) to "this book is *Alice in Wonderland* — what's the title? what's on the cover?" Concrete text-feature recognition. |
| `h1-rabbit-pace`  | New                           | K.NS.2      | **KEEP** | The White Rabbit hops past saying numbers; child counts forward from a given number. Replaces "gravity" egg, which is not a K standard. |
| `h1-gravity-fact` | "Gravity is the invisible hug"| —           | **CUT**  | Not a K science standard. K.PS.1 is about *investigating* motion, not memorizing the word "gravity." Move to Tier 2 / Grade 1+. |

### Hub 2 — The Hall of Doors (Measurement + ELA)

| Egg ID              | Source-doc concept               | Maps to       | Verdict | Reasoning |
|---------------------|----------------------------------|---------------|---------|-----------|
| `h2-door-compare`   | "Tiny door vs. Alice"            | K.M.1, K.M.2  | **KEEP** | Direct comparison: shorter / taller. Core K measurement standard. |
| `h2-key-shape`      | "Golden key" + cards (originally Hub 5) | K.G.1   | **KEEP** | The key's bow is a circle; the bit is a rectangle. Identify shapes in a real object regardless of orientation. Pulled from Hub 5 to give Hub 2 a geometry standard. |
| `h2-drink-bigger`   | "Drink Me" bottle                | K.M.1         | **KEEP** | Reframe from "volume/capacity" (1st-grade language) to "Alice is *bigger* now / *smaller* now." Same source-doc moment, K-appropriate framing. |
| `h2-fractions`      | "Drink fractions 1/2, 1/4"       | —             | **CUT**  | Fractions appear in 3rd-grade Indiana standards. Not K. Park for Tier 2. |
| `h2-ph-balance`     | "Acid + Base → neutral purple"   | —             | **CUT**  | Not in K science. Park for Tier 3. |

### Other source-doc eggs explicitly cut from MVP

These all live in `06b-cut-list.md`-style backlog (or just here in the
"future tiers" pile). None ship.

| Source-doc egg                          | Why cut |
|----------------------------------------|---------|
| Caterpillar life-cycle (Hub 3)         | Hub 3 not in MVP. K.LS standards exist for life cycles; revive when Hub 3 ships. |
| Cheshire Cat "five senses"             | Not a real five-senses lesson; was a non-sequitur. Cut entirely. |
| Tea Party 2+2=4                        | Hub 4 not in MVP, but K.CA.1 supports it; revive when Hub 4 ships. |
| Card soldier shapes                    | Pulled into Hub 2 as `h2-key-shape`. Original Hub 5 placement post-MVP. |
| Punnett Square Flowers                 | Middle-school biology. Out of scope at any tier. |
| Food Pyramid producers/consumers       | Middle-school. Out of scope at any tier. |
| Bioluminescent verb-noun-adjective     | Decent ELA idea; needs Tier 2 mechanic. Park. |
| Thermal conduction heat map            | Middle-school. Out of scope at any tier. |
| Color mixing garden                    | Plausible K-art; not in MVP hubs. Park. |
| Vinegar + baking soda reaction         | Out of K standards. Park for Tier 2. |

## Egg authoring checklist

Before adding a new egg to the JSON, the author must answer:

1. Which Indiana standard code does it satisfy? (Specific subcode, not
   just "K.M".)
2. Does the audio narration deliver the standard's verb? ("Identify,"
   "Compare," "Retell.")
3. Can a non-reading 5-year-old complete the interaction without parent
   help? (Tier 1 only — no reading, no clicking targets smaller than the
   child's thumb.)
4. Is the cardImage (if present) culturally appropriate, free of stock
   photography, and either original art or public-domain illustration?

If any answer is "no" or "I'm not sure," the egg doesn't ship.

## Verification pass (before launch)

Before the first marketing push:

- Cross-check every standard code against the current Indiana DOE PDF.
- Have one Indiana-licensed K teacher review the six MVP eggs and sign
  off that the standard mapping is defensible. Pay them. This is not a
  favor; it is a correctness gate.
- File the signed sign-off in `plans/_artifacts/` (create as needed).
