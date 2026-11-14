// Pure habit functions (no React), shared by the popup and unit tests.
import { addDays, dayKey, monthKey, parseDay } from "../../lib/dates"

export const MILESTONES = [7, 21, 30, 66, 100]

export const newId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `h-${Date.now()}-${Math.random().toString(16).slice(2)}`

/**
 * Habit list for a month. A month without its own list inherits the latest
 * earlier list, but only for the current month or later: past months stay as
 * they were recorded.
 */
export function habitsForMonth(habits, mk, currentMk = monthKey()) {
  if (habits.months[mk]) return habits.months[mk]
  if (mk < currentMk) return []
  const earlier = Object.keys(habits.months)
    .filter((k) => k < mk)
    .sort()
  return earlier.length ? habits.months[earlier[earlier.length - 1]] : []
}

/** Copy the inherited list into the month so edits stick to it. */
const materialize = (habits, mk) =>
  habits.months[mk]
    ? habits
    : { ...habits, months: { ...habits.months, [mk]: [...habitsForMonth(habits, mk)] } }

export const isChecked = (habits, day, id) => Boolean(habits.checks[day]?.[id])

export function toggleCheck(habits, day, id) {
  const dayChecks = { ...(habits.checks[day] || {}) }
  if (dayChecks[id]) delete dayChecks[id]
  else dayChecks[id] = true
  const checks = { ...habits.checks }
  if (Object.keys(dayChecks).length) checks[day] = dayChecks
  else delete checks[day]
  return { ...habits, checks }
}

/** Consecutive checked days ending on `day` (0 if `day` is unchecked). */
export function streakEndingAt(habits, id, day) {
  let n = 0
  let d = parseDay(day)
  while (isChecked(habits, dayKey(d), id)) {
    n++
    d = addDays(d, -1)
  }
  return n
}

/** Current streak: counts today if done, otherwise the run ending yesterday. */
export function currentStreak(habits, id, today = dayKey()) {
  if (isChecked(habits, today, id)) return streakEndingAt(habits, id, today)
  return streakEndingAt(habits, id, dayKey(addDays(parseDay(today), -1)))
}

/** Milestones the streak ending on `day` has reached that are not yet recorded. */
export function newMilestones(habits, id, day) {
  const streak = streakEndingAt(habits, id, day)
  const have = new Set(
    habits.achievements.filter((a) => a.uuid === id).map((a) => a.chainLength),
  )
  return MILESTONES.filter((m) => streak >= m && !have.has(m))
}

export function addHabit(habits, mk, title, color) {
  const h = materialize(habits, mk)
  const habit = { id: newId(), title: title.trim(), color }
  return { ...h, months: { ...h.months, [mk]: [...h.months[mk], habit] } }
}

/** Title and colour edits apply to every month the habit appears in. */
export function updateHabit(habits, id, patch) {
  const months = {}
  for (const [mk, list] of Object.entries(habits.months)) {
    months[mk] = list.map((x) => (x.id === id ? { ...x, ...patch } : x))
  }
  return { ...habits, months }
}

/** Remove from this month onward; earlier months keep their history. */
export function removeHabit(habits, id, fromMk) {
  const h = materialize(habits, fromMk)
  const months = {}
  for (const [mk, list] of Object.entries(h.months)) {
    months[mk] = mk >= fromMk ? list.filter((x) => x.id !== id) : list
  }
  return { ...h, months }
}

/** Move a habit up or down in this month and every later month. */
export function moveHabit(habits, id, mk, delta) {
  const h = materialize(habits, mk)
  const months = { ...h.months }
  for (const key of Object.keys(months)) {
    if (key < mk) continue
    const list = [...months[key]]
    const i = list.findIndex((x) => x.id === id)
    const j = i + delta
    if (i < 0 || j < 0 || j >= list.length) continue
    ;[list[i], list[j]] = [list[j], list[i]]
    months[key] = list
  }
  return { ...h, months }
}

/** Unchecked habits today. public/background.js repeats this for the toolbar badge. */
export function remainingToday(habits, now = new Date()) {
  const today = dayKey(now)
  return habitsForMonth(habits, monthKey(now), monthKey(now)).filter(
    (x) => !isChecked(habits, today, x.id),
  ).length
}

/** Longest run of consecutive checked days for a habit. */
export function bestStreak(habits, id) {
  const days = Object.keys(habits.checks)
    .filter((d) => habits.checks[d][id])
    .sort()
  let best = 0
  let run = 0
  let prev = null
  for (const d of days) {
    run = prev && dayKey(addDays(parseDay(prev), 1)) === d ? run + 1 : 1
    best = Math.max(best, run)
    prev = d
  }
  return best
}
