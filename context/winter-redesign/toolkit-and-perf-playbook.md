# Toolkit + Perf Playbook (Winter redesign, final quality/perf waves)

Written 2026-10-30. Hand this to every agent in the audit/perf waves. Ground rules: **visuals must not get worse**, **measure before and after every change**, and **don't add deps to the app's package.json just for tooling**. Use npx or the global installs below.

---

## 1. What's installed and how to use it

### Skills (in `~/.claude/skills`, pinned copies, each folder has a `.provenance` file with repo + commit)

These loaded live in the installing session. Any session started before 2026-10-30 ~19:20 needs a **Claude Code restart** to see them.

| Skill | Source @ commit | Use it for |
|---|---|---|
| `web-quality-audit` | addyosmani/web-quality-skills @ afa8da9 | Whole-site audit (perf, a11y, SEO, best practices). `scripts/analyze.sh <out/>` is a read-only HTML linter (needs jq, which is present). |
| `performance` | same | Loading perf: bundles, images, fonts, caching. |
| `core-web-vitals` | same | LCP/INP/CLS fixes, plus Speculation Rules guidance. |
| `accessibility` | same | WCAG 2.2 pass. Pair with the reduced-motion work. |
| `best-practices`, `seo` | same | Security headers, meta/OG/structured data for the festival. |
| `animation-performance` | emilkowalski/skills @ a81dbca | Jank diagnosis: composite-only props, blur cost (Safari), will-change, rAF vs CSS/WAAPI, React re-render per frame. **Start here for every "it stutters" report.** |
| `review-animations` | same | Critique existing motion against standards (STANDARDS.md). |
| `improve-animations` | same | Read-only codebase motion audit that outputs prioritized plans for other agents. Good first task for the motion wave. |
| `animate` | same | Building new motion (e.g. the themed preloader). |
| `break-ui` | same | Worst-case data stress test (long artist names, missing fields, non-Latin). |
| `vercel-react-best-practices` | vercel-labs/agent-skills @ 1a2c79d | React/Next perf rules (bundle-conditional, bundle-preload, idle callback, re-render rules). Ignore the server/RSC data-fetch rules, since this is a static export. |
| `web-design-guidelines` | **vendored** snapshot of vercel-labs/web-interface-guidelines `command.md` @ 434b7f9 | file:line UI review (a11y, focus, animation, images, perf). The upstream skill WebFetches unpinned `main` on every run, so I vendored a fixed copy instead. |
| `webapp-testing` | anthropics/skills @ ca45fc4 | Playwright scripting patterns plus `scripts/with_server.py`, which starts a server, runs a script and tears both down. Python Playwright 1.60 is installed for it (see below). |

Already present before this pass: `impeccable`, `unslop`, `frontend-design`, `gsap-skills:*` (use `gsap-performance` with `animation-performance`), `find-skills`, `skill-creator`, the chrome-devtools MCP (it has `performance_start_trace` / `performance_analyze_insight` / `lighthouse_audit` / `take_heapsnapshot`), chrome-devtools-axi and lavish-axi.

### CLI tools

