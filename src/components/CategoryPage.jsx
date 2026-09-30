import { useEffect, useMemo, useState } from 'react'
import { localLibrary, fetchLive } from '../services/gifService.js'
import { searchLibrary } from '../services/matchingService.js'
import { useDebounce } from '../hooks/useDebounce.js'
import { Link } from '../router.jsx'
import GifCard from './GifCard.jsx'
import MemePreviewModal from './MemePreviewModal.jsx'
import SkeletonGrid from './SkeletonGrid.jsx'

export default function CategoryPage({ category, onCopied }) {
  const [q, setQ] = useState('')
  const dq = useDebounce(q, 250)
  const [live, setLive] = useState([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('')
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true); setNotice(''); setLive([])
    fetchLive({ category: category.label, keywords: category.keywords, emotion: '', tone: '' }).then(r => {
      if (cancelled) return
      if (r.ok) setLive(r.gifs)
      else setNotice("Showing our curated picks — live results are taking a break 😊")
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [category.slug])

  const localMatches = useMemo(() => localLibrary.filter(category.match), [category])

  const pool = useMemo(() => {
    const merged = [...live, ...localMatches.filter(l => !live.some(g => g.id === l.id))]
    return merged.sort((a, b) => (b.trendScore + b.popularityScore) - (a.trendScore + a.popularityScore))
  }, [live, localMatches])

  const filtered = useMemo(() => (dq.trim() ? searchLibrary(pool, dq) : pool), [pool, dq])

  return (
    <section className="category-page">
      <Link to="/categories" className="back-link">← All categories</Link>
      <h1>{category.emoji} {category.label}</h1>
      <p className="tag">{category.description}</p>
      <div className="search glass">
        <label htmlFor="cat-search">Search within {category.label}</label>
        <input id="cat-search" value={q} onChange={e => setQ(e.target.value)} placeholder="Search in English, Hindi, Marathi…" />
      </div>
      {notice && <p className="notice" role="status">{notice}</p>}
      {loading ? <SkeletonGrid /> : (
        filtered.length ? (
          <div className="grid">
            {filtered.map(g => <GifCard key={g.id} gif={g} onCopied={onCopied} onOpen={setPreview} />)}
          </div>
        ) : (
          <p className="empty">
            No {category.label.toLowerCase()} memes matched “{q}” yet — try another word, or check back once the meme library grows.
          </p>
        )
      )}
      <MemePreviewModal gif={preview} onClose={() => setPreview(null)} onCopied={onCopied} />
    </section>
  )
}
