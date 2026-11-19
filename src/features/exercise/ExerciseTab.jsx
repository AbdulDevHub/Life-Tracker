import { useMemo, useState } from "react"
import { LuCheck, LuDumbbell, LuPlus, LuRotateCcw, LuStar, LuX } from "react-icons/lu"
import { Button, Card, EmptyState, Segmented } from "../../components/ui"
import { addDays, dayKey, parseDay } from "../../lib/dates"
import { defaultExercise } from "../../lib/defaults"
import { KEYS } from "../../lib/storage"
import { useStored } from "../../lib/useStore"
import { cx, toast } from "../../lib/util"
import { newId } from "../habits/habitLogic"
import BodyMap from "./BodyMap"
import ExerciseStats from "./ExerciseStats"
import { EXERCISES, MUSCLE_LABEL, MUSCLES } from "./catalog"
import { favoriteValues, isFavorite, toggleFavorite } from "./favorites"

const RANGE = { today: 1, week: 7 }
// Sets per muscle that count as "fully worked" for the shading.
const FULL_SETS = { today: 6, week: 15 }

const emptyForm = { name: "", muscles: [], sets: "3", reps: "10", weight: "" }

function dayLabel(k, today) {
  if (k === today) return "Today"
  if (k === dayKey(addDays(parseDay(today), -1))) return "Yesterday"
  return parseDay(k).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })
}

