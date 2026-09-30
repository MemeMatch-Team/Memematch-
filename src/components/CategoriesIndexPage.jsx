import { CATEGORIES } from '../data/categories.js'
import { localLibrary } from '../services/gifService.js'
import { Link } from '../router.jsx'

export default function CategoriesIndexPage() {
  return (
    <section>
      <h1>🗂️ Categories</h1>
      <p className="tag">Pick a mood or a moment — we'll find the meme.</p>
      <div className="cat-grid">
        {CATEGORIES.map(c => {
          const count = localLibrary.filter(c.match).length
          return (
            <Link key={c.slug} to={`/${c.slug}`} className="cat-card">
              <span className="cat-emoji">{c.emoji}</span>
              <span className="cat-label">{c.label}</span>
              <span className="cat-count">{count} meme{count === 1 ? '' : 's'}</span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
