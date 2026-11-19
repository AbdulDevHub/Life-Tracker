import { describe, expect, it } from "vitest"
import { badgeFor, bestStreak, earnedBadges } from "./habitLogic"

const habitsWith = (days, achievements = []) => ({
  checks: Object.fromEntries(days.map((d) => [d, { h1: true }])),
  achievements,
})
const run = (start, n) =>
  Array.from({ length: n }, (_, i) => {
    const d = new Date(2026, 0, start + i)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  })

describe("streak badges", () => {
  it("earns badges from past history, not only live ticks", () => {
    const h = habitsWith(run(1, 25))
    expect(earnedBadges(h, "h1", "2026-12-31")).toEqual([7, 21])
  })

  it("ignores days ticked ahead of today", () => {
    const h = habitsWith(run(1, 10))
    expect(bestStreak(h, "h1", "2026-01-05")).toBe(5)
    expect(earnedBadges(h, "h1", "2026-01-05")).toEqual([])
  })

  it("keeps badges stored when they were reached live", () => {
    const h = habitsWith([], [{ uuid: "h1", chainLength: 7, date: "2025-01-07" }])
    expect(earnedBadges(h, "h1", "2026-01-01")).toEqual([7])
  })

  it("badgeFor gives the highest milestone passed", () => {
    expect([badgeFor(3), badgeFor(7), badgeFor(41), badgeFor(150)]).toEqual([0, 7, 30, 100])
  })
})
