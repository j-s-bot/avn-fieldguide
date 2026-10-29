/**
 * AVN Fieldguide Main Application Controller
 * Coordinates modular ES components, data loading, client-side routing, and reactive UI state.
 */

import { loadGuideData, GUIDES } from './data-loader.js';
import { renderHeader } from './header.js';
import { renderFilterBar } from './filter-bar.js';
import { renderSpeciesCard } from './species-card.js';
import { initLightbox, openLightbox, closeLightbox } from './lightbox.js';
import { initComparisonModal, setComparisonGuide, setComparisonUpdateListener, toggleCompare, clearComparison, isCompared } from './comparison-modal.js';
import { getRouteState, navigateToGuide, updateUrlParam, removeUrlParams, onRouteChanged } from './router.js';

class FieldguideApp {
  constructor() {
    this.activeGuideId = 'sparrows';
    this.guideData = null;

    // View & layout state
    this.currentGridCols = parseInt(localStorage.getItem('avn_sparrow_grid_cols') || localStorage.getItem('avn_grid_cols') || '1', 10);
    if (![1, 2, 3].includes(this.currentGridCols)) this.currentGridCols = 1;

    this.currentAssetMode = 'both'; // 'both' | 'plates' | 'photos'
    this.cardAssetOverrides = {};
    this.photoModes = {}; // speciesId -> 'primary' | 'crux'
    this.photoIndices = {}; // speciesId -> index

    // Elimination state
    this.dismissedIds = new Set();

    // Filters state
    this.activeBreastFork = 'all'; // sparrows
    this.activeSex = 'all'; // ducks
    this.activeAge = 'all'; // gulls
    this.activeGroup = 'all'; // shorebirds, terns, grebes, swans
    this.activeRarity = 'all';
    this.activeTraits = new Set();
    this.activeBillColors = new Set(); // Beak color triage (ducks, terns, swans, shorebirds)
    this.activeLegColors = new Set(); // Leg color triage (shorebirds)
    this.includeTwoTone = true; // Two-tone enabled by default
    this.urlSpeciesFilter = null; // Set of allowed species IDs or null
    this.currentSort = 'freq-desc';

    // DOM containers
    this.headerEl = document.getElementById('appHeader');
    this.filterContainerEl = document.getElementById('appFilterContainer');
    this.feedEl = document.getElementById('speciesFeed');

    // Bindings
    this.handleRoute = this.handleRoute.bind(this);
  }

