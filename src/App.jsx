import { useState } from 'react'
import { usePath } from './router.jsx'
import { SavedProvider, useSavedContext } from './context/SavedContext.jsx'
import { getCategory } from './data/categories.js'
import Navbar from './components/Navbar.jsx'
import Home from './components/Home.jsx'
import TrendingPage from './components/TrendingPage.jsx'
import CategoriesIndexPage from './components/CategoriesIndexPage.jsx'
import CategoryPage from './components/CategoryPage.jsx'
import SavedPage from './components/SavedPage.jsx'
import { ChaosProvider } from './chaos/ChaosContext.jsx'
import ChaosLayer from './chaos/ChaosLayer.jsx'
import DoodleBackground from './components/DoodleBackground.jsx'

function Shell() {
  const path = usePath()
  const [toast, setToast] = useState('')
  const { saved } = useSavedContext()
  const flash = m => { setToast(m); setTimeout(() => setToast(''), 2200) }

  const slug = path.replace(/^\/+/, '').split('/')[0]
  const category = slug ? getCategory(slug) : null

  let page
  if (path === '/') page = <Home onCopied={flash} />
  else if (path === '/trending') page = <TrendingPage onCopied={flash} />
  else if (path === '/categories') page = <CategoriesIndexPage />
  else if (path === '/saved') page = <SavedPage onCopied={flash} />
  else if (category) page = <CategoryPage key={category.slug} category={category} onCopied={flash} />
  else page = <Home onCopied={flash} />

  return (
    <DoodleBackground>
    <div className="app">
      <Navbar path={path} savedCount={saved.length} />
      <main>{page}</main>
      {toast && <div className="toast" role="status">{toast}</div>}
      <footer>Memes via GIPHY. MemeMatch never generates media — it only understands, searches, matches and ranks.</footer>
    </div>
    </DoodleBackground>
  )
}

export default function App() {
  return (
    <ChaosProvider>
      <SavedProvider>
        <Shell />
        <ChaosLayer />
      </SavedProvider>
    </ChaosProvider>
  )
}
