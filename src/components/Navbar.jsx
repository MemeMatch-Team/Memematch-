import { useState } from 'react'
import { Link } from '../router.jsx'
import { useChaos } from '../chaos/ChaosContext.jsx'

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/trending', label: 'Trending' },
  { to: '/categories', label: 'Categories' },
  { to: '/saved', label: 'Saved' },
]

export default function Navbar({ path, savedCount }) {
  const [open, setOpen] = useState(false)
  const { count } = useChaos()
  return (
    <header className="nav">
      <div className="nav-row">
        <Link to="/" className="logo" onClick={() => setOpen(false)}>MemeMatch <em>AI</em></Link>
        <button className="nav-toggle" aria-expanded={open} aria-label="Toggle navigation menu" onClick={() => setOpen(o => !o)}>
          {open ? '✕' : '☰'}
        </button>
        <nav className={'nav-links' + (open ? ' open' : '')} aria-label="Main">
          {LINKS.map(l => (
            <Link key={l.to} to={l.to} className={path === l.to ? 'active' : ''} onClick={() => setOpen(false)}>
              {l.label}{l.to === '/saved' && savedCount > 0 ? ` (${count(savedCount)})` : ''}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
