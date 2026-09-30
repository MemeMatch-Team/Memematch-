import { createContext, useContext, useMemo, useState } from 'react'
import { vadaPav, chai } from './chaos.js'

const Ctx = createContext(null)

export function ChaosProvider({ children }) {
  const [flags, setFlags] = useState({ voice: true, flee: true, mayhem: true, canteen: false })
  const toggle = k => setFlags(f => ({ ...f, [k]: !f[k] }))
  const value = useMemo(() => ({
    ...flags,
    toggle,
    // Canteen mode: numbers -> snacks
    intensity: n => (flags.canteen ? vadaPav(n) : `${n}/10`),
    energy: pct => (flags.canteen ? chai(pct) : `${pct}%`),
    count: n => (flags.canteen ? `${n} 🥪` : `${n}`),
  }), [flags])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useChaos = () => useContext(Ctx)
