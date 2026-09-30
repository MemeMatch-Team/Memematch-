import { useEffect, useRef, useState } from 'react'
import { useChaos } from './ChaosContext.jsx'
import { speak } from './chaos.js'

const MAX_DRIFT = 90 // px: the button only shuffles a short distance from its home
const TAUNTS = ['Nope 🏃', 'Too slow!', 'Catch me 😜', 'Missed!', 'Try harder', 'lol no']

// Primary button runs away from the cursor. Gets tired after a few dodges so the app stays usable.
export default function FleeingButton({ children, className, disabled, onClick: userClick, ...rest }) {
  const { flee, voice } = useChaos()
  const ref = useRef(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [label, setLabel] = useState(null)
  const dodges = useRef(0)
  const tiredUntil = useRef(0)
  const firstDodge = useRef(0)

  useEffect(() => {
    if (!flee) { setPos({ x: 0, y: 0 }); return }
    if (window.matchMedia?.('(hover: none)').matches) return // touch screens can't hover
    const onMove = e => {
      const el = ref.current
      if (!el || disabled || Date.now() < tiredUntil.current) return
      const r = el.getBoundingClientRect()
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2
      const dx = cx - e.clientX, dy = cy - e.clientY
      const dist = Math.hypot(dx, dy)
      if (dist > 100) return
      if (!firstDodge.current) firstDodge.current = Date.now()
      dodges.current += 1
      if (dodges.current > 7) {
        dodges.current = 0
        tiredUntil.current = Date.now() + 6000
        setLabel('Fine… 😮‍💨')
        setPos({ x: 0, y: 0 })
        setTimeout(() => setLabel(null), 6000)
        return
      }
      const nx = dx / (dist || 1), ny = dy / (dist || 1)
      const jump = 35 + Math.random() * 35
      setPos(p => {
        const clamp = v => Math.max(-MAX_DRIFT, Math.min(MAX_DRIFT, v))
        return {
          x: clamp(p.x + nx * jump + (Math.random() - 0.5) * 20),
          y: clamp(p.y + ny * jump + (Math.random() - 0.5) * 20),
        }
      })
      setLabel(TAUNTS[Math.floor(Math.random() * TAUNTS.length)])
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [flee, disabled])

  const onClick = e => {
    if (voice) {
      const secs = firstDodge.current ? Math.max(1, Math.round((Date.now() - firstDodge.current) / 1000)) : 20
      speak(`You wasted ${secs} seconds finding the button.`)
    }
    firstDodge.current = 0
    userClick?.(e)
  }

  return (
    <button
      ref={ref}
      onClick={onClick}
      className={className}
      disabled={disabled}
      style={{ transform: `translate(${pos.x}px, ${pos.y}px)`, transition: 'transform .18s cubic-bezier(.3,1.6,.5,1)', position: 'relative', zIndex: 30 }}
      {...rest}
    >
      {label || children}
    </button>
  )
}
