import { describe, expect, it } from "vitest"
import { favoriteValues, isFavorite, mergeFavorites, toggleFavorite } from "./favorites"

const bench = { name: "Bench press", muscles: ["chest"], sets: 3, reps: 10, weight: 60 }

describe("favourite exercises", () => {
  it("toggles by name, ignoring case", () => {
    const favs = toggleFavorite([], bench)
    expect(isFavorite(favs, "bench PRESS")).toBe(true)
    expect(toggleFavorite(favs, { ...bench, name: "bench press" })).toEqual([])
  })

  it("logs with the latest entry's values, else the saved template", () => {
    expect(favoriteValues(bench, [])).toEqual(bench)
    const entries = [
      { name: "Bench press", muscles: ["chest"], sets: 3, reps: 8, weight: 70, timestamp: "2026-11-10T10:00:00Z" },
      { name: "bench press", muscles: ["chest", "triceps"], sets: 4, reps: 6, weight: 75, timestamp: "2026-11-17T10:00:00Z" },
      { name: "Squat", muscles: ["quads"], sets: 5, reps: 5, weight: 100, timestamp: "2026-11-18T10:00:00Z" },
    ]
    expect(favoriteValues(bench, entries)).toEqual({ name: "Bench press", muscles: ["chest", "triceps"], sets: 4, reps: 6, weight: 75 })
  })

  it("merges backups without duplicates", () => {
    expect(mergeFavorites([bench], [{ ...bench, weight: 1 }, { ...bench, name: "Squat" }]).map((f) => f.name)).toEqual([
      "Bench press",
      "Squat",
    ])
  })
})
