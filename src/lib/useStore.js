import { useCallback, useEffect, useRef, useState } from "react"
import { getItems, setItems, subscribe } from "./storage"

/**
 * React state backed by one storage key. Returns [value, update, loaded].
 * update accepts a value or a function of the latest value. Updates made
 * before the first read finishes are queued so they never overwrite stored data.
 */
export function useStored(key, makeDefault) {
  const [value, setValue] = useState(makeDefault)
  const [loaded, setLoaded] = useState(false)
  const latest = useRef(value)
  const isLoaded = useRef(false)
  const queue = useRef([])
  // Serialized values we wrote ourselves; their change events are echoes to skip.
  const pending = useRef([])

  const write = useCallback(
    (next) => {
      const resolved = typeof next === "function" ? next(latest.current) : next
      latest.current = resolved
      setValue(resolved)
      pending.current.push(JSON.stringify(resolved))
      setItems({ [key]: resolved })
    },
    [key],
  )

  useEffect(() => {
    let alive = true
    getItems([key]).then((res) => {
      if (!alive) return
      if (res[key] !== undefined) {
        const merged = { ...makeDefault(), ...res[key] }
        latest.current = merged
        setValue(merged)
      }
      isLoaded.current = true
      setLoaded(true)
      const queued = queue.current
      queue.current = []
      queued.forEach(write)
    })
    const off = subscribe((changes) => {
      if (!(key in changes) || changes[key] === undefined) return
      const raw = JSON.stringify(changes[key])
      const i = pending.current.indexOf(raw)
      if (i !== -1) {
        pending.current.splice(0, i + 1)
        return
      }
      const merged = { ...makeDefault(), ...changes[key] }
      latest.current = merged
      setValue(merged)
    })
    return () => {
      alive = false
      off()
    }
    // makeDefault is a stable module-level factory
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, write])

  const update = useCallback(
    (next) => {
      if (!isLoaded.current) queue.current.push(next)
      else write(next)
    },
    [write],
  )

  return [value, update, loaded]
}
