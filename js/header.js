/**
 * AVN Fieldguide Header Component
 * Top system header with guide tabs, density switchers, asset toggles, sort dropdown, and results counter.
 */

import { GUIDES } from './data-loader.js';

export function renderHeader(container, state, callbacks = {}) {
  const {
    activeGuide = 'sparrows',
    activeAssetMode = 'both',
    gridCols = 3,
    currentSort = 'freq-desc',
    dismissedCount = 0,
    matchCount = 0,
    guideName = 'Sparrows'
  } = state;

  const {
    onSelectGuide = () => {},
    onSetAssetMode = () => {},
    onToggleAssetHotkey = () => {},
    onSetGridDensity = () => {},
    onSetSort = () => {},
    onUnhideAll = () => {}
  } = callbacks;

  const activeGuideObj = GUIDES.find(g => g.id === activeGuide) || GUIDES[0];

  container.className = "sticky top-0 z-40 bg-[#060913]/95 backdrop-blur-md border-b border-slate-800/80 px-2.5 sm:px-6 py-1.5 sm:py-2 select-none";
  container.innerHTML = `
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-1.5 sm:gap-3">
      
      <!-- Brand & Guide Complex Selector -->
      <div class="flex items-center gap-3 min-w-0">
        <div class="flex items-center gap-1.5 shrink-0">
          <span class="w-2 h-2 rounded-full bg-sky-400"></span>
          <span class="font-extrabold text-sm tracking-tight uppercase text-white">AVN Fieldguide</span>
          <span id="activeGuideBadge" class="text-[10px] font-mono-num font-semibold text-sky-400 px-1.5 py-0.5 rounded bg-sky-950/60 border border-sky-800/60 ml-0.5 uppercase">${activeGuideObj.name}</span>
        </div>

        <!-- Navigation Tabs between Guides -->
        <nav class="flex items-center gap-1 ml-2 border-l border-slate-800 pl-3 text-xs overflow-x-auto no-scrollbar" role="tablist" aria-label="Bird complex selection">
          ${GUIDES.map(g => {
            const isActive = g.id === activeGuide;
            if (isActive) {
              return `<span role="tab" aria-selected="true" class="px-2.5 py-1 rounded-md font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40 shrink-0 cursor-default">${g.label}</span>`;
            }
            return `
              <a href="index.html?guide=${g.id}" data-guide="${g.id}" role="tab" aria-selected="false" class="guide-tab-link px-2.5 py-1 rounded-md font-medium text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent transition shrink-0">
                ${g.label}
              </a>
            `;
          }).join('')}
        </nav>
      </div>

      <!-- Quick Actions / View Controls -->
      <div class="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar max-w-full py-0.5">
        
        <!-- Results Match Counter -->
        <span id="matchCounter" class="text-xs font-semibold tabular-nums text-slate-300 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 shrink-0">
          ${matchCount} shown
        </span>

        <!-- Unhide All Reset Button -->
        <button id="unhideBtn" class="${dismissedCount > 0 ? '' : 'hidden'} px-2 py-1 rounded-md text-xs font-semibold bg-rose-950/80 text-rose-300 border border-rose-800/80 hover:bg-rose-900 transition flex items-center gap-1 cursor-pointer shrink-0">
          <span>Unhide (<span id="unhideCount">${dismissedCount}</span>)</span>
        </button>

        <!-- Asset Mode Selector: Both / Plates / Photos -->
        <div class="inline-flex rounded-lg bg-slate-900/90 border border-slate-800 p-0.5 text-xs shrink-0" role="group" aria-label="Asset visual mode">
          <button id="assetBothBtn" data-mode="both" class="px-2.5 py-1 rounded-md font-semibold transition flex items-center gap-1 cursor-pointer ${activeAssetMode === 'both' ? 'text-white bg-slate-800 shadow-sm' : 'text-slate-400 hover:text-white'}" title="Show both standardized drawings and field photos side-by-side">
            <span>⚡ Both</span>
          </button>
          <button id="assetPlatesBtn" data-mode="plates" class="px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1 cursor-pointer ${activeAssetMode === 'plates' ? 'text-white bg-slate-800 shadow-sm font-semibold' : 'text-slate-400 hover:text-white'}" title="Drawings only (Press P to toggle)">
            <span>🎨 Plates</span>
          </button>
          <button id="assetPhotosBtn" data-mode="photos" class="px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1 cursor-pointer ${activeAssetMode === 'photos' ? 'text-white bg-slate-800 shadow-sm font-semibold' : 'text-slate-400 hover:text-white'}" title="Field photos only (Press P to toggle)">
            <span>📷 Photos</span>
          </button>
        </div>

        <!-- Hotkey Pill Indicator -->
        <button id="hotkeyBtn" class="hidden lg:inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-slate-200 transition cursor-pointer shrink-0" title="Press 'P' on keyboard to flip all cards between Plates and Photos">
          <kbd class="px-1 py-0.2 bg-slate-800 border border-slate-700 rounded text-[10px] text-sky-400 font-mono font-bold">P</kbd>
          <span id="hotkeyLabel" class="capitalize">${activeAssetMode} (P)</span>
        </button>

        <!-- Density View Mode Toggle: 1/row, 2/row, 3/row -->
        <div class="inline-flex rounded-lg bg-slate-900/90 border border-slate-800 p-0.5 text-xs shrink-0" role="group" aria-label="Layout column density">
          <button id="gridCol1Btn" data-cols="1" class="px-2 py-1 rounded-md font-medium transition flex items-center gap-1.5 cursor-pointer ${gridCols === 1 ? 'text-white bg-slate-800 shadow-sm font-semibold' : 'text-slate-400 hover:text-white'}" title="1 per row: Large expanded specimen view with big photos and diagnostic anatomy">
            <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
              <rect x="2" y="2" width="12" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/>
              <rect x="4.5" y="4.5" width="7" height="7" rx="1"/>
            </svg>
            <span class="text-[11px] font-semibold hidden xl:inline">1/row</span>
          </button>
          <button id="gridCol2Btn" data-cols="2" class="px-2 py-1 rounded-md font-medium transition flex items-center gap-1.5 cursor-pointer ${gridCols === 2 ? 'text-white bg-slate-800 shadow-sm font-semibold' : 'text-slate-400 hover:text-white'}" title="2 per row: Balanced dual-column comparison view with generous image frames">
            <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
              <rect x="1.5" y="2" width="13" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/>
              <rect x="3.5" y="4.5" width="4" height="7" rx="0.75"/>
              <rect x="8.5" y="4.5" width="4" height="7" rx="0.75"/>
            </svg>
            <span class="text-[11px] font-semibold hidden xl:inline">2/row</span>
          </button>
          <button id="gridCol3Btn" data-cols="3" class="px-2 py-1 rounded-md font-medium transition flex items-center gap-1.5 cursor-pointer ${gridCols === 3 ? 'text-white bg-slate-800 shadow-sm font-semibold' : 'text-slate-400 hover:text-white'}" title="3 per row: Compact identification matrix overview">
            <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
              <rect x="1" y="2" width="14" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/>
              <rect x="2.5" y="4.5" width="2.8" height="7" rx="0.5"/>
              <rect x="6.6" y="4.5" width="2.8" height="7" rx="0.5"/>
              <rect x="10.7" y="4.5" width="2.8" height="7" rx="0.5"/>
            </svg>
            <span class="text-[11px] font-semibold hidden xl:inline">3/row</span>
          </button>
        </div>

        <!-- Sort Select -->
        <select id="sortSelect" class="bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs rounded-lg px-2.5 py-1 font-medium focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer shrink-0">
          <option value="freq-desc" ${currentSort === 'freq-desc' ? 'selected' : ''}>eBird Frequency</option>
          <option value="freq-asc" ${currentSort === 'freq-asc' ? 'selected' : ''}>Rarity First</option>
          <option value="size-asc" ${currentSort === 'size-asc' ? 'selected' : ''}>Size: Small &rarr; Large</option>
          <option value="size-desc" ${currentSort === 'size-desc' ? 'selected' : ''}>Size: Large &rarr; Small</option>
          <option value="bill-asc" ${currentSort === 'bill-asc' ? 'selected' : ''}>Beak: Short &rarr; Long</option>
          <option value="bill-desc" ${currentSort === 'bill-desc' ? 'selected' : ''}>Beak: Long &rarr; Short</option>
          <option value="name-asc" ${currentSort === 'name-asc' ? 'selected' : ''}>Alphabetical (A-Z)</option>
        </select>
      </div>

    </div>
  `;

  // Attach event listeners
  const navLinks = container.querySelectorAll('.guide-tab-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
      e.preventDefault();
      const targetGuide = link.getAttribute('data-guide');
      onSelectGuide(targetGuide);
    });
  });

  const assetBtns = container.querySelectorAll('[data-mode]');
  assetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      onSetAssetMode(btn.getAttribute('data-mode'));
    });
  });

  const hotkeyBtn = container.querySelector('#hotkeyBtn');
  if (hotkeyBtn) {
    hotkeyBtn.addEventListener('click', onToggleAssetHotkey);
  }

  const densityBtns = container.querySelectorAll('[data-cols]');
  densityBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      onSetGridDensity(parseInt(btn.getAttribute('data-cols'), 10));
    });
  });

  const sortSelect = container.querySelector('#sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      onSetSort(sortSelect.value);
    });
  }

  const unhideBtn = container.querySelector('#unhideBtn');
  if (unhideBtn) {
    unhideBtn.addEventListener('click', onUnhideAll);
  }
}
