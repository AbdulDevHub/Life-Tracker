// Exercise totals for a week, month or year, plus the bars for its chart.
import { addDays, addMonths, dayKey, daysInMonth, parseDay, startOfWeek } from "../../lib/dates"

const WEEKDAY = ["M", "T", "W", "T", "F", "S", "S"]
const MONTH = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"]

/**
 * The period `offset` steps back from the one containing `today` ("YYYY-MM-DD").
 * Returns { from, to, title, buckets: [{ from, to, label }] } with inclusive day keys.
 */
export function period(range, offset, today) {
  const t = parseDay(today)
  if (range === "week") {
    const start = addDays(startOfWeek(t), -7 * offset)
    const end = addDays(start, 6)
    const mon = (d) => d.toLocaleDateString(undefined, { month: "short" })
    const title =
      start.getMonth() === end.getMonth()
        ? `${start.getDate()}–${end.getDate()} ${mon(end)}`
        : `${start.getDate()} ${mon(start)}–${end.getDate()} ${mon(end)}`
    return {
      from: dayKey(start),
      to: dayKey(end),
      title,
      buckets: WEEKDAY.map((label, i) => ({ from: dayKey(addDays(start, i)), to: dayKey(addDays(start, i)), label })),
    }
  }
  if (range === "month") {
    const start = addMonths(new Date(t.getFullYear(), t.getMonth(), 1), -offset)
    const n = daysInMonth(start)
    const buckets = Array.from({ length: n }, (_, i) => {
      const k = dayKey(addDays(start, i))
      return { from: k, to: k, label: i === 0 || (i + 1) % 5 === 0 ? String(i + 1) : "" }
    })
    return {
      from: buckets[0].from,
      to: buckets[n - 1].to,
      title: start.toLocaleDateString(undefined, { month: "short", year: "numeric" }),
      buckets,
    }
  }
  const year = t.getFullYear() - offset
  return {
    from: `${year}-01-01`,
    to: `${year}-12-31`,
    title: String(year),
    buckets: MONTH.map((label, m) => {
      const s = new Date(year, m, 1)
      return { from: dayKey(s), to: dayKey(new Date(year, m, daysInMonth(s))), label }
    }),
  }
}

/** Totals for entries inside period p: active days, sets, reps, volume, sets per bucket, top exercises. */
export function summarize(entries, p) {
  const inside = entries.filter((e) => e.day >= p.from && e.day <= p.to)
  const days = new Set(inside.map((e) => e.day))
  let sets = 0
  let reps = 0
  let volume = 0
  const byName = new Map()
  for (const e of inside) {
    const s = Number(e.sets) || 1
    const r = Number(e.reps) || 0
    sets += s
    reps += s * r
    if (e.weight) volume += s * r * Number(e.weight)
    const key = e.name.trim().toLowerCase()
    const cur = byName.get(key) || { name: e.name.trim(), sets: 0, sessions: new Set() }
    cur.sets += s
    cur.sessions.add(e.day)
    byName.set(key, cur)
  }
  const bars = p.buckets.map((b) =>
    inside.reduce((n, e) => (e.day >= b.from && e.day <= b.to ? n + (Number(e.sets) || 1) : n), 0),
  )
  const top = [...byName.values()]
    .map((x) => ({ name: x.name, sets: x.sets, sessions: x.sessions.size }))
    .sort((a, b) => b.sets - a.sets || a.name.localeCompare(b.name))
  return { activeDays: days.size, sets, reps, volume: Math.round(volume), bars, top }
}
