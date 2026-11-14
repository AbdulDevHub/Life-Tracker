import { describe, expect, it } from "vitest"
import { buildBackup, mergeHabits, mergeWaterDays, parseImport } from "./importExport"
import { addHabit, currentStreak, habitsForMonth, newMilestones, toggleCheck } from "../features/habits/habitLogic"
import { defaultExercise, defaultHabits, defaultSettings, defaultWater } from "./defaults"

describe("backup import", () => {
  it("parses its own export", () => {
    const state = {
      habits: { ...defaultHabits(), months: { "2026-11": [{ id: "x", title: "X", color: "#fff" }] } },
      water: defaultWater(),
      exercise: defaultExercise(),
      settings: defaultSettings(),
    }
    const { data, summary } = parseImport(JSON.stringify(buildBackup(state)))
    expect(data.habits).toEqual(state.habits)
    expect(summary).toMatchObject({ habits: 1, months: 1, checks: 0 })
  })

  it("rejects unrelated text", () => {
    expect(() => parseImport("hello")).toThrow()
    expect(() => parseImport('{"foo":1}')).toThrow()
  })

  it("merges habits without duplicates", () => {
    const a = { months: { "2026-01": [{ id: "a1", title: "A" }] }, checks: { "2026-01-01": { a1: true } }, achievements: [] }
    const b = { months: { "2026-01": [{ id: "a1", title: "A" }, { id: "b", title: "B" }] }, checks: { "2026-01-01": { b: true } }, achievements: [] }
    const m = mergeHabits(a, b)
    expect(m.months["2026-01"].map((h) => h.id)).toEqual(["a1", "b"])
    expect(m.checks["2026-01-01"]).toEqual({ a1: true, b: true })
  })

  it("merges water per day without dropping either side", () => {
    const a = { "2026-11-13": [{ volume: 250, timestamp: "2026-11-13T15:00:00Z" }] }
    const b = { "2026-11-13": [{ volume: 400, timestamp: "2026-11-13T09:00:00Z" }, { volume: 250, timestamp: "2026-11-13T15:00:00Z" }] }
    expect(mergeWaterDays(a, b)["2026-11-13"].map((l) => l.volume)).toEqual([400, 250])
  })
})

describe("habit logic", () => {
  it("inherits the latest list for the current and future months only", () => {
    const h = { ...defaultHabits(), months: { "2026-09": [{ id: "a" }] } }
    expect(habitsForMonth(h, "2026-11", "2026-11")).toEqual([{ id: "a" }])
    expect(habitsForMonth(h, "2026-10", "2026-11")).toEqual([])
  })

  it("adding a habit to an empty past month does not copy later habits", () => {
    const h = { ...defaultHabits(), months: { "2020-01": [{ id: "old" }] } }
    expect(addHabit(h, "2020-03", "New", "#fff").months["2020-03"].map((x) => x.title)).toEqual(["New"])
  })

  it("counts streaks and milestones", () => {
    let h = defaultHabits()
    for (let d = 1; d <= 7; d++) h = toggleCheck(h, `2026-11-0${d}`, "a")
    expect(currentStreak(h, "a", "2026-11-07")).toBe(7)
    expect(currentStreak(h, "a", "2026-11-08")).toBe(7)
    expect(newMilestones(h, "a", "2026-11-07")).toEqual([7])
    h = toggleCheck(h, "2026-11-04", "a")
    expect(currentStreak(h, "a", "2026-11-07")).toBe(3)
  })
})
