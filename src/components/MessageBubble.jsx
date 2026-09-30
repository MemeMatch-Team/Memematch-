import ReactionPicker from './ReactionPicker.jsx'
import ChaosEmoji from '../chaos/ChaosEmoji.jsx'
import { useChaos } from '../chaos/ChaosContext.jsx'

export default function MessageBubble({ message, analysis, language, reaction, onReact, onRemove, open, setOpen }) {
  const hasReaction = Boolean(reaction)
  const { mayhem } = useChaos()
  return (
    <article className="message-thread">
      <div className="message-bubble sender">
        <p>{message}</p>
        <span className="message-time">now</span>
      </div>
      <div className="message-reaction-row">
        {hasReaction && (
          <button type="button" className="reaction-chip" onClick={onRemove} aria-label="Remove reaction">
            {reaction.type === 'emoji' ? <ChaosEmoji base={reaction.value} /> : <img className={mayhem ? 'chaos-gif' : ''} src={reaction.value.previewUrl || reaction.value.gifUrl} alt="" />}
            <span>1</span>
          </button>
        )}
        <button type="button" className="react-button" onClick={() => setOpen(v => !v)} aria-expanded={open}>＋ React</button>
      </div>
      {open && (
        <ReactionPicker
          analysis={analysis}
          language={language}
          selectedEmoji={reaction?.type === 'emoji' ? reaction.value : null}
          onEmoji={emoji => onReact({ type: 'emoji', value: emoji })}
          onMeme={gif => onReact({ type: 'meme', value: gif })}
          onClose={() => setOpen(false)}
        />
      )}
    </article>
  )
}
