# 05 — Performance Budget (Older Devices)

The source doc's budget assumed a current flagship phone. That's wrong
for the audience: kids' devices skew old, hand-me-down, and budget
Android. This budget is sized to the worst representative device we
intend to support, not the best one we'd like to.

## Reference devices (must run at target FPS)

| Device                       | Year | RAM   | GPU class            | Why included                       |
|------------------------------|------|-------|----------------------|------------------------------------|
| iPhone SE (1st gen)          | 2016 | 2 GB  | A9 / PowerVR GT7600  | Common parent hand-me-down         |
| iPhone SE (2nd gen)          | 2020 | 3 GB  | A13 / Apple GPU      | Common parent hand-me-down         |
| Amazon Fire HD 8 (10th gen)  | 2020 | 2 GB  | Mali-G52 MP3         | Cheap kids' tablet ($89 retail)    |
| Samsung Galaxy Tab A7 Lite   | 2021 | 3 GB  | PowerVR GE8320       | Cheap kids' tablet (~$160)         |

If the experience does not run on **iPhone SE 1st gen** at the target
frame rate, it does not ship.

## Hard limits

| Metric                   | Mobile (low-end) | Mobile (mid)   | Desktop  |
|--------------------------|------------------|----------------|----------|
| **Frame rate (sustained)** | ≥ 30 FPS       | ≥ 60 FPS       | ≥ 60 FPS |
| **Frame rate (worst case 1% lows)** | ≥ 24 FPS | ≥ 45 FPS    | ≥ 55 FPS |
| **Draw calls / frame**   | ≤ 50             | ≤ 100          | ≤ 250    |
| **Visible triangles**    | ≤ 150,000        | ≤ 500,000      | ≤ 1.5M   |
| **Texture max size**     | 1024 px (rare 2048 hero) | 2048 px (rare 4096) | 4096 px |
| **Total scene texture memory** | ≤ 96 MB    | ≤ 256 MB       | ≤ 512 MB |
| **JS heap (peak)**       | ≤ 350 MB         | ≤ 700 MB       | ≤ 1.2 GB |
| **Total transferred**    | ≤ 12 MB / hub    | ≤ 25 MB / hub  | ≤ 60 MB / hub |
| **Time to interactive (Slow 4G, low-end)** | ≤ 4 s | ≤ 3 s     | ≤ 2 s    |

The "low-end" column is the gate. The two iPhone SE generations and the
Fire HD 8 must hit it. The "mid" column is for current mid-range Androids.

## What this changes vs. the source doc

- FPS target on mobile drops from a flat 60 → tiered (30 low-end, 60 mid).
- Draw call ceiling on mobile drops from 100 → 50 for low-end. This is
  the single biggest constraint and dictates merging meshes into atlases.
- Texture size drops from 1024 default → still 1024, but with a hard
  total-memory ceiling that the source doc didn't have.
- New JS heap ceiling. iOS Safari OOMs around 1 GB; we leave 65 % of
  that as headroom for the system.
- Total transferred per hub is new. Kids on cellular hot-spots can't
  load 50 MB scenes.

## Mandatory techniques

1. **`.glb` with Draco mesh compression + KTX2 (BasisU) textures.** Both
   on every shipping asset. No `.png` textures in the runtime path.
2. **Baked lighting only.** No real-time lights, no real-time shadows,
   no shadow maps. All shadows painted into the diffuse texture.
3. **Mesh atlasing.** One material per hub where possible. The Hall of
   Doors should be 1 draw call for the architecture + 1 per egg.
4. **Object pooling.** Eggs, particles, and any spawned entity comes
   from a pool created at scene init. No `document.createElement` inside
   the A-Frame `tick`.
5. **Texture LODs.** Each texture ships at three sizes (256, 512, 1024).
   The runtime picks based on `devicePixelRatio` × `screen.width`.
6. **Instanced rendering** (Three.js `InstancedMesh`) for repeated
   geometry — e.g., the falling clocks in Hub 1.
7. **Audio: 22.05 kHz mono `.ogg`** with `.mp3` fallback. Narration
   chunks are streamed, not preloaded.

## Forbidden at MVP

- Postprocessing effects (bloom, DoF, motion blur, AA beyond MSAA 2x).
- Per-pixel real-time lighting.
- Particle systems beyond a single billboard glow shader on eggs.
- Cubemap reflections / probes.
- Animated rigged characters. Cheshire Cat is a 2D billboard or simple
  shape-keyed sprite, not a skeletal model.

## Measurement protocol

Every PR that touches scene assets or scene code must include:

- A Lighthouse mobile run on the preview URL (Slow 4G, mid-tier CPU
  throttle 4x). Score artifacted into the PR.
- A manual run on the iPhone SE 1st gen rig (or BrowserStack equivalent),
  with `requestAnimationFrame` FPS logged for 60 s in each hub.
- A WebGL stats snapshot (`THREE.WebGLRenderer.info`) after each hub
  load, posted as a PR comment.

If any of those regress the budget, the PR doesn't merge.

## Non-budget but related

- **Service worker pre-cache** of `.glb` + audio after first load so
  re-entry is instant and offline-tolerant. Serwist matches Wanderlearn
  classic.
- **Splash → consent → loading-screen sequence** must total ≤ 6 s on
  low-end with cold cache, including the parent gate.
