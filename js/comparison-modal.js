/**
 * AVN Fieldguide Comparison Modal & Bottom Tray Component
 * Supports head-to-head side-by-side diagnostic trait comparison.
 */

let comparedSpecies = new Map();
let currentGuide = null;
let modalEl = null;
let trayEl = null;

export function initComparisonModal(guide = null) {
  if (guide) currentGuide = guide;
  trayEl = document.getElementById('comparisonTray');
  modalEl = document.getElementById('comparisonModal');

  if (!trayEl) {
    trayEl = document.createElement('div');
    trayEl.id = 'comparisonTray';
    trayEl.className = 'fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 border border-sky-500/50 rounded-2xl shadow-2xl p-2.5 sm:px-4 sm:py-3 flex items-center gap-3 max-w-lg w-[92%] sm:w-auto backdrop-blur-md hidden transition-all duration-200';
    document.body.appendChild(trayEl);
  }

  if (!modalEl) {
    modalEl = document.createElement('div');
    modalEl.id = 'comparisonModal';
    modalEl.className = 'fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 hidden';
    modalEl.setAttribute('role', 'dialog');
    modalEl.setAttribute('aria-modal', 'true');
    modalEl.setAttribute('aria-label', 'Species comparison modal');
    modalEl.innerHTML = `
      <div class="bg-slate-950 border border-slate-800 rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden" onclick="event.stopPropagation()">
        <div class="p-4 border-b border-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
            <h3 class="font-extrabold text-base sm:text-lg text-white">Side-by-Side Diagnostic Comparison</h3>
          </div>
          <button id="closeCompareModalBtn" class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div id="compareModalBody" class="p-4 sm:p-6 overflow-y-auto space-y-6"></div>
      </div>
    `;
    modalEl.onclick = closeComparisonModal;
    document.body.appendChild(modalEl);

    const closeBtn = document.getElementById('closeCompareModalBtn');
    if (closeBtn) closeBtn.onclick = closeComparisonModal;

    window.addEventListener('keydown', (e) => {
      if (!modalEl || modalEl.classList.contains('hidden')) return;
      if (e.key === 'Escape') closeComparisonModal();
    });
  }

  window.toggleCompare = toggleCompare;
  window.clearComparison = clearComparison;
  window.openComparisonModal = openComparisonModal;
  window.closeComparisonModal = closeComparisonModal;
}

export function setComparisonGuide(guide) {
  currentGuide = guide;
}

let updateListener = null;

export function setComparisonUpdateListener(cb) {
  updateListener = cb;
}

export function isCompared(id) {
  return comparedSpecies.has(id);
}

export function toggleCompare(speciesId, onUpdate) {
  if (!trayEl || !modalEl) initComparisonModal(currentGuide);

  if (comparedSpecies.has(speciesId)) {
    comparedSpecies.delete(speciesId);
  } else {
    if (comparedSpecies.size >= 4) {
      alert('You can compare up to 4 species simultaneously.');
      return;
    }
    const sp = currentGuide?.species?.find(s => s.id === speciesId);
    if (sp) comparedSpecies.set(speciesId, sp);
  }

  renderTray();
  if (typeof onUpdate === 'function') onUpdate();
  if (typeof updateListener === 'function') updateListener();
}

export function clearComparison(onUpdate) {
  if (!trayEl || !modalEl) initComparisonModal(currentGuide);
  comparedSpecies.clear();
  renderTray();
  closeComparisonModal();
  if (typeof onUpdate === 'function') onUpdate();
  if (typeof updateListener === 'function') updateListener();
}

