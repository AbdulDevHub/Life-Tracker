// Favourite exercises: saved templates that log in one click.
// A favourite uses the values from the latest logged entry with the same name,
// so weight and reps progress automatically; its own saved values are the fallback.

const same = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase()

export const isFavorite = (favorites = [], name) => !!name.trim() && favorites.some((f) => same(f.name, name))

/** Add or remove a favourite by name. `template` is { name, muscles, sets, reps, weight }. */
export function toggleFavorite(favorites = [], template) {
  if (isFavorite(favorites, template.name)) return favorites.filter((f) => !same(f.name, template.name))
  const { name, muscles, sets, reps, weight } = template
  return [...favorites, { name: name.trim(), muscles: [...muscles], sets, reps, weight: weight ?? null }]
}

/** The values to log for a favourite: latest matching entry, else the saved template. */
export function favoriteValues(fav, entries = []) {
  let last = null
  for (const e of entries) if (same(e.name, fav.name) && (!last || e.timestamp > last.timestamp)) last = e
  const src = last || fav
  return { name: fav.name, muscles: [...src.muscles], sets: src.sets, reps: src.reps, weight: src.weight ?? null }
}

/** Union of favourites by name (current wins). Used by backup merge. */
export function mergeFavorites(current = [], incoming = []) {
  return [...current, ...incoming.filter((f) => !isFavorite(current, f.name))]
}
