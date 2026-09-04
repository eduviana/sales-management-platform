---
name: Lumina Analytics
colors:
  surface: '#131315'
  surface-dim: '#131315'
  surface-bright: '#39393b'
  surface-container-lowest: '#0e0e10'
  surface-container-low: '#1c1b1d'
  surface-container: '#201f22'
  surface-container-high: '#2a2a2c'
  surface-container-highest: '#353437'
  on-surface: '#e5e1e4'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#e5e1e4'
  inverse-on-surface: '#313032'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffb95f'
  on-tertiary: '#472a00'
  tertiary-container: '#ca8100'
  on-tertiary-container: '#3e2400'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#131315'
  on-background: '#e5e1e4'
  surface-variant: '#353437'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 0.25rem
  sm: 0.5rem
  md: 1rem
  lg: 1.5rem
  xl: 2rem
  gutter: 1.5rem
  margin: 2rem
---

## Brand & Style
The design system is engineered for high-performance sales environments, emphasizing clarity, speed, and precision. It adopts a **Corporate Modern** aesthetic with a lean toward **Minimalism**, ensuring that complex data remains the focal point without unnecessary visual noise.

The interface prioritizes a "lights-out" executive experience. It utilizes deep neutral tones to reduce eye strain during long analytical sessions, while employing vibrant, high-saturation accents to highlight critical performance indicators. The emotional response is one of institutional trust, technical sophistication, and immediate clarity.

## Colors
This design system utilizes a sophisticated dark-mode palette built on a Zinc and Slate foundation.

- **Primary (Blue):** Used for primary actions, active states, and general data trends.
- **Success (Emerald):** Reserved strictly for positive growth, closed deals, and exceeding quotas.
- **Warning/Targets (Amber):** Used for pipeline targets, pending items, and nearing thresholds.
- **Neutral/Background:** The base layer is Zinc-950 (`#09090B`), with component surfaces using Zinc-900 (`#18181B`).
- **Borders:** Subtle definition is achieved using Slate-800 (`#27272A`) for low-contrast separation.

## Typography
The typography system relies on **Inter** for its exceptional readability in data-dense environments. It utilizes a tight tracking model for headlines to maintain a professional, "locked-in" feel. 

For technical data points, currency values, and small metadata labels, **JetBrains Mono** is introduced as a secondary functional font. This monospaced addition ensures that numerical columns in tables align perfectly, facilitating rapid scanning of financial figures.

## Layout & Spacing
The layout follows a **12-column fluid grid** for the main dashboard content, allowing widgets to span 3, 4, 6, or 12 columns depending on the data complexity.

- **Desktop:** 2rem side margins with 1.5rem gutters between cards.
- **Tablet:** 1.5rem margins with 1rem gutters; 12-column grid collapses to 6.
- **Mobile:** 1rem margins; all cards stack vertically into a single column.

A strict 4px baseline grid ensures vertical rhythm across all components, specifically in data tables where row heights are fixed to multiples of 8px.

## Elevation & Depth
In this dark-mode environment, depth is communicated through **Tonal Layers** rather than heavy shadows.

- **Level 0 (Background):** `#09090B` — The canvas.
- **Level 1 (Cards/Surfaces):** `#18181B` — Primary container for charts and lists.
- **Level 2 (Popovers/Modals):** `#27272A` — Elevated surfaces with a subtle 1px border of `#3F3F46` to ensure separation from the background.

Shadows, when used, are ultra-subtle: `0 4px 6px -1px rgba(0, 0, 0, 0.5)`. The primary method of separation is the 1px Slate border.

## Shapes
The shape language is **Soft** and disciplined. A 0.25rem (4px) radius is the standard for most interactive elements, providing a modern feel without appearing too casual or "bubbly." 

- **Small Components (Buttons, Inputs):** 4px (rounded-sm)
- **Large Components (Cards, Modals):** 8px (rounded-lg)
- **Status Badges:** Full-pill (999px) to distinguish them from interactive buttons.

## Components
- **Buttons:** Primary buttons use a solid Blue-600 fill with white text. Secondary buttons use a ghost style with a Slate-800 border.
- **Data Tables:** High-contrast text (Zinc-100) on Zinc-900 surfaces. Row hover states use a subtle Zinc-800 highlight. Cell padding is strictly 12px vertical, 16px horizontal.
- **Cards:** No outer shadows. 1px border (`#27272A`). Titles are always `headline-md` or `body-sm` (uppercase) for sub-headers.
- **Status Badges:** Small, high-saturation pills. Use Emerald/Amber/Blue backgrounds at 15% opacity with 100% opacity text for maximum legibility without overpowering the UI.
- **Input Fields:** Zinc-950 background with a 1px Slate-800 border. On focus, the border transitions to Blue-500 with a subtle outer glow.
- **Charts:** Use a 2px stroke width for line charts. Area charts should use a gradient fade from 30% opacity to 0% at the baseline.