/**
 * AVN Fieldguide Lightbox Modal Component
 * Smooth fullscreen modal for inspecting high-res plates, field photos, and crux crops.
 */

let modalEl = null;
let titleEl = null;
let subtitleEl = null;
let badgeEl = null;
let captionEl = null;
let imageEl = null;
let counterEl = null;
let galleryItems = [];
let currentIndex = -1;

export function initLightbox() {
  modalEl = document.getElementById('imageLightboxModal');
  if (!modalEl) {
    modalEl = document.createElement('div');
    modalEl.id = 'imageLightboxModal';
    modalEl.className = 'hidden fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-5 select-none';
    modalEl.setAttribute('role', 'dialog');
    modalEl.setAttribute('aria-modal', 'true');
    modalEl.setAttribute('aria-label', 'Image preview lightbox');
    modalEl.innerHTML = `
      <!-- Lightbox Header -->
      <div class="flex items-center justify-between gap-3 max-w-6xl w-full mx-auto pb-3 border-b border-slate-800">
        <div class="flex items-center gap-2.5 min-w-0">
          <span class="w-2.5 h-2.5 rounded-full bg-sky-400 shrink-0"></span>
          <div class="min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <h3 id="lightboxTitle" class="text-base sm:text-xl font-black text-white tracking-tight truncate">Species Name</h3>
              <span id="lightboxBadge" class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">DIAGNOSTIC PLATE</span>
            </div>
            <p id="lightboxSubtitle" class="text-xs italic font-serif text-slate-400 truncate">Scientific Name</p>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <span id="lightboxCounter" class="text-[10px] font-mono-num font-bold text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded hidden">1 / 1</span>
          <span class="text-[11px] text-slate-500 hidden sm:inline">Press <kbd class="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono text-[10px]">Esc</kbd> or click outside</span>
          <button id="closeLightboxBtn" class="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer" title="Close Lightbox (Esc)">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
      </div>

      <!-- Lightbox Main Stage Image -->
      <div class="flex-1 flex items-center justify-center p-2 sm:p-4 min-h-0 relative" id="lightboxStage">
        <button id="lightboxPrevBtn" class="hidden absolute left-2 sm:left-4 z-10 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition cursor-pointer" title="Previous Image (Left Arrow)">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        
        <img id="lightboxImage" src="" alt="Fullscreen bird visual" class="max-h-full max-w-full object-contain rounded-lg shadow-2xl transition-transform duration-200">

        <button id="lightboxNextBtn" class="hidden absolute right-2 sm:right-4 z-10 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition cursor-pointer" title="Next Image (Right Arrow)">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"></path></svg>
        </button>
      </div>

      <!-- Lightbox Caption & Details Footer -->
      <div class="max-w-4xl w-full mx-auto pt-3 border-t border-slate-800 text-center">
        <p id="lightboxCaption" class="text-xs sm:text-sm text-slate-300 font-medium"></p>
      </div>
    `;
    document.body.appendChild(modalEl);
  }

  titleEl = document.getElementById('lightboxTitle');
  subtitleEl = document.getElementById('lightboxSubtitle');
  badgeEl = document.getElementById('lightboxBadge');
  captionEl = document.getElementById('lightboxCaption');
  imageEl = document.getElementById('lightboxImage');
  counterEl = document.getElementById('lightboxCounter');

  const closeBtn = document.getElementById('closeLightboxBtn');
  if (closeBtn) closeBtn.onclick = closeLightbox;

  const prevBtn = document.getElementById('lightboxPrevBtn');
  if (prevBtn) prevBtn.onclick = prevImage;

  const nextBtn = document.getElementById('lightboxNextBtn');
  if (nextBtn) nextBtn.onclick = nextImage;

  modalEl.onclick = (e) => {
    if (e.target === modalEl || e.target.id === 'lightboxStage') {
      closeLightbox();
    }
  };

  // Touch swipe support for mobile
  const stage = document.getElementById('lightboxStage');
  let touchStartX = 0;
  if (stage) {
    stage.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    stage.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      if (touchEndX < touchStartX - 50) nextImage();
      if (touchEndX > touchStartX + 50) prevImage();
    }, { passive: true });
  }

  window.addEventListener('keydown', (e) => {
    if (modalEl.classList.contains('hidden')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'ArrowRight') nextImage();
  });

  // Expose on window for inline event handlers
  window.openLightbox = openLightbox;
  window.closeLightbox = closeLightbox;
  window.handleLightboxBackdropClick = (e) => {
    if (e.target.id === 'imageLightboxModal' || e.target.id === 'lightboxStage') {
      closeLightbox();
    }
  };
}

