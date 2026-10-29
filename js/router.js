/**
 * AVN Fieldguide Client-Side Router
 * Handles dynamic routing via query parameter (?guide=<name>) and URL filter state synchronization.
 */

const listeners = new Set();

const SORT_NORMALIZATION = {
  'freq-desc': 'freq-desc',
  'freq-asc': 'freq-asc',
  'freq': 'freq-desc',
  'rarity': 'freq-asc',
  'rare': 'freq-asc',
  'size-asc': 'size-asc',
  'size-desc': 'size-desc',
  'size': 'size-asc',
  'smallest': 'size-asc',
  'largest': 'size-desc',
  'bill-asc': 'bill-asc',
  'bill-desc': 'bill-desc',
  'bill': 'bill-asc',
  'beak-asc': 'bill-asc',
  'beak-desc': 'bill-desc',
  'beak': 'bill-asc',
  'name-asc': 'name-asc',
  'name': 'name-asc',
  'az': 'name-asc',
  'alpha': 'name-asc'
};

export function getRouteState() {
  const searchParams = new URLSearchParams(window.location.search);
  
  // Extract hash parameters if present (supports #ducks, #guide=ducks, #guide=ducks&sort=size-asc, #ducks?sort=size-asc)
  let hashGuide = null;
  const hashParams = new URLSearchParams();
  if (window.location.hash) {
    const rawHash = window.location.hash.replace(/^#\/?/, '').trim();
    if (rawHash) {
      if (rawHash.startsWith('guide=')) {
        const searchLike = new URLSearchParams(rawHash);
        searchLike.forEach((val, key) => hashParams.set(key, val));
        hashGuide = hashParams.get('guide');
      } else if (rawHash.includes('?') || rawHash.includes('&')) {
        const delim = rawHash.includes('?') ? '?' : '&';
        const parts = rawHash.split(delim);
        hashGuide = parts[0];
        const searchLike = new URLSearchParams(parts.slice(1).join('&'));
        searchLike.forEach((val, key) => hashParams.set(key, val));
      } else {
        hashGuide = rawHash;
      }
    }
  }

  // Guide parameter: search parameter > hashGuide > default 'sparrows'
  let guide = searchParams.get('guide') || hashGuide || 'sparrows';
  guide = guide.toLowerCase().trim();

  // Helper to retrieve param prioritizing searchParams over hashParams
  const getParam = (k) => searchParams.get(k) || hashParams.get(k);

  // 2. Sort parameter
  const sortParam = getParam('sort') || getParam('order') || getParam('orderby');
  const sort = sortParam ? (SORT_NORMALIZATION[sortParam.toLowerCase().trim()] || 'freq-desc') : 'freq-desc';

  // 3. Species Checklist Filter (?species=mallard,wood_duck or ?filter=... or ?checklist=...)
  const specParam = getParam('species') || getParam('filter') || getParam('include') || getParam('checklist');
  const speciesTokens = specParam ? specParam.toLowerCase().split(/[\s,|+]+/).map(t => t.trim()).filter(Boolean) : [];

  // 4. Beak / Bill color filter (?beak=blue or ?bill=yellow)
  const beakParam = getParam('beak') || getParam('bill') || getParam('billcolor') || getParam('beakcolor');
  const billColors = [];
  if (beakParam) {
    beakParam.toLowerCase().split(/[\s,|+]+/).map(t => t.trim()).filter(Boolean).forEach(c => {
      if (['blue', 'orange', 'yellow', 'black', 'red'].includes(c)) {
        billColors.push(c);
      } else if (c === 'slate' || c === 'dark') {
        billColors.push('black');
      }
    });
  }

  // 4b. Two-tone toggle (?twotone=false or ?solid=true)
  const twotoneParam = getParam('twotone') || getParam('twotones') || getParam('multicolor');
  let includeTwoTone = true;
  if (twotoneParam === 'false' || twotoneParam === '0' || getParam('solid') === 'true' || getParam('solid') === '1') {
    includeTwoTone = false;
  }

  // 4c. Leg color filter (?legs=yellow,green or ?leg=black)
  const legParam = getParam('legs') || getParam('leg') || getParam('legcolor');
  const legColors = [];
  if (legParam) {
    legParam.toLowerCase().split(/[\s,|+]+/).map(t => t.trim()).filter(Boolean).forEach(c => {
      if (['yellow', 'green', 'orange', 'black', 'slate'].includes(c)) {
        legColors.push(c);
      }
    });
  }

  // 5. Rarity filter (?rarity=rare)
  const rarityParam = getParam('rarity') || getParam('status');
  const rarity = rarityParam ? rarityParam.toLowerCase().trim() : null;

  // 6. Sex filter (?sex=drake)
  const sexParam = getParam('sex') || getParam('gender');
  const sex = sexParam ? sexParam.toLowerCase().trim() : null;

  // 7. Breast fork filter (?breast=streaked or ?fork=streaked or ?underparts=plain)
  const breastParam = getParam('breast') || getParam('fork') || getParam('underparts');
  let breastFork = null;
  if (breastParam) {
    const bNorm = breastParam.toLowerCase().trim();
    if (['streaked', 'unstreaked', 'clean', 'plain', 'all'].includes(bNorm)) {
      breastFork = (bNorm === 'clean' || bNorm === 'plain') ? 'unstreaked' : bNorm;
    }
  }

  // 8. Group filter (?group=plover)
  const groupParam = getParam('group');
  const group = groupParam ? groupParam.toLowerCase().trim() : null;

  // 9. Age filter (?age=adult)
  const ageParam = getParam('age');
  const age = ageParam ? ageParam.toLowerCase().trim() : null;

  // 10. Crux Traits filter (?traits=yellow_lores,eyering or ?trait=...)
  const traitsParam = getParam('traits') || getParam('trait');
  const traits = traitsParam ? traitsParam.toLowerCase().split(/[\s,|+]+/).map(t => t.trim()).filter(Boolean) : null;

  return {
    guide,
    sort,
    speciesTokens,
    billColors,
    includeTwoTone,
    legColors,
    rarity,
    sex,
    breastFork,
    group,
    age,
    traits,
    rawParams: searchParams
  };
}

export function navigateToGuide(guideId, preserveParams = false) {
  const current = new URLSearchParams(window.location.search);
  const targetGuide = guideId.toLowerCase().trim();
  const next = preserveParams ? new URLSearchParams(current) : new URLSearchParams();

  next.set('guide', targetGuide);
  if (!preserveParams) {
    // Preserve sort across guides (since all species support sorting)
    if (current.has('sort')) next.set('sort', current.get('sort'));
    // Preserve beak triage filter if target guide supports beak colors
    if (['ducks', 'terns', 'swans', 'shorebirds'].includes(targetGuide) && current.has('beak')) {
      next.set('beak', current.get('beak'));
    }
    if (targetGuide === 'shorebirds' && current.has('legs')) {
      next.set('legs', current.get('legs'));
    }
    if (current.has('twotone')) {
      next.set('twotone', current.get('twotone'));
    }
  }

  const newUrl = `${window.location.pathname}?${next.toString()}`;
  window.history.pushState({ guide: targetGuide }, '', newUrl);
  notifyListeners();
}

export function updateUrlParam(key, value, replace = true, activeGuide = null) {
  const params = new URLSearchParams(window.location.search);

  // If search lacks 'guide', preserve the current active guide
  if (!params.has('guide')) {
    const currentRoute = getRouteState();
    const g = activeGuide || currentRoute.guide;
    if (g) params.set('guide', g);
  }

  if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
    params.delete(key);
  } else if (Array.isArray(value)) {
    params.set(key, value.join(','));
  } else {
    params.set(key, String(value));
  }

  const query = params.toString();
  const hash = window.location.hash && !window.location.hash.startsWith('#guide=') && !window.location.hash.match(/^#[a-z]+$/i)
    ? window.location.hash
    : '';
  const newUrl = query ? `${window.location.pathname}?${query}${hash}` : `${window.location.pathname}${hash}`;
  if (replace) {
    window.history.replaceState(null, '', newUrl);
  } else {
    window.history.pushState(null, '', newUrl);
  }
}

export function removeUrlParams(keys, replace = true) {
  const params = new URLSearchParams(window.location.search);
  keys.forEach(k => params.delete(k));
  const query = params.toString();
  const hash = window.location.hash && !window.location.hash.startsWith('#guide=') && !window.location.hash.match(/^#[a-z]+$/i)
    ? window.location.hash
    : '';
  const newUrl = query ? `${window.location.pathname}?${query}${hash}` : `${window.location.pathname}${hash}`;
  if (replace) {
    window.history.replaceState(null, '', newUrl);
  } else {
    window.history.pushState(null, '', newUrl);
  }
}

export function onRouteChanged(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function notifyListeners() {
  const routeState = getRouteState();
  listeners.forEach(cb => {
    try { cb(routeState); } catch (e) { console.error('Route listener error:', e); }
  });
}

// Global popstate handler (back/forward buttons)
window.addEventListener('popstate', () => {
  notifyListeners();
});
