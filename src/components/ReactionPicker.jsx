import { useMemo, useState } from 'react'
import EmojiPicker from './EmojiPicker.jsx'
import MemeReactionPicker from './MemeReactionPicker.jsx'

export default function ReactionPicker({ analysis, language, selectedEmoji, onEmoji, onMeme, onClose }) {
  const [mode, setMode] = useState('emoji')
  const recommended = useMemo(() => {
    const text = `${analysis?.emotion || ''} ${analysis?.tone || ''} ${(analysis?.keywords || []).join(' ')}`.toLowerCase()
    if (analysis?.responseIntent === 'thanks') return ['🙏','❤️','😊','🫶']
    if (analysis?.responseIntent === 'welcome') return ['😊','🤝','🙌','❤️']
    if (analysis?.responseIntent === 'congratulate') return ['🎉','👏','🙌','🔥']
    if (analysis?.responseIntent === 'support') return ['🫂','❤️','🙏','🥲']
    if (/sad|cry|fail|frustrat|exam|bore/.test(text)) return ['😭','💀','😂','🤦']
    if (/happy|success|win|excited|celebr/.test(text)) return ['🔥','👏','🙌','😂']
    if (/angry|rage/.test(text)) return ['😡','🤦','💀','👎']
    if (/shock|surpris|confus/.test(text)) return ['😱','😮','👀','💀']
    return ['😂','😭','💀','🤔']
  }, [analysis])

  return (
    <div className="reaction-popover">
      <div className="reaction-mode-tabs" role="tablist">
        <button type="button" className={mode === 'emoji' ? 'active' : ''} onClick={() => setMode('emoji')}>😊 Emoji</button>
        <button type="button" className={mode === 'meme' ? 'active' : ''} onClick={() => setMode('meme')}>🎞️ Meme</button>
        <button type="button" className="picker-close" onClick={onClose} aria-label="Close reaction picker">×</button>
      </div>
      {mode === 'emoji'
        ? <EmojiPicker recommended={recommended} selected={selectedEmoji} onSelect={onEmoji} />
        : <MemeReactionPicker analysis={analysis} language={language} onSelect={onMeme} />}
    </div>
  )
}
