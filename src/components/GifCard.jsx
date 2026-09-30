import { useState } from 'react'
import { useSavedContext } from '../context/SavedContext.jsx'
import { downloadMeme } from '../utils/download.js'
import { shareMeme, whatsappShareUrl, copyLink } from '../utils/share.js'

export default function GifCard({ gif, title, why, big, onCopied, onOpen }) {
  const [src, setSrc] = useState(gif.gifUrl)
  const [broken, setBroken] = useState(false)
  const [busy, setBusy] = useState(false)
  const [menu, setMenu] = useState(false)
  const { isSaved, toggleSave } = useSavedContext()
  const saved = isSaved(gif.id)

  const doSave = e => { e.stopPropagation(); toggleSave(gif); onCopied?.(saved ? 'Removed from saved' : 'Saved ❤️') }

  const doDownload = async e => {
    e.stopPropagation()
    if (busy) return
    setBusy(true)
    const r = await downloadMeme(gif)
    setBusy(false)
    onCopied?.(r.ok ? 'Downloading meme… 📥' : 'Opened original — save it from there 📥')
  }

  const doShare = async e => {
    e.stopPropagation()
    const r = await shareMeme(gif)
    if (r.ok) { onCopied?.('Shared! 🎉'); return }
    if (r.method === 'cancelled') return
    setMenu(m => !m)
  }
  const doWhatsapp = e => { e.stopPropagation(); window.open(whatsappShareUrl(gif), '_blank', 'noopener'); setMenu(false) }
  const doCopy = async e => {
    e.stopPropagation()
    const ok = await copyLink(gif)
    onCopied?.(ok ? 'Link copied ✅' : (gif.pageUrl || gif.gifUrl))
    setMenu(false)
  }

  const openable = typeof onOpen === 'function' && !broken

  return (
    <article className={'card' + (big ? ' big' : '')}>
      {title && <h3 className="card-title">{title}</h3>}
      <button
        className={'save-btn' + (saved ? ' on' : '')}
        aria-pressed={saved}
        aria-label={saved ? `Remove ${gif.name} from saved memes` : `Save ${gif.name}`}
        onClick={doSave}
      >
        {saved ? '❤️' : '🤍'}
      </button>
      <div
        className="gif-wrap"
        onClick={() => openable && onOpen(gif)}
        role={openable ? 'button' : undefined}
        tabIndex={openable ? 0 : undefined}
        aria-label={openable ? `Preview ${gif.name}` : undefined}
        onKeyDown={e => { if (openable && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onOpen(gif) } }}
      >
        {broken ? <div className="gif-broken">This meme is unavailable 😅</div> : (
          <img
            src={src}
            alt={gif.name}
            loading="lazy"
            decoding="async"
            onError={() => (src !== gif.previewUrl && gif.previewUrl ? setSrc(gif.previewUrl) : setBroken(true))}
          />
        )}
        {gif.match != null && <span className="badge">{gif.match}% match</span>}
      </div>
      <p className="gif-name">{gif.name}</p>
      {why && <p className="why">{why}</p>}
      <p className="meta">{gif.category}</p>
      <div className="tags">{(gif.tags || []).slice(0, 4).map(t => <span key={t}>#{t}</span>)}</div>
      <div className="actions">
        <button onClick={doDownload} disabled={busy} aria-label={`Download ${gif.name}`}>{busy ? 'Saving…' : '⬇️ Download'}</button>
        <button onClick={doShare} aria-label={`Share ${gif.name}`} aria-expanded={menu}>🔗 Share</button>
      </div>
      {menu && (
        <div className="share-menu" role="menu">
          <button role="menuitem" onClick={doWhatsapp}>WhatsApp</button>
          <button role="menuitem" onClick={doCopy}>Copy link</button>
          <button role="menuitem" className="ghost-mini" onClick={e => { e.stopPropagation(); setMenu(false) }}>Close</button>
        </div>
      )}
      <p className="src">via {gif.source}</p>
    </article>
  )
}
