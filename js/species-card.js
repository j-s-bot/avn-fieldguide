/**
 * AVN Fieldguide Species Card Component (Tier 3: The Diagnostic Slab)
 * Renders high-signal specimen cards with consolidated biometric pills,
 * elevated Key ID / Rule-Out banner above full-bleed dual plate/photo stages,
 * and a 3-column untruncated anatomical tract footer.
 */

const DOT_MAP = {
  'blue': 'bg-sky-400',
  'orange': 'bg-orange-400',
  'yellow': 'bg-yellow-400',
  'green': 'bg-emerald-400',
  'black': 'bg-slate-400 border border-slate-600',
  'slate': 'bg-slate-400',
  'red': 'bg-rose-500',
  'pink': 'bg-rose-300 border border-rose-200/40'
};

function variantBtnClass(isActive) {
  if (isActive) return 'px-2 py-0.5 rounded text-[10px] font-bold border border-sky-500 bg-sky-600 text-white transition cursor-pointer';
  return 'px-2 py-0.5 rounded text-[10px] font-medium border border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 transition cursor-pointer';
}

function compareBtnClass(isComp) {
  if (isComp) return 'px-2.5 py-1 rounded-md text-[11px] font-semibold transition flex items-center gap-1 shrink-0 cursor-pointer bg-sky-600 text-white shadow-sm ring-1 ring-sky-400';
  return 'px-2.5 py-1 rounded-md text-[11px] font-semibold transition flex items-center gap-1 shrink-0 cursor-pointer bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-700';
}

