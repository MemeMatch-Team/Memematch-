// Proxies GIPHY search so the API key stays server-side.
export default async function handler(req, res) {
  const key = process.env.GIPHY_API_KEY
  if (!key) return res.status(503).json({ error: 'missing_key' })
  const q = String(req.query.q || '').slice(0, 100)
  if (!q) return res.status(400).json({ error: 'empty' })
  try {
    const r = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${key}&q=${encodeURIComponent(q)}&limit=12&rating=pg-13&lang=en`)
    if (!r.ok) return res.status(r.status === 429 ? 429 : 502).json({ error: 'upstream' })
    const { data } = await r.json()
    res.setHeader('Cache-Control', 's-maxage=300')
    res.status(200).json({ data })
  } catch { res.status(502).json({ error: 'failed' }) }
}
