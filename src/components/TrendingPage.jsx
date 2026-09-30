import { useEffect, useMemo, useState } from 'react'
import { localLibrary, fetchLive } from '../services/gifService.js'
import { CATEGORIES } from '../data/categories.js'
import { Link } from '../router.jsx'
import GifCard from './GifCard.jsx'
import MemePreviewModal from './MemePreviewModal.jsx'
import SkeletonGrid from './SkeletonGrid.jsx'

export default function TrendingPage({ onCopied }) {
  const [live, setLive] = useState([])
  const [loading, setLoading] = useState(true)
  const [isLive, setIsLive] = useState(false)
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetchLive({ category: 'Trending', keywords: ['trending', 'viral', 'meme'], emotion: '', tone: '' }).then(r => {
      if (cancelled) return
      if (r.ok) { setLive(r.gifs); setIsLive(true) }
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  const topLocal = useMemo(
    () => [...localLibrary].sort((a, b) => (b.trendScore + b.popularityScore) - (a.trendScore + a.popularityScore)).slice(0, 12),
    []
  )
  const pool = useMemo(() => {
    const merged = [...live, ...topLocal.filter(l => !live.some(g => g.id === l.id))]
    return merged.slice(0, 16)
  }, [live, topLocal])

  return (
    <section className="trending-page">
      <h1>🔥 Trending on MemeMatch</h1>
      <p className="tag">{isLive ? 'Live trending picks, refreshed from GIPHY.' : 'Popular this week from our curated library — live trending needs a GIPHY key.'}</p>
      {loading ? <SkeletonGrid /> : (
        <div className="grid">
          {pool.map(g => <GifCard key={g.id} gif={g} onCopied={onCopied} onOpen={setPreview} />)}
        </div>
      )}
      <h2>📌 Popular categories</h2>
      <div className="cat-grid">
        {CATEGORIES.map(c => {
          const count = localLibrary.filter(c.match).length
          return (
            <Link key={c.slug} to={`/${c.slug}`} className="cat-card">
              <span className="cat-emoji">{c.emoji}</span>
              <span className="cat-label">{c.label}</span>
              <span className="cat-count">{count} meme{count === 1 ? '' : 's'}</span>
            </Link>
          )
        })}
      </div>
      <MemePreviewModal gif={preview} onClose={() => setPreview(null)} onCopied={onCopied} />
    </section>
  )
}
