import fallback from '../data/fallbackGifs.json'
export const localLibrary = fallback

// Live GIPHY search through our serverless proxy. Returns { gifs, ok, reason }.
export async function fetchLive(analysis) {
  const intentQuery = (analysis.intentKeywords || []).slice(0, 4)
  const q = [...intentQuery, analysis.context, ...analysis.keywords.slice(0, 3), analysis.category].filter(Boolean).join(' ')
  try {
    const r = await fetch(`/api/gifs?q=${encodeURIComponent(q)}`)
    if (!r.ok) return { gifs: [], ok: false, reason: r.status === 429 ? 'rate' : 'api' }
    const { data } = await r.json()
    if (!data?.length) return { gifs: [], ok: false, reason: 'empty' }
    const gifs = data.map((g, i) => ({
      id: g.id, name: g.title || q, gifUrl: g.images.fixed_height.url, previewUrl: g.images.fixed_height_still.url,
      category: analysis.category, emotion: analysis.emotion.toLowerCase(), tone: analysis.tone.toLowerCase(), language: analysis.language || 'All',
      tags: [...new Set([...(analysis.intentKeywords || []), ...analysis.keywords, analysis.responseIntent || '', ...(g.title || '').toLowerCase().split(/\W+/).filter(w => w.length > 2)])].filter(Boolean).slice(0, 14),
      popularityScore: Math.max(50, 92 - i * 4), trendScore: 50, source: 'GIPHY', pageUrl: g.url,
    }))
    return { gifs, ok: true }
  } catch { return { gifs: [], ok: false, reason: 'network' } }
}


export async function fetchReactionGifs(query, analysis, language = 'All') {
  const q = [query, ...(analysis?.intentKeywords || []).slice(0, 3), analysis?.context || '', language !== 'All' ? language : ''].filter(Boolean).join(' ')
  try {
    const r = await fetch(`/api/gifs?q=${encodeURIComponent(q)}`)
    if (!r.ok) return { gifs: [], ok: false, reason: r.status === 429 ? 'rate' : 'api' }
    const { data } = await r.json()
    if (!data?.length) return { gifs: [], ok: false, reason: 'empty' }
    const gifs = data.map((g, i) => ({
      id: g.id, name: g.title || q, gifUrl: g.images.fixed_height.url, previewUrl: g.images.fixed_height_still.url,
      category: analysis?.category || 'Reaction', emotion: analysis?.emotion?.toLowerCase() || 'amused',
      tone: analysis?.tone?.toLowerCase() || 'funny',
      language: language === 'All' ? 'Indian' : language,
      tags: [...new Set([...(analysis?.intentKeywords || []), ...(analysis?.keywords || []), analysis?.responseIntent || '', language, ...(g.title || '').toLowerCase().split(/\W+/).filter(w => w.length > 2)])].filter(Boolean).slice(0, 16),
      popularityScore: Math.max(50, 92 - i * 4), trendScore: 50, source: 'GIPHY', pageUrl: g.url,
    }))
    return { gifs, ok: true }
  } catch { return { gifs: [], ok: false, reason: 'network' } }
}
