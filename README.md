# AvnLookalike 🦅

> Visual avian identification, species-pair disambiguation, and field eliminator.

Live Web Application: **[https://j-s-bot.github.io/avn-lookalike/](https://j-s-bot.github.io/avn-lookalike/)**

---

## 🎯 What is AvnLookalike?

Bird identification apps often present generic catalog listings or AI classifiers without explaining *why* one candidate was picked over another. When observing ambiguous species complexes (such as sparrows, fall warblers, or empidonax flycatchers), birders need:

1. **Standardized Coordinate Scanning**: Every bird rendered in identical lateral profile facing right on neutral background so eyes scan the exact same physical tracts across species:
   $$\text{Bill} \longrightarrow \text{Lores / Eye-Ring} \longrightarrow \text{Crown} \longrightarrow \text{Breast} \longrightarrow \text{Wings} \longrightarrow \text{Tail}$$
2. **Side-by-Side Reality Check**: Standardized Sibley/Peterson-style field plates paired alongside uncropped real-world field photographs.
3. **Plumage Morph Clarity**: Instant toggles for sexual dimorphism and age variations (e.g. White-throated white-striped vs tan-striped; White-crowned adult vs 1st-winter immature).
4. **Rank-Ordered Regional Probability**: Sorted directly by eBird checklist observation frequency for the specific date and region, allowing rapid elimination from most probable to rarest.

---

## 🌾 Module 1: Late October Sparrow Differentiator (Central Maryland)

Current live module covers the 11 confusing Little Brown Jobs (LBJs) in Baltimore County & Central Maryland:

1. **Song Sparrow** (62%) — Coarse heavy streaks merging into a central stickpin; long rounded pumped tail.
2. **White-throated Sparrow** (56%) — Bright yellow supraloral dot + crisp square white throat bib.
3. **Swamp Sparrow** (24%) — Solid unbarred bright rufous wings + clean gray neck & breast.
4. **Chipping Sparrow** (20%) — Slim petite body, notched tail, unstreaked breast, streaky brownish cap in fall.
5. **Field Sparrow** (14%) — Bright candy-pink bill + bold white eye-ring on blank innocent face + unstreaked buffy breast.
6. **Savannah Sparrow** (12%) — Lemon-yellow lores + pale center crown stripe + crisp streaks + compact notched tail.
7. **White-crowned Sparrow** (10%) — Cinnamon-brown & tan striped crown (1st-winter) + plain gray breast + pink/orange bill.
8. **Lincoln's Sparrow** (6%) — Warm creamy buff chest apron with needle-fine pencil streaks + clean white belly.
9. **Fox Sparrow** (4%) — Large bulky body, brilliant foxy-rust wings/tail, heavy triangular red chevrons, yellow lower mandible.
10. **Vesper Sparrow** (3%) — Bold white eye-ring + chestnut shoulder patch (lesser coverts) + white outer tail flash.
11. **House Sparrow (Female)** — Plain unstreaked dirty-buff breast + heavy stubby finch bill + pale buffy eyebrow.

---

## 🔮 Future Roadmap

- [ ] **Species-Pair Disambiguator (`avn-diff`)**: Input any two candidate species (e.g., *Greater vs Lesser Yellowlegs*, *Downy vs Hairy Woodpecker*, *Sharp-shinned vs Cooper's Hawk*) and generate an instant side-by-side diagnostic tract breakdown.
- [ ] **Location & Date Eliminator**: Input GPS coordinates or an eBird hotspot ID to dynamically generate the ranked lookalike matrix for that exact week.
- [ ] **Interactive Elimination Wizard**: Step-by-step diagnostic questionnaire that prunes candidates based on visible tracts.

---

## 📱 Offline PWA Support

AvnLookalike is a zero-dependency, self-contained Progressive Web App (PWA). All image assets are encoded directly in the client bundle. Open the site on mobile and tap **"Add to Home Screen"** to use it offline in the field with zero cellular service.
