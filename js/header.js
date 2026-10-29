/**
 * AVN Fieldguide Header Component (Tier 1: System Navigation & View Bar)
 * Renders brand identity, taxonomic complex tabs, view mode switchers, grid density, and sort selector.
 */

import { GUIDES } from './data-loader.js';

export function renderHeader(container, state, callbacks = {}) {
  const {
    activeGuide = 'sparrows',
    activeAssetMode = 'both',
    gridCols = 1,
    currentSort = 'freq-desc'
  } = state;

  const {
    onSelectGuide = () => {},
    onSetAssetMode = () => {},
    onSetGridDensity = () => {},
    onSetSort = () => {}
  } = callbacks;

  container.className = "sticky top-0 z-40 bg-[#060913]/95 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-6 py-2 select-none";
  container.innerHTML = `
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2 sm:gap-3">
      
      <!-- Brand & Taxonomic Complex Tabs -->
      <div class="flex items-center gap-3 min-w-0">
        <div class="flex items-center gap-2 shrink-0">
          <span class="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]"></span>
          <span class="font-extrabold text-xs tracking-wider uppercase text-white">AVN Fieldguide</span>
        </div>

        <nav class="flex items-center gap-1 border-l border-slate-800 pl-3 text-xs overflow-x-auto no-scrollbar" role="tablist" aria-label="Bird complex selection">
          ${GUIDES.map(g => {
            const isActive = g.id === activeGuide;
            const shortName = g.name.split(' ')[0];
            if (isActive) {
              return `<span role="tab" aria-selected="true" class="px-2.5 py-1 rounded-md font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm shrink-0 cursor-default">${shortName}</span>`;
            }
            return `
              <a href="index.html?guide=${g.id}" data-guide="${g.id}" role="tab" aria-selected="false" class="guide-tab-link px-2.5 py-1 rounded-md font-medium text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent transition shrink-0">
                ${shortName}
              </a>
            `;
          }).join('')}
        </nav>
      </div>

      <!-- Right: View Mode, Grid Density & Sort Controls -->
      <div class="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-full md:shrink-0 py-0.5 text-xs">
        
        <!-- Asset Mode Selector: Both / Plates / Photos -->
        <div class="inline-flex rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-xs shrink-0" role="group" aria-label="Asset visual mode">
          <button id="assetBothBtn" data-mode="both" class="px-2.5 py-1 rounded-md transition flex items-center gap-1.5 cursor-pointer ${activeAssetMode === 'both' ? 'text-white bg-slate-800 shadow-sm font-semibold' : 'text-slate-400 hover:text-white font-medium'}" title="Show both standardized plates and field photos side-by-side (Press P to cycle)">
            <svg class="w-3.5 h-3.5 text-sky-400 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="1.5" y="2.5" width="5.5" height="11" rx="1"/>
              <rect x="9" y="2.5" width="5.5" height="11" rx="1"/>
            </svg>
            <span>Both</span>
          </button>
          <button id="assetPlatesBtn" data-mode="plates" class="px-2.5 py-1 rounded-md transition flex items-center gap-1.5 cursor-pointer ${activeAssetMode === 'plates' ? 'text-white bg-slate-800 shadow-sm font-semibold' : 'text-slate-400 hover:text-white font-medium'}" title="Diagnostic plates only (Press P to cycle)">
            <svg class="w-3.5 h-3.5 text-sky-400 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M2 13.5L14 13.5M3.5 10.5C5.5 6.5 9.5 5 13 6.5C11.5 9.5 8.5 10.5 3.5 10.5Z" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Plates</span>
          </button>
          <button id="assetPhotosBtn" data-mode="photos" class="px-2.5 py-1 rounded-md transition flex items-center gap-1.5 cursor-pointer ${activeAssetMode === 'photos' ? 'text-white bg-slate-800 shadow-sm font-semibold' : 'text-slate-400 hover:text-white font-medium'}" title="Field photographs only (Press P to cycle)">
            <svg class="w-3.5 h-3.5 text-emerald-400 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="1.5" y="3.5" width="13" height="9.5" rx="1.5"/>
              <circle cx="8" cy="8.25" r="2.25"/>
            </svg>
            <span>Photos</span>
          </button>
        </div>

        <!-- Density View Mode Toggle: 1/row, 2/row, 3/row -->
        <div class="inline-flex rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-xs shrink-0" role="group" aria-label="Layout column density">
          <button id="gridCol1Btn" data-cols="1" class="px-2 py-1 rounded-md transition flex items-center gap-1 cursor-pointer ${gridCols === 1 ? 'text-white bg-slate-800 shadow-sm font-semibold' : 'text-slate-400 hover:text-white font-medium'}" title="1 per row: Full-width diagnostic slab view">
            <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
              <rect x="2" y="2" width="12" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/>
              <rect x="4.5" y="4.5" width="7" height="7" rx="1"/>
            </svg>
            <span class="hidden xl:inline">1/row</span>
          </button>
          <button id="gridCol2Btn" data-cols="2" class="px-2 py-1 rounded-md transition flex items-center gap-1 cursor-pointer ${gridCols === 2 ? 'text-white bg-slate-800 shadow-sm font-semibold' : 'text-slate-400 hover:text-white font-medium'}" title="2 per row: Dual-column comparative view">
            <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
              <rect x="1.5" y="2" width="13" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/>
              <rect x="3.5" y="4.5" width="4" height="7" rx="0.75"/>
              <rect x="8.5" y="4.5" width="4" height="7" rx="0.75"/>
            </svg>
            <span class="hidden xl:inline">2/row</span>
          </button>
          <button id="gridCol3Btn" data-cols="3" class="px-2 py-1 rounded-md transition flex items-center gap-1 cursor-pointer ${gridCols === 3 ? 'text-white bg-slate-800 shadow-sm font-semibold' : 'text-slate-400 hover:text-white font-medium'}" title="3 per row: Compact matrix overview">
            <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
              <rect x="1" y="2" width="14" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/>
              <rect x="2.5" y="4.5" width="2.8" height="7" rx="0.5"/>
              <rect x="6.6" y="4.5" width="2.8" height="7" rx="0.5"/>
              <rect x="10.7" y="4.5" width="2.8" height="7" rx="0.5"/>
            </svg>
            <span class="hidden xl:inline">3/row</span>
          </button>
        </div>

        <!-- Sort Select -->
        <select id="sortSelect" aria-label="Sort species" class="bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs rounded-lg px-2.5 py-1 font-medium focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer shrink-0">
          <option value="freq-desc" ${currentSort === 'freq-desc' ? 'selected' : ''}>Sort: eBird Freq</option>
          <option value="freq-asc" ${currentSort === 'freq-asc' ? 'selected' : ''}>Sort: Rarity First</option>
          <option value="size-asc" ${currentSort === 'size-asc' ? 'selected' : ''}>Size: Small → Large</option>
          <option value="size-desc" ${currentSort === 'size-desc' ? 'selected' : ''}>Size: Large → Small</option>
          <option value="bill-asc" ${currentSort === 'bill-asc' ? 'selected' : ''}>Beak: Short → Long</option>
          <option value="bill-desc" ${currentSort === 'bill-desc' ? 'selected' : ''}>Beak: Long → Short</option>
          <option value="name-asc" ${currentSort === 'name-asc' ? 'selected' : ''}>Alphabetical (A-Z)</option>
        </select>
      </div>

    </div>
  `;

  // Attach event listeners
  container.querySelectorAll('.guide-tab-link').forEach(link => {
    link.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
      e.preventDefault();
      onSelectGuide(link.getAttribute('data-guide'));
    });
  });

  container.querySelectorAll('[data-mode]').forEach(btn => {
    btn.addEventListener('click', () => {
      onSetAssetMode(btn.getAttribute('data-mode'));
    });
  });

  container.querySelectorAll('[data-cols]').forEach(btn => {
    btn.addEventListener('click', () => {
      onSetGridDensity(parseInt(btn.getAttribute('data-cols'), 10));
    });
  });

  const sortSelect = container.querySelector('#sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      onSetSort(e.target.value);
    });
  }
}
