import { useEffect, useState } from 'react'
import { mutateEmoji } from './chaos.js'
import { useChaos } from './ChaosContext.jsx'

// Emoji that keeps mutating into a shaking, spinning, unhinged mashup.
export default function ChaosEmoji({ base, className = '' }) {
  const { mayhem } = useChaos()
  const [shown, setShown] = useState(base)
  useEffect(() => {
    if (!mayhem) { setShown(base); return }
    setShown(mutateEmoji(base))
    const id = setInterval(() => setShown(mutateEmoji(base)), 650)
    return () => clearInterval(id)
  }, [base, mayhem])
  return <span className={(mayhem ? 'chaos-emoji ' : '') + className}>{shown}</span>
}
