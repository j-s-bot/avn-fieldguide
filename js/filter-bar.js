/**
 * AVN Fieldguide Filter Bar Component
 * Renders targeted checklist banner and guide-specific interactive facet filters.
 */

function chipClass(isActive, isPrimary = true) {
  if (isActive) {
    return isPrimary
      ? 'bg-sky-600 text-white font-bold shadow-sm ring-1 ring-sky-400/50'
      : 'bg-slate-800 text-white font-bold border border-slate-700 shadow-sm';
  }
  return 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700';
}

function forkBtnClass(isActive) {
  if (isActive) {
    return 'py-2 px-3 rounded-lg text-xs font-bold transition flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 cursor-pointer bg-sky-600 text-white shadow-sm ring-1 ring-sky-400/50';
  }
  return 'py-2 px-3 rounded-lg text-xs font-bold transition flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 cursor-pointer bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-900';
}

function buildBeakSwatchesHtml(speciesList, activeBillColors, includeTwoTone) {
  const colorsPresent = new Set();
  let hasMulticolor = false;
  speciesList.forEach(s => {
    (s.bill_colors || []).forEach(c => colorsPresent.add(c));
    if (s.bill_multicolor) hasMulticolor = true;
  });

  if (colorsPresent.size === 0) return '';

  const colorMeta = [
    { id: 'blue', name: 'Blue', dotBg: 'bg-sky-400', border: 'border-sky-300/40' },
    { id: 'orange', name: 'Orange', dotBg: 'bg-orange-400', border: 'border-orange-300/40' },
    { id: 'yellow', name: 'Yellow', dotBg: 'bg-yellow-400', border: 'border-yellow-300/40' },
    { id: 'red', name: 'Red', dotBg: 'bg-rose-500', border: 'border-rose-400/40' },
    { id: 'pink', name: 'Pink', dotBg: 'bg-rose-300', border: 'border-rose-200/40' },
    { id: 'black', name: 'Dark/Slate', dotBg: 'bg-slate-400', border: 'border-slate-300/50' }
  ].filter(c => colorsPresent.has(c.id));

  const anyActive = activeBillColors.size > 0;

  const dotsHtml = colorMeta.map(bc => {
    const isSelected = activeBillColors.has(bc.id);
    const count = speciesList.filter(s => (s.bill_colors || []).includes(bc.id) && (includeTwoTone || !s.bill_multicolor)).length;
    const activeStyle = isSelected
      ? 'ring-2 ring-white scale-125 shadow-lg opacity-100'
      : (anyActive ? 'opacity-35 hover:opacity-90' : 'opacity-80 hover:opacity-100 hover:scale-125');
    return `
      <button data-beak="${bc.id}" title="${bc.name} Beak (${count} matching species) - click to filter" class="w-4 h-4 rounded-full ${bc.dotBg} ${bc.border} transition-all shadow cursor-pointer shrink-0 ${activeStyle}" aria-label="${bc.name} beak"></button>
    `;
  }).join('');

  const twoToneBtn = hasMulticolor ? `
    <span class="text-slate-700 mx-0.5">|</span>
    <button data-action="toggle-bill-two-tone" class="filter-chip px-1.5 py-0.5 rounded text-[10px] font-bold border transition flex items-center gap-1 cursor-pointer ${includeTwoTone ? 'bg-sky-950 text-sky-200 border-sky-500/80 shadow-sm' : 'bg-slate-900 text-slate-400 border-slate-700 opacity-60'}" title="${includeTwoTone ? 'Two-tone & patterned bills INCLUDED (click to show solid monochrome only)' : 'Solid monochrome bills ONLY (click to include two-tone)'}">
      <span>${includeTwoTone ? '✓ ±Two-Tone' : 'Solid Only'}</span>
    </button>
  ` : '';

  return `
    <div class="flex items-center gap-1.5 bg-slate-950/90 border border-slate-800 rounded-full px-2 py-1 shrink-0" title="Filter by Beak Color">
      <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 select-none mr-0.5">Beak:</span>
      ${dotsHtml}
      ${twoToneBtn}
    </div>
  `;
}

