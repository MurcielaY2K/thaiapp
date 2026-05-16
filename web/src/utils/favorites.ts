const KEY = 'thaiquest:favorites';

export function getFavorites(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]')); }
  catch { return new Set(); }
}

export function toggleFavorite(cardId: string): boolean {
  const favs = getFavorites();
  if (favs.has(cardId)) favs.delete(cardId); else favs.add(cardId);
  localStorage.setItem(KEY, JSON.stringify([...favs]));
  return favs.has(cardId);
}

export function isFavorite(cardId: string): boolean {
  return getFavorites().has(cardId);
}
