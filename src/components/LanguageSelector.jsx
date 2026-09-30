const OPTIONS = [
  ['All', 'All'],
  ['English', 'English'],
  ['Hindi', 'Hindi'],
  ['Marathi', 'Marathi'],
  ['Hinglish', 'Hinglish'],
  ['Minglish', 'Minglish'],
  ['Indian', 'Indian'],
]

export default function LanguageSelector({ value, onChange }) {
  return (
    <div className="language-filter" aria-label="Reaction language">
      <span className="language-label">Language</span>
      <select value={value} onChange={e => onChange(e.target.value)} aria-label="Choose meme language">
        {OPTIONS.map(([label, val]) => <option key={val} value={val}>{label}</option>)}
      </select>
    </div>
  )
}