export default function ExerciseTab({ isFull }) {
  const [ex, setEx, loaded] = useStored(KEYS.exercise, defaultExercise)
  const [range, setRange] = useState("today")
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [showAll, setShowAll] = useState(false)
  const [editMuscles, setEditMuscles] = useState(false)
  const [view, setView] = useState("favorites")
  const [confirmReset, setConfirmReset] = useState(false)
  const today = dayKey()

  // Past exercise names (with their last-used muscles) come first in suggestions.
  const known = useMemo(() => {
    const map = { ...EXERCISES }
    for (const e of ex.entries) map[e.name] = e.muscles
    return map
  }, [ex.entries])

  const setsByMuscle = useMemo(() => {
    const from = dayKey(addDays(parseDay(today), -(RANGE[range] - 1)))
    const out = {}
    for (const e of ex.entries) {
      if (e.day < from || e.day > today) continue
      for (const m of e.muscles) out[m] = (out[m] || 0) + (Number(e.sets) || 1)
    }
    return out
  }, [ex.entries, range, today])

  const intensity = useMemo(() => {
    const out = {}
    for (const [m, s] of Object.entries(setsByMuscle)) out[m] = Math.max(0.35, s / FULL_SETS[range])
    return out
  }, [setsByMuscle, range])

  const onName = (name) => {
    const match = known[name] || known[Object.keys(known).find((k) => k.toLowerCase() === name.trim().toLowerCase())]
    setForm((f) => ({ ...f, name, ...(match ? { muscles: [...match] } : {}) }))
  }

  const toggleMuscle = (id) =>
    setForm((f) => ({
      ...f,
      muscles: f.muscles.includes(id) ? f.muscles.filter((m) => m !== id) : [...f.muscles, id],
    }))

  const canAdd = form.name.trim() && form.muscles.length && Number(form.reps) > 0 && Number(form.sets) > 0

  const addEntry = (entry) =>
    setEx((x) => ({
      ...x,
      entries: [
        ...x.entries,
        { id: newId(), day: dayKey(), timestamp: new Date().toISOString(), ...entry },
      ],
    }))

  const submit = () => {
    if (!canAdd) return
    addEntry({
      name: form.name.trim(),
      muscles: form.muscles,
      sets: Number(form.sets),
      reps: Number(form.reps),
      weight: form.weight === "" ? null : Number(form.weight),
    })
    toast(`💪 Logged ${form.name.trim()}`)
    setForm((f) => ({ ...emptyForm, sets: f.sets, reps: f.reps }))
    setEditMuscles(false)
  }

  const favorites = ex.favorites || []
  const toggleFav = (template) => {
    const was = isFavorite(favorites, template.name)
    setEx((x) => ({ ...x, favorites: toggleFavorite(x.favorites, template) }))
    toast(was ? `Removed ${template.name.trim()} from favourites` : `⭐ ${template.name.trim()} added to favourites`)
  }
  const formTemplate = () => ({
    name: form.name,
    muscles: form.muscles,
    sets: Number(form.sets) || 3,
    reps: Number(form.reps) || 10,
    weight: form.weight === "" ? null : Number(form.weight),
  })
  const logFavorite = (fav) => {
    const v = favoriteValues(fav, ex.entries)
    addEntry(v)
    toast(`💪 Logged ${v.name}`)
  }
  const formIsFav = isFavorite(favorites, form.name)
  // Muscles collapse to a one-line summary once filled in (from the catalogue or a past entry).
  const showMuscleGrid = editMuscles || form.muscles.length === 0
  const loggedToday = new Set(ex.entries.filter((e) => e.day === today).map((e) => e.name.toLowerCase()))

  const remove = (id) => setEx((x) => ({ ...x, entries: x.entries.filter((e) => e.id !== id) }))

  const todayCount = ex.entries.filter((e) => e.day === today).length
  const resetToday = () => {
    if (!confirmReset) return setConfirmReset(true)
    setEx((x) => ({ ...x, entries: x.entries.filter((e) => e.day !== today) }))
    setConfirmReset(false)
    toast("Cleared today's exercises")
  }

  const visible = ex.entries
    .filter((e) => !selected || e.muscles.includes(selected))
    .slice()
    .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
  const groups = []
  for (const e of visible) {
    const g = groups[groups.length - 1]
    if (g && g.day === e.day) g.items.push(e)
    else groups.push({ day: e.day, items: [e] })
  }
  const shownGroups = showAll ? groups : groups.slice(0, 10)

  const worked = Object.entries(setsByMuscle).sort((a, b) => b[1] - a[1])

  if (!loaded) return null

  return (
    <div className={cx("grid grid-cols-[290px_minmax(0,1fr)_minmax(0,1fr)] gap-3", isFull ? "min-h-[480px] items-start" : "h-[424px]")}>
      <Card className="flex min-h-0 flex-col gap-2 overflow-y-auto">
        <div className="flex items-center justify-between">
          <span className="label">Muscles worked</span>
          <Segmented
            value={range}
            onChange={setRange}
            options={[
              { value: "today", label: "Today" },
              { value: "week", label: "7 days" },
            ]}
          />
        </div>
        <BodyMap intensity={intensity} selected={selected} onSelect={setSelected} />
        <div className="flex min-h-[26px] flex-wrap gap-1">
          {worked.length === 0 ? (
            <p className="w-full text-center text-xs text-muted">
              {range === "today" ? "Nothing logged today yet." : "Nothing logged in the last 7 days."}
            </p>
          ) : (
            worked.map(([m, s]) => (
              <button
                key={m}
                type="button"
                onClick={() => setSelected(selected === m ? null : m)}
                className={cx(
                  "rounded-full px-2 py-0.5 text-[11px] font-semibold transition",
                  selected === m ? "bg-accent text-white" : "bg-accent/15 text-accent hover:bg-accent/25",
                )}
              >
                {MUSCLE_LABEL[m]} · {s} {s === 1 ? "set" : "sets"}
              </button>
            ))
          )}
        </div>
        {todayCount > 0 && (
          <button
            type="button"
            onClick={resetToday}
            onBlur={() => setConfirmReset(false)}
            className={cx(
              "mx-auto flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition",
              confirmReset ? "bg-danger text-white" : "text-muted hover:bg-raised hover:text-danger",
            )}
          >
            <LuRotateCcw /> {confirmReset ? `Delete ${todayCount} ${todayCount === 1 ? "entry" : "entries"}?` : "Reset today"}
          </button>
        )}
      </Card>

      <div className="contents">
        <Card className="flex min-h-0 flex-col overflow-y-auto">
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault()
              submit()
            }}
          >
            <label className="flex flex-col gap-1.5">
              <span className="label">Log exercise</span>
              <div className="flex gap-1.5">
                <input
                  className="field min-w-0 flex-1"
                  list="lt-exercises"
                  value={form.name}
                  onChange={(e) => onName(e.target.value)}
                  placeholder="e.g. Bench press"
                  maxLength={60}
                />
                <button
                  type="button"
                  disabled={!canAdd}
                  onClick={() => toggleFav(formTemplate())}
                  aria-pressed={formIsFav}
                  className={cx(
                    "grid w-9 shrink-0 place-items-center rounded-xl bg-raised text-base transition disabled:opacity-40",
                    formIsFav ? "text-amber-400" : "text-muted hover:text-ink",
                  )}
                  title={formIsFav ? "Remove from favourites" : "Add to favourites"}
                  aria-label="Favourite"
                >
                  <LuStar className={formIsFav ? "fill-current" : ""} />
                </button>
              </div>
              <datalist id="lt-exercises">
                {Object.keys(known)
                  .sort()
                  .map((n) => (
                    <option key={n} value={n} />
                  ))}
              </datalist>
            </label>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="label">Muscles</span>
                {form.muscles.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setEditMuscles((v) => !v)}
                    className="text-[11px] font-semibold text-accent"
                  >
                    {showMuscleGrid ? "Done" : "Edit"}
                  </button>
                )}
              </div>
              {showMuscleGrid ? (
                <div className="flex flex-wrap gap-1">
                  {MUSCLES.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggleMuscle(m.id)}
                      aria-pressed={form.muscles.includes(m.id)}
                      className={cx(
                        "rounded-full px-2 py-0.5 text-[11px] font-semibold transition",
                        form.muscles.includes(m.id) ? "bg-accent text-white" : "bg-raised text-muted hover:text-ink",
                      )}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs font-semibold">{form.muscles.map((m) => MUSCLE_LABEL[m]).join(" · ")}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                ["sets", "Sets"],
                ["reps", "Reps"],
                ["weight", ex.unit],
              ].map(([k, label]) => (
                <label key={k} className="flex flex-col gap-1.5">
                  <span className="label truncate">{label}</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    className="field text-center"
                    value={form[k]}
                    min={0}
                    step={k === "weight" ? 0.5 : 1}
                    placeholder={k === "weight" ? "–" : ""}
                    onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
                  />
                </label>
              ))}
            </div>
            <Button type="submit" disabled={!canAdd}>
              <LuPlus /> Log exercise
            </Button>
          </form>
        </Card>

        <Card className="flex min-h-0 flex-col !p-0">
          <div className={cx("flex min-h-[28px] items-center gap-2 px-4 pt-4", selected ? "justify-between" : "justify-center")}>
            {selected ? (
              <>
                <span className="label truncate">{MUSCLE_LABEL[selected]} history</span>
                <button type="button" onClick={() => setSelected(null)} className="text-[11px] font-semibold text-accent">
                  Show all
                </button>
              </>
            ) : (
              <Segmented
                className="w-full [&>button]:flex-1"
                value={view}
                onChange={setView}
                options={[
                  { value: "favorites", label: "Favourites" },
                  { value: "history", label: "History" },
                  { value: "stats", label: "Stats" },
                ]}
              />
            )}
          </div>
          {view === "stats" && !selected ? (
            <ExerciseStats entries={ex.entries} unit={ex.unit} today={today} />
          ) : view === "favorites" && !selected ? (
            favorites.length === 0 ? (
              <EmptyState icon={<LuStar />} title="No favourites yet">
                Star an exercise you do every week, then log it here in one click.
              </EmptyState>
            ) : (
              <ul className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
                {favorites.map((f) => {
                  const v = favoriteValues(f, ex.entries)
                  const done = loggedToday.has(f.name.toLowerCase())
                  return (
                    <li key={f.name} className="group flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-raised">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold leading-tight">{f.name}</p>
                        <p className="truncate text-[11px] text-muted">
                          {v.sets} × {v.reps}
                          {v.weight != null && ` @ ${v.weight} ${ex.unit}`}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleFav(f)}
                        className="hidden text-muted hover:text-danger focus:block group-hover:block"
                        aria-label={`Remove ${f.name} from favourites`}
                        title="Remove from favourites"
                      >
                        <LuX />
                      </button>
                      <button
                        type="button"
                        onClick={() => logFavorite(f)}
                        className={cx(
                          "grid h-7 w-7 shrink-0 place-items-center rounded-full transition",
                          done ? "bg-accent text-white" : "bg-accent/15 text-accent hover:bg-accent/25",
                        )}
                        aria-label={`Log ${f.name} today`}
                        title={done ? "Logged today. Click to log another set." : "Log today"}
                      >
                        {done ? <LuCheck /> : <LuPlus />}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )
          ) : groups.length === 0 ? (
            <EmptyState icon={<LuDumbbell />} title="No workouts yet">
              Log an exercise and the muscle map lights up.
            </EmptyState>
          ) : (
            <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
              {shownGroups.map((g) => (
                <div key={g.day} className="mt-2">
                  <p className="px-2 text-[11px] font-bold text-muted">{dayLabel(g.day, today)}</p>
                  <ul>
                    {g.items.map((e) => (
                      <li key={e.id} className="group relative rounded-lg px-2 py-1.5 hover:bg-raised">
                        <div className="min-w-0">
                          <p className="text-sm font-bold leading-tight">{e.name}</p>
                          <p className="line-clamp-2 text-[11px] text-muted">
                            {e.sets} × {e.reps}
                            {e.weight != null && ` @ ${e.weight} ${ex.unit}`} · {e.muscles.map((m) => MUSCLE_LABEL[m]).join(", ")}
                          </p>
                        </div>
                        <div className="absolute right-1.5 top-1.5 flex gap-1.5 rounded-md bg-raised px-1 py-0.5 opacity-0 transition focus-within:opacity-100 group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => toggleFav(e)}
                          className={isFavorite(favorites, e.name) ? "text-amber-400" : "text-muted hover:text-amber-400"}
                          aria-label={`Favourite ${e.name}`}
                          title={isFavorite(favorites, e.name) ? "Remove from favourites" : "Add to favourites"}
                        >
                          <LuStar className={isFavorite(favorites, e.name) ? "fill-current" : ""} />
                        </button>
                        {g.day !== today && (
                          <button
                            type="button"
                            onClick={() => {
                              addEntry({ name: e.name, muscles: e.muscles, sets: e.sets, reps: e.reps, weight: e.weight })
                              toast(`💪 Logged ${e.name} again`)
                            }}
                            className="text-muted hover:text-accent"
                            aria-label={`Log ${e.name} again today`}
                            title="Log again today"
                          >
                            <LuRotateCcw />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => remove(e.id)}
                          className="text-muted hover:text-danger"
                          aria-label={`Remove ${e.name}`}
                        >
                          <LuX />
                        </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {groups.length > 10 && (
                <button
                  type="button"
                  onClick={() => setShowAll((s) => !s)}
                  className="mt-1 w-full rounded-lg py-1.5 text-xs font-semibold text-muted hover:bg-raised hover:text-ink"
                >
                  {showAll ? "Show less" : `Show ${groups.length - 10} more days`}
                </button>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
