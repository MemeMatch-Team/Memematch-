import { useState } from 'react'
import { useSavedContext } from '../context/SavedContext.jsx'
import { Link } from '../router.jsx'
import GifCard from './GifCard.jsx'
import MemePreviewModal from './MemePreviewModal.jsx'

export default function SavedPage({ onCopied }) {
  const { saved } = useSavedContext()
  const [preview, setPreview] = useState(null)

  return (
    <section>
      <h1>❤️ Saved Memes</h1>
      <p className="tag">Memes you've saved on this device.</p>
      {saved.length ? (
        <div className="grid">
          {saved.map(g => <GifCard key={g.id} gif={g} onCopied={onCopied} onOpen={setPreview} />)}
        </div>
      ) : (
        <p className="empty">No saved memes yet. Tap 🤍 on any meme to save it here — or <Link to="/">find your first match</Link>.</p>
      )}
      <MemePreviewModal gif={preview} onClose={() => setPreview(null)} onCopied={onCopied} />
    </section>
  )
}
