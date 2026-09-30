import { useMemo, useState } from 'react'

const GROUPS = {
  Common: ['😂','😭','🤣','😢','😡','😱','😮','😐','🤔','😎','❤️','🔥','👏','💀','🤦','🙌','🥲','😅','🤡','🫡','👀','👍','👎'],
  Funny: ['😂','🤣','💀','🤡','😅','🤦','😭','👀','😐'],
  Love: ['❤️','🥰','😍','😘','🙌','👏'],
  Sad: ['😭','😢','🥲','😞','💀'],
  Angry: ['😡','🤬','🤦','👎'],
  Shocked: ['😱','😮','😳','👀','💀'],
}

export default function EmojiPicker({ recommended = [], selected, onSelect }) {
  const [group, setGroup] = useState('Common')
  const emojis = useMemo(() => {
    const base = GROUPS[group] || GROUPS.Common
    return [...new Set([...recommended, ...base])]
  }, [group, recommended])

  return (
    <div className="emoji-picker" role="dialog" aria-label="Emoji reactions">
      <div className="picker-tabs" role="tablist">
        {Object.keys(GROUPS).map(g => (
          <button key={g} type="button" role="tab" aria-selected={group === g} className={group === g ? 'active' : ''} onClick={() => setGroup(g)}>{g}</button>
        ))}
      </div>
      <div className="emoji-grid">
        {emojis.map(e => (
          <button key={e} type="button" className={selected === e ? 'selected' : ''} onClick={() => onSelect(e)} aria-label={`React ${e}`}>{e}</button>
        ))}
      </div>
    </div>
  )
}
