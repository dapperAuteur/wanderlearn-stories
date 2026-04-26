# Performance measurement

Two measurement protocols, one for the chrome (marketing + parent
dashboard), one for the scene (the A-Frame-rendered hubs). Plan 05
sets the budgets; this doc describes how we run the measurements.

## Chrome — Lighthouse CI

The home page, placeholder routes, and (eventually) the parent
dashboard are HTML-rendered surfaces that Lighthouse measures
faithfully. Runs locally and in CI.

### Local run

```bash
pnpm build       # production build (Lighthouse runs against `pnpm start`)
pnpm lhci        # full Lighthouse CI run with budgets
pnpm lhci:open   # open the most recent HTML report
```

`pnpm lhci` runs three Lighthouse iterations per URL and asserts
budgets in `lighthouserc.json`. The `temporary-public-storage`
upload target keeps reports for ~7 days at a public URL — print a
shareable link for the PR.

### Budgets (mobile, simulated Slow 4G + 4× CPU throttle)

Per plan 05's "low-end mobile" column:

| Metric | Threshold | Source |
|--------|-----------|--------|
| Performance score | ≥ 0.80 | Lighthouse aggregate |
| Accessibility score | ≥ 0.95 | Lighthouse aggregate |
| Best practices score | ≥ 0.90 (warn) | Lighthouse aggregate |
| Time to Interactive | ≤ 4000 ms | Plan 05 hard limit |
| Largest Contentful Paint | ≤ 2500 ms | Core Web Vital |
| Cumulative Layout Shift | ≤ 0.1 | Core Web Vital |
| Total Blocking Time | ≤ 300 ms (warn) | Lighthouse |

The thresholds are deliberately strict: failing a budget breaks the
build, not just warns. Move from `error` to `warn` only with a
recorded reason.

### Cold cache requirement

Plan 05 §"Non-budget but related": "Service worker pre-cache" can
mask perf regressions on second load. **Lighthouse runs are always
cold-cache** — Chromium is launched fresh per run, no shared cache
between iterations. The Serwist SW won't activate during Lighthouse
because each run starts in a clean profile.

### CI integration (when Vercel is bootstrapped)

Once preview URLs exist (post-/vercel:bootstrap), update
`lighthouserc.json` to point `collect.url` at the preview URL
instead of `http://localhost:3000`, and remove the
`startServerCommand`. Wire `pnpm lhci` into a GitHub Action that
runs on PR open + every push to a feature branch. The job posts the
report URL as a PR comment.

## Scene — manual on real devices

A-Frame canvas content isn't measured well by Lighthouse:
- LCP isn't meaningful for canvas-rendered scenes.
- CLS doesn't track 3D camera changes.
- TTI assumes JS work plateaus, but our render loop is intentional.

So plan 05's scene-perf protocol is manual:

### Per-PR scene checklist (on the iPhone SE 1st gen rig)

For any PR that touches `src/scene/` or asset URLs in the curriculum
JSON:

1. Deploy to Vercel preview.
2. Open the preview URL on the iPhone SE 1st gen (or BrowserStack
   equivalent).
3. Visit `/alice` and complete Hub 1.
4. Capture `requestAnimationFrame` FPS for 60 seconds in each hub.
   Console snippet to drop in DevTools:
   ```js
   const samples = [];
   let last = performance.now();
   (function tick() {
     const now = performance.now();
     samples.push(1000 / (now - last));
     last = now;
     if (samples.length < 3600) requestAnimationFrame(tick);
     else console.log(`min=${Math.min(...samples).toFixed(1)} ` +
       `mean=${(samples.reduce((a,b)=>a+b)/samples.length).toFixed(1)} ` +
       `p1=${samples.sort((a,b)=>a-b)[Math.floor(samples.length*0.01)].toFixed(1)} FPS`);
   })();
   ```
5. Capture `THREE.WebGLRenderer.info` in DevTools after each hub
   load (draw calls, triangles).
6. Paste numbers into the PR description.

Hard limits per plan 05:
- ≥ 30 FPS sustained
- ≥ 24 FPS on the worst-case 1% lows
- ≤ 50 draw calls per frame
- ≤ 150,000 visible triangles

If anything regresses the budget, the PR doesn't merge.

## What this doesn't cover (yet)

- **JS heap peak** — needs a memory profiler run, not Lighthouse.
- **Total scene texture memory** — requires inspection of the .glb +
  texture atlas, easier as a CI step that parses the asset manifest.
- **Per-hub transferred budget (≤ 12 MB)** — Lighthouse reports
  total bytes transferred but doesn't separate per-hub. Add a custom
  audit when the asset pipeline solidifies.

These get their own measurement scripts when they start mattering
(when real `.glb` and audio assets land — currently the scene is
primitive geometry which doesn't stress these).
