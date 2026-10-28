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

export function renderFilterBar(container, guideData, filterState, callbacks = {}) {
  const {
    activeBreastFork = 'all',
    activeSex = 'all',
    activeAge = 'all',
    activeGroup = 'all',
    activeRarity = 'all',
    activeTraits = new Set(),
    activeBillColors = new Set(),
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

    const copyBtn = banner.querySelector('#copyShareBtn');
    if (copyBtn) copyBtn.onclick = onCopyShareLink;
    const clearBtn = banner.querySelector('#clearChecklistBtn');
    if (clearBtn) clearBtn.onclick = onClearUrlFilter;

    container.appendChild(banner);
  }

  // 2. Guide-Specific Filter Panel
  const panel = document.createElement('section');
  panel.className = "max-w-7xl mx-auto px-3 sm:px-6 pt-3 pb-1 select-none";

  if (guideId === 'sparrows') {
    panel.innerHTML = `
      <div class="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-2.5 sm:p-3 shadow-xl">
        <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <!-- Left: Guidance -->
          <div class="flex items-center gap-2.5">
            <span class="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold text-xs shrink-0">1</span>
            <div>
              <div class="text-xs font-extrabold uppercase tracking-wider text-slate-200">First Field Fork: Underparts</div>
              <div class="text-[11px] text-slate-400">Look at breast/belly: is it heavily striped or plain?</div>
            </div>
          </div>

          <!-- Center: Master Binary Segmented Control -->
          <div class="grid grid-cols-3 gap-1.5 p-1 bg-slate-950/80 rounded-xl flex-1 max-w-xl">
            <button data-fork="all" class="${forkBtnClass(activeBreastFork === 'all')}">
              <span>All Sparrows</span>
            </button>
            <button data-fork="streaked" class="${forkBtnClass(activeBreastFork === 'streaked')}">
              <span>Streaked</span>
            </button>
            <button data-fork="unstreaked" class="${forkBtnClass(activeBreastFork === 'unstreaked')}">
              <span>Clean / Plain</span>
            </button>
          </div>

          <!-- Right: Clear Filters -->
          <div class="flex items-center justify-end">
            <button id="resetFiltersBtn" class="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition cursor-pointer">
              Reset Filters
            </button>
          </div>
        </div>

        <!-- Trait Pills Secondary Row -->
        <div class="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
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
    // TWO-ROW DUCK FILTER LAYOUT with 5-color beak swatches
    const billColorsMeta = meta.billColorsMeta || [
      { id: 'blue', name: 'Blue Beak', tooltip: 'Blue / Lead-blue Beak (12 species: Scaup, Wigeon, Ring-necked, Pintail Drake, Bufflehead Drake)', dotBg: 'bg-sky-400', border: 'border-sky-300/40' },
      { id: 'orange', name: 'Orange Beak', tooltip: 'Orange / Two-tone Beak (4 species: Mallard Hen, Gadwall Hen, Shoveler Hen, Merganser Hen)', dotBg: 'bg-orange-400', border: 'border-orange-300/40' },
      { id: 'yellow', name: 'Yellow Beak', tooltip: 'Yellow / Olive Beak (2 species: Mallard Drake, Black Duck)', dotBg: 'bg-yellow-400', border: 'border-yellow-300/40' },
      { id: 'black', name: 'Dark / Slate Beak', tooltip: 'Dark / Slate Beak (16 species: Gadwall Drake, Teal, Shoveler Drake, Pintail Hen, etc.)', dotBg: 'bg-slate-400', border: 'border-slate-300/50' },
      { id: 'red', name: 'Red Beak', tooltip: 'Red / Tri-color Beak (1 species: Wood Duck Drake)', dotBg: 'bg-rose-500', border: 'border-rose-400/40' }
    ];

    panel.innerHTML = `
      <div class="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-2.5 sm:p-3 shadow-xl space-y-2">
        <!-- Row 1: Primary Triage (Sex, Rarity, Guild, Beak Color Palette) -->
        <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
          <!-- Sex filters -->
          <button data-sex="all" title="Show all 29 drake and hen cards" class="filter-chip px-2 py-1 rounded text-xs shrink-0 transition cursor-pointer ${chipClass(activeSex === 'all')}">All 29</button>
          <button data-sex="drake" title="Filter to male / drake variants only" class="filter-chip px-2 py-1 rounded text-xs shrink-0 transition cursor-pointer ${chipClass(activeSex === 'drake')}">Drake</button>
          <button data-sex="hen" title="Filter to female / hen variants only" class="filter-chip px-2.5 py-1 rounded text-xs shrink-0 transition cursor-pointer ${chipClass(activeSex === 'hen')}">Hen (Female)</button>

          <span class="text-slate-700">|</span>

          <!-- eBird Rarity Tiers -->
          <button data-rarity="all" title="Show all eBird status levels" class="filter-chip px-2 py-1 rounded text-xs shrink-0 transition cursor-pointer ${chipClass(activeRarity === 'all', false)}">All Status</button>
          <button data-rarity="common" title="eBird Common: Expected species (>15% checklists)" class="filter-chip px-2 py-1 rounded text-xs shrink-0 transition cursor-pointer ${chipClass(activeRarity === 'common')}">Common</button>
          <button data-rarity="uncommon" title="eBird Uncommon: Regular seasonal migrants (1% - 15% checklists)" class="filter-chip px-2 py-1 rounded text-xs shrink-0 transition cursor-pointer ${chipClass(activeRarity === 'uncommon')}">Uncommon</button>
          <button data-rarity="rare" title="eBird Rare / Review Species: Vagrants requiring documentation" class="filter-chip px-2 py-1 rounded text-xs font-medium shrink-0 transition cursor-pointer ${activeRarity === 'rare' ? 'bg-amber-500 text-slate-950 font-black ring-1 ring-amber-400 shadow-sm' : 'bg-slate-900 text-amber-300 border border-amber-500/50 hover:border-amber-400'}">&#9733; Rare</button>

          <span class="text-slate-700">|</span>

          <!-- Guild filters -->
          <button data-trait="dabbler" title="Dabbler: Puddle ducks that feed on the surface" class="filter-chip px-2 py-1 rounded text-xs shrink-0 transition cursor-pointer ${chipClass(activeTraits.has('dabbler'))}">Dabbler</button>
          <button data-trait="diver" title="Diver: Diving ducks that submerge to feed" class="filter-chip px-2 py-1 rounded text-xs shrink-0 transition cursor-pointer ${chipClass(activeTraits.has('diver'))}">Diver</button>

          <span class="text-slate-700">|</span>

          <!-- 5-Color Beak Swatches (Standalone dots with mouseover tooltips) -->
          <div class="flex items-center gap-1.5 bg-slate-950/90 border border-slate-800 rounded-full px-2 py-1 shrink-0" title="Filter by Beak Color (hover for species details)">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 select-none mr-0.5">Beak:</span>
            ${billColorsMeta.map(bc => {
              const isSelected = activeBillColors.has(bc.id);
              const activeStyle = isSelected ? 'ring-2 ring-white scale-125 shadow-lg' : 'hover:scale-125 opacity-90 hover:opacity-100';
              return `
                <button data-beak="${bc.id}" title="${bc.tooltip || bc.name}" class="w-4 h-4 rounded-full ${bc.dotBg} ${bc.border || 'border border-white/30'} transition-all shadow cursor-pointer shrink-0 ${activeStyle}" aria-label="${bc.name}"></button>
              `;
            }).join('')}
          </div>

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
    panel.querySelectorAll('[data-beak]').forEach(btn => {
      btn.onclick = () => onToggleBillColor(btn.getAttribute('data-beak'));
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
        <!-- Row 1: Groups / Ages & Rarity -->
        <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
          ${groupChipsHtml}

          <!-- eBird Rarity Tiers -->
          <div class="flex items-center gap-1 shrink-0">
            <button data-rarity="all" class="filter-chip px-2 py-0.5 rounded text-xs shrink-0 transition cursor-pointer ${chipClass(activeRarity === 'all', false)}">All Status</button>
            <button data-rarity="common" class="filter-chip px-2 py-0.5 rounded text-xs shrink-0 transition cursor-pointer ${chipClass(activeRarity === 'common')}">Common</button>
            <button data-rarity="uncommon" class="filter-chip px-2 py-0.5 rounded text-xs shrink-0 transition cursor-pointer ${chipClass(activeRarity === 'uncommon')}">Uncommon</button>
            <button data-rarity="rare" class="filter-chip px-2 py-0.5 rounded text-xs font-medium shrink-0 transition cursor-pointer ${activeRarity === 'rare' ? 'bg-amber-500 text-slate-950 font-black ring-1 ring-amber-400 shadow-sm' : 'bg-slate-900 text-amber-300 border border-amber-500/50 hover:border-amber-400'}">&#9733; Rare</button>
          </div>

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
  const resetBtn = panel.querySelector('#resetFiltersBtn');
  if (resetBtn) resetBtn.onclick = onResetAllFilters;

  container.appendChild(panel);
}
