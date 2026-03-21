# KavachOS Brand Guide

> Kavach = Armor (Hindi). Inspired by Karna's golden Kavach-Kundal from the Mahabharata - divine, indestructible, golden armor.

## Name

| Context | Format |
|---------|--------|
| Brand name | **KavachOS** |
| Logo/code | **kavachos** (lowercase) |
| Domain | kavachos.com |
| npm | `kavachos` / `@kavachos/*` |
| GitHub | github.com/kavachos |
| LinkedIn | KavachOS |
| X | @thedsks (personal) |
| Tagline | **The Auth OS** |
| Pitch | "Armor for every identity. Human and agent." |

## Logo

Concentric rounded square rings representing layers of armor/security. Each ring is a defense boundary. The golden gradient is from Karna's divine kavach. Center dot = the protected identity core.

### Files

All assets in `docs-local/kavachos-brand/export/`:

| File | Description |
|------|-------------|
| `icon-gold-dark.svg` | Primary logo - gold rings on dark bg |
| `icon-gold-light.svg` | Gold rings on light bg |
| `icon-gold-transparent.svg` | Gold rings, no bg (for overlays) |
| `icon-gold-dark-{size}.png` | Dark bg PNGs: 16-2048px |
| `icon-gold-light-{size}.png` | Light bg PNGs: 16-2048px |
| `icon-gold-transparent-{size}.png` | Transparent PNGs: 16-2048px |

### Where to Upload

| Platform | File | Size |
|----------|------|------|
| GitHub org avatar | `icon-gold-dark-512.png` | 512x512 |
| GitHub repo social preview | `icon-gold-dark-1024.png` | 1024x1024 |
| LinkedIn company logo | `icon-gold-dark-512.png` | 512x512 |
| X / Twitter profile pic | `icon-gold-dark-512.png` | 512x512 |
| npm avatar | `icon-gold-dark-256.png` | 256x256 |
| Discord server icon | `icon-gold-dark-512.png` | 512x512 |
| Favicon | `icon-gold-dark-32.png` | 32x32 |
| Apple Touch Icon | `icon-gold-dark-192.png` | 192x192 |
| PWA manifest | `icon-gold-dark-192.png` + `icon-gold-dark-512.png` | 192 + 512 |
| Dev.to / blog | `icon-gold-dark-256.png` | 256x256 |
| Email signature | `icon-gold-transparent-64.png` | 64x64 |
| Slide decks (dark bg) | `icon-gold-transparent-512.png` | 512x512 |
| Slide decks (light bg) | `icon-gold-light-512.png` | 512x512 |
| Print / merch | `icon-gold-dark-2048.png` | 2048x2048 |
| In-project SVG | `icon-gold-dark.svg` | Scalable |

## Color Palette

### Primary (Golden Armor)

| Name | Hex | Use |
|------|-----|-----|
| Gold Bright | `#F0D87A` | Highlights, center dot, CTAs |
| Gold Primary | `#D4B65A` | Main brand color, buttons |
| Gold Mid | `#C9A84C` | Gradient start |
| Gold Deep | `#9A7B22` | Dark accents, hover states |
| Gold Shadow | `#8B6914` | Gradient end, shadows, borders |
| Gold Darkest | `#6B4E0A` | Text on light backgrounds |

### Gradient (use for rings, buttons, accents)

```css
/* Primary gradient - diagonal */
background: linear-gradient(135deg, #C9A84C, #8B6914);

/* Light variant */
background: linear-gradient(135deg, #F0D87A, #BFA042);

/* Dark variant */
background: linear-gradient(135deg, #9A7B22, #6B4E0A);
```

### Neutrals

| Name | Hex | Use |
|------|-----|-----|
| Background Dark | `#0a0a0a` | Dark mode bg |
| Surface Dark | `#111111` | Cards, panels (dark) |
| Border Dark | `#1a1a1a` | Borders (dark) |
| Background Light | `#f5f5f5` | Light mode bg |
| Surface Light | `#ffffff` | Cards, panels (light) |
| Border Light | `#e0e0e0` | Borders (light) |

## Typography

| Context | Font | Weight |
|---------|------|--------|
| Logo wordmark | Space Grotesk | 700 (bold) |
| "OS" suffix | Space Grotesk | 300 (light) |
| Headings | Space Grotesk | 600-800 |
| Body | Manrope | 300-500 |
| UI labels | Manrope | 500-600 |
| Code | JetBrains Mono | 400 |

### Wordmark Format

```
kavachOS          - logo (lowercase k, uppercase OS)
KavachOS          - formal text (capital K)
kavachos          - code/npm/domain (all lowercase)
THE AUTH OS       - tagline (all caps, spaced)
```

## Brand Story (for interviews, about pages, pitches)

"Kavach means armor in Hindi. In the Mahabharata, the warrior Karna was born with divine golden armor - the Kavach-Kundal - that made him invincible. We named our product KavachOS because we believe every digital identity deserves that same level of protection. Whether human or AI agent, your identity should be armored."

## Don'ts

- Don't use color backgrounds behind the logo (use dark or transparent variants)
- Don't stretch or distort the proportions
- Don't add effects (drop shadow, glow, bevel) to the logo
- Don't use the grey/white variants (deprecated - gold is the official brand)
- Don't capitalize as KAVACHOS or kavachOs
- Don't separate as "Kavach OS" (it's one word: KavachOS)
