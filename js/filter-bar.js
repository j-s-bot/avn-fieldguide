/**
 * AVN Fieldguide Filter Bar Component (Tier 2: The Anatomical HUD)
 * Renders targeted checklist banner, single-row 48px Anatomical HUD bar,
 * tactile Color Triage & Crux Marks popovers, and inline removable filter chips.
 */

const BEAK_COLOR_META = [
  { id: 'blue', name: 'Blue', dotBg: 'bg-sky-400', border: 'border-sky-200/40' },
  { id: 'orange', name: 'Orange', dotBg: 'bg-orange-400', border: 'border-orange-200/40' },
  { id: 'yellow', name: 'Yellow', dotBg: 'bg-yellow-400', border: 'border-yellow-200/40' },
  { id: 'red', name: 'Red', dotBg: 'bg-rose-500', border: 'border-rose-300/40' },
  { id: 'pink', name: 'Pink', dotBg: 'bg-rose-300', border: 'border-rose-200/40' },
  { id: 'black', name: 'Dark / Black', dotBg: 'bg-slate-400', border: 'border-slate-300/40' }
];

const LEG_COLOR_META = [
  { id: 'yellow', name: 'Yellow Legs', shortName: 'Yellow', dotBg: 'bg-amber-400', border: 'border-amber-200/40' },
  { id: 'green', name: 'Green / Olive Legs', shortName: 'Green / Olive', dotBg: 'bg-emerald-400', border: 'border-emerald-200/40' },
  { id: 'orange', name: 'Orange Legs', shortName: 'Orange', dotBg: 'bg-orange-400', border: 'border-orange-200/40' },
  { id: 'pink', name: 'Pink / Flesh Legs', shortName: 'Pink / Flesh', dotBg: 'bg-rose-300', border: 'border-rose-200/40' },
  { id: 'red', name: 'Red Legs', shortName: 'Red', dotBg: 'bg-rose-500', border: 'border-rose-300/40' },
  { id: 'black', name: 'Dark / Black Legs', shortName: 'Dark / Black', dotBg: 'bg-slate-400', border: 'border-slate-300/40' }
];

const DOT_BG_MAP = {
  blue: 'bg-sky-400',
  orange: 'bg-orange-400',
  yellow: 'bg-amber-400',
  green: 'bg-emerald-400',
  red: 'bg-rose-500',
  pink: 'bg-rose-300',
  black: 'bg-slate-400'
};

function segBtnClass(isActive) {
  if (isActive) {
    return 'px-2.5 py-1 rounded-lg text-xs font-bold bg-sky-600 text-white shadow-sm transition cursor-pointer shrink-0';
  }
  return 'px-2.5 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition cursor-pointer shrink-0';
}

function rarityBtnClass(isActive, isRare = false) {
  if (isActive) {
    return isRare
      ? 'px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm transition cursor-pointer shrink-0'
      : 'px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 text-white shadow-sm transition cursor-pointer shrink-0';
  }
  return isRare
    ? 'px-2.5 py-1 rounded-lg text-xs font-medium text-amber-300/80 hover:text-amber-300 transition cursor-pointer shrink-0'
    : 'px-2.5 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition cursor-pointer shrink-0';
}

function getTraitEntries(guideId, meta) {
  if (guideId === 'sparrows') {
    return [
      ['yellow_lores', 'Yellow Lores'],
      ['eyering', 'Eye-Ring'],
      ['rufous_cap', 'Rufous Cap'],
      ['pink_bill', 'Pink Bill']
    ];
  }
  if (guideId === 'ducks') {
    const defaultDuckTraits = {
      spatulate_bill: 'Spatulate Bill',
      white_bill_ring: 'White Bill Ring',
      crested_head: 'Crested / Tufted',
      green_head: 'Green Head/Patch',
      white_cheek_patch: 'White Cheek Patch',
      white_speculum: 'White Speculum',
      stiff_tail: 'Stiff Tail',
      white_bill_base: 'White at Bill Base'
    };
    return Object.entries(meta.traitLabels || defaultDuckTraits);
  }
  return Object.entries(meta.traitLabels || {});
}