function renderTray() {
  if (!trayEl) return;
  if (comparedSpecies.size === 0) {
    trayEl.classList.add('hidden');
    trayEl.innerHTML = '';
    return;
  }

  trayEl.classList.remove('hidden');
  const count = comparedSpecies.size;
  const names = Array.from(comparedSpecies.values()).map(s => s.name).join(', ');

  trayEl.innerHTML = `
    <div class="flex items-center gap-2 min-w-0">
      <span class="w-2 h-2 rounded-full bg-sky-400 shrink-0 animate-ping"></span>
      <div class="min-w-0">
        <div class="text-xs font-bold text-white flex items-center gap-1.5">
          <span>Comparing</span>
          <span class="px-1.5 py-0.2 rounded bg-sky-950 text-sky-300 border border-sky-800 text-[10px] font-mono-num font-bold">${count}</span>
        </div>
        <div class="text-[10px] text-slate-400 truncate max-w-[200px] sm:max-w-xs">${names}</div>
      </div>
    </div>
    <div class="flex items-center gap-2 ml-auto shrink-0">
      <button id="openCompareModalBtn" onclick="openComparisonModal()" class="px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-600 text-white hover:bg-sky-500 shadow transition flex items-center gap-1 cursor-pointer">
        <span>View Matrix</span>
      </button>
      <button onclick="clearComparison()" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer" title="Clear all comparison picks">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
    </div>
  `;
}

export function openComparisonModal() {
  if (!modalEl) return;
  const modalBody = document.getElementById('compareModalBody');
  if (!modalBody) return;

  const items = Array.from(comparedSpecies.values());
  if (items.length === 0) {
    closeComparisonModal();
    return;
  }

  const colsClass = items.length === 1 ? 'grid-cols-1' : (items.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : (items.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'));

  modalBody.innerHTML = `
    <div class="grid ${colsClass} gap-4">
      ${items.map(s => `
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div>
            <div class="flex items-start justify-between gap-1 pb-2 border-b border-slate-800">
              <div>
                <h4 class="font-extrabold text-sm sm:text-base text-white">${s.name}</h4>
                <p class="text-xs italic text-slate-400 font-serif">${s.sci}</p>
              </div>
              <span class="text-[10px] font-mono-num font-bold px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">${s.prob}</span>
            </div>

            <div class="my-3 h-36 bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center p-1.5">
              <img src="${s.plate || s.photo}" alt="${s.name}" class="max-h-full max-w-full object-contain">
            </div>

            <div class="space-y-2 text-xs">
              <div class="p-2 rounded bg-slate-950/80 border border-slate-800">
                <span class="text-[10px] font-bold text-sky-400 uppercase block">Size & Stature</span>
                <span class="text-slate-300">${s.size_display || (s.length_cm + ' cm')} • ${s.bill_display || (s.bill_mm + ' mm')}</span>
              </div>
              <div class="p-2 rounded bg-slate-950/80 border border-slate-800">
                <span class="text-[10px] font-bold text-amber-400 uppercase block">Diagnostic Crux</span>
                <span class="text-amber-200/90 text-[11px]">${s.rule_out || 'N/A'}</span>
              </div>
              ${s.diagnostics ? `
                <div class="p-2 rounded bg-slate-950/80 border border-slate-800 space-y-1">
                  <span class="text-[10px] font-bold text-slate-400 uppercase block">Field Marks</span>
                  ${s.diagnostics.slice(0, 3).map(d => `
                    <div class="text-[11px] text-slate-300"><strong class="text-sky-300">${d.tract}:</strong> ${d.mark}</div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          </div>

          <button onclick="toggleCompare('${s.id}'); openComparisonModal();" class="mt-3 w-full py-1 rounded text-xs font-semibold bg-rose-950/50 text-rose-300 border border-rose-800/60 hover:bg-rose-900 transition cursor-pointer">
            Remove from Comparison
          </button>
        </div>
      `).join('')}
    </div>
  `;

  modalEl.classList.remove('hidden');
  document.body.classList.add('overflow-hidden');
}

export function closeComparisonModal() {
  if (!modalEl) return;
  modalEl.classList.add('hidden');
  document.body.classList.remove('overflow-hidden');
}
