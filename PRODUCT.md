# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Field birders, wildlife photographers, and ornithologists needing rapid, decisive disambiguation of confusing lookalike species complexes ("Little Brown Jobs", fall warblers, flycatchers, confusing winter waterfowl, immature gulls, dowitchers/peeps, terns, and loons/grebes) in the field under varying lighting conditions and on mobile devices.

## Product Purpose

AvnLookalike provides instant, visual-first species elimination and side-by-side comparative analysis. Instead of generic catalog text or black-box machine learning guesses, it presents species in standardized, identical lateral profile coordinates (Sibley/Peterson field plates) alongside verified uncropped field photographs, highlighting only the decisive separating tracts (crux marks) to settle field IDs in seconds.

## Positioning

Unlike general field guides that treat every species as an isolated encyclopedia entry, AvnLookalike is an active *eliminator*: species are organized across 6 targeted taxonomic lookalike complexes, dynamically rank-ordered by regional eBird checklist frequency, filtered across mutually exclusive anatomical facets (bill shape, plumage marks, leg color, feeding behavior), and dismissed in-memory as candidates are ruled out.

## Operating Context

Mobile phone screens in bright sunlight or low-glare twilight, often in remote fields, marshes, or coastal shores with zero cellular connectivity. Demands instant first-viewport visibility of the birds, zero bloated header distraction, rapid thumb scrolling, 1-card-per-row full-width comparative scanning, and offline PWA functionality.

## Capabilities and Constraints

- **Single-page offline bundle**: Zero external API or runtime framework dependencies; operates client-side with Service Worker offline asset caching (`v14`).
- **Standardized single-column layout**: Exactly 1 full-width specimen card per row across all viewport widths to enable direct comparative vertical scanning without cramped multi-column layout shifts.
- **Strict anatomical consistency**: All primary diagnostic illustrations maintain identical lateral orientation (facing right) and comparative posture.
- **Real-world uncropped photography**: High-resolution field photos must display full body anatomy without head or tail cropping.
- **Topographical precision**: Visual callouts target explicit avian feather tracts (lores, supercilium, eye-ring, lesser coverts, rectrices, bill culmen/gonys).
- **Interactive in-memory elimination**: Species cards feature instant dismissal ("X") to hide eliminated candidates during active field viewing; dismissals reset cleanly on page reload without persisting or corrupting subsequent sessions.
- **Zero non-confusing fluff**: Non-confusing taxa are excluded from lookalike complexes.

## Brand Commitments

- **Namespace**: `avn-*` family (`avn-codex`, `avn-studio`, `avn-birdbox`, `avn-lookalike`).
- **Tone**: Precision, instrument-grade, restrained scientific authority. No AI marketing gimmicks, no emojis, no bloated SaaS cards.

## Evidence on Hand

- Standardized field-guide watercolor plates and uncropped field photos across 6 specialized guides (110 total species and plumage variants):
  - Sparrows (`index.html`): 11 species.
  - Ducks & Waterfowl (`ducks.html`): 29 species and plumage morphs.
  - Gulls & Laridae (`gulls.html`): 19 species and age cycles.
  - Shorebirds & Plovers (`shorebirds.html`): 21 species and seasonal plumages.
  - Terns & Skimmers (`terns.html`): 16 species and age/seasonal plumages.
  - Grebes & Loons (`grebes.html`): 14 species and seasonal plumages.
  - Curated crux field marks, high-resolution field verification photos, and field comparison assets.
- Regional eBird checklist frequency data for Mid-Atlantic / Central Maryland.

## Product Principles

1. **The Birds Lead the First Viewport**: Never force the user to scroll past administrative headers, banners, or giant filter panels to see birds.
2. **Standardized Coordinates Over Casual Angles**: Field plates lock to identical orientation so the user's eyes can scan the same anatomical path on every specimen.
3. **One Card Per Row**: Maintain full-width comparative scanning density without multi-column horizontal disruption.
4. **Active Elimination Over Passive Browsing**: Filtering, dismissals, and crux mark callouts serve process of elimination, not passive reading.
5. **Restraint and Legibility**: Field marks are displayed with surgical brevity; every pixel serves rapid visual differentiation.

## Accessibility & Inclusion

- **Field Sunlight Contrast**: High-contrast dark backgrounds (`#0a0f1d`) with crisp typography and distinct badge fills to ensure legibility under direct sunlight.
- **Screen Reader Support**: Semantic HTML cards, explicit ARIA labels on dismissal and toggle actions, and descriptive alt text identifying species name, plumage, and posture.
- **Touch Target Density**: Dismissal buttons and facet pills sized with minimum 44px touch targets to accommodate cold-weather field gloved touch.
