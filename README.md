# SimplePlan Media — Kids' Classes Landing Page

A pixel-accurate, fully responsive recreation of the **SimplePlan Media** practical-assignment Figma design, built with **plain HTML5, CSS3 and vanilla JavaScript** — no frameworks, no build step.

> Figma source: *Assignment Project For Devs* (`node-id 1104-30628` homepage, `1104-31140` header dropdown).
> The Figma file is view-only, so every value was extracted by screenshot-based pixel measurement of those frames.

---

## ▶ Run it

No tooling required — everything is static:

```bash
# option 1 — just open it
open index.html            # macOS
start index.html           # Windows

# option 2 — serve it (avoids any file:// quirks)
python -m http.server 8080     # then visit http://localhost:8080
```

## 📁 Structure

```
project/
├── index.html            # full page: header + dropdown, hero, features, classes, teachers, CTA, footer
├── css/
│   └── style.css         # design tokens, all sections, interactions & responsive rules
├── js/
│   └── script.js         # dropdown, currency toggle, carousel, bookmarks, email validation, chat, …
└── assets/
    ├── fonts/            # PP Pangram Sans Rounded — Medium (500), Semibold (600), Bold (700)
    └── images/           # hero art, blobs, icons, quote blob (cropped from the design)
                          # class / teacher / footer photos (originals used by the design, served from Pexels)
                          # (icons are inline SVG — crisper and color-controlled)
```

## 🎨 Design tokens (measured from the Figma frames)

| Token | Value | Used for |
|---|---|---|
| Indigo (primary) | `#2430A0` | logo, headings, buttons, price bars, chat button |
| Coral | `#FB7356` | CTA pill, hover accents |
| Red accent | `#E25753` | SHOW ALL, saved bookmark |
| Heart red | `#FC1C1C` | hero & footer hearts |
| Pink | `#FF006D` | teacher categories |
| Amber | `#FFB051` | star ratings |
| Card body | `#E9EFFF` | class cards |
| Dropdown panel | `#E7EBFF` | categories mega-panel |
| Footer bg | `#F4F7FA` | footer band |
| Slate (secondary text) | `#51557D` | paragraphs, links, input border |

Type: **PP Pangram Sans Rounded** — 500 body, 600 headings/buttons, 700 pills/prices.
Container: `1136px`, gutters `157px / 147px` at ≥1440 (as in the frame), fluid with auto margins below.

## ✨ Implemented interactions (all functional)

1. **Sticky header** that gains a soft shadow once you scroll.
2. **CATEGORIES mega-dropdown** — matching frame `1104-31140`: lavender panel, 8 language categories, sub-list (All / Indian / Norwegian / Category 04), orange hover (+ the Walt Whitman quote blob), chevron flip, outside-click / Esc to close.
3. **NOK ⇄ INR currency toggle** — segmented control with an indigo active pill; switches every card price, strikethrough included (`kr 1000 / kr 2000` ⇄ `₹1,499 / ₹2,999`).
4. **Teachers carousel** — prev/next buttons with wrap-around, sliding track, swipe support, and the faded partially-cut 4th card when more teachers remain ahead (as in the design).
5. **Bookmark toggles** on class cards — outline ⇄ red filled, saved state announced via `aria-pressed` + toast.
6. **Email capture** in hero and CTA — real validation (empty / invalid / success states, shake animation, inline messages, transient "SENT ✓" label).
7. **Enroll buttons + SHOW ALL** — confirmation toast feedback.
8. **Floating chat button** — opens a mini support panel where messages get an auto-reply.
9. **Back-to-top** button — appears after 500px of scroll, smooth-scrolls home.
10. **Scroll & load effects** — staggered fade-up reveals on every section, hover lifts on cards/teachers/buttons (assignments' plus point).
11. **Responsive** — desktop (1440 reference), tablet (~768), mobile (~375/425): burger drawer with categories accordion, stacked hero, 2/1-column grids, no horizontal scroll anywhere.

## 🔍 Notes & small deviations (checks & balances)

### 📸 Screenshots (`screenshots/`)

| File | Shows |
|---|---|
| `desktop-1440.png` / `desktop-1920.png` | full desktop page at 1440 / 1920 |
| `mobile-375.png` | full mobile page at 375 |
| `header-dropdown-open.png` | CATEGORIES mega-panel open (frame 1.2.5) |
| `interaction-currency-inr.png` | classes section after switching to INR |
| `interaction-carousel.png` | teachers carousel after two "next" clicks |
| `interaction-email-validation.png` | hero form invalid-email state |
| `interaction-mobile-drawer.png` | burger drawer + categories accordion at 375 |

- **Fonts** are the supplied PP Pangram Sans Rounded woff/woff2/ttf files, loaded via `@font-face` (700 exists only as `.woff` — supplied that way).
- **Photos**: the design reuses stock photography. Class-card photos, teacher portraits and the footer plates image are the original Pexels photos (identified via the assignment's starter assets) so badges, bookmarks and the faded card state stay **live HTML/CSS**, not baked into the bitmaps.
- **Hero art** (photo + polka-dot blobs) is one composite cropped from the frame at 2× for retina crispness; the design-annotation strokes and the baked chat button it contained were erased, and a real, clickable chat button was rebuilt on top.
- **Card 3** intentionally has no badge and no strike-through price, per the design.
- The design artboard mixes states (NOK toggle active, yet cards 3–4 shown in ₹). The build favours a *coherent* interaction: all cards follow the active currency, so cards 3–4 show `kr` until INR is selected.
- The 4th teacher card (Nichola) is clipped at the right edge in the frame (only ~177 of 209px wide); the build reproduces the peek and shows the full photo from the original source asset.
- Above 1440px the layout stays horizontally centered on the 1136px container.

## ✅ Browser support

Evergreen Chrome, Edge, Firefox, Safari (uses `overflow: clip`, CSS grid, IntersectionObserver, with graceful fallbacks).
