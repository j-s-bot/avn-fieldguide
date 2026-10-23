# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML5, Tailwind CSS, vanilla JavaScript (zero runtime dependencies, single-file bundle with self-contained assets and PWA service worker for offline field use).

## Users

Field birders, wildlife photographers, and ornithologists needing rapid, decisive disambiguation of confusing lookalike species complexes ("Little Brown Jobs", fall warblers, flycatchers) in the field under varying lighting conditions and on mobile devices.

## Product Purpose

AvnLookalike provides instant, visual-first species elimination and side-by-side comparison. Instead of generic catalog text or black-box machine learning guesses, it presents species in standardized, identical lateral profile coordinates (Sibley/Peterson field plates) alongside verified uncropped field photographs, highlighting only the decisive separating tracts (crux marks) to settle field IDs in seconds.

## Positioning

Unlike general field guides that treat every species as an isolated encyclopedia entry, AvnLookalike is an active *eliminator*: species are dynamically rank-ordered by local eBird checklist probability for the exact week and region, paired across identical anatomical coordinates, and stripped of non-confusing taxonomic clutter.

## Operating Context

Mobile phone screens in bright sunlight or low-glare twilight, often in remote fields or marsh edges with zero cellular connectivity. Demands instant first-viewport visibility of the birds, zero bloated header distraction, rapid thumb scrolling, and offline PWA functionality.

## Capabilities and Constraints

- **Single-page offline bundle**: Zero external API or network dependencies; runs entirely client-side.
- **Strict anatomical consistency**: All diagnostic illustrations must maintain identical lateral orientation (facing right) and scale.
- **Real-world uncropped photography**: High-resolution field photos must display full body anatomy without head or tail cropping.
- **Topographical precision**: Visual callouts target explicit avian feather tracts (lores, supercilium, eye-ring, lesser coverts, rectrices, bill).
- **Zero non-confusing fluff**: Non-confusing taxa (e.g. Eastern Towhee, Dark-eyed Junco) are excluded from LBJ guides.

## Brand Commitments

- **Namespace**: `avn-*` family (`avn-codex`, `avn-studio`, `avn-birdbox`, `avn-lookalike`).
- **Tone**: Precision, instrument-grade, restrained scientific authority. No AI marketing gimmicks, no emojis, no bloated SaaS cards.

## Evidence on Hand

- Standardized field-guide watercolor plates for 11 confusing late-October sparrows.
- Curated high-resolution field photos and dimorphic morph assets.
- Stephen's two mystery field photos (Vesper Sparrow and Savannah Sparrow) as live verification benchmarks.
- Regional eBird checklist frequency data for Baltimore County / Central Maryland (Late October, Week 4).

## Product Principles

1. **The Birds Lead the First Viewport**: Never force the user to scroll past administrative headers, banners, or giant filter panels to see birds.
2. **Standardized Coordinates Over Casual Angles**: Field plates lock to identical orientation so the user's eyes can scan the same anatomical path on every specimen.
3. **Restraint and Legibility**: Field marks are displayed with surgical brevity; every pixel serves rapid visual differentiation.