| Tool | Version | Invoke |
|---|---|---|
| Lighthouse | 12.8.2 (global npm) | `lighthouse http://localhost:3000/ --preset=desktop --no-enable-error-reporting --output=json --output=html --output-path=./lh` (mobile is the default; drop `--preset`). Always pass `--no-enable-error-reporting`. |
| Unlighthouse (multi-page) | 0.19.1 via npx, not installed | `npx --yes unlighthouse@0.19.1 --site http://localhost:3000 --no-cache` scans every route into a dashboard. The site has few routes, so a Lighthouse loop over `/`, `/lab/` and the artist pages is fine too. |
| Lighthouse CI | @lhci/cli 0.15.1 via npx | `npx --yes @lhci/cli@0.15.1 autorun --collect.staticDistDir=agape-festival/out --collect.numberOfRuns=3 --upload.target=filesystem` gives median-of-3 numbers, which beats single runs. Never use `temporary-public-storage`, because it uploads reports to Google. |
| Playwright (Node) | @playwright/test 1.64.1 in `~/.cache/pw-tools` (NOT the app) | Browsers: WebKit 27.2 (webkit-2370), Chromium 156. Run scripts with `node script.mjs` importing `/Users/jaredbeguelin/.cache/pw-tools/node_modules/playwright/index.mjs`, or `cd ~/.cache/pw-tools && npx playwright test --config <abs path>`. |
| Playwright (Python) | 1.60.0 (user site-packages) | WebKit 26.4 (webkit-2287) + Chromium. For the `webapp-testing` skill: `python3 -E script.py` (use `-E`, not `-I`, because user site-packages must load). |
| pyftsubset (fonttools 4.60.2 + brotli) | `~/Library/Python/3.9/bin/pyftsubset` (not on PATH) | `~/Library/Python/3.9/bin/pyftsubset in.ttf --text-file=glyphs.txt --flavor=woff2 --layout-features='*' --output-file=out.woff2` |
| svgo | 4.0.0 (global npm) | `svgo -f public/assets/... -o /tmp/out --multipass`. Check visually: svgo can break filters/masks in fancy HUD SVGs. |
| avifenc / cwebp | homebrew | `avifenc -q 60 -s 4 in.png out.avif`, `cwebp -q 80 in.png -o out.webp` |
| sharp-cli | 5.3.0 via npx | `npx --yes sharp-cli@5 -i in.png -o out.avif -f avif -q 55`. AVIF output verified working. |
| ffmpeg | homebrew, has **libsvtav1, libvpx-vp9, libx265**, libx264 | Recipes in section 3. |
| Next bundle analyzer | built in to Next 16.1 | `cd agape-festival && npx next experimental-analyze -o` (Turbopack-native, no dep needed). Drop `-o` to get the web UI on :4000. **Coordinate first**: it writes into `.next/`, so don't run it while another agent's build is mid-flight. `@next/bundle-analyzer` is webpack-only and needs a config change, so skip it. |

Telemetry: `next telemetry disable` has been run (global config). Playwright, svgo, fonttools and sharp have no telemetry. Lighthouse error reporting is opt-in, but pass the flag anyway.

### Useful facts already measured
- Initial JS is reasonable. The **855 KB chunk is three.js/R3F, and it is not referenced by any HTML page**, so it's lazy. Keep it that way: no static import of `three` in anything on the initial route.
- **framer-motion: zero imports in `src/`.** It's a dead dependency. Remove it from package.json; it's safe and costs no visuals.
- `out/_next/static/chunks/*.js.map` files are being emitted into the deploy. They're harmless for users but publish the source; consider dropping them from the deploy.
- `bg/desktop.mp4` is 13.9 MB, **1280x2276 portrait** h264 at 5.5 Mbps, 20 s, 30 fps. `videos/winter-kobosil.mp4` is 11 MB, 1440x1080 h264 at 5.6 Mbps, 15.6 s, 25 fps. `bg/frames/` holds 151 WebP files at 720x1280, 4.8 MB total.
- Fonts come through `next/font` (Orbitron, Outfit, local ChonkyPixels). Body fonts already have `preload: false`. Only the hero still is preloaded as LCP (`src/app/page.tsx`). That setup is good; don't regress it.

---

## 2. McMaster-Carr: what they actually do (verified 2026-10-30)

