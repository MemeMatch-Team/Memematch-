import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const KEY = 'memematch:saved:v1'

function read() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY))
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

const SavedContext = createContext(null)

// Single source of truth for saved/favorited memes (prototype-friendly localStorage).
// If this project later gains real auth/a backend, swap the two effects below
// for API calls — every consumer uses the same isSaved/toggleSave/removeSaved shape.
export function SavedProvider({ children }) {
  const [saved, setSaved] = useState(read)

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(saved)) } catch { /* storage unavailable/full: ignore */ }
  }, [saved])

  const isSaved = useCallback(id => saved.some(g => g.id === id), [saved])

  const toggleSave = useCallback(gif => {
    setSaved(prev => prev.some(g => g.id === gif.id)
      ? prev.filter(g => g.id !== gif.id)
      : [{ ...gif, savedAt: Date.now() }, ...prev].slice(0, 300))
  }, [])

  const removeSaved = useCallback(id => setSaved(prev => prev.filter(g => g.id !== id)), [])

  return (
    <SavedContext.Provider value={{ saved, isSaved, toggleSave, removeSaved }}>
      {children}
    </SavedContext.Provider>
  )
}

export function useSavedContext() {
  const ctx = useContext(SavedContext)
  if (!ctx) throw new Error('useSavedContext must be used within a SavedProvider')
  return ctx
}