function escapeAttr(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function renderSpeciesCard(s, options = {}) {
  const {
    guideId = 'sparrows',
    maxCategoryLength = 65.0,
    currentAssetMode = 'both',
    cardAssetOverrides = {},
    photoModes = {},
    photoIndices = {},
    currentSort = 'freq-desc',
    currentGridCols = 3,
    isCompared = false,
    onDismiss,
    onTogglePhoto,
    onSwitchPhotoVariant,
    onFlipAsset,
    onToggleCompare
  } = options;

  const card = document.createElement('article');
  card.id = `card-${s.id}`;
  card.setAttribute('data-species-id', s.id);

  const isRare = s.rarity === 'rare';
  const lenPct = Math.min(100, Math.round(((s.length_cm || 0) / maxCategoryLength) * 100));
  const effMode = cardAssetOverrides[s.id] || currentAssetMode;

  // Outer container styling: highlight for Rare or Compared cards
  if (isCompared) {
    card.className = "bg-slate-900 border-2 border-sky-500 rounded-xl overflow-hidden shadow-lg shadow-sky-950/40 ring-1 ring-sky-500 flex flex-col group transition";
  } else if (isRare) {
    card.className = "bg-slate-900/80 border border-slate-800/90 rounded-xl overflow-hidden shadow-sm hover:border-slate-700/80 transition flex flex-col group";
  } else {
    card.className = "bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm hover:border-slate-700/80 transition flex flex-col group";
  }

  // 1. Badges setup
  let sexBadgeHtml = '';
  if (s.sex) {
    let sexBadgeClass = "bg-sky-950/80 text-sky-400 border-sky-800/60";
    let sexLabel = "Drake (Male)";
    if (s.sex === 'hen') {
      sexBadgeClass = "bg-amber-950/80 text-amber-400 border-amber-800/60";
      sexLabel = "Hen (Female)";
    } else if (s.sex === 'both') {
      sexBadgeClass = "bg-slate-800 text-slate-300 border-slate-700";
      sexLabel = "Drake & Hen Similar";
    }
    sexBadgeHtml = `<span class="text-[10px] font-semibold px-2 py-0.5 rounded border ${sexBadgeClass}">${sexLabel}</span>`;
  }

  let guildBadgeHtml = '';
  if (s.guild) {
    guildBadgeHtml = s.guild === 'dabbler'
      ? '<span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">Dabbler</span>'
      : '<span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/40">Diver</span>';
  } else if (s.group) {
    guildBadgeHtml = `<span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">${s.group.replace(/_/g, ' ')}</span>`;
  }

  let frequencyBadge = '';
  let rarityCallout = '';
  if (isRare) {
    frequencyBadge = `
      <span class="text-[11px] font-mono text-slate-400 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded flex items-center gap-1" title="Low probability eBird vagrant (<0.1% checklists)">
        <span class="text-slate-600 font-bold">⊘</span> Unlikely Vagrant (&lt;0.1%)
      </span>
    `;
    rarityCallout = `
      <div class="mx-4 mt-2.5 text-[11px] text-slate-400 bg-slate-950/80 border border-slate-800/80 rounded-lg px-3 py-1.5 flex items-center justify-between flex-wrap gap-2">
        <span><strong class="text-slate-300 font-semibold">Low-probability vagrant:</strong> Rule out common candidates first.</span>
        <span class="text-slate-500 font-mono text-[10px]">eBird Review</span>
      </div>
    `;
  } else {
    frequencyBadge = `
      <span class="text-[11px] font-bold tabular-nums text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-md" title="Relative seasonal frequency">
        ${s.prob} freq
      </span>
    `;
  }

  // Unified Biometric Pill (Size + Bill + Legs)
  const sizeSegment = `<span class="${currentSort.startsWith('size') ? 'text-sky-300 font-bold' : ''}" title="Typical Total Body Length">${s.size_display || (s.length_cm + ' cm')}</span>`;

  let billSegment = '';
  if (s.bill_display || s.bill_mm) {
    const dots = (s.bill_colors || []).map(c => `<span class="inline-block w-2 h-2 rounded-full ${DOT_MAP[c] || 'bg-slate-400'} shrink-0" title="Beak: ${c}"></span>`).join('');
    billSegment = `
      <span class="text-slate-600">·</span>
      <span class="flex items-center gap-1 ${currentSort.startsWith('bill') ? 'text-sky-300 font-bold' : ''}" title="Beak length: ${s.bill_display || (s.bill_mm + ' mm')}">
        ${dots ? `<span class="flex items-center gap-0.5 shrink-0">${dots}</span>` : ''}
        <span>${s.bill_display || (s.bill_mm + ' mm')} bill</span>
      </span>
    `;
  }

  let legSegment = '';
  if (s.leg_colors && s.leg_colors.length > 0) {
    const legDots = s.leg_colors.map(c => `<span class="inline-block w-2 h-2 rounded-full ${DOT_MAP[c] || 'bg-slate-400'} shrink-0" title="Legs: ${c}"></span>`).join('');
    legSegment = `
      <span class="text-slate-600">·</span>
      <span class="flex items-center gap-1" title="Leg color: ${s.leg_colors.join(', ')}">
        <span class="flex items-center gap-0.5 shrink-0">${legDots}</span>
        <span>legs</span>
      </span>
    `;
  }

  const biometricPillHtml = `
    <div class="flex items-center gap-2 bg-slate-950 border border-slate-800 px-2.5 py-0.5 rounded-md text-[11px] font-mono tabular-nums text-slate-300" title="Standing Stature: ${s.length_cm} cm of ${maxCategoryLength} cm category max (${lenPct}%)">
      ${sizeSegment}
      ${billSegment}
      ${legSegment}
    </div>
  `;

  // Visuals stage
  const currentPhotoMode = photoModes[s.id] || 'primary';
  const hasCruxPhoto = Boolean(s.crux_photo && s.crux_photo !== s.photo);

  // Check if multiple photo variants exist
  const curVariantIdx = photoIndices[s.id] || 0;
  const activeVariant = (Array.isArray(s.photo_variants) && s.photo_variants.length > 0)
    ? (s.photo_variants[curVariantIdx] || s.photo_variants[0])
    : null;

  let activePhotoUrl = s.photo;
  let activePhotoCaption = s.photo_caption || s.name;

  if (hasCruxPhoto) {
    activePhotoUrl = (currentPhotoMode === 'crux') ? s.crux_photo : s.photo;
    activePhotoCaption = (currentPhotoMode === 'crux') ? (s.crux_caption || s.rule_out) : (s.photo_caption || s.name);
  } else if (activeVariant) {
    activePhotoUrl = activeVariant.src || s.photo;
    activePhotoCaption = activeVariant.caption || s.photo_caption || s.name;
  }

  // Photo toggle overlay
  let photoToggleHtml = '';
  if (hasCruxPhoto) {
    photoToggleHtml = `
      <div class="flex items-center gap-0.5 bg-slate-900/90 p-0.5 rounded border border-slate-700/80 shadow">
        <button data-action="toggle-photo" data-species-id="${s.id}" data-mode="primary" class="px-1.5 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${currentPhotoMode === 'primary' ? 'bg-slate-800 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-white'}">Profile</button>
        <button data-action="toggle-photo" data-species-id="${s.id}" data-mode="crux" class="px-1.5 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${currentPhotoMode === 'crux' ? 'bg-slate-800 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-white'}">Crux</button>
      </div>
    `;
  } else if (Array.isArray(s.photo_variants) && s.photo_variants.length > 1) {
    photoToggleHtml = `
      <div class="flex items-center gap-1 overflow-x-auto no-scrollbar">
        ${s.photo_variants.map((v, i) => `
          <button data-action="switch-variant" data-species-id="${s.id}" data-index="${i}" class="${variantBtnClass(i === curVariantIdx)}">
            ${escapeAttr(v.label)}
          </button>
        `).join('')}
      </div>
    `;
  }

  // Safe strings for lightbox attributes
  const safeName = escapeAttr(s.name);
  const safeSci = escapeAttr(s.sci);
  const safePlateCap = escapeAttr(s.plate_caption || 'Diagnostic lateral plate');
  const safePhotoCap = escapeAttr(activePhotoCaption);

  let visualsHtml = '';
  if (effMode === 'both') {
    visualsHtml = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 px-4 py-3">
        <!-- Visual 1: Hand-Drawn Field Guide Plate -->
        <div data-action="lightbox" data-src="${s.plate}" data-title="${safeName}" data-sci="${safeSci}" data-badge="DIAGNOSTIC PLATE" data-caption="${safePlateCap}" class="relative bg-slate-950 rounded-lg border border-slate-800/90 overflow-hidden flex flex-col justify-between cursor-zoom-in group/img transition hover:border-sky-500/50 hover:shadow-lg" title="Click to view fullscreen plate">
          <div class="absolute top-2 left-2.5 right-2.5 flex items-center justify-between z-10 pointer-events-none">
            <span class="text-[10px] font-bold uppercase tracking-wider text-sky-400 bg-slate-950/85 backdrop-blur-sm px-2 py-0.5 rounded border border-sky-800/40">Diagnostic Plate</span>
            <span class="text-[10px] font-mono text-slate-400 bg-slate-950/85 px-1.5 py-0.5 rounded border border-slate-800/60 flex items-center gap-1 opacity-0 group-hover/img:opacity-100 group-hover/img:text-sky-300 transition">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"></path></svg>
              Zoom
            </span>
          </div>
          <div class="h-44 sm:h-48 md:h-52 flex items-center justify-center p-2 overflow-hidden">
            <img src="${s.plate}" alt="${s.name} Plate" loading="lazy" class="max-h-full max-w-full object-contain transition duration-200 group-hover/img:scale-105">
          </div>
          <div class="bg-slate-950/90 border-t border-slate-800/60 px-3 py-1.5 text-[11px] text-slate-400 truncate" title="${escapeAttr(s.plate_caption)}">
            ${s.plate_caption || 'Standard lateral profile'}
          </div>
        </div>

        <!-- Visual 2: Field Photograph -->
        <div data-action="lightbox" data-src="${activePhotoUrl}" data-title="${safeName}" data-sci="${safeSci}" data-badge="FIELD PHOTO" data-caption="${safePhotoCap}" class="relative bg-slate-950 rounded-lg border border-slate-800/90 overflow-hidden flex flex-col justify-between cursor-zoom-in group/img transition hover:border-emerald-500/50 hover:shadow-lg" title="Click to view fullscreen photo">
          <div class="absolute top-2 left-2.5 right-2.5 flex items-center justify-between z-10">
            <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-slate-950/85 backdrop-blur-sm px-2 py-0.5 rounded border border-emerald-800/40 pointer-events-none">Field Photo</span>
            <div class="pointer-events-auto">
              ${photoToggleHtml}
            </div>
          </div>
          <div class="h-44 sm:h-48 md:h-52 flex items-center justify-center p-2 overflow-hidden">
            <img src="${activePhotoUrl}" alt="${s.name} Photo" loading="lazy" class="max-h-full max-w-full object-contain transition duration-200 group-hover/img:scale-105">
          </div>
          <div class="bg-slate-950/90 border-t border-slate-800/60 px-3 py-1.5 text-[11px] text-slate-400 truncate" title="${safePhotoCap}">
            ${activePhotoCaption}
          </div>
        </div>
      </div>
    `;
  } else if (effMode === 'plates') {
    visualsHtml = `
      <div class="px-4 py-3">
        <div data-action="lightbox" data-src="${s.plate}" data-title="${safeName}" data-sci="${safeSci}" data-badge="DIAGNOSTIC PLATE" data-caption="${safePlateCap}" class="relative bg-slate-950 rounded-lg border border-slate-800/90 overflow-hidden flex flex-col justify-between cursor-zoom-in group/img transition hover:border-sky-500/50 hover:shadow-lg" title="Click to view fullscreen plate">
          <div class="absolute top-2 left-2.5 right-2.5 flex items-center justify-between z-10">
            <span class="text-[10px] font-bold uppercase tracking-wider text-sky-400 bg-slate-950/85 backdrop-blur-sm px-2 py-0.5 rounded border border-sky-800/40 pointer-events-none">Diagnostic Plate</span>
            <button data-action="flip-asset" data-species-id="${s.id}" class="text-[10px] font-mono font-semibold text-slate-300 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 px-2 py-0.5 rounded transition shadow-sm pointer-events-auto cursor-pointer flex items-center gap-1">
              <svg class="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/></svg>
              Flip to Photo
            </button>
          </div>
          <div class="h-48 sm:h-56 md:h-64 flex items-center justify-center p-2 overflow-hidden">
            <img src="${s.plate}" alt="${s.name} Plate" loading="lazy" class="max-h-full max-w-full object-contain transition duration-200 group-hover/img:scale-105">
          </div>
          <div class="bg-slate-950/90 border-t border-slate-800/60 px-3 py-1.5 text-[11px] text-slate-400 truncate">
            ${s.plate_caption || 'Standard lateral profile'}
          </div>
        </div>
      </div>
    `;
  } else {
    // Photos mode
    visualsHtml = `
      <div class="px-4 py-3">
        <div data-action="lightbox" data-src="${activePhotoUrl}" data-title="${safeName}" data-sci="${safeSci}" data-badge="FIELD PHOTO" data-caption="${safePhotoCap}" class="relative bg-slate-950 rounded-lg border border-slate-800/90 overflow-hidden flex flex-col justify-between cursor-zoom-in group/img transition hover:border-emerald-500/50 hover:shadow-lg" title="Click to view fullscreen photo">
          <div class="absolute top-2 left-2.5 right-2.5 flex items-center justify-between z-10">
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-slate-950/85 backdrop-blur-sm px-2 py-0.5 rounded border border-emerald-800/40 pointer-events-none">Field Photo</span>
              <div class="pointer-events-auto">${photoToggleHtml}</div>
            </div>
            <button data-action="flip-asset" data-species-id="${s.id}" class="text-[10px] font-mono font-semibold text-slate-300 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 px-2 py-0.5 rounded transition shadow-sm pointer-events-auto cursor-pointer flex items-center gap-1">
              <svg class="w-3 h-3 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              Flip to Plate
            </button>
          </div>
          <div class="h-48 sm:h-56 md:h-64 flex items-center justify-center p-2 overflow-hidden">
            <img src="${activePhotoUrl}" alt="${s.name} Photo" loading="lazy" class="max-h-full max-w-full object-contain transition duration-200 group-hover/img:scale-105">
          </div>
          <div class="bg-slate-950/90 border-t border-slate-800/60 px-3 py-1.5 text-[11px] text-slate-400 truncate">
            ${activePhotoCaption}
          </div>
        </div>
      </div>
    `;
  }

  // 3-Column Anatomical Tract Footer (Full untruncated text)
  const diagnostics = Array.isArray(s.diagnostics) ? s.diagnostics : [];
  const diagHtml = diagnostics.map(d => {
    const label = d.tract || 'Mark';
    return `
      <div>
        <span class="text-[10px] font-black uppercase tracking-wider text-sky-400 block mb-0.5">${label}</span>
        <span class="text-slate-200 leading-snug block">${d.mark}</span>
      </div>
    `;
  }).join('');

  // Universal compare button across all complexes
  const compareBtnHtml = `
    <button data-action="compare" data-species-id="${s.id}" class="${compareBtnClass(isCompared)}" title="Add to side-by-side comparison matrix">
      <span>${isCompared ? '✓ Compared' : '+ Compare'}</span>
    </button>
  `;

  card.innerHTML = `
    <div class="flex-1 min-w-0 flex flex-col justify-between">
      <div>
        <!-- Consolidated Card Header -->
        <div class="px-4 py-3 border-b border-slate-800/80 flex items-center justify-between gap-2 flex-wrap bg-slate-900/60">
          <div class="flex items-center gap-2.5 min-w-0 flex-wrap">
            <span class="text-xs font-black text-slate-500 font-mono">#${s.rank}</span>
            <h2 class="text-base sm:text-lg font-bold tracking-tight text-white whitespace-normal">${s.name}</h2>
            <span class="text-xs italic font-serif text-slate-400 hidden sm:inline">${s.sci}</span>
            ${sexBadgeHtml}
            ${guildBadgeHtml}
          </div>

          <div class="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0 ml-auto">
            ${frequencyBadge}
            ${biometricPillHtml}
            ${compareBtnHtml}
            <button data-action="dismiss" data-species-id="${s.id}" title="Dismiss this species (rule it out from view)" aria-label="Dismiss ${s.name}" class="p-1.5 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-800/60 transition cursor-pointer">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Elevated Key ID / Rule-Out Banner (Top of Card for Rapid Vertical Triage) -->
        ${s.rule_out ? `
          <div class="mx-4 mt-3 px-3 py-2 rounded-lg bg-amber-950/35 border border-amber-500/35 flex items-start gap-2 text-xs text-amber-100/95">
            <svg class="w-4 h-4 text-amber-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            <div><strong class="text-amber-300 font-bold uppercase tracking-wider text-[10px] mr-1.5">Key ID:</strong> ${s.rule_out}</div>
          </div>
        ` : ''}

        <!-- Rarity Callout for Review Species -->
        ${rarityCallout}

        <!-- Full-Bleed Dual Visual Stage -->
        ${visualsHtml}
      </div>

      <!-- 3-Column Anatomical Tract Footer -->
      ${diagHtml ? `
        <div class="bg-slate-950/80 border-t border-slate-800/80 px-4 py-2.5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          ${diagHtml}
        </div>
      ` : ''}
    </div>
  `;

  // Delegate clicks on interactive buttons inside card
  card.onclick = (e) => {
    const target = e.target.closest('[data-action]');
    if (!target) return;
    const action = target.getAttribute('data-action');
    const id = target.getAttribute('data-species-id') || s.id;

    if (action === 'dismiss' && typeof onDismiss === 'function') {
      e.stopPropagation();
      onDismiss(id);
    } else if (action === 'toggle-photo' && typeof onTogglePhoto === 'function') {
      e.stopPropagation();
      const mode = target.getAttribute('data-mode');
      onTogglePhoto(id, mode);
    } else if (action === 'switch-variant' && typeof onSwitchPhotoVariant === 'function') {
      e.stopPropagation();
      const idx = parseInt(target.getAttribute('data-index'), 10);
      onSwitchPhotoVariant(id, idx);
    } else if (action === 'flip-asset' && typeof onFlipAsset === 'function') {
      e.stopPropagation();
      onFlipAsset(id);
    } else if (action === 'compare' && typeof onToggleCompare === 'function') {
      e.stopPropagation();
      onToggleCompare(id);
    } else if (action === 'lightbox') {
      e.stopPropagation();
      const src = target.getAttribute('data-src');
      const title = target.getAttribute('data-title');
      const sci = target.getAttribute('data-sci');
      const badge = target.getAttribute('data-badge');
      const caption = target.getAttribute('data-caption');

      const allStages = Array.from(document.querySelectorAll('#speciesFeed [data-action="lightbox"]'));
      const gallery = allStages.map(el => ({
        src: el.getAttribute('data-src'),
        title: el.getAttribute('data-title'),
        subtitle: el.getAttribute('data-sci'),
        badgeText: el.getAttribute('data-badge'),
        caption: el.getAttribute('data-caption')
      }));

      if (typeof window.openLightbox === 'function') {
        window.openLightbox(src, title, sci, badge, caption, gallery);
      }
    }
  };

  return card;
}
