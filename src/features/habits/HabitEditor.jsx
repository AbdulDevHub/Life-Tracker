import { useEffect, useState } from "react"
import { LuArrowDown, LuArrowUp, LuTrash2 } from "react-icons/lu"
import { Button, Modal } from "../../components/ui"
import { dayKey, parseMonth } from "../../lib/dates"
import { cx } from "../../lib/util"
import { HABIT_COLORS } from "./colors"
import { bestStreak, currentStreak, earnedBadges, MILESTONES, moveHabit, removeHabit, updateHabit } from "./habitLogic"

export default function HabitEditor({ habit, monthKey, habits, setHabits, onClose }) {
  const [title, setTitle] = useState("")
  const [color, setColor] = useState("")
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (habit) {
      setTitle(habit.title)
      setColor(habit.color)
      setConfirmDelete(false)
    }
  }, [habit])

  if (!habit) return null

  const today = dayKey()
  const current = currentStreak(habits, habit.id, today)
  const best = bestStreak(habits, habit.id, today)
  const earned = new Set(earnedBadges(habits, habit.id, today))
  const next = MILESTONES.find((m) => m > current)
  const monthName = parseMonth(monthKey).toLocaleDateString(undefined, { month: "long" })

  const save = () => {
    if (!title.trim()) return
    setHabits((h) => updateHabit(h, habit.id, { title: title.trim(), color }))
    onClose()
  }

  return (
    <Modal open wide onClose={onClose} title="Edit habit">
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          save()
        }}
      >
        <div className="grid grid-cols-2 gap-5">
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="label">Name</span>
              <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={60} autoFocus />
            </label>
            <div className="flex flex-col gap-1.5">
              <span className="label">Colour</span>
              <div className="flex flex-wrap gap-1.5">
                {HABIT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    aria-label={`Colour ${c}`}
                    className={cx("h-6 w-6 rounded-full transition", color === c && "ring-2 ring-ink ring-offset-2 ring-offset-surface")}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="rounded-xl bg-raised p-2">
                <p className="text-lg font-extrabold leading-tight">{current}</p>
                <p className="text-[10px] font-semibold text-muted">Current streak</p>
              </div>
              <div className="rounded-xl bg-raised p-2">
                <p className="text-lg font-extrabold leading-tight">{best}</p>
                <p className="text-[10px] font-semibold text-muted">Best streak</p>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between">
                <span className="label">Streak badges</span>
                <span className="text-[10px] font-semibold text-muted">
                  {next ? `${next - current} more ${next - current === 1 ? "day" : "days"} to ${next}` : "All earned 🎉"}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {MILESTONES.map((m) => (
                  <span
                    key={m}
                    title={earned.has(m) ? `Earned: a ${m}-day streak` : `Reach a ${m}-day streak to earn this`}
                    className={cx(
                      "flex flex-col items-center rounded-lg py-1 text-[11px] font-extrabold leading-tight",
                      earned.has(m) ? "bg-lift/20 text-lift" : "bg-raised text-muted/60",
                    )}
                  >
                    <span className={cx("text-sm", !earned.has(m) && "opacity-30 grayscale")}>🔥</span>
                    {m}d
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-line pt-3">
          <Button variant="ghost" size="sm" onClick={() => setHabits((h) => moveHabit(h, habit.id, monthKey, -1))} aria-label="Move up" title="Move up">
            <LuArrowUp />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setHabits((h) => moveHabit(h, habit.id, monthKey, 1))} aria-label="Move down" title="Move down">
            <LuArrowDown />
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              if (!confirmDelete) return setConfirmDelete(true)
              setHabits((h) => removeHabit(h, habit.id, monthKey))
              onClose()
            }}
            title={confirmDelete ? "Past months and check-offs are kept" : undefined}
          >
            <LuTrash2 /> {confirmDelete ? `Remove from ${monthName} on?` : "Remove"}
          </Button>
          <Button type="submit" size="sm" className="ml-auto px-6" disabled={!title.trim()}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  )
}
