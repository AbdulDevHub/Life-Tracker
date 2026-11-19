import { useRef, useState } from "react"
import { LuDownload, LuUpload } from "react-icons/lu"
import { waterDayKey } from "../lib/dates"
import { defaultExercise, defaultHabits, defaultSettings, defaultWater } from "../lib/defaults"
import { mergeFavorites } from "../features/exercise/favorites"
import { backupFileName, buildBackup, mergeHabits, mergeWaterDays, parseImport } from "../lib/importExport"
import { KEYS } from "../lib/storage"
import { useStored } from "../lib/useStore"
import { downloadJson, toast } from "../lib/util"
import { Button, Modal, Segmented, Switch } from "./ui"


function Section({ title, children }) {
  return (
    <section className="flex flex-col gap-1.5">
      <h3 className="label">{title}</h3>
      {children}
    </section>
  )
}

function Row({ label, children }) {
  return (
    <div className="flex min-h-7 items-center justify-between gap-3 text-sm">
      <span>{label}</span>
      {children}
    </div>
  )
}

function ImportPanel({ setHabits, setWater, setExercise, setSettings, onDone }) {
  const [text, setText] = useState("")
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")
  const [confirmReplace, setConfirmReplace] = useState(false)
  const fileRef = useRef(null)

  const check = (value = text) => {
    setConfirmReplace(false)
    try {
      setResult(parseImport(value))
      setError("")
    } catch (e) {
      setResult(null)
      setError(e.message)
    }
  }

  const apply = (mode) => {
    const { data } = result
    if (mode === "replace") {
      if (data.habits) setHabits({ ...defaultHabits(), ...data.habits })
      if (data.water) setWater({ ...defaultWater(), ...data.water })
      if (data.exercise) setExercise({ ...defaultExercise(), ...data.exercise })
      if (data.settings) setSettings((s) => ({ ...s, ...data.settings }))
    } else {
      if (data.habits) setHabits((h) => mergeHabits(h, data.habits))
      if (data.water) setWater((w) => ({ ...w, days: mergeWaterDays(w.days, data.water.days) }))
      if (data.exercise)
        setExercise((x) => {
          const ids = new Set(x.entries.map((e) => e.id))
          return {
            ...x,
            entries: [...x.entries, ...(data.exercise.entries || []).filter((e) => !ids.has(e.id))],
            favorites: mergeFavorites(x.favorites, data.exercise.favorites),
          }
        })
    }
    toast(mode === "replace" ? "✅ Data replaced" : "✅ Data merged")
    setText("")
    setResult(null)
    setConfirmReplace(false)
    onDone?.()
  }

  const s = result?.summary

  return (
    <div className="flex flex-col gap-2">
      <textarea
        className="field h-16 resize-none font-mono text-[11px]"
        placeholder="Paste a Life Tracker backup here, or choose the file…"
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          setResult(null)
          setError("")
        }}
        spellCheck={false}
      />
      <input
        ref={fileRef}
        type="file"
        accept=".json,.txt,application/json,text/plain"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0]
          if (!file) return
          const value = await file.text()
          setText(value)
          check(value)
          e.target.value = ""
        }}
      />
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={() => fileRef.current?.click()}>
          <LuUpload /> Choose file
        </Button>
        <Button variant="soft" size="sm" disabled={!text.trim()} onClick={() => check()}>
          Check
        </Button>
      </div>
      {error && <p className="text-xs font-semibold text-danger">{error}</p>}
      {s && (
        <div className="flex flex-col gap-2 rounded-xl bg-raised p-3 text-xs">
          <p className="font-bold">Life Tracker backup</p>
          <p className="text-muted">
            {s.habits} habits across {s.months} months, {s.checks} check-offs, {s.waterDays} water days,{" "}
            {s.workouts} exercises.
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => apply("merge")}>
              Merge in
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => (confirmReplace ? apply("replace") : setConfirmReplace(true))}
            >
              {confirmReplace ? "Sure? Replace" : "Replace mine"}
            </Button>
          </div>
          <p className="text-muted">Merge keeps what you have and adds anything new. Replace overwrites it.</p>
        </div>
      )}
    </div>
  )
}

