// Thin wrapper over chrome.storage.local, with a localStorage fallback so the
// app also runs in `pnpm dev` and in Playwright screenshots.
export const KEYS = {
  habits: "lt.habits",
  water: "lt.water",
  exercise: "lt.exercise",
  settings: "lt.settings",
}

const chromeStore = () =>
  typeof chrome !== "undefined" && chrome.storage && chrome.storage.local
    ? chrome.storage.local
    : null

const LOCAL_EVENT = "lt-storage"

export async function getItems(keys) {
  const store = chromeStore()
  if (store) return store.get(keys)
  const out = {}
  for (const k of keys) {
    try {
      const raw = localStorage.getItem(k)
      if (raw != null) out[k] = JSON.parse(raw)
    } catch {
      /* ignore unreadable value */
    }
  }
  return out
}

export async function setItems(obj) {
  const store = chromeStore()
  if (store) return store.set(obj)
  for (const [k, v] of Object.entries(obj)) localStorage.setItem(k, JSON.stringify(v))
  window.dispatchEvent(new CustomEvent(LOCAL_EVENT, { detail: obj }))
}

/** Calls cb({key: newValue}) when any key changes (also from other extension pages). */
export function subscribe(cb) {
  const store = chromeStore()
  if (store) {
    const listener = (changes, area) => {
      if (area !== "local") return
      const out = {}
      for (const [k, c] of Object.entries(changes)) out[k] = c.newValue
      cb(out)
    }
    chrome.storage.onChanged.addListener(listener)
    return () => chrome.storage.onChanged.removeListener(listener)
  }
  const listener = (e) => cb(e.detail)
  window.addEventListener(LOCAL_EVENT, listener)
  return () => window.removeEventListener(LOCAL_EVENT, listener)
}
