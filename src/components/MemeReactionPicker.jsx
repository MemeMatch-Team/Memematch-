import { useEffect, useState } from 'react'
import { fetchReactionGifs, localLibrary } from '../services/gifService.js'

export default function MemeReactionPicker({ analysis, language, onSelect }) {
  const [query, setQuery] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  const recommendedQuery = [...(analysis?.intentKeywords || []).slice(0, 4), analysis?.context, ...(analysis?.keywords || []).slice(0, 3), analysis?.category, language !== 'All' ? language : ''].filter(Boolean).join(' ')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const result = await fetchReactionGifs(query.trim() || recommendedQuery, analysis, language)
      if (!cancelled) {
        const local = result.gifs.length ? [] : localLibrary
          .filter(g => language === 'All' || g.language === language || (language === 'Indian' && ['Hindi','Marathi','Hinglish','Minglish','Indian'].includes(g.language)))
          .slice(0, 8)
        setItems([...result.gifs, ...local].slice(0, 8))
        setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [recommendedQuery, query, language, analysis])

  return (
    <div className="meme-picker" role="dialog" aria-label="Meme reaction picker">
      <div className="meme-search-row">
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search a reaction meme…" aria-label="Search reaction memes" />
      </div>
      {loading && <p className="picker-loading">Finding reactions…</p>}
      <div className="meme-reaction-grid">
        {items.map(g => (
          <button key={g.id} type="button" className="meme-reaction-option" onClick={() => onSelect(g)} title={g.name}>
            <img src={g.previewUrl || g.gifUrl} alt="" loading="lazy" />
            <span>{g.name}</span>
          </button>
        ))}
      </div>
      {!loading && !items.length && <p className="empty">No reaction memes found. Try another search.</p>}
    </div>
  )
}