Sources: [Wes Bos tip + video](https://wesbos.com/tip/why-is-this-website-so-fast) ([video](https://youtube.com/watch?v=-Ln-8QM8KhQ)), [dev.to breakdown](https://dev.to/svsharma/the-surprising-tech-behind-mcmaster-carrs-blazing-fast-website-speed-bfc), [aresluna](https://www.unsung.aresluna.org/everything-possible-to-make-this-website-as-fast-as-they-can/), plus a curl of the live site.

1. **Server-rendered HTML** (ASP.NET `.aspx`): content arrives in the first response, about 81 KB. *We already have this via static export.*
2. **Cacheable page frame plus a small dynamic fetch**: the frame is cacheable, and per-user bits come from `ShellDynamic.aspx` (preloaded `as=fetch`). *Equivalent: fully static HTML, and any live data (ticket status) fetched after paint.*
3. **Prefetch on hover**: the next page's HTML is fetched when you hover a link.
4. **pushState swaps**: pages are swapped without a full reload. *Next `<Link>` already does this.*
5. **Inlined critical CSS** (a single inline `<style>`, about 48 KB); the rest loads later. *We have `experimental.inlineCss`.*
6. **CSS image sprites**: one PNG per category, sliced with fixed 60 px `background-position` steps.
7. **Fixed image dimensions**, so there's zero layout shift.
8. **dns-prefetch / preload**: image and static hosts are prefetched; the logo SVG, 3 woff2 fonts and the homepage sprites are preloaded.
9. **CDN plus immutable caching**: `max-age=31536000, immutable` on versioned asset URLs, and the HTML is `no-cache`.
10. **JS after first paint**: bundles are injected after render, with modern and legacy bundles split. (The bundles aren't small; about 3.8 MB is the largest. Speed comes from ordering, not from having little JS.)
11. **`performance.mark` instrumentation** throughout, so they measure everything.
12. Folklore that didn't check out: "system fonts only" (they preload 3 web fonts) and "old YUI/jQuery only" (they also have modern component code). There's a service-worker kill switch, but no active SW was found.

**The lesson:** they don't win by being tiny. They win on **request count, ordering, cacheability and zero reflow**. All of those are compatible with a maximalist site.

---

## 3. Perf playbook, ranked by expected impact vs visual risk

Legend: Impact H/M/L · Visual risk None/Low/Med. Do them in this order. Re-run Lighthouse (median of 3, mobile + desktop) plus a WebKit Playwright smoke test after each one.

### Tier 1: big wins, no visual change

**1. Re-encode the heavy videos (H / None-Low).** 25 MB of h264 is the single biggest byte cost.
- Mobile/portrait bg (`desktop.mp4` is portrait 1280x2276): make a 720x1280 variant. Serve AV1 first, with an h264 fallback via `<source type>`:
  `ffmpeg -i desktop.mp4 -vf scale=720:-2 -c:v libsvtav1 -crf 38 -preset 6 -g 30 -pix_fmt yuv420p10le -an -movflags +faststart bg-720.av1.mp4`
  `ffmpeg -i desktop.mp4 -vf scale=720:-2 -c:v libx264 -crf 26 -preset slow -profile:v high -pix_fmt yuv420p -g 30 -an -movflags +faststart bg-720.h264.mp4`
- **If the video is scroll-scrubbed via `currentTime`, keep a short GOP (`-g 15..30`) or seeking stutters.** Seek smoothness matters more than size here. Test scrubbing in WebKit before you ship. Safari plays AV1 only on M3+/A17+ hardware, so the h264 fallback is mandatory.
- `winter-kobosil.mp4` (11 MB): same recipe at 1280 wide, plus a 720 wide variant for `(max-width: 768px)`. Target 2-3 MB mobile / 4-5 MB desktop. Strip audio (`-an`) if it's muted.
- Compare first frame and mid frame of old vs new at 100% zoom before you swap.

**2. Pack the 151 bg WebP frames into sprite sheets (H on request count / None).** This is the McMaster sprite trick applied to frame sequences. 151 requests become about 8-10. Example: tile 16 frames per sheet (4x4 at 720x1280, which makes a 2880x5120 sheet, within WebKit's 16384 px canvas/texture limits; keep sheets ≤ 4096 x 8192 to be safe on iOS memory). Draw with `ctx.drawImage(sheet, sx, sy, 720, 1280, ...)`. Decode once with `createImageBitmap`. Load the first sheet eagerly and the rest on idle. Encode the sheets with cwebp `-q 80` (or AVIF, if decoding speed holds up on mid-range Android). Caveat: decoding one big sheet costs more peak memory than one frame, so release the bitmaps of sheets that are far away. **Lower-risk alternative:** keep individual frames but serve them from an HTTP/2 CDN with immutable caching (Cloudflare does this). Request count matters less on H2, so measure it before rebuilding the loader.

**3. Immutable caching headers on Cloudflare Pages (H on repeat visits / None).** Add `public/_headers`:
```
/_next/static/*
  Cache-Control: public, max-age=31536000, immutable
/assets/*
  Cache-Control: public, max-age=2592000, stale-while-revalidate=86400
```
Assets aren't content-hashed, so don't make them immutable unless you version them (`?v=` or hashed filenames). Check what GitHub Pages (the live main site) does: `_headers` only works on CF Pages.

**4. Remove dead deps and keep three.js lazy (M / None).** Drop `framer-motion` (unused). Check that `@react-three/*` and `three` only come in through `next/dynamic` / dynamic `import()`. Run `npx next experimental-analyze -o` before and after.

**5. Preload ordering audit (M-H on LCP / None).** One high-priority hero image (already done), the display font only if it's above the fold, and nothing else in `<head>` at `fetchpriority=high`. Bg video: `preload="metadata"` plus a poster (posters exist: `poster-desktop.webp` 78 KB, `poster-mobile.webp` 31 KB). Start the video download after LCP (`requestIdleCallback` or the `load` event). Use the Lighthouse "LCP request discovery" and "network dependency tree" insights to verify.

### Tier 2: good wins, low risk

**6. Speculative idle loading of below-fold media (M / None).** After `load` plus `requestIdleCallback`, warm the next section's assets. Use `IntersectionObserver` with a generous `rootMargin` (for example `100% 0px`) to start fetching section media a screen ahead, McMaster-style, then hover/touchstart prefetch for artist tiles → artist page/video poster. For routes, add Speculation Rules to the static HTML (`<script type="speculationrules">{"prerender":[{"where":{"href_matches":"/artists/*"},"eagerness":"moderate"}]}</script>`), which does hover prefetch in Chromium for free. Safari ignores it harmlessly. Gate any side effects on `document.prerendering`.

**7. Themed preloader that warms caches without hurting LCP (M / Low).** Rules: (a) the hero still must still paint as LCP, so the preloader is an **overlay drawn over already-rendered HTML** (CSS-only, inline SVG, no JS needed to show it) and never a blank page that hides content; (b) cap it at about 1.2-1.5 s or first-sheet-ready, whichever comes first, and skip it on repeat visits (`sessionStorage` flag in try/catch) and under `prefers-reduced-motion`; (c) while it plays, warm the first frame sheet, the bg video's first bytes and the fonts. A HUD "LOADING / ROUND 1" bar driven by real progress fits the fighting-game theme. Note that Lighthouse measures LCP on the largest element, so an overlay that is opaque and large can *become* the LCP element. Keep the overlay's main element as text or a small SVG, or fade out the overlay before about 2 s. Use the `animate` skill for the motion design.

**8. AVIF + responsive srcset for stills (M / Low).** Hero, flyer, artist portraits, OG: generate AVIF (q≈50-60) plus WebP fallback via `<picture>`, at 2-3 widths (640/1080/1600). `images.unoptimized: true` means there's no Next image pipeline, so you write the `<picture>` yourself. Check dark gradients and neon edges for AVIF banding at 100% zoom. Bump quality if they band.

**9. `content-visibility: auto` on heavy below-fold sections (M on render / Low).** Add `contain-intrinsic-size: auto 1200px`. **Never put it on anything a ScrollTrigger pins or measures**: it breaks `start`/`end` math and pin spacing. After adding it, call `ScrollTrigger.refresh()` and test. Good candidates: footer, FAQ, lineup grid (if it isn't pinned).

**10. Font subsetting (L-M / None).** Orbitron/Outfit go through `next/font/google`, which already subsets to `latin`. Add `display: "swap"`, and check `adjustFontFallback` to stop CLS. For local ChonkyPixels (6.8 KB woff2) the gain is negligible; skip it. Subset only if you add a big display font: `pyftsubset` with `--text` set to the used strings (uppercase HUD labels + digits + punctuation).

### Tier 3: polish

**11. Sprite atlas / inline SVG for small UI images (L-M / None).** Icons, HUD corner brackets and small logos under about 2 KB: inline them as SVG in JSX (zero requests). Artist tile thumbnails (if there are many small rasters): one AVIF/WebP atlas with fixed cell size and `background-position`, exactly the McMaster pattern. It's only worth it with more than about 15 tiles visible at once.

**12. Service worker precache for repeat visits (M on repeat / Med on correctness).** It's only worth it if fans come back repeatedly (lineup drops, set times). Use a hand-written SW of about 40 lines (cache-first for `/_next/static/*` and versioned `/assets/*`, network-first for HTML) and include a kill switch (`/sw.js` that unregisters, like McMaster). Risk: stale HTML after deploys. **Do this last, or not at all, before the festival.** Immutable headers (#3) get you 80% of the benefit with zero risk.

**13. dns-prefetch / preconnect (L / None).** Only for third-party origins actually used above the fold (ticketing widget, Shopify). Self-hosted next/font needs none.

**14. `performance.mark` instrumentation (L / None).** Add marks around preloader start/end, first-sheet-decoded and video-ready, so you can see them in DevTools traces.

---

## 4. Animation smoothness audit recipe

1. **Trace**: chrome-devtools MCP → `performance_start_trace` (reload + scroll through the full page) → `performance_stop_trace` → `performance_analyze_insight`. Look for long tasks over 50 ms during scroll, "Recalculate Style" / "Layout" inside ScrollTrigger callbacks (layout thrash), and paint storms.
2. **CPU throttle 4x + mobile viewport**: `emulate` before tracing. The MacBook is the least representative device.
3. **Layers**: run DevTools Layers / "Rendering → Layer borders" manually. Too many `will-change` layers costs GPU memory, which is the main risk on iOS Safari.
4. **Hot spots to grep for**: animated `filter: blur()` over 20 px (Safari kills it), `backdrop-filter` on scrolling elements, animated `box-shadow`, `transition: all`, React `setState` inside ScrollTrigger `onUpdate` (write to refs/styles instead), `mix-blend-mode` over video.
5. **Frame-rate probe** (works in Chromium and WebKit via Playwright): inject a rAF loop that records frame deltas while `page.mouse.wheel` scrolls, then report p50/p95 frame time and the count of frames over 33 ms. WebKit headless timing is indicative only; confirm on a real iPhone.
6. Load skills `animation-performance` + `gsap-skills:gsap-performance`, and run `improve-animations` for a prioritized plan.

## 5. Safari/WebKit QA recipe (Playwright)

```js
// save anywhere outside the app, run: node wk-smoke.mjs
import { webkit, chromium, devices } from '/Users/jaredbeguelin/.cache/pw-tools/node_modules/playwright/index.mjs';
const URL = process.env.URL ?? 'http://localhost:3000/';
for (const [bt, dev] of [[webkit, devices['iPhone 15 Pro']], [webkit, devices['Desktop Safari']], [chromium, devices['Pixel 7']]]) {
  const b = await bt.launch(); const ctx = await b.newContext({ ...dev }); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto(URL, { waitUntil: 'networkidle' });
  for (let i = 0; i < 12; i++) { await p.mouse.wheel(0, 900); await p.waitForTimeout(250); }
  await p.screenshot({ path: `shot-${bt.name()}-${dev.viewport.width}.png`, fullPage: false });
  console.log(bt.name(), dev.viewport.width, errs.length ? errs : 'no errors'); await b.close();
}
```
Things to check in WebKit specifically: video `autoplay muted playsinline` start, `currentTime` scrubbing smoothness, `100vh` vs `100dvh`/`svh` jumps when the URL bar collapses, canvas size limits (sprite sheets), AVIF/AV1 fallback paths, `backdrop-filter` (needs `-webkit-` prefix in older Safari), and the `scrollbar-gutter`/overscroll bounce interacting with ScrollTrigger pins (`ScrollTrigger.normalizeScroll` is a last resort). Serve the static build with `npx --yes serve@14 agape-festival/out -l 3000` to test the real export.

---

## 6. Rejected / skipped, and why

- **vercel-labs `web-design-guidelines` as published**: it fetches its rules from unpinned GitHub `main` at runtime (supply-chain/prompt-injection surface). **Vendored a pinned snapshot instead.**
- **`npx skills add …` (skills.sh CLI)**: I installed by manual pinned copy instead, so every file was reviewed and versions are fixed. find-skills still works for discovery.
- **emilkowalski RN/Swift/Sonner/Expo/apple-design/prototype/pick-ui-library/remove-animations**: off-target for this site (`remove-animations` works against a maximalist brief). The upstream README promotes a newsletter, but the skills themselves have no scripts and no network calls.
- **addyosmani `seo` / `best-practices`**: installed (cheap, relevant for launch) but low priority.
- **`@next/bundle-analyzer`**: webpack-only, and it needs a next.config change plus a dep. Next 16's built-in `experimental-analyze` covers it.
- **source-map-explorer**: would need source maps enabled. The built-in analyzer is better.
- **Lighthouse CI `temporary-public-storage` upload, PageSpeed Insights API, WebPageTest, DebugBear, SpeedCurve, Calibre**: they upload data or need account signup. Local Lighthouse/LHCI with filesystem output is enough. (PSI in a browser is fine for a one-off field-data check on the public URL.)
- **Python Playwright browsers duplicate the Node ones** (different builds): extra disk accepted so the `webapp-testing` skill works unmodified. Python uses `webkit-2287` + `chromium*-1223`; Node 1.64.1 uses `webkit-2370` + `chromium*-1248`. Don't delete either set unless you drop that binding.
- **BrowserStack/LambdaTest for real Safari/iOS**: account required. Use a real iPhone over the CF preview URL for the final check.
