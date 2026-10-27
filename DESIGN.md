# Design System: AVN Fieldguide

## 1. Intent & Mode
- **Mode**: Read / Operate (Ornithological Field Eliminator).
- **Core Directive**: The birds lead from pixel zero. The mobile viewport must show the first species card immediately upon landing without requiring scroll.
- **Aesthetic**: Instrument-grade dark workstation. Precision scientific minimalism; zero decorative emojis, zero AI-slop gradients, zero bloated metric cards.

## 2. Typography
- **Font Stack**: System sans-serif (`system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`).
- **Hierarchy**:
  - App Header: `text-sm font-bold uppercase tracking-wider text-slate-400`
  - Species Heading: `text-xl md:text-2xl font-bold tracking-tight text-white`
  - Scientific Name: `text-xs md:text-sm italic font-serif text-slate-400`
  - Likelihood Pill: `text-xs font-semibold tabular-nums px-2 py-0.5 rounded-full`
  - Tract Labels: `text-[11px] font-bold uppercase tracking-wider text-sky-400`
  - Field Mark Copy: `text-xs leading-relaxed text-slate-200`
  - Rule-out Formula: `text-xs font-medium text-amber-200`

## 3. Color Palette
- **Background**: Deep void slate (`#030712` / `slate-950`)
- **Card Surface**: High-contrast surface (`#0f172a` / `slate-900`)
- **Card Border**: Crisp low-luminance divider (`#1e293b` / `slate-800`)
- **Primary Text**: Off-white (`#f8fafc` / `slate-50`)
- **Secondary Text**: Muted slate (`#94a3b8` / `slate-400`)
- **Diagnostic Accents**:
  - Sky (`#38bdf8`): Primary feather tracts & plate headings
  - Emerald (`#34d399`): High-probability badges & field reality photo headings
  - Amber (`#fbbf24`): Separating diagnostic crux & rule-out formulas
  - Rose (`#fb7185`): Distinctive bill / shoulder markings

## 4. Mobile Layout & First Viewport Rules
- **Header Height Budget**: Total header height on mobile cannot exceed 80px (including filters).
- **Sticky Tray**: Single-line title and horizontal scrolling pill tray.
- **Card Structure**:
  - Mobile: Clean vertical stack or compact side-by-side tabs.
  - Desktop: 2-column visual grid (Standardized Plate on left, Field Photo on right).
  - Visual Containment: All images use `object-contain` inside fixed-height dark frames so heads, bills, and tails are 100% visible with zero cropping.