  async init() {
    initLightbox();
    initComparisonModal();
    setComparisonUpdateListener(() => this.renderFeedOnly());

    // Register service worker for offline PWA parity
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').then(reg => {
          reg.update();
        }).catch(err => {
          console.debug('ServiceWorker registration skipped:', err);
        });
      });
    }

    // Hotkey listener (P for flipping asset mode, Esc handled in lightbox/comparison modal)
    window.addEventListener('keydown', (e) => {
      if (e.target && ['input', 'select', 'textarea'].includes(e.target.tagName.toLowerCase())) return;
      const isLightboxOpen = document.getElementById('imageLightboxModal') && !document.getElementById('imageLightboxModal').classList.contains('hidden');
      const isCompareModalOpen = document.getElementById('comparisonModal') && !document.getElementById('comparisonModal').classList.contains('hidden');
      if (isLightboxOpen || isCompareModalOpen) return;
      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        this.cycleAssetMode();
      }
    });

    onRouteChanged(this.handleRoute);

    const initialRoute = getRouteState();
    await this.handleRoute(initialRoute);
  }

  async handleRoute(routeState) {
    const rawTarget = routeState.guide || 'sparrows';

    try {
      this.guideData = await loadGuideData(rawTarget);
    } catch (err) {
      console.error('Failed to load guide:', err);
      return;
    }

    const targetGuide = this.guideData.id;
    const isGuideChanged = this.activeGuideId !== targetGuide;
    this.activeGuideId = targetGuide;

    document.title = `AVN Fieldguide | ${this.guideData.title}`;
    setComparisonGuide(this.guideData);

    if (isGuideChanged) {
      this.resetGuideSpecificFilters();
    }

    // Apply sort from URL if present
    this.currentSort = routeState.sort || 'freq-desc';

    // Apply beak colors from URL if present
    const guideHasBeak = (this.guideData.species || []).some(s => s.bill_colors && s.bill_colors.length > 0);
    if (guideHasBeak && routeState.billColors && routeState.billColors.length > 0) {
      this.activeBillColors = new Set(routeState.billColors);
    } else if (isGuideChanged) {
      this.activeBillColors.clear();
    }

    // Apply two-tone toggle from URL
    if (routeState.includeTwoTone !== undefined) {
      this.includeTwoTone = routeState.includeTwoTone;
    } else if (isGuideChanged) {
      this.includeTwoTone = true;
    }

    // Apply leg colors from URL
    const guideHasLegs = (this.guideData.species || []).some(s => s.leg_colors && s.leg_colors.length > 0);
    if (guideHasLegs && routeState.legColors && routeState.legColors.length > 0) {
      this.activeLegColors = new Set(routeState.legColors);
    } else if (isGuideChanged) {
      this.activeLegColors.clear();
    }

    // Apply rarity from URL if present
    this.activeRarity = routeState.rarity || 'all';

    // Apply sex from URL if present
    this.activeSex = routeState.sex || 'all';

    // Apply breast fork from URL if present
    this.activeBreastFork = routeState.breastFork || 'all';

    // Apply group from URL if present
    this.activeGroup = routeState.group || 'all';

    // Apply age from URL if present
    this.activeAge = routeState.age || 'all';

    // Apply traits from URL if present
    this.activeTraits = routeState.traits ? new Set(routeState.traits) : new Set();

    // Resolve species checklist tokens from URL
    if (routeState.speciesTokens && routeState.speciesTokens.length > 0) {
      this.urlSpeciesFilter = this.resolveChecklistTokens(routeState.speciesTokens);
    } else {
      this.urlSpeciesFilter = null;
    }

    this.render();
  }

  resolveChecklistTokens(tokens) {
    const matched = new Set();
    const metaCodeMap = this.guideData.meta?.codeMap || {};
    const species = this.guideData.species || [];

    tokens.forEach(tok => {
      const normTok = tok.toLowerCase().trim();
      if (!normTok) return;
      const strippedTok = normTok.replace(/[-_\s]/g, '');

      // 1. Check meta codeMap (e.g. wood_duck -> [wood_duck_drake, wood_duck_hen])
      if (metaCodeMap[normTok]) {
        metaCodeMap[normTok].forEach(id => matched.add(id));
      } else if (metaCodeMap[strippedTok]) {
        metaCodeMap[strippedTok].forEach(id => matched.add(id));
      }

      // 2. Match against species id, name, sci, ebird_code
      species.forEach(s => {
        const idNorm = (s.id || '').toLowerCase();
        const idStripped = idNorm.replace(/[-_\s]/g, '');
        const nameNorm = (s.name || '').toLowerCase();
        const sciNorm = (s.sci || '').toLowerCase();
        const codeNorm = (s.ebird_code || '').toLowerCase();

        if (idNorm === normTok ||
            idStripped === strippedTok ||
            idNorm.startsWith(normTok + '_') ||
            idNorm.endsWith('_' + normTok) ||
            nameNorm.includes(normTok) ||
            nameNorm.includes(normTok.replace(/[-_]/g, ' ')) ||
            sciNorm.includes(normTok) ||
            (codeNorm && codeNorm === normTok)) {
          matched.add(s.id);
        }
      });
    });

    return matched;
  }

  resetGuideSpecificFilters() {
    this.dismissedIds.clear();
    this.cardAssetOverrides = {};
    this.photoModes = {};
    this.photoIndices = {};
    this.activeBreastFork = 'all';
    this.activeSex = 'all';
    this.activeAge = 'all';
    this.activeGroup = 'all';
    this.activeRarity = 'all';
    this.activeTraits.clear();
    this.activeBillColors.clear();
    clearComparison();
  }

  cycleAssetMode() {
    if (this.currentAssetMode === 'both') this.setAssetMode('plates');
    else if (this.currentAssetMode === 'plates') this.setAssetMode('photos');
    else this.setAssetMode('both');
  }

  setAssetMode(mode) {
    this.currentAssetMode = mode;
    this.cardAssetOverrides = {};
    this.render();
  }

  setGridDensity(cols) {
    this.currentGridCols = cols;
    localStorage.setItem('avn_grid_cols', String(cols));
    localStorage.setItem('avn_sparrow_grid_cols', String(cols));
    this.render();
  }

  setSort(sortKey) {
    this.currentSort = sortKey;
    updateUrlParam('sort', sortKey === 'freq-desc' ? null : sortKey);
    this.render();
  }

  unhideAll() {
    this.dismissedIds.clear();
    this.render();
  }

  dismissSpecies(id) {
    this.dismissedIds.add(id);
    this.render();
  }

  toggleCardPhoto(id, mode) {
    this.photoModes[id] = mode;
    this.renderFeedOnly();
  }

  switchPhotoVariant(id, index) {
    this.photoIndices[id] = index;
    this.renderFeedOnly();
  }

  flipCardAsset(id) {
    const cur = this.cardAssetOverrides[id] || this.currentAssetMode;
    this.cardAssetOverrides[id] = cur === 'plates' ? 'photos' : 'plates';
    this.renderFeedOnly();
  }

  copyShareLink() {
    const url = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        this.indicateCopied();
      }).catch(() => {
        this.fallbackCopy(url);
      });
    } else {
      this.fallbackCopy(url);
    }
  }

  fallbackCopy(text) {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      this.indicateCopied();
    } catch (e) {
      prompt('Copy share link:', text);
    }
  }

  indicateCopied() {
    const btn = document.getElementById('copyShareBtn');
    if (btn) {
      const original = btn.innerHTML;
      btn.innerHTML = `<span>✓ Copied!</span>`;
      setTimeout(() => { btn.innerHTML = original; }, 2000);
    }
  }

  clearUrlFilter() {
    this.urlSpeciesFilter = null;
    removeUrlParams(['species', 'filter', 'include', 'checklist']);
    this.render();
  }

  getFilteredSpecies() {
    if (!this.guideData) return [];
    const species = this.guideData.species || [];

    const filtered = species.filter(s => {
      // 1. Checklist Filter
      if (this.urlSpeciesFilter !== null && !this.urlSpeciesFilter.has(s.id)) return false;

      // 2. Dismiss Filter
      if (this.dismissedIds.has(s.id)) return false;

      // 3. Sparrows Breast Fork
      if (this.activeGuideId === 'sparrows') {
        if (this.activeBreastFork === 'streaked' && s.breast !== 'streaked') return false;
        if (this.activeBreastFork === 'unstreaked' && s.breast !== 'unstreaked') return false;
      }

      // 4. Ducks Sex Filter
      if (this.activeGuideId === 'ducks') {
        if (this.activeSex === 'drake' && s.sex !== 'drake' && s.sex !== 'both') return false;
        if (this.activeSex === 'hen' && s.sex !== 'hen' && s.sex !== 'both') return false;
      }

      // 5. Gulls Age Filter
      if (this.activeGuideId === 'gulls' && this.activeAge !== 'all') {
        if (s.age && s.age !== this.activeAge) return false;
      }

      // 6. Group Filter (Shorebirds, Terns, Grebes, Swans)
      if (this.activeGroup !== 'all' && s.group) {
        if (s.group !== this.activeGroup) return false;
      }

      // 7. Rarity Filter
      if (this.activeRarity !== 'all' && s.rarity) {
        if (s.rarity !== this.activeRarity) return false;
      }

      // 8. Beak Color Triage Filter & Two-Tone (Multicolor) Logic
      if (this.activeBillColors.size > 0) {
        const hasMatchingColor = s.bill_colors && s.bill_colors.some(c => this.activeBillColors.has(c));
        if (!hasMatchingColor) return false;
        // If Two-Tone is disabled (Solid Only), exclude multi-colored bills
        if (!this.includeTwoTone && s.bill_multicolor) return false;
      } else if (!this.includeTwoTone) {
        // No specific color picked, but user clicked "Solid Only"
        if (s.bill_multicolor) return false;
      }

      // 8b. Leg Color Triage Filter (Shorebirds)
      if (this.activeLegColors.size > 0) {
        const hasMatchingLeg = s.leg_colors && s.leg_colors.some(c => this.activeLegColors.has(c));
        if (!hasMatchingLeg) return false;
      }

      // 9. Crux Traits (AND logic: must match all selected traits)
      for (const trait of this.activeTraits) {
        // Special trait mapping for sparrows
        if (this.activeGuideId === 'sparrows') {
          if (trait === 'yellow_lores' && !s.yellow) return false;
          if (trait === 'eyering' && !s.eyering) return false;
          if (trait === 'rufous_cap' && !s.rufous_crown) return false;
          if (trait === 'pink_bill' && !s.pink_bill) return false;
        } else {
          // General traits check
          if (trait === 'dabbler' && s.guild !== 'dabbler') return false;
          if (trait === 'diver' && s.guild !== 'diver') return false;
          if (trait !== 'dabbler' && trait !== 'diver') {
            if (!s.traits || !s.traits.includes(trait)) return false;
          }
        }
      }

      return true;
    });

    // Apply Sorting
    filtered.sort((a, b) => {
      const probA = parseFloat(String(a.prob).replace(/[^0-9.]/g, '')) || 0;
      const probB = parseFloat(String(b.prob).replace(/[^0-9.]/g, '')) || 0;

      switch (this.currentSort) {
        case 'freq-desc':
          return probB - probA || (a.rank || 0) - (b.rank || 0);
        case 'freq-asc':
          return probA - probB || (b.rank || 0) - (a.rank || 0);
        case 'size-asc':
          return (a.length_cm - b.length_cm) || (a.bill_mm - b.bill_mm) || a.name.localeCompare(b.name);
        case 'size-desc':
          return (b.length_cm - a.length_cm) || (b.bill_mm - a.bill_mm) || a.name.localeCompare(b.name);
        case 'bill-asc':
          return (a.bill_mm - b.bill_mm) || (a.length_cm - b.length_cm) || a.name.localeCompare(b.name);
        case 'bill-desc':
          return (b.bill_mm - a.bill_mm) || (b.length_cm - a.length_cm) || a.name.localeCompare(b.name);
        case 'name-asc':
          return a.name.localeCompare(b.name);
        default:
          return (a.rank || 0) - (b.rank || 0);
      }
    });

    return filtered;
  }

  render() {
    if (!this.guideData) return;

    const filteredSpecies = this.getFilteredSpecies();

    // 1. Render Header
    renderHeader(this.headerEl, {
      activeGuide: this.activeGuideId,
      activeAssetMode: this.currentAssetMode,
      gridCols: this.currentGridCols,
      currentSort: this.currentSort,
      dismissedCount: this.dismissedIds.size,
      matchCount: filteredSpecies.length,
      guideName: this.guideData.name
    }, {
      onSelectGuide: (guideId) => navigateToGuide(guideId),
      onSetAssetMode: (mode) => this.setAssetMode(mode),
      onToggleAssetHotkey: () => this.cycleAssetMode(),
      onSetGridDensity: (cols) => this.setGridDensity(cols),
      onSetSort: (sortKey) => this.setSort(sortKey),
      onUnhideAll: () => this.unhideAll()
    });

    // 2. Render Filter Bar
    renderFilterBar(this.filterContainerEl, this.guideData, {
      activeBreastFork: this.activeBreastFork,
      activeSex: this.activeSex,
      activeAge: this.activeAge,
      activeGroup: this.activeGroup,
      activeRarity: this.activeRarity,
      activeTraits: this.activeTraits,
      activeBillColors: this.activeBillColors,
      activeLegColors: this.activeLegColors,
      includeTwoTone: this.includeTwoTone,
      urlSpeciesFilter: this.urlSpeciesFilter
    }, {
      onSetBreastFork: (fork) => {
        this.activeBreastFork = fork;
        updateUrlParam('breast', fork === 'all' ? null : fork, true, this.activeGuideId);
        this.render();
      },
      onSetSex: (sex) => {
        this.activeSex = sex;
        updateUrlParam('sex', sex === 'all' ? null : sex, true, this.activeGuideId);
        this.render();
      },
      onSetAge: (age) => {
        this.activeAge = age;
        updateUrlParam('age', age === 'all' ? null : age, true, this.activeGuideId);
        this.render();
      },
      onSetGroup: (grp) => {
        this.activeGroup = grp;
        updateUrlParam('group', grp === 'all' ? null : grp, true, this.activeGuideId);
        this.render();
      },
      onSetRarity: (rarity) => {
        this.activeRarity = rarity;
        updateUrlParam('rarity', rarity === 'all' ? null : rarity, true, this.activeGuideId);
        this.render();
      },
      onToggleTrait: (trait) => {
        // Handle exclusive pairs if defined
        const pairs = this.guideData.meta?.exclusivePairs || [];
        pairs.forEach(([t1, t2]) => {
          if (trait === t1 && this.activeTraits.has(t2)) this.activeTraits.delete(t2);
          if (trait === t2 && this.activeTraits.has(t1)) this.activeTraits.delete(t1);
        });

        if (this.activeTraits.has(trait)) this.activeTraits.delete(trait);
        else this.activeTraits.add(trait);
        updateUrlParam('traits', this.activeTraits.size > 0 ? Array.from(this.activeTraits) : null, true, this.activeGuideId);
        this.render();
      },
      onToggleBillColor: (color) => {
        if (this.activeBillColors.has(color)) this.activeBillColors.delete(color);
        else this.activeBillColors.add(color);
        updateUrlParam('beak', this.activeBillColors.size > 0 ? Array.from(this.activeBillColors) : null, true, this.activeGuideId);
        this.render();
      },
      onToggleLegColor: (color) => {
        if (this.activeLegColors.has(color)) this.activeLegColors.delete(color);
        else this.activeLegColors.add(color);
        updateUrlParam('legs', this.activeLegColors.size > 0 ? Array.from(this.activeLegColors) : null, true, this.activeGuideId);
        this.render();
      },
      onToggleTwoTone: () => {
        this.includeTwoTone = !this.includeTwoTone;
        updateUrlParam('twotone', this.includeTwoTone ? null : 'false', true, this.activeGuideId);
        this.render();
      },
      onResetAllFilters: () => {
        this.resetGuideSpecificFilters();
        removeUrlParams([
          'beak', 'bill', 'billcolor', 'beakcolor',
          'sex', 'gender',
          'rarity', 'status',
          'breast', 'fork', 'underparts',
          'group', 'age',
          'traits', 'trait'
        ]);
        this.render();
      },
      onClearUrlFilter: () => this.clearUrlFilter(),
      onCopyShareLink: () => this.copyShareLink()
    });

    // 3. Render Feed
    this.renderFeedOnly(filteredSpecies);
  }

  renderFeedOnly(cachedFiltered = null) {
    const filteredSpecies = cachedFiltered || this.getFilteredSpecies();
    this.feedEl.innerHTML = '';

    // Apply grid column classes
    if (this.currentGridCols === 1) {
      this.feedEl.className = 'grid grid-cols-1 gap-5 max-w-4xl mx-auto';
    } else if (this.currentGridCols === 2) {
      this.feedEl.className = 'grid grid-cols-1 md:grid-cols-2 gap-4 max-w-6xl mx-auto';
    } else {
      this.feedEl.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-w-7xl mx-auto';
    }

    // Match Counter update
    const counter = document.getElementById('matchCounter');
    if (counter) {
      let label = `${filteredSpecies.length} shown`;
      if (this.activeGuideId === 'ducks') {
        if (this.activeRarity === 'rare') label = `${filteredSpecies.length} rare vagrants shown`;
        else if (this.activeSex === 'drake') label = `${filteredSpecies.length} drakes shown`;
        else if (this.activeSex === 'hen') label = `${filteredSpecies.length} hens shown`;
        else label = `${filteredSpecies.length} variants shown`;
      }
      if (this.dismissedIds.size > 0) {
        label += ` (${this.dismissedIds.size} hidden)`;
      }
      counter.textContent = label;
    }

    const unhideBtn = document.getElementById('unhideBtn');
    const unhideCount = document.getElementById('unhideCount');
    if (unhideBtn) {
      if (this.dismissedIds.size > 0) {
        unhideBtn.classList.remove('hidden');
        if (unhideCount) unhideCount.textContent = this.dismissedIds.size;
      } else {
        unhideBtn.classList.add('hidden');
      }
    }

    // Empty state
    if (filteredSpecies.length === 0) {
      this.feedEl.className = 'max-w-3xl mx-auto';
      this.feedEl.innerHTML = `
        <div class="text-center py-16 px-4 bg-slate-900/50 border border-slate-800 rounded-2xl shadow-xl">
          <div class="text-3xl mb-2">🔍</div>
          <h3 class="text-base font-semibold text-slate-200">No species match the active combination</h3>
          <p class="text-xs text-slate-400 mt-1.5">Try deselecting some traits or resetting the filters to view more species.</p>
          <button id="emptyResetBtn" class="mt-4 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 text-white hover:bg-sky-500 transition cursor-pointer">
            Reset All Filters
          </button>
        </div>
      `;
      const btn = this.feedEl.querySelector('#emptyResetBtn');
      if (btn) btn.onclick = () => {
        this.resetGuideSpecificFilters();
        this.urlSpeciesFilter = null;
        removeUrlParams([
          'species', 'filter', 'include', 'checklist',
          'beak', 'bill', 'billcolor', 'beakcolor',
          'sex', 'gender',
          'rarity', 'status',
          'breast', 'fork', 'underparts',
          'group', 'age',
          'traits', 'trait'
        ]);
        this.render();
      };
      return;
    }

    // Render cards
    filteredSpecies.forEach(s => {
      const card = renderSpeciesCard(s, {
        guideId: this.activeGuideId,
        maxCategoryLength: this.guideData.maxCategoryLength,
        currentAssetMode: this.currentAssetMode,
        cardAssetOverrides: this.cardAssetOverrides,
        photoModes: this.photoModes,
        photoIndices: this.photoIndices,
        currentSort: this.currentSort,
        currentGridCols: this.currentGridCols,
        isCompared: isCompared(s.id),
        onDismiss: (id) => this.dismissSpecies(id),
        onTogglePhoto: (id, mode) => this.toggleCardPhoto(id, mode),
        onSwitchPhotoVariant: (id, idx) => this.switchPhotoVariant(id, idx),
        onFlipAsset: (id) => this.flipCardAsset(id),
        onToggleCompare: (id) => toggleCompare(id, () => this.renderFeedOnly())
      });
      this.feedEl.appendChild(card);
    });
  }
}

// Bootstrap application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new FieldguideApp();
  app.init();
  window.fieldguideApp = app;
});