export function openLightbox(src, title, subtitle, badgeText = 'DIAGNOSTIC PLATE', caption = '', gallery = []) {
  if (!modalEl) initLightbox();

  if (imageEl) imageEl.src = src;
  if (titleEl) titleEl.textContent = title || '';
  if (subtitleEl) subtitleEl.textContent = subtitle || '';
  if (badgeEl) {
    badgeEl.textContent = badgeText || '';
    if ((badgeText || '').toUpperCase().includes('PHOTO')) {
      badgeEl.className = 'text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800';
    } else {
      badgeEl.className = 'text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800';
    }
  }
  if (captionEl) captionEl.textContent = caption || '';

  galleryItems = Array.isArray(gallery) && gallery.length > 0 ? gallery : [{ src, title, subtitle, badgeText, caption }];
  currentIndex = galleryItems.findIndex(item => item.src === src);
  if (currentIndex === -1) currentIndex = 0;

  updateNavButtons();

  modalEl.classList.remove('hidden');
  document.body.classList.add('overflow-hidden');
}

export function closeLightbox() {
  if (!modalEl) return;
  modalEl.classList.add('hidden');
  document.body.classList.remove('overflow-hidden');
  if (imageEl) imageEl.src = '';
}

function updateNavButtons() {
  const prevBtn = document.getElementById('lightboxPrevBtn');
  const nextBtn = document.getElementById('lightboxNextBtn');
  const cntEl = document.getElementById('lightboxCounter');
  if (galleryItems.length <= 1) {
    if (prevBtn) { prevBtn.classList.add('hidden'); prevBtn.classList.remove('flex'); }
    if (nextBtn) { nextBtn.classList.add('hidden'); nextBtn.classList.remove('flex'); }
    if (cntEl) cntEl.classList.add('hidden');
  } else {
    if (prevBtn) { prevBtn.classList.remove('hidden'); prevBtn.classList.add('flex'); }
    if (nextBtn) { nextBtn.classList.remove('hidden'); nextBtn.classList.add('flex'); }
    if (cntEl) {
      cntEl.classList.remove('hidden');
      cntEl.textContent = `${currentIndex + 1} / ${galleryItems.length}`;
    }
  }
}

function prevImage() {
  if (galleryItems.length <= 1) return;
  currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
  showCurrentGalleryItem();
}

function nextImage() {
  if (galleryItems.length <= 1) return;
  currentIndex = (currentIndex + 1) % galleryItems.length;
  showCurrentGalleryItem();
}

function showCurrentGalleryItem() {
  const item = galleryItems[currentIndex];
  if (!item) return;
  if (imageEl) imageEl.src = item.src;
  if (titleEl) titleEl.textContent = item.title || '';
  if (subtitleEl) subtitleEl.textContent = item.subtitle || '';
  if (badgeEl) {
    badgeEl.textContent = item.badgeText || '';
    if ((item.badgeText || '').toUpperCase().includes('PHOTO')) {
      badgeEl.className = 'text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800';
    } else {
      badgeEl.className = 'text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800';
    }
  }
  if (captionEl) captionEl.textContent = item.caption || '';
  const cntEl = document.getElementById('lightboxCounter');
  if (cntEl) cntEl.textContent = `${currentIndex + 1} / ${galleryItems.length}`;
}
