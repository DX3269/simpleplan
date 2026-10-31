# SimplePlan Media — Technical Implementation Notes

A companion to `README.md` (run steps & screenshots). This document explains **how** the landing page was built, **what** was used at each layer, and **why** those choices were made.

---

## 1. Stack summary

| Layer | Used | Why |
|---|---|---|
| Markup | Semantic HTML5, one file (`index.html`) | The deliverable is a single landing page; one document keeps deployment trivially static (any static host serves it without a build step). |
| Styling | Hand-written CSS3 (`css/style.css`), custom properties, flexbox | Full pixel control for a design-replication task; native CSS variables give a single source of truth for colors/spacing; no preprocessor needed for a stylesheet of this size. |
| Behavior | Vanilla JavaScript (`js/script.js`), one IIFE, zero dependencies | Every interaction (carousel, dropdown, validation…) is a few lines of DOM state + CSS class toggles; pulling in jQuery/React for this would add weight and a build step with no benefit. |
| Fonts | Self-hosted **PP Pangram Sans Rounded** (woff2/woff/ttf, `@font-face`) | Hosted by the project itself so the page is identical offline and on any CDN; `font-display: swap` avoids invisible-text flash before load. |
| Media | Pexels stock photos + design-derived decorative art (PNG/JPG) | Live photos keep badges/bookmarks realistic and remixable; decorative shapes/art baked as images keep the page pixel-accurate without hand-animating complex vector shapes. |
| Deployment | GitHub → Vercel, static | `index.html` sits at the repo root, so Vercel treats it as a static site with no build command. |

**No frameworks, no bundler, no build step.** The whole project is 1 HTML file, 1 CSS file, 1 JS file + assets — it runs by double-clicking `index.html`.

---

## 2. How the design was sourced (view-only Figma)

The Figma file was view-only, so the build was driven from **measured screenshots** of the design frames instead of the design API:

- 2× captures of the homepage frame and the categories-dropdown state were taken.
- A capture→CSS mapping was established from two known anchor points, then every section's position/size was extracted by pixel-scanning the captures (row/column color runs).
- That produced exact geometry for each section — e.g. hero tagline at y≈231, feature strip at y≈852, cards 1493–1893, teachers 2085, CTA 2489–2772, footer 2855 in a 1440-wide frame ≈3241 tall. The built page lands within a few pixels of every anchor.

**Why:** pixel measurement is reproducible and testable; later "does it match?" questions (e.g. the hero email row) were settled the same way — by scanning pixel color-runs out of the reference and out of the rendered page and comparing numbers, not eyeballing.

**Asset decisions from the same source:**
- **Baked from the design (PNG):** the hero photo composite with surrounding organic blobs, the floating blobs/squiggles, quote blob, and category/feature icons that were drawn illustrations. Hand-rebuilding irregular blob shapes in CSS would waste time and drift from the design; they are purely decorative.
- **Live HTML/CSS:** everything a user interacts with or reads — cards, price tags, "NEW" badges, bookmark buttons, the footer plate photo, the teachers carousel.
- **Erased from baked art:** Figma annotation strokes and a baked-in chat button were cleaned out of the crops so page-level widgets don't get duplicated.

---

## 3. Typography

- Family: *PP Pangram Sans Rounded* (three weights actually used: **500 / 600 / 700**).
- `@font-face` cascades **woff2 → woff → ttf** so modern browsers take the smallest format and the fallback chain still works everywhere.
- `font-display: swap`: text renders in a fallback immediately, then swaps — no blank text on slow connections.
- Font loading is verified during QA in headless Chrome (`document.fonts` reports all three weights `loaded`).

---

## 4. Design tokens

All colors/sizes live in `:root` custom properties, mirroring the design system:

```css
--indigo: #2430A0;   /* primary buttons, headings        */
--indigo-deep: #1B1D6E;   /* hover state                 */
--coral: #FB7356;    /* CTA band, accents                */
--red-accent: #E25753;    /* form error states           */
--heart-red: #FC1C1C;     /* tagline hearts              */
--slate: #51557D;    /* input borders, secondary text    */
--line: #D8DFE6;     /* hairlines                        */
--focus: rgba(36, 48, 160, .35);  /* focus ring          */
--header-h: 74px; --radius-card: 10px;
--shadow-soft: 0 10px 30px rgba(36, 48, 160, .10);
--ease: cubic-bezier(.22, .75, .35, 1);  /* shared easing */
```

