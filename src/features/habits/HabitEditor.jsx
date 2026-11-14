import { useEffect, useState } from "react"
import { LuArrowDown, LuArrowUp, LuTrash2 } from "react-icons/lu"
import { Button, Modal } from "../../components/ui"
import { dayKey, parseMonth } from "../../lib/dates"
import { cx } from "../../lib/util"
import { HABIT_COLORS } from "./colors"
import { bestStreak, currentStreak, MILESTONES, moveHabit, removeHabit, updateHabit } from "./habitLogic"

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

  const earned = new Set(habits.achievements.filter((a) => a.uuid === habit.id).map((a) => a.chainLength))
  const monthName = parseMonth(monthKey).toLocaleDateString(undefined, { month: "long" })

  const save = () => {
    if (!title.trim()) return
    setHabits((h) => updateHabit(h, habit.id, { title: title.trim(), color }))
    onClose()
  }

  return (
    <Modal open onClose={onClose} title="Edit habit">
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          save()
        }}
      >
        <label className="flex flex-col gap-1.5">
          <span className="label">Name</span>
          <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={60} autoFocus />
        </label>

        <div className="flex flex-col gap-1.5">
          <span className="label">Colour</span>
          <div className="flex flex-wrap gap-2">
            {HABIT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={`Colour ${c}`}
                className={cx("h-7 w-7 rounded-full transition", color === c && "ring-2 ring-ink ring-offset-2 ring-offset-surface")}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="rounded-xl bg-raised p-2">
            <p className="text-lg font-extrabold">{currentStreak(habits, habit.id, dayKey())}</p>
            <p className="text-[10px] text-muted">Current streak</p>
          </div>
          <div className="rounded-xl bg-raised p-2">
            <p className="text-lg font-extrabold">{bestStreak(habits, habit.id)}</p>
            <p className="text-[10px] text-muted">Best streak</p>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="label">Streak badges</span>
          <div className="flex flex-wrap gap-1.5">
            {MILESTONES.map((m) => (
              <span
                key={m}
                className={cx(
                  "rounded-full px-2.5 py-1 text-[11px] font-bold",
                  earned.has(m) ? "bg-accent/20 text-accent" : "bg-raised text-muted/60",
                )}
              >
                🔥 {m} days
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setHabits((h) => moveHabit(h, habit.id, monthKey, -1))} aria-label="Move up">
            <LuArrowUp />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setHabits((h) => moveHabit(h, habit.id, monthKey, 1))} aria-label="Move down">
            <LuArrowDown />
          </Button>
          <Button
            variant="danger"
            size="sm"
            className="ml-auto"
            onClick={() => {
              if (!confirmDelete) return setConfirmDelete(true)
              setHabits((h) => removeHabit(h, habit.id, monthKey))
              onClose()
            }}
          >
            <LuTrash2 /> {confirmDelete ? `Remove from ${monthName} on?` : "Remove"}
          </Button>
        </div>
        {confirmDelete && (
          <p className="-mt-2 text-[11px] text-muted">Past months and check-offs are kept. Click again to confirm.</p>
        )}

        <Button type="submit" disabled={!title.trim()}>
          Save
        </Button>
      </form>
    </Modal>
  )
}