function countSpeciesWithTrait(guideId, speciesList, traitKey) {
  return speciesList.filter(s => {
    if (guideId === 'sparrows') {
      if (traitKey === 'yellow_lores') return Boolean(s.yellow);
      if (traitKey === 'eyering') return Boolean(s.eyering);
      if (traitKey === 'rufous_cap') return Boolean(s.rufous_crown);
      if (traitKey === 'pink_bill') return Boolean(s.pink_bill);
      return false;
    }
    return Array.isArray(s.traits) && s.traits.includes(traitKey);
  }).length;
}

export function renderFilterBar(container, guideData, filterState, callbacks = {}) {
  const {
    activeBreastFork = 'all',
    activeSex = 'all',
    activeAge = 'all',
    activeGroup = 'all',
    activeRarity = 'all',
    activeTraits = new Set(),
    activeBillColors = new Set(),
    activeLegColors = new Set(),
    includeTwoTone = true,
    urlSpeciesFilter = null,
    openTray = null,
    matchCount = 0,
    dismissedCount = 0
  } = filterState;

  const {
    onSetBreastFork = () => {},
    onSetSex = () => {},
    onSetAge = () => {},
    onSetGroup = () => {},
    onSetRarity = () => {},
    onToggleTrait = () => {},
    onToggleBillColor = () => {},
    onToggleLegColor = () => {},
    onSetTwoTone = () => {},
    onClearColors = () => {},
    onSetOpenTray = () => {},
    onResetAllFilters = () => {},
    onUnhideAll = () => {},
    onClearUrlFilter = () => {},
    onCopyShareLink = () => {}
  } = callbacks;

  const guideId = guideData.id || 'sparrows';
  const meta = guideData.meta || {};
  const speciesList = guideData.species || [];

  container.innerHTML = '';

  // 1. Targeted Checklist Banner (if urlSpeciesFilter is active)
  if (urlSpeciesFilter !== null) {
    const allowedList = speciesList.filter(s => urlSpeciesFilter.has(s.id));
    const previewText = allowedList.length > 0
      ? Array.from(new Set(allowedList.map(s => s.name.replace(/\s*\([^)]*\)/, '')))).join(', ')
      : 'No species found matching checklist filter tokens';
    const banner = document.createElement('div');
    banner.className = "max-w-7xl mx-auto px-3 sm:px-6 pt-3";
    banner.innerHTML = `
      <div class="bg-slate-900 border border-sky-500/50 rounded-2xl p-3 sm:p-4 shadow-xl">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
          <div class="flex items-center gap-2.5 min-w-0">
            <span class="w-2.5 h-2.5 rounded-full bg-sky-400 shrink-0 ring-2 ring-sky-400/30"></span>
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-xs font-black uppercase tracking-wider text-white">Targeted Checklist Active</span>
                <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-sky-900/80 text-sky-200 border border-sky-600/70">
                  ${allowedList.length} of ${speciesList.length} Cards
                </span>
              </div>
              <p class="text-xs text-slate-300 truncate max-w-xl mt-0.5">
                ${previewText}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button id="copyShareBtn" class="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 hover:text-white border border-slate-700 transition flex items-center gap-1.5 shadow-sm cursor-pointer">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              <span>Copy Link</span>
            </button>
            <button id="clearChecklistBtn" class="px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-600 text-white hover:bg-sky-500 transition shadow-sm flex items-center gap-1 cursor-pointer">
              <span>Show All (${speciesList.length})</span>
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        </div>
      </div>
    `;

    banner.querySelector('#copyShareBtn').onclick = onCopyShareLink;
    banner.querySelector('#clearChecklistBtn').onclick = onClearUrlFilter;
    container.appendChild(banner);
  }

  // 2. Discover Color & Trait Capabilities for Active Guide
  const beakColorsPresent = new Set();
  const legColorsPresent = new Set();
  let hasMulticolorBeak = false;
  let hasRarity = false;

  speciesList.forEach(s => {
    (s.bill_colors || []).forEach(c => beakColorsPresent.add(c));
    (s.leg_colors || []).forEach(c => legColorsPresent.add(c));
    if (s.bill_multicolor) hasMulticolorBeak = true;
    if (s.rarity) hasRarity = true;
  });

  const availableBeakMeta = BEAK_COLOR_META.filter(c => beakColorsPresent.has(c.id));
  const availableLegMeta = LEG_COLOR_META.filter(c => legColorsPresent.has(c.id));
  const hasColorTriage = availableBeakMeta.length > 0 || availableLegMeta.length > 0;

  const traitEntries = getTraitEntries(guideId, meta);
  const traitMap = Object.fromEntries(traitEntries);

  // Build Facet 1: Primary Morph / Group Control
  let primaryFacetHtml = '';
  let groupPopoverHtml = '';

  if (guideId === 'sparrows') {
    const streakedCount = speciesList.filter(s => s.breast === 'streaked').length;
    const plainCount = speciesList.filter(s => s.breast === 'unstreaked').length;
    primaryFacetHtml = `
      <div class="inline-flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5 text-xs shrink-0" role="group" aria-label="Breast pattern">
        <button data-fork="all" class="${segBtnClass(activeBreastFork === 'all')}">All ${speciesList.length}</button>
        <button data-fork="streaked" class="${segBtnClass(activeBreastFork === 'streaked')}">Streaked (${streakedCount})</button>
        <button data-fork="unstreaked" class="${segBtnClass(activeBreastFork === 'unstreaked')}">Plain (${plainCount})</button>
      </div>
    `;
  } else if (guideId === 'ducks') {
    primaryFacetHtml = `
      <div class="inline-flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5 text-xs shrink-0" role="group" aria-label="Plumage sex">
        <button data-sex="all" class="${segBtnClass(activeSex === 'all')}">All ${speciesList.length}</button>
        <button data-sex="drake" class="${segBtnClass(activeSex === 'drake')}">Drake</button>
        <button data-sex="hen" class="${segBtnClass(activeSex === 'hen')}">Hen</button>
      </div>
      <div class="inline-flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5 text-xs shrink-0" role="group" aria-label="Foraging guild">
        <button data-trait="dabbler" class="${segBtnClass(activeTraits.has('dabbler'))}">Dabbler</button>
        <button data-trait="diver" class="${segBtnClass(activeTraits.has('diver'))}">Diver</button>
      </div>
    `;
  } else if (meta.ageOptions) {
    primaryFacetHtml = `
      <div class="inline-flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5 text-xs shrink-0" role="group" aria-label="Age cycle">
        ${meta.ageOptions.map(age => `
          <button data-age="${age}" class="${segBtnClass(activeAge === age)}">
            ${age === 'all' ? 'All Ages' : (age.charAt(0).toUpperCase() + age.slice(1))}
          </button>
        `).join('')}
      </div>
    `;
  } else if (meta.groupIds && meta.groupLabels) {
    const activeGroupLabel = activeGroup === 'all'
      ? 'All'
      : (meta.groupLabels[activeGroup] || activeGroup).replace(/\s*\(.*\)/, '');
    const isGroupOpen = openTray === 'group';

    primaryFacetHtml = `
      <div class="relative shrink-0">
        <button data-tray-trigger="group" class="px-3 py-1.5 rounded-xl text-xs font-semibold ${activeGroup !== 'all' || isGroupOpen ? 'bg-sky-950/60 border-sky-500/60 text-sky-100' : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700'} border transition flex items-center gap-1.5 cursor-pointer">
          <span class="text-slate-400">Group:</span>
          <span class="text-white font-bold">${activeGroupLabel}</span>
          <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
        </button>
      </div>
    `;

    groupPopoverHtml = `
      <div id="tray-group" data-tray="group" class="${isGroupOpen ? '' : 'hidden'} absolute top-14 left-3 w-72 max-w-[90vw] bg-slate-950/95 border border-slate-700 rounded-2xl p-3.5 shadow-2xl backdrop-blur-xl z-50">
        <div class="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-300">Taxonomic Group</span>
          <button data-action="close-tray" class="text-xs text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 cursor-pointer">Done</button>
        </div>
        <div class="grid grid-cols-1 gap-1 text-xs">
          <button data-group="all" class="text-left px-3 py-2 rounded-xl transition flex items-center justify-between cursor-pointer ${activeGroup === 'all' ? 'bg-sky-600 text-white font-bold' : 'hover:bg-slate-900 text-slate-200 font-medium'}">
            <span>All ${guideData.name}</span>
            <span class="font-mono text-xs ${activeGroup === 'all' ? 'text-sky-100' : 'text-slate-400'}">${speciesList.length}</span>
          </button>
          ${meta.groupIds.filter(g => g !== 'all').map(gId => {
            const grpCount = speciesList.filter(s => s.group === gId).length;
            const isSel = activeGroup === gId;
            return `
              <button data-group="${gId}" class="text-left px-3 py-2 rounded-xl transition flex items-center justify-between cursor-pointer ${isSel ? 'bg-sky-600 text-white font-bold' : 'hover:bg-slate-900 text-slate-300'}">
                <span>${meta.groupLabels[gId] || gId}</span>
                <span class="font-mono text-xs ${isSel ? 'text-sky-100' : 'text-slate-400'}">${grpCount}</span>
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // Build Facet 2: Color Triage Trigger & Popover Workbench
  let colorTriggerHtml = '';
  let colorPopoverHtml = '';

  if (hasColorTriage) {
    const activeColorCount = activeBillColors.size + activeLegColors.size + (!includeTwoTone ? 1 : 0);
    const isColorOpen = openTray === 'color';

    // Dots preview inside trigger button
    const activeDotsList = [
      ...Array.from(activeBillColors),
      ...Array.from(activeLegColors)
    ].slice(0, 4);

    const triggerDotsHtml = activeDotsList.length > 0
      ? activeDotsList.map(c => `<span class="w-2.5 h-2.5 rounded-full ${DOT_BG_MAP[c] || 'bg-slate-400'} ring-1 ring-white/60"></span>`).join('')
      : `<span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span><span class="w-2.5 h-2.5 rounded-full bg-sky-400"></span>`;

    colorTriggerHtml = `
      <div class="relative shrink-0">
        <button id="hudColorTrigger" data-tray-trigger="color" class="px-3 py-1.5 rounded-xl text-xs font-semibold ${activeColorCount > 0 || isColorOpen ? 'bg-sky-950/70 border-sky-500/70 text-sky-100 shadow-sm' : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700'} border transition flex items-center gap-2 cursor-pointer">
          <span class="flex items-center gap-1">${triggerDotsHtml}</span>
          <span>Color Triage</span>
          ${activeColorCount > 0 ? `<span class="bg-sky-500 text-slate-950 font-black px-1.5 py-0.2 rounded-full text-xs">${activeColorCount}</span>` : ''}
          <svg class="w-3.5 h-3.5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
        </button>
      </div>
    `;

    // Build Beak Section inside Color Popover
    let beakSectionHtml = '';
    if (availableBeakMeta.length > 0) {
      const twoToneSwitchHtml = hasMulticolorBeak ? `
        <div class="inline-flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs" role="group" aria-label="Bill pattern mode">
          <button data-action="set-two-tone" data-twotone="true" class="px-2 py-1 rounded-md flex items-center gap-1.5 transition cursor-pointer ${includeTwoTone ? 'font-bold bg-sky-600 text-white shadow-sm' : 'font-medium text-slate-400 hover:text-white'}" title="Include both solid and two-toned bills">
            <svg class="w-3 h-3 shrink-0" viewBox="0 0 16 16" fill="currentColor"><path d="M8 15A7 7 0 1 0 8 1v14zm0 1A8 8 0 1 1 8 0a8 8 0 0 1 0 16z"/></svg>
            <span>Include Two-Tone</span>
          </button>
          <button data-action="set-two-tone" data-twotone="false" class="px-2 py-1 rounded-md flex items-center gap-1.5 transition cursor-pointer ${!includeTwoTone ? 'font-bold bg-amber-600 text-white shadow-sm' : 'font-medium text-slate-400 hover:text-white'}" title="Show only solid monochrome bills">
            <svg class="w-3 h-3 shrink-0" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="7"/></svg>
            <span>Solid Only</span>
          </button>
        </div>
      ` : '';

      const beakCardsHtml = availableBeakMeta.map(bc => {
        const isSelected = activeBillColors.has(bc.id);
        const count = speciesList.filter(s => (s.bill_colors || []).includes(bc.id) && (includeTwoTone || !s.bill_multicolor)).length;
        const activeClasses = isSelected
          ? 'ring-2 ring-sky-400 bg-sky-950/60 border-sky-400 shadow-md'
          : 'bg-slate-900 hover:bg-slate-800/80 border-slate-800';
        return `
          <button data-beak="${bc.id}" title="${bc.name} Beak (${count} matching species) - click to filter" aria-label="${bc.name} beak" class="flex items-center gap-2.5 p-2 rounded-xl border transition cursor-pointer text-left ${activeClasses}">
            <span class="w-5 h-5 rounded-full ${bc.dotBg} border ${bc.border} shadow shrink-0"></span>
            <div class="min-w-0">
              <div class="text-xs font-bold text-slate-100 leading-tight truncate">${bc.name}</div>
              <div class="text-xs text-slate-400 font-mono">${count} species</div>
            </div>
          </button>
        `;
      }).join('');

      beakSectionHtml = `
        <div class="space-y-2">
          <div class="flex items-center justify-between gap-2 flex-wrap">
            <span class="text-xs font-bold text-slate-300 uppercase tracking-wider">Beak Color</span>
            ${twoToneSwitchHtml}
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            ${beakCardsHtml}
          </div>
        </div>
      `;
    }

    // Build Leg Section inside Color Popover
    let legSectionHtml = '';
    if (availableLegMeta.length > 0) {
      const legCardsHtml = availableLegMeta.map(lc => {
        const isSelected = activeLegColors.has(lc.id);
        const count = speciesList.filter(s => (s.leg_colors || []).includes(lc.id)).length;
        const activeClasses = isSelected
          ? 'ring-2 ring-sky-400 bg-sky-950/60 border-sky-400 shadow-md'
          : 'bg-slate-900 hover:bg-slate-800/80 border-slate-800';
        return `
          <button data-leg="${lc.id}" title="${lc.name} (${count} matching species) - click to filter" aria-label="${lc.name}" class="flex items-center gap-2.5 p-2 rounded-xl border transition cursor-pointer text-left ${activeClasses}">
            <span class="w-5 h-5 rounded-full ${lc.dotBg} border ${lc.border} shadow shrink-0"></span>
            <div class="min-w-0">
              <div class="text-xs font-bold text-slate-100 leading-tight truncate">${lc.shortName}</div>
              <div class="text-xs text-slate-400 font-mono">${count} species</div>
            </div>
          </button>
        `;
      }).join('');

      legSectionHtml = `
        <div class="space-y-2 ${beakSectionHtml ? 'pt-3 border-t border-slate-800/80' : ''}">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-300 uppercase tracking-wider">Leg Color</span>
            <span class="text-xs text-slate-400">Multi-select</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            ${legCardsHtml}
          </div>
        </div>
      `;
    }

    colorPopoverHtml = `
      <div id="tray-color" data-tray="color" class="${isColorOpen ? '' : 'hidden'} absolute top-14 left-3 sm:left-24 w-[460px] max-w-[94vw] bg-slate-950/95 border border-sky-500/50 rounded-2xl p-4 shadow-2xl backdrop-blur-xl z-50 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-sky-400"></span>
            <span class="text-xs font-bold uppercase tracking-wider text-white">Anatomical Color Triage</span>
          </div>
          <div class="flex items-center gap-2.5">
            <button data-action="clear-colors" class="text-xs text-sky-400 hover:underline font-semibold cursor-pointer">Clear Colors</button>
            <button data-action="close-tray" class="text-xs text-slate-300 hover:text-white bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 cursor-pointer font-semibold">Done</button>
          </div>
        </div>
        ${beakSectionHtml}
        ${legSectionHtml}
      </div>
    `;
  }

  // Build Facet 3: Crux Marks Trigger & Popover Matrix
  let marksTriggerHtml = '';
  let marksPopoverHtml = '';

  if (traitEntries.length > 0) {
    const nonGuildTraitsCount = Array.from(activeTraits).filter(t => t !== 'dabbler' && t !== 'diver').length;
    const isMarksOpen = openTray === 'marks';

    marksTriggerHtml = `
      <div class="relative shrink-0">
        <button id="hudMarksTrigger" data-tray-trigger="marks" class="px-3 py-1.5 rounded-xl text-xs font-semibold ${nonGuildTraitsCount > 0 || isMarksOpen ? 'bg-amber-950/60 border-amber-500/60 text-amber-100 shadow-sm' : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700'} border transition flex items-center gap-1.5 cursor-pointer">
          <span>Crux Marks</span>
          ${nonGuildTraitsCount > 0 ? `<span class="bg-amber-500 text-slate-950 font-black px-1.5 py-0.2 rounded-full text-xs">${nonGuildTraitsCount}</span>` : ''}
          <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
        </button>
      </div>
    `;

    const traitButtonsHtml = traitEntries.map(([k, label]) => {
      const isSelected = activeTraits.has(k);
      const count = countSpeciesWithTrait(guideId, speciesList, k);
      const activeClasses = isSelected
        ? 'bg-amber-950/70 border-amber-400 text-amber-200 font-bold shadow-sm'
        : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white font-medium';
      return `
        <button data-trait="${k}" class="px-3 py-2 rounded-xl border text-xs text-left flex items-center justify-between gap-2 transition cursor-pointer ${activeClasses}">
          <span class="truncate">${label}</span>
          <span class="font-mono text-xs ${isSelected ? 'text-amber-300' : 'text-slate-400'} shrink-0">${count}</span>
        </button>
      `;
    }).join('');

    marksPopoverHtml = `
      <div id="tray-marks" data-tray="marks" class="${isMarksOpen ? '' : 'hidden'} absolute top-14 left-3 sm:left-48 w-[480px] max-w-[94vw] bg-slate-950/95 border border-slate-700 rounded-2xl p-4 shadow-2xl backdrop-blur-xl z-50 space-y-3">
        <div class="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-200">Diagnostic Field Marks (Crux Traits)</span>
          <button data-action="close-tray" class="text-xs text-slate-300 hover:text-white bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 cursor-pointer font-semibold">Done</button>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          ${traitButtonsHtml}
        </div>
      </div>
    `;
  }

  // Build Facet 4: Status / Rarity Segmented Pill
  let rarityFacetHtml = '';
  if (hasRarity) {
    rarityFacetHtml = `
      <div class="inline-flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5 text-xs shrink-0" role="group" aria-label="eBird status">
        <button data-rarity="all" title="Show all eBird status levels" class="${rarityBtnClass(activeRarity === 'all')}">All Status</button>
        <button data-rarity="common" title="eBird Common: Expected species" class="${rarityBtnClass(activeRarity === 'common')}">Common</button>
        <button data-rarity="uncommon" title="eBird Uncommon: Regular seasonal migrants" class="${rarityBtnClass(activeRarity === 'uncommon')}">Uncommon</button>
        <button data-rarity="rare" title="Low-probability vagrants (<0.1% eBird checklists)" class="${rarityBtnClass(activeRarity === 'rare', true)}">Rare</button>
      </div>
    `;
  }

  // Build Inline Active Filter Chips (1-click dismissal without opening popovers)
  const activeChips = [];

  if (activeGroup !== 'all' && meta.groupLabels) {
    const grpLabel = (meta.groupLabels[activeGroup] || activeGroup).replace(/\s*\(.*\)/, '');
    activeChips.push(`
      <button data-remove-group="all" class="px-2 py-0.5 rounded-full bg-slate-950 border border-slate-700 hover:border-rose-500 text-xs text-slate-200 flex items-center gap-1.5 transition cursor-pointer shrink-0" title="Remove group filter">
        <span>${grpLabel}</span>
        <span class="text-slate-400">✕</span>
      </button>
    `);
  }

  activeBillColors.forEach(c => {
    activeChips.push(`
      <button data-remove-beak="${c}" class="px-2 py-0.5 rounded-full bg-slate-950 border border-slate-700 hover:border-rose-500 text-xs text-slate-200 flex items-center gap-1.5 transition cursor-pointer shrink-0" title="Remove ${c} beak filter">
        <span class="w-2 h-2 rounded-full ${DOT_BG_MAP[c] || 'bg-slate-400'}"></span>
        <span class="capitalize">${c} Beak</span>
        <span class="text-slate-400">✕</span>
      </button>
    `);
  });

  if (!includeTwoTone && hasMulticolorBeak) {
    activeChips.push(`
      <button data-action="set-two-tone" data-twotone="true" class="px-2 py-0.5 rounded-full bg-amber-950/70 border border-amber-600/70 hover:border-rose-500 text-xs text-amber-200 flex items-center gap-1.5 transition cursor-pointer shrink-0" title="Restore two-tone bills">
        <svg class="w-2.5 h-2.5 text-amber-400 shrink-0" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="7"/></svg>
        <span>Solid Bills Only</span>
        <span class="text-amber-400">✕</span>
      </button>
    `);
  }

  activeLegColors.forEach(c => {
    activeChips.push(`
      <button data-remove-leg="${c}" class="px-2 py-0.5 rounded-full bg-slate-950 border border-slate-700 hover:border-rose-500 text-xs text-slate-200 flex items-center gap-1.5 transition cursor-pointer shrink-0" title="Remove ${c} legs filter">
        <span class="w-2 h-2 rounded-full ${DOT_BG_MAP[c] || 'bg-slate-400'}"></span>
        <span class="capitalize">${c} Legs</span>
        <span class="text-slate-400">✕</span>
      </button>
    `);
  });

  activeTraits.forEach(t => {
    if (guideId === 'ducks' && (t === 'dabbler' || t === 'diver')) return;
    const tLabel = traitMap[t] || t;
    activeChips.push(`
      <button data-remove-trait="${t}" class="px-2 py-0.5 rounded-full bg-slate-950 border border-amber-700/70 hover:border-rose-500 text-xs text-amber-200 flex items-center gap-1.5 transition cursor-pointer shrink-0" title="Remove ${tLabel} filter">
        <span>${tLabel}</span>
        <span class="text-slate-400">✕</span>
      </button>
    `);
  });

  const activeChipsHtml = activeChips.length > 0
    ? `<div class="flex items-center gap-1.5 pl-2 border-l border-slate-800 flex-wrap">${activeChips.join('')}</div>`
    : '';

  // Assemble the HUD Bar
  const panel = document.createElement('div');
  panel.className = "max-w-7xl mx-auto px-3 sm:px-6 pt-3 relative z-30";
  panel.innerHTML = `
    <div class="bg-slate-900/90 border border-slate-800/90 rounded-2xl px-3 py-2 shadow-xl flex flex-wrap items-center justify-between gap-2 relative">
      
      <!-- Left: Facet Triggers & Active Chips -->
      <div class="flex items-center gap-2 flex-wrap min-w-0">
        ${primaryFacetHtml}
        ${colorTriggerHtml}
        ${marksTriggerHtml}
        ${rarityFacetHtml}
        ${activeChipsHtml}
      </div>

      <!-- Right: Live Candidate Counter, Unhide, & Reset -->
      <div class="flex items-center gap-2 ml-auto shrink-0">
        <span id="matchCounter" class="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-800/60 px-2.5 py-1 rounded-lg tabular-nums">
          ${matchCount} / ${speciesList.length} shown
        </span>

        <button id="unhideBtn" class="${dismissedCount > 0 ? '' : 'hidden'} px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-950/80 text-rose-300 border border-rose-800/80 hover:bg-rose-900 transition flex items-center gap-1 cursor-pointer">
          <span>Unhide (<span id="unhideCount">${dismissedCount}</span>)</span>
        </button>

        <button id="resetFiltersBtn" class="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition cursor-pointer">
          Reset
        </button>
      </div>

      <!-- Floating Popover Trays -->
      ${groupPopoverHtml}
      ${colorPopoverHtml}
      ${marksPopoverHtml}
    </div>
  `;

  // Wire Event Listeners
  panel.querySelectorAll('[data-tray-trigger]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const targetTray = btn.getAttribute('data-tray-trigger');
      onSetOpenTray(openTray === targetTray ? null : targetTray);
    };
  });

  panel.querySelectorAll('[data-action="close-tray"]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      onSetOpenTray(null);
    };
  });

  panel.querySelectorAll('[data-action="clear-colors"]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      onClearColors();
    };
  });

  panel.querySelectorAll('[data-action="set-two-tone"]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const val = btn.getAttribute('data-twotone') === 'true';
      onSetTwoTone(val);
    };
  });

  panel.querySelectorAll('[data-fork]').forEach(btn => {
    btn.onclick = () => onSetBreastFork(btn.getAttribute('data-fork'));
  });

  panel.querySelectorAll('[data-sex]').forEach(btn => {
    btn.onclick = () => onSetSex(btn.getAttribute('data-sex'));
  });

  panel.querySelectorAll('[data-age]').forEach(btn => {
    btn.onclick = () => onSetAge(btn.getAttribute('data-age'));
  });

  panel.querySelectorAll('[data-group]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      onSetGroup(btn.getAttribute('data-group'));
    };
  });

  panel.querySelectorAll('[data-rarity]').forEach(btn => {
    btn.onclick = () => onSetRarity(btn.getAttribute('data-rarity'));
  });

  panel.querySelectorAll('[data-trait]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      onToggleTrait(btn.getAttribute('data-trait'));
    };
  });

  panel.querySelectorAll('[data-beak]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      onToggleBillColor(btn.getAttribute('data-beak'));
    };
  });

  panel.querySelectorAll('[data-leg]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      onToggleLegColor(btn.getAttribute('data-leg'));
    };
  });

  panel.querySelectorAll('[data-remove-group]').forEach(btn => {
    btn.onclick = () => onSetGroup('all');
  });

  panel.querySelectorAll('[data-remove-beak]').forEach(btn => {
    btn.onclick = () => onToggleBillColor(btn.getAttribute('data-remove-beak'));
  });

  panel.querySelectorAll('[data-remove-leg]').forEach(btn => {
    btn.onclick = () => onToggleLegColor(btn.getAttribute('data-remove-leg'));
  });

  panel.querySelectorAll('[data-remove-trait]').forEach(btn => {
    btn.onclick = () => onToggleTrait(btn.getAttribute('data-remove-trait'));
  });

  const resetBtn = panel.querySelector('#resetFiltersBtn');
  if (resetBtn) resetBtn.onclick = onResetAllFilters;

  const unhideBtn = panel.querySelector('#unhideBtn');
  if (unhideBtn) unhideBtn.onclick = onUnhideAll;

  container.appendChild(panel);
}