**Why tokens:** one-change-from-everywhere restyling, and QA scripts can read the same variables.

---

## 5. Hero email row — the interesting construction

The design draws the newsletter row as **one continuous stadium**: the input's white body slides *under* the indigo button, and the button's rounded left end is the only cap that shows. Implemented as:

- `.hero .mail-input { width: 235px }` — the input physically extends beneath the button, so its top/bottom border lines flow into the button's straight edges seamlessly.
- `.btn-solid { width: 216px; height: 40px; margin-left: -34px; z-index: 1 }` — overlaps the input's hidden right end; the visible seam starts exactly where the design's indigo cap emerges (x≈358 on the 1440 frame).
- Font metrics matched to the frame by pixel scan: button text 14px/700/1.5px tracking, arrow 18px, inputtype 14px with 18px side padding.
- Mobile (`≤939px`) unwinds the overlap: the row wraps, the input goes full-width, and the button stacks below with `margin-left: 0`.

---

## 6. Interactions (`js/script.js`)

All behavior is one IIFE with two micro-helpers (`$`, `$$`). Elements are resolved once up front; listeners drive **class toggles that CSS animates** (transitions around a shared `--ease` curve). This keeps JS tiny and motion smooth without a JS animation library.

| Feature | How it works |
|---|---|
| Sticky header | scroll listener toggles `.scrolled` (shadow + pin) after 10px. |
| Categories dropdown | `#catTrigger` toggles `.open` on the header; closes on outside click, `Esc`, or navigating; chevron rotates via `[aria-expanded]`. |
| Mobile drawer | burger toggles `.menu-open`; drawer animates `max-height` + opacity; nested category list inside. |
| Currency toggle | `data-cur` buttons swap price text across **all** cards (NOK ↔ INR) so the page never shows a mixed-currency state; strike-through prices follow. |
| Teachers carousel | translate-based track (`CARD_PITCH = 318px`), 4 visible cards, index clamped, `prefers-reduced-motion` honored; touch swipe supported; next card gets a faded `peek` look. |
| Newsletter validation | regex `^[^\s@]+@[^\s@]+\.[^\s@]{2,}$`; error state = red ring + shake animation + inline message; success = confirmation message, button flips to `SENT ✓`. |
| Bookmark / Enroll | toggle `.saved` heart; enroll swaps label to `Enrolled ✓` and fires a toast. |
| Chat widget | floating button opens a panel; user messages appended instantly, an auto-reply arrives after a beat. |
| Back-to-top | appears past ~600px, smooth-scrolls home. |

**Why class-driven:** states are inspectable in DevTools, animations are GPU-friendly CSS transitions, and behavior is identical with JS-anim-less clients (progressive enhancement).

---

## 7. Responsive strategy

Desktop-first with nodes going static progressively:

```
1439 ↓  scale type/containers
1239 ↓  tighten gutters
1024 ↓  narrows content cols
939  ↓  header → burger + mobile drawer; hero art stacks; carousel 2-up… 
860 ↓
760 ↓
620 ↓  cards 1-up, form stacks fully
425 ↓  small-phone fine-tuning
```

QA sweeps every breakpoint down to **320px** for horizontal overflow (`scrollWidth − clientWidth === 0` at 1920/1600/1440/1240/1100/1024/940/939/768/600/425/375/320).

---

## 8. Verification methodology

Every rendering claim was checked by **scripted headless Chrome** (puppeteer-core) against a locally served copy:

- full-page screenshots at three viewports (1440 / 1920 / 375),
- an automated interactions script clicking through all 8 features and asserting state (see `interaction-*.png` in `screenshots/`),
- zero console errors / zero page errors across the runs,
- fonts confirmed loaded before capture.

**Why scripted checks:** design-vs-build questions in this project were repeatedly solved by comparing numbers (color runs, bounding boxes) from the live render against the design capture — screenshots alone invited stale-cache misreads.

---

## 9. Caching & deployment notes

- Asset URLs in `index.html` carry explicit versions (`css/style.css?v=2`, `js/script.js?v=2`) so iteration doesn't fight the browser cache.
- Deploy target is **Vercel** importing the GitHub repo; no build command, no framework preset — `index.html` at the repo root is served directly.
- Sitemap robots/SEO polish was out of scope; the page is content-complete static HTML.
