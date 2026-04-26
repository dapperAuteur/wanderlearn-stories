# public/assets/audio/alice/

Drop audio narration files here. The seed JSON in
`src/curriculum/alice/*.json` references these paths verbatim, so the
filenames matter.

## Expected files

### Hub-level narration (plays after the user clicks "Begin")

- `hub-1-narration.ogg` — chapter 1 / The Descent intro narration.
  Quoted line: "Down, down, down. Would the fall never come to an end?"
- `hub-2-narration.ogg` — chapters 1–2 / The Hall of Doors intro.
  Quoted line: "There were doors all round the hall, but they were
  all locked."

### Per-egg narration (plays when the egg is gazed/clicked)

Hub 1:
- `h1-clocks-count.ogg`
- `h1-bookshelves.ogg`
- `h1-rabbit-pace.ogg`

Hub 2:
- `h2-door-compare.ogg`
- `h2-key-shape.ogg`
- `h2-drink-bigger.ogg`

## Format guidelines (plan 02 + plan 05)

- **Codec:** `.ogg` (Vorbis) primary; `.mp3` fallback if a browser
  doesn't decode `.ogg`.
- **Sample rate:** 22.05 kHz mono. Plan 05 explicitly sets this; full
  44.1 kHz stereo blows the per-hub transfer budget.
- **Bitrate:** 64–96 kbps. Voice doesn't need more.
- **Length:** ≤ 12 s per egg (plan 01); hub narration up to ~30 s.
- **Loudness:** normalize to ≈ -14 LUFS so audio levels are
  consistent across eggs.
- **No fabricated voices.** Plan 02 / 03: human narration only,
  matching the WitUS umbrella's no-AI-voice rule even though the
  *worlds* are synthetic.

## Captions

Every audio clip needs a transcript for VoiceOver / TalkBack
accessibility. Captions live in the curriculum JSON `cardBody`
field; keep that text in sync with what's actually said.

## File hosting at scale

For MVP this directory is fine. As the asset pipeline grows
(multiple books × multiple hubs × multiple texture LODs for images),
move to Cloudinary (plan 02) and update the JSON paths to absolute
`https://res.cloudinary.com/...` URLs. The schema accepts both.
