export default function DoodleBackground({ children }) {
  return (
    <div className="doodle-shell">
      <div className="doodle-pattern" aria-hidden="true">
        <span>☺</span><span>✦</span><span>⌁</span><span>♡</span><span>☻</span><span>✎</span><span>◌</span><span>↗</span>
      </div>
      <div className="doodle-content">{children}</div>
    </div>
  )
}
