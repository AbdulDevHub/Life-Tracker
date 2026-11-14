// Sample data for screenshots: `pnpm dev`, then open /?demo=1 (or /?demo=1&tab=water).
// Only runs outside the extension, where storage falls back to localStorage.
import { addDays, dayKey, monthKey, waterDayKey } from "./dates"
import { KEYS } from "./storage"

export function seedDemo() {
  const params = new URLSearchParams(location.search)
  if (!params.has("demo") || (typeof chrome !== "undefined" && chrome.storage)) return
  const now = new Date()
  const habitsList = [
    { id: "d1", title: "🕌 Pray on time", color: "#9d78fa" },
    { id: "d2", title: "🏋️ Gym", color: "#f98028" },
    { id: "d3", title: "📖 Read 10 pages", color: "#1cabe3" },
    { id: "d4", title: "🛌 Sleep by 11", color: "#22c55e" },
  ]
  const checks = {}
  for (let i = 1; i <= 40; i++) {
    const k = dayKey(addDays(now, -i))
    checks[k] = {}
    habitsList.forEach((h, j) => {
      if (j === 0 || (i * (j + 3)) % 5 !== 0) checks[k][h.id] = true
    })
  }
  checks[dayKey(now)] = { d1: true, d3: true }
  const months = { [monthKey(addDays(now, -40))]: habitsList, [monthKey(now)]: habitsList }

  const wk = waterDayKey(now)
  const iso = (h, m) => {
    const d = new Date(now)
    d.setHours(h, m, 0, 0)
    return d.toISOString()
  }
  const days = { [wk]: [{ volume: 400, timestamp: iso(8, 10) }, { volume: 250, timestamp: iso(11, 30) }, { volume: 500, timestamp: iso(14, 5) }] }
  ;[1900, 2300, 1400, 2100, 2600, 1700].forEach((t, i) => {
    days[dayKey(addDays(now, -(i + 1)))] = [{ volume: t, timestamp: addDays(now, -(i + 1)).toISOString() }]
  })

  const today = dayKey(now)
  const yday = dayKey(addDays(now, -1))
  const e = (id, day, name, muscles, sets, reps, weight) => ({ id, day, timestamp: `${day}T1${id.length}:00:00.000Z`, name, muscles, sets, reps, weight })
  const entries = [
    e("e1", today, "Bench press", ["chest", "frontDelts", "triceps"], 4, 8, 70),
    e("e2", today, "Incline dumbbell press", ["chest", "frontDelts", "triceps"], 3, 10, 26),
    e("e3", today, "Tricep pushdown", ["triceps"], 3, 12, 30),
    e("e4", yday, "Squat", ["quads", "glutes", "adductors", "lowerBack"], 5, 5, 100),
    e("e5", yday, "Romanian deadlift", ["hamstrings", "glutes", "lowerBack"], 3, 8, 80),
    e("e6", dayKey(addDays(now, -3)), "Pull-up", ["lats", "biceps", "rearDelts", "forearms"], 4, 8, null),
  ]

  localStorage.setItem(KEYS.habits, JSON.stringify({ months, checks, achievements: [{ uuid: "d1", chainLength: 7 }, { uuid: "d1", chainLength: 21 }, { uuid: "d1", chainLength: 30 }] }))
  localStorage.setItem(KEYS.water, JSON.stringify({ goal: 2500, selected: 400, days }))
  localStorage.setItem(KEYS.exercise, JSON.stringify({ unit: "kg", entries }))
  localStorage.setItem(
    KEYS.settings,
    JSON.stringify({ theme: params.get("theme") || "dark", tab: params.get("tab") || "habits", showBadge: true, reminders: { habits: "off", water: "off" } }),
  )
}