export default function SettingsSheet({ open, onClose, settings, setSettings }) {
  const [habits, setHabits] = useStored(KEYS.habits, defaultHabits)
  const [water, setWater] = useStored(KEYS.water, defaultWater)
  const [exercise, setExercise] = useStored(KEYS.exercise, defaultExercise)
  const [confirmWipe, setConfirmWipe] = useState(false)
  const [showImport, setShowImport] = useState(false)

  const setReminder = (key, value) =>
    setSettings((s) => ({ ...s, reminders: { ...s.reminders, [key]: value } }))

  const exportAll = () => {
    downloadJson(buildBackup({ habits, water, exercise, settings }), backupFileName())
    toast("⬇️ Backup downloaded")
  }

  const wipe = () => {
    if (!confirmWipe) return setConfirmWipe(true)
    setHabits(defaultHabits())
    setWater(defaultWater())
    setExercise(defaultExercise())
    setSettings({ ...defaultSettings(), theme: settings.theme })
    setConfirmWipe(false)
    toast("All data erased")
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Settings" wide>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <div className="flex flex-col gap-4">
          <Section title="General">
            <Row label="Theme">
              <Segmented
                value={settings.theme}
                onChange={(v) => setSettings((s) => ({ ...s, theme: v }))}
                options={[
                  { value: "dark", label: "Dark" },
                  { value: "light", label: "Light" },
                ]}
              />
            </Row>
            <Row label="Weight unit">
              <Segmented
                value={exercise.unit}
                onChange={(v) => setExercise((x) => ({ ...x, unit: v }))}
                options={[
                  { value: "kg", label: "kg" },
                  { value: "lb", label: "lb" },
                ]}
              />
            </Row>
            <Switch
              label="Habits left on toolbar icon"
              checked={settings.showBadge !== false}
              onChange={(v) => setSettings((s) => ({ ...s, showBadge: v }))}
            />
          </Section>

          <Section title="Reminders">
            <Row label="Habits">
              <Segmented
                value={settings.reminders?.habits || "off"}
                onChange={(v) => setReminder("habits", v)}
                options={[
                  { value: "off", label: "Off" },
                  { value: "daily", label: "8 PM" },
                  { value: "hourly", label: "Hourly" },
                ]}
              />
            </Row>
            <Row label="Water">
              <Segmented
                value={settings.reminders?.water || "off"}
                onChange={(v) => setReminder("water", v)}
                options={[
                  { value: "off", label: "Off" },
                  { value: "60", label: "1 h" },
                  { value: "120", label: "2 h" },
                ]}
              />
            </Row>
            <p className="text-[11px] text-muted">Only when something is left to do. Water: 8 AM–10 PM.</p>
          </Section>
        </div>

        <div className="flex flex-col gap-4">
          <Section title="Backup">
            <div className="flex gap-2">
              <Button variant="soft" size="sm" onClick={exportAll}>
                <LuDownload /> Export
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowImport((v) => !v)}>
                <LuUpload /> {showImport ? "Hide import" : "Import"}
              </Button>
            </div>
            {showImport && (
              <ImportPanel
                setHabits={setHabits}
                setWater={setWater}
                setExercise={setExercise}
                setSettings={setSettings}
                onDone={() => setShowImport(false)}
              />
            )}
          </Section>

          <Section title="Reset">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const dk = waterDayKey()
                  setWater((w) => {
                    const days = { ...w.days }
                    delete days[dk]
                    return { ...w, days }
                  })
                  toast("Today's water reset")
                }}
              >
                Reset today&apos;s water
              </Button>
              <Button variant="danger" size="sm" onClick={wipe}>
                {confirmWipe ? "Click again to erase" : "Erase all data"}
              </Button>
            </div>
            <p className="text-[11px] text-muted">Export a backup first. Erasing can&apos;t be undone.</p>
          </Section>
        </div>

        <p className="col-span-2 border-t border-line pt-3 text-center text-[11px] text-muted">
          Life Tracker v{globalThis.chrome?.runtime?.getManifest?.().version ?? "2.0.0"} · Your data stays on this device.
        </p>
      </div>
    </Modal>
  )
}
