import { describe, expect, it } from "vitest"
import { period, summarize } from "./stats"

const today = "2026-11-19" // a Thursday

describe("exercise periods", () => {
  it("weeks run Monday to Sunday and step back by offset", () => {
    const w = period("week", 0, today)
    expect([w.from, w.to, w.buckets.length]).toEqual(["2026-11-16", "2026-11-22", 7])
    expect(period("week", 1, today).from).toBe("2026-11-09")
  })

  it("months cover every day and cross year boundaries", () => {
    const m = period("month", 0, today)
    expect([m.from, m.to, m.buckets.length]).toEqual(["2026-11-01", "2026-11-30", 30])
    expect(period("month", 11, today).from).toBe("2025-12-01")
  })

  it("years have one bucket per month", () => {
    const y = period("year", 1, today)
    expect([y.from, y.to, y.title]).toEqual(["2025-01-01", "2025-12-31", "2025"])
    expect(y.buckets[1].to).toBe("2025-02-28")
  })
})

describe("summarize", () => {
  const e = (day, name, sets, reps, weight = null) => ({ day, name, sets, reps, weight, muscles: [] })
  const entries = [
    e("2026-11-16", "Bench press", 3, 10, 60),
    e("2026-11-16", "Pull-up", 3, 8),
    e("2026-11-18", "bench press", 4, 8, 60),
    e("2026-11-10", "Squat", 5, 5, 100), // previous week
  ]

  it("totals sets, reps, volume and active days in range", () => {
    const s = summarize(entries, period("week", 0, today))
    expect(s).toMatchObject({ activeDays: 2, sets: 10, reps: 86, volume: 3720 })
    expect(s.bars).toEqual([6, 0, 4, 0, 0, 0, 0])
  })

  it("ranks exercises by sets, merging names case-insensitively", () => {
    const { top } = summarize(entries, period("week", 0, today))
    expect(top[0]).toEqual({ name: "Bench press", sets: 7, sessions: 2 })
  })
})
