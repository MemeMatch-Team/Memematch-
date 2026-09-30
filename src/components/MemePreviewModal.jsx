import { useEffect, useRef } from 'react'
import { useSavedContext } from '../context/SavedContext.jsx'
import { downloadMeme } from '../utils/download.js'
import { shareMeme, whatsappShareUrl, copyLink } from '../utils/share.js'

export default function MemePreviewModal({ gif, onClose, onCopied }) {
  const boxRef = useRef(null)
  const { isSaved, toggleSave } = useSavedContext()

  useEffect(() => {
    if (!gif) return
    const onKey = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    boxRef.current?.focus()
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [gif, onClose])

  if (!gif) return null
  const saved = isSaved(gif.id)

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={gif.name}
        ref={boxRef}
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close preview">✕</button>
        <div className="modal-img-wrap">
          <img src={gif.gifUrl} alt={gif.name} className="modal-img" />
        </div>
        <div className="modal-info">
          <p className="gif-name">{gif.name}</p>
          <p className="meta">{gif.category}</p>
          <div className="tags">{(gif.tags || []).slice(0, 6).map(t => <span key={t}>#{t}</span>)}</div>
          <div className="actions modal-actions">
            <button onClick={() => { toggleSave(gif); onCopied?.(saved ? 'Removed from saved' : 'Saved ❤️') }}>
              {saved ? '❤️ Saved' : '🤍 Save'}
            </button>
            <button onClick={async () => { const r = await downloadMeme(gif); onCopied?.(r.ok ? 'Downloading meme… 📥' : 'Opened original — save it from there 📥') }}>
              ⬇️ Download
            </button>
            <button onClick={async () => {
              const r = await shareMeme(gif)
              if (r.ok) onCopied?.('Shared! 🎉')
              else if (r.method !== 'cancelled') window.open(whatsappShareUrl(gif), '_blank', 'noopener')
            }}>
              🔗 Share
            </button>
            <button onClick={async () => { const ok = await copyLink(gif); onCopied?.(ok ? 'Link copied ✅' : 'Could not copy link') }}>
              Copy link
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