function buildLegSwatchesHtml(speciesList, activeLegColors) {
  const colorsPresent = new Set();
  speciesList.forEach(s => (s.leg_colors || []).forEach(c => colorsPresent.add(c)));
  if (colorsPresent.size === 0) return '';

  const legMeta = [
    { id: 'yellow', name: 'Yellow Legs', dotBg: 'bg-amber-400', border: 'border-amber-300/40' },
    { id: 'green', name: 'Green / Olive Legs', dotBg: 'bg-emerald-400', border: 'border-emerald-300/40' },
    { id: 'orange', name: 'Orange Legs', dotBg: 'bg-orange-400', border: 'border-orange-300/40' },
    { id: 'pink', name: 'Pink / Flesh Legs', dotBg: 'bg-rose-300', border: 'border-rose-200/40' },
    { id: 'red', name: 'Red Legs', dotBg: 'bg-rose-500', border: 'border-rose-400/40' },
    { id: 'black', name: 'Dark / Black Legs', dotBg: 'bg-slate-400', border: 'border-slate-300/50' }
  ].filter(c => colorsPresent.has(c.id));

  const anyActive = activeLegColors.size > 0;

  const dotsHtml = legMeta.map(lc => {
    const isSelected = activeLegColors.has(lc.id);
    const count = speciesList.filter(s => (s.leg_colors || []).includes(lc.id)).length;
    const activeStyle = isSelected
      ? 'ring-2 ring-white scale-125 shadow-lg opacity-100'
      : (anyActive ? 'opacity-35 hover:opacity-90' : 'opacity-80 hover:opacity-100 hover:scale-125');
    return `
      <button data-leg="${lc.id}" title="${lc.name} (${count} matching species) - click to filter" class="w-4 h-4 rounded-full ${lc.dotBg} ${lc.border} transition-all shadow cursor-pointer shrink-0 ${activeStyle}" aria-label="${lc.name}"></button>
    `;
  }).join('');

  return `
    <div class="flex items-center gap-1.5 bg-slate-950/90 border border-slate-800 rounded-full px-2 py-1 shrink-0" title="Filter by Leg Color">
      <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 select-none mr-0.5">Legs:</span>
      ${dotsHtml}
    </div>
  `;
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
    urlSpeciesFilter = null
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
    onToggleTwoTone = () => {},
    onResetAllFilters = () => {},
    onClearUrlFilter = () => {},
    onCopyShareLink = () => {}
  } = callbacks;

  const guideId = guideData.id || 'sparrows';
  const meta = guideData.meta || {};
  const speciesList = guideData.species || [];

  container.innerHTML = '';

  // 1. Checklist Banner if urlSpeciesFilter is active
  if (urlSpeciesFilter !== null) {
    const allowedList = speciesList.filter(s => urlSpeciesFilter.has(s.id));
    const previewText = allowedList.length > 0
      ? Array.from(new Set(allowedList.map(s => s.name.replace(/\s*\([^)]*\)/, '')))).join(', ')
      : 'No species found matching checklist filter tokens';
    const banner = document.createElement('div');
    banner.className = "max-w-7xl mx-auto px-3 sm:px-6 pt-3";
    banner.innerHTML = `
      <div class="bg-gradient-to-r from-sky-950/90 via-slate-900 to-sky-950/80 border border-sky-500/50 rounded-2xl p-3 sm:p-4 shadow-xl">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
          <div class="flex items-center gap-2.5 min-w-0">
            <span class="w-2.5 h-2.5 rounded-full bg-sky-400 shrink-0 ring-2 ring-sky-400/30"></span>
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-xs font-black uppercase tracking-wider text-white">Targeted Checklist Active</span>
                <span class="text-[10px] font-mono-num font-bold px-2 py-0.5 rounded bg-sky-900/80 text-sky-200 border border-sky-600/70">
                  ${allowedList.length} of ${speciesList.length} Cards
                </span>
              </div>
              <p class="text-[11px] text-slate-300 truncate max-w-xl mt-0.5">
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

  // 2. Guide-Specific Filter Panel
  const panel = document.createElement('div');
  panel.className = "max-w-7xl mx-auto px-3 sm:px-6 pt-3";

  const beakSwatchesHtml = buildBeakSwatchesHtml(speciesList, activeBillColors, includeTwoTone);
  const legSwatchesHtml = buildLegSwatchesHtml(speciesList, activeLegColors);

  if (guideId === 'sparrows') {
    // SPARROWS LAYOUT
    panel.innerHTML = `
      <div class="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-2.5 sm:p-3 shadow-xl space-y-2.5">
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div class="grid grid-cols-3 gap-1.5 flex-1 bg-slate-950 p-1 rounded-xl border border-slate-800/80">
            <button data-fork="all" class="${forkBtnClass(activeBreastFork === 'all')}">
              <span>All 11 Sparrows</span>
            </button>
            <button data-fork="streaked" class="${forkBtnClass(activeBreastFork === 'streaked')}">
              <span>⚡ Streaked (5)</span>
            </button>
            <button data-fork="unstreaked" class="${forkBtnClass(activeBreastFork === 'unstreaked')}">
              <span>🛡️ Plain (6)</span>
            </button>
          </div>
          <button id="resetFiltersBtn" class="px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition cursor-pointer self-end sm:self-center">
            Reset
          </button>
        </div>

        <div class="pt-2 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 shrink-0 select-none pl-0.5">Crux Traits:</span>
          ${[
            { id: 'yellow_lores', label: 'Yellow Lores' },
            { id: 'eyering', label: 'Eye-Ring' },
            { id: 'rufous_cap', label: 'Rufous Cap' },
            { id: 'pink_bill', label: 'Pink Bill' }
          ].map(t => {
            const isActive = activeTraits.has(t.id);
            return `
              <button data-trait="${t.id}" class="filter-chip px-2.5 py-0.5 rounded text-xs font-medium transition cursor-pointer shrink-0 ${chipClass(isActive)}">
                ${t.label}
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `;

    panel.querySelectorAll('[data-fork]').forEach(btn => {
      btn.onclick = () => onSetBreastFork(btn.getAttribute('data-fork'));
    });

  } else if (guideId === 'ducks') {
    // TWO-ROW DUCK FILTER LAYOUT with 5-color beak swatches & Two-Tone Toggle
    panel.innerHTML = `
      <div class="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-2.5 sm:p-3 shadow-xl space-y-2">
        <!-- Row 1: Primary Triage (Sex, Rarity, Guild, Beak Color Palette, Two-Tone Toggle) -->
        <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
          <!-- Sex filters -->
          <button data-sex="all" title="Show all 29 drake and hen cards" class="filter-chip px-2 py-1 rounded text-xs shrink-0 transition cursor-pointer ${chipClass(activeSex === 'all')}">All 29</button>
          <button data-sex="drake" title="Filter to male / drake variants only" class="filter-chip px-2 py-1 rounded text-xs shrink-0 transition cursor-pointer ${chipClass(activeSex === 'drake')}">Drake</button>
          <button data-sex="hen" title="Filter to female / hen variants only" class="filter-chip px-2 py-1 rounded text-xs shrink-0 transition cursor-pointer ${chipClass(activeSex === 'hen')}">Hen (Female)</button>

          <span class="text-slate-700">|</span>

          <!-- eBird Rarity Tiers -->
          <button data-rarity="all" title="Show all eBird status levels" class="filter-chip px-2 py-1 rounded text-xs shrink-0 transition cursor-pointer ${chipClass(activeRarity === 'all', false)}">All Status</button>
          <button data-rarity="common" title="eBird Common: Expected species (>15% checklists)" class="filter-chip px-2 py-1 rounded text-xs shrink-0 transition cursor-pointer ${chipClass(activeRarity === 'common')}">Common</button>
          <button data-rarity="uncommon" title="eBird Uncommon: Regular seasonal migrants (1% - 15% checklists)" class="filter-chip px-2 py-1 rounded text-xs shrink-0 transition cursor-pointer ${chipClass(activeRarity === 'uncommon')}">Uncommon</button>
          <button data-rarity="rare" title="Low-probability vagrants (<0.1% eBird checklists)" class="filter-chip px-2 py-1 rounded text-xs shrink-0 transition cursor-pointer flex items-center gap-1 ${activeRarity === 'rare' ? 'bg-slate-800 text-slate-200 border border-slate-600 font-semibold' : 'bg-slate-950 text-slate-500 border border-slate-800/80 hover:text-slate-300 hover:border-slate-700'}"><span class="text-slate-600 font-mono text-[10px]">⊘</span> Unlikely Vagrant</button>

          <span class="text-slate-700">|</span>

          <!-- Guild filters -->
          <button data-trait="dabbler" title="Dabbler: Puddle ducks that feed on the surface" class="filter-chip px-2 py-1 rounded text-xs shrink-0 transition cursor-pointer ${chipClass(activeTraits.has('dabbler'))}">Dabbler</button>
          <button data-trait="diver" title="Diver: Diving ducks that submerge to feed" class="filter-chip px-2 py-1 rounded text-xs shrink-0 transition cursor-pointer ${chipClass(activeTraits.has('diver'))}">Diver</button>

          <span class="text-slate-700">|</span>

          <!-- Beak Swatches + Two-Tone Toggle -->
          ${beakSwatchesHtml}

          <!-- Reset Button on Far Right -->
          <div class="ml-auto pl-2 shrink-0">
            <button id="resetFiltersBtn" class="px-2.5 py-1 rounded text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition cursor-pointer">
              Reset
            </button>
          </div>
        </div>

        <!-- Row 2: Crux Plumage Traits -->
        <div class="pt-2 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 shrink-0 select-none pl-0.5">Crux Traits:</span>
          ${Object.entries(meta.traitLabels || {
            'spatulate_bill': 'Spatulate Bill',
            'white_bill_ring': 'White Bill Ring',
            'crested_head': 'Crested / Tufted',
            'green_head': 'Green Head/Patch',
            'white_cheek_patch': 'White Cheek Patch',
            'white_speculum': 'White Speculum',
            'stiff_tail': 'Stiff Tail',
            'white_bill_base': 'White at Bill Base'
          }).map(([k, label]) => {
            const isActive = activeTraits.has(k);
            return `
              <button data-trait="${k}" class="filter-chip px-2.5 py-0.5 rounded text-xs font-medium transition cursor-pointer shrink-0 ${chipClass(isActive)}">
                ${label}
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `;

    panel.querySelectorAll('[data-sex]').forEach(btn => {
      btn.onclick = () => onSetSex(btn.getAttribute('data-sex'));
    });

  } else {
    // Universal Layout for Gulls, Shorebirds, Terns, Grebes, Swans
    let groupChipsHtml = '';
    if (meta.groupIds && meta.groupLabels) {
      groupChipsHtml = `
        <div class="flex items-center gap-1 shrink-0">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 select-none mr-1">Group:</span>
          <button data-group="all" class="filter-chip px-2 py-0.5 rounded text-xs shrink-0 transition cursor-pointer ${chipClass(activeGroup === 'all')}">All</button>
          ${meta.groupIds.filter(g => g !== 'all').map(gId => `
            <button data-group="${gId}" class="filter-chip px-2 py-0.5 rounded text-xs shrink-0 transition cursor-pointer ${chipClass(activeGroup === gId)}">
              ${(meta.groupLabels[gId] || gId).replace(/\s*\(.*\)/, '')}
            </button>
          `).join('')}
          <span class="text-slate-700 mx-1">|</span>
        </div>
      `;
    } else if (meta.ageOptions) {
      groupChipsHtml = `
        <div class="flex items-center gap-1 shrink-0">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 select-none mr-1">Age:</span>
          ${meta.ageOptions.map(age => `
            <button data-age="${age}" class="filter-chip px-2 py-0.5 rounded text-xs shrink-0 transition cursor-pointer ${chipClass(activeAge === age)}">
              ${age === 'all' ? 'All Ages' : (age.charAt(0).toUpperCase() + age.slice(1))}
            </button>
          `).join('')}
          <span class="text-slate-700 mx-1">|</span>
        </div>
      `;
    }

    panel.innerHTML = `
      <div class="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-2.5 sm:p-3 shadow-xl space-y-2">
        <!-- Row 1: Groups / Ages & Rarity, Legs & Beak Swatches, Two-Tone Toggle -->
        <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
          ${groupChipsHtml}

          <!-- eBird Rarity Tiers -->
          <div class="flex items-center gap-1 shrink-0">
            <button data-rarity="all" class="filter-chip px-2 py-0.5 rounded text-xs shrink-0 transition cursor-pointer ${chipClass(activeRarity === 'all', false)}">All Status</button>
            <button data-rarity="common" class="filter-chip px-2 py-0.5 rounded text-xs shrink-0 transition cursor-pointer ${chipClass(activeRarity === 'common')}">Common</button>
            <button data-rarity="uncommon" class="filter-chip px-2 py-0.5 rounded text-xs shrink-0 transition cursor-pointer ${chipClass(activeRarity === 'uncommon')}">Uncommon</button>
            <button data-rarity="rare" title="Low-probability vagrants (<0.1% eBird checklists)" class="filter-chip px-2 py-0.5 rounded text-xs shrink-0 transition cursor-pointer flex items-center gap-1 ${activeRarity === 'rare' ? 'bg-slate-800 text-slate-200 border border-slate-600 font-semibold' : 'bg-slate-950 text-slate-500 border border-slate-800/80 hover:text-slate-300 hover:border-slate-700'}"><span class="text-slate-600 font-mono text-[10px]">⊘</span> Unlikely Vagrant</button>
          </div>

          ${legSwatchesHtml ? `<span class="text-slate-700">|</span>${legSwatchesHtml}` : ''}
          ${beakSwatchesHtml ? `<span class="text-slate-700">|</span>${beakSwatchesHtml}` : ''}

          <!-- Reset Button on Far Right -->
          <div class="ml-auto pl-2 shrink-0">
            <button id="resetFiltersBtn" class="px-2.5 py-1 rounded text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition cursor-pointer">
              Reset
            </button>
          </div>
        </div>

        <!-- Row 2: Crux Plumage Traits -->
        <div class="pt-2 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 shrink-0 select-none pl-0.5">Crux Traits:</span>
          ${Object.entries(meta.traitLabels || {}).map(([k, label]) => {
            const isActive = activeTraits.has(k);
            return `
              <button data-trait="${k}" class="filter-chip px-2.5 py-0.5 rounded text-xs font-medium transition cursor-pointer shrink-0 ${chipClass(isActive)}">
                ${label}
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `;

    panel.querySelectorAll('[data-group]').forEach(btn => {
      btn.onclick = () => onSetGroup(btn.getAttribute('data-group'));
    });
    panel.querySelectorAll('[data-age]').forEach(btn => {
      btn.onclick = () => onSetAge(btn.getAttribute('data-age'));
    });
  }

  // Common listeners across all guides
  panel.querySelectorAll('[data-rarity]').forEach(btn => {
    btn.onclick = () => onSetRarity(btn.getAttribute('data-rarity'));
  });
  panel.querySelectorAll('[data-trait]').forEach(btn => {
    btn.onclick = () => onToggleTrait(btn.getAttribute('data-trait'));
  });
  panel.querySelectorAll('[data-beak]').forEach(btn => {
    btn.onclick = () => onToggleBillColor(btn.getAttribute('data-beak'));
  });
  panel.querySelectorAll('[data-leg]').forEach(btn => {
    btn.onclick = () => onToggleLegColor(btn.getAttribute('data-leg'));
  });
  panel.querySelectorAll('[data-action="toggle-bill-two-tone"]').forEach(btn => {
    btn.onclick = () => onToggleTwoTone();
  });

  const resetBtn = panel.querySelector('#resetFiltersBtn');
  if (resetBtn) resetBtn.onclick = onResetAllFilters;

  container.appendChild(panel);
}
