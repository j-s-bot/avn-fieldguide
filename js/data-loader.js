/**
 * AVN Fieldguide Data Loader
 * Fetches and caches standalone JSON datasets from data/<guide>.json
 */

const guideCache = new Map();

export const GUIDES = [
  { id: 'sparrows', name: 'Sparrows', count: 11, label: 'Sparrows (11)' },
  { id: 'ducks', name: 'Ducks', count: 29, label: 'Ducks (29)' },
  { id: 'gulls', name: 'Gulls', count: 19, label: 'Gulls (19)' },
  { id: 'shorebirds', name: 'Shorebirds', count: 22, label: 'Shorebirds (22)' },
  { id: 'terns', name: 'Terns', count: 16, label: 'Terns (16)' },
  { id: 'grebes', name: 'Grebes & Loons', count: 14, label: 'Grebes & Loons (14)' },
  { id: 'swans', name: 'Swans', count: 14, label: 'Swans (14)' }
];

export async function loadGuideData(guideId) {
  const normId = (guideId || 'sparrows').toLowerCase().trim();
  const validGuide = GUIDES.find(g => g.id === normId) || GUIDES[0];
  const targetId = validGuide.id;

  if (guideCache.has(targetId)) {
    return guideCache.get(targetId);
  }

  const jsonUrl = `./data/${targetId}.json`;
  try {
    const res = await fetch(jsonUrl);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} fetching ${jsonUrl}`);
    }
    const data = await res.json();
    const normalized = normalizeGuide(targetId, data);
    guideCache.set(targetId, normalized);
    return normalized;
  } catch (err) {
    console.error(`Failed to load guide data for "${targetId}":`, err);
    throw err;
  }
}

function normalizeGuide(guideId, raw) {
  if (Array.isArray(raw)) {
    return {
      id: guideId,
      name: guideId.charAt(0).toUpperCase() + guideId.slice(1),
      title: `${guideId.charAt(0).toUpperCase() + guideId.slice(1)} Disambiguation Guide`,
      count: raw.length,
      maxCategoryLength: Math.max(...raw.map(s => s.length_cm || 0), 20),
      maxCategoryBill: Math.max(...raw.map(s => s.bill_mm || 0), 20),
      meta: {},
      species: raw
    };
  }

  const species = raw.species || [];
  const maxLen = raw.maxCategoryLength || Math.max(...species.map(s => s.length_cm || 0), 20);
  const maxBill = raw.maxCategoryBill || Math.max(...species.map(s => s.bill_mm || 0), 20);

  return {
    id: raw.id || guideId,
    name: raw.name || guideId,
    title: raw.title || `${raw.name || guideId} Disambiguation Guide`,
    count: species.length || raw.count || 0,
    maxCategoryLength: maxLen,
    maxCategoryBill: maxBill,
    meta: raw.meta || {},
    species
  };
}
