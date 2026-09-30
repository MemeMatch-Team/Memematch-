import { useState, useMemo, useRef, useEffect } from 'react'
import { analyze } from '../services/aiService.js'
import { fetchLive, localLibrary } from '../services/gifService.js'
import { rank, buildSections, explain, searchLibrary, FILTERS, detectLanguage, getGifLanguage, inferResponseIntent } from '../services/matchingService.js'
import { CATEGORIES } from '../data/categories.js'
import { Link } from '../router.jsx'
import GifCard from './GifCard.jsx'
import MemeEnergy from './MemeEnergy.jsx'
import MemePreviewModal from './MemePreviewModal.jsx'
import MessageBubble from './MessageBubble.jsx'
import RecommendedReactions from './RecommendedReactions.jsx'
import LanguageSelector from './LanguageSelector.jsx'
import ChaosEmoji from '../chaos/ChaosEmoji.jsx'
import FleeingButton from '../chaos/FleeingButton.jsx'
import { useChaos } from '../chaos/ChaosContext.jsx'
import { SARCASTIC, ERROR_ROASTS, speak, roastFor, burst, pick } from '../chaos/chaos.js'

const EXAMPLES = [
  'My exam destroyed me',
  'My code has 50 errors',
  'Aaj college madhe khup boring lecture hota 😭',
  'आज मेरा mood बहुत अच्छा है',
  'mala khup bhook lagli aahe',
  'Finally my code works!',
]
const STEPS = SARCASTIC // 5️⃣ Sarcastic Loading Screen
const SPINNERS = ['🙄', '😒', '🥱', '🫠', '🤡', '💀']
const EMOJI = {
  frustrated: '😤', angry: '😡', sad: '😢', happy: '😄', confused: '😵‍💫', shocked: '😱',
  disappointed: '😞', excited: '🤩', tired: '🥱', bored: '😐', amused: '😆', awkward: '😬',
  disbelieving: '🫤', panicked: '😰', surprised: '😲',
}

export default function Home({ onCopied }) {
  const [text, setText] = useState('')
  const [phase, setPhase] = useState('home')
  const [step, setStep] = useState(0)
  const [analysis, setAnalysis] = useState(null)
  const [ranked, setRanked] = useState([])
  const [seen, setSeen] = useState(new Set())
  const [filter, setFilter] = useState('All')
  const [language, setLanguage] = useState('All')
  const [notice, setNotice] = useState('')
  const [err, setErr] = useState('')
  const [q, setQ] = useState('')
  const [preview, setPreview] = useState(null)
  const [reaction, setReaction] = useState(null)
  const [reactionOpen, setReactionOpen] = useState(false)
  const { voice, intensity } = useChaos()
  const timer = useRef()
  useEffect(() => () => clearInterval(timer.current), [])

  const popular = useMemo(
    () => [...localLibrary].sort((a, b) => b.trendScore + b.popularityScore - a.trendScore - a.popularityScore).slice(0, 4),
    []
  )

  async function submit(e) {
    e?.preventDefault()
    if (!text.trim()) { setErr('Tell me what happened first 😂'); if (voice) speak(pick(ERROR_ROASTS)); return }
    setErr(''); setNotice(''); setPhase('loading'); setStep(Math.floor(Math.random() * STEPS.length)); setSeen(new Set()); setReaction(null); setReactionOpen(false)
    const detected = detectLanguage(text.trim())
    setLanguage(detected === 'All' ? 'All' : detected)
    timer.current = setInterval(() => setStep(s => s + 1), 1100)
    const { analysis: a, usedAI } = await analyze(text.trim())
    const response = inferResponseIntent(text.trim())
    const enriched = { ...a, language: detected, ...response, reactionIntent: response.responseIntent }
    const live = await fetchLive(enriched)
    clearInterval(timer.current)
    const pool = live.ok ? live.gifs : localLibrary
    setNotice('')
    setAnalysis(enriched); setRanked(rank(pool, enriched)); setFilter('All'); setQ(''); setPhase('results')
    if (voice) speak(roastFor(a.emotion), { queue: true })   // 🤖 Robotic Voice Roast
  }

  const filtered = useMemo(() => {
    const f = ranked.filter(g => {
      const gifLanguage = getGifLanguage(g)
      const languageOK = language === 'All' || gifLanguage === language ||
        (language === 'Indian' && ['Hindi','Marathi','Hinglish','Minglish','Indian'].includes(gifLanguage))
      return FILTERS[filter](g) && languageOK
    })
    return f.length ? f : ranked.filter(FILTERS[filter])
  }, [ranked, filter, language])

  const fresh = filtered.filter(g => !seen.has(g.id))
  const sections = buildSections(fresh.length >= 3 ? fresh : filtered, analysis || {})
  const findAnother = () => setSeen(s => (fresh.length - sections.length >= 1 ? new Set([...s, ...sections.map(x => x[1].id)]) : new Set()))
  const results = q.trim() ? searchLibrary(localLibrary, q) : null

  const setEmojiReaction = emoji => { setReaction({ type: 'emoji', value: emoji }); setReactionOpen(false); burst(emoji) }
  const setMemeReaction = gif => { setReaction({ type: 'meme', value: gif }); setReactionOpen(false); burst('🤡') }
  const removeReaction = () => setReaction(null)

  return (
    <>
      {phase !== 'results' && (
        <section className="hero">
          <div className="hero-kicker"><span className="status-dot" /> MemeMatch AI · reaction-ready</div>
          <h1>Say what happened.<br /><span>We’ll find the reaction.</span></h1>
          <p className="sub">A calmer way to turn everyday moments into the right meme or GIF.</p>
          <form onSubmit={submit} className="composer glass">
            <label htmlFor="msg">Tell me what happened</label>
            <textarea
              id="msg" rows={3} maxLength={500} value={text} onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submit(e) }}
              placeholder="My exam destroyed me… / आज बहुत थक गया / मला खूप भूक लागली आहे"
            />
            <div className="composer-bottom">
              <span className="composer-hint">English · Hindi · Marathi · Hinglish · Minglish</span>
              <FleeingButton className="send-btn" disabled={phase === 'loading'} aria-label="Find a meme reaction">Send ↗</FleeingButton>
            </div>
          </form>
          {err && <p role="alert" className="err">{err}</p>}
          {phase === 'loading' && <p className="loading" role="status" aria-live="polite"><span className="spin-emoji">{SPINNERS[step % SPINNERS.length]}</span>{STEPS[step % STEPS.length]}</p>}
          <div className="chips quick-prompts" aria-label="Quick suggestions">{EXAMPLES.map(x => <button key={x} type="button" onClick={() => setText(x)}>{x}</button>)}</div>
        </section>
      )}

      {phase === 'home' && (
        <>
          <section>
            <div className="section-heading"><div><h2>Popular picks</h2><p>Real reactions from the local library.</p></div></div>
            {popular.length ? <div className="grid">{popular.map(g => <GifCard key={g.id} gif={g} onCopied={onCopied} onOpen={setPreview} />)}</div>
              : <p className="empty">The local meme library is empty. Run <code>npm run seed</code>.</p>}
            <div className="search glass">
              <label htmlFor="s">Search memes</label>
              <input id="s" value={q} onChange={e => setQ(e.target.value)} placeholder="college, exam, coding, Marathi…" />
            </div>
            {results && (results.length ? <div className="grid">{results.slice(0, 6).map(g => <GifCard key={g.id} gif={g} onCopied={onCopied} onOpen={setPreview} />)}</div>
              : <p className="empty">No memes for "{q}". Try "exam" or "college".</p>)}
          </section>
          <section>
            <h2>Quick categories</h2>
            <div className="chips">{CATEGORIES.slice(0, 9).map(c => <Link key={c.slug} to={`/${c.slug}`} className="chip-link">{c.emoji} {c.label}</Link>)}</div>
          </section>
        </>
      )}

      {phase === 'results' && analysis && (
        <section className="results-page">
          <div className="results-top">
            <div><span className="eyebrow">MESSAGE UNDERSTOOD</span><h2>Your reaction room</h2></div>
            <LanguageSelector value={language} onChange={setLanguage} />
          </div>

          <div className="message-stage">
            <MessageBubble
              message={text}
              analysis={analysis}
              language={language}
              reaction={reaction}
              onReact={value => value?.type === 'meme' ? setMemeReaction(value.value) : value?.type ? setEmojiReaction(value.value) : setEmojiReaction(value)}
              onRemove={removeReaction}
              open={reactionOpen}
              setOpen={setReactionOpen}
            />
            <div className="understood glass">
              <p className="understood-title">We understood your message as</p>
              <ul>
                <li>Emotion: <ChaosEmoji base={EMOJI[analysis.emotion.toLowerCase()] || '🙂'} /> {analysis.emotion}</li>
                <li>Context: {analysis.context}</li>
                <li>Tone: {analysis.tone}</li>
                <li>Intensity: {intensity(analysis.intensity)}</li>
                <li>Language: {language}</li>
              </ul>
              <MemeEnergy analysis={analysis} />
            </div>
          </div>

          <RecommendedReactions analysis={analysis} language={language} onEmoji={setEmojiReaction} onMeme={() => setReactionOpen(true)} />
          {notice && <p className="notice" role="status">{notice}</p>}

          <div className="result-controls">
            <div className="filters" role="tablist">{Object.keys(FILTERS).map(f => (
              <button key={f} className={f === filter ? 'on' : ''} onClick={() => { setFilter(f); setSeen(new Set()) }}>{f}</button>
            ))}</div>
            <LanguageSelector value={language} onChange={setLanguage} />
          </div>

          {sections.length ? <div className="grid">{sections.map(([title, g], i) =>
            <GifCard key={g.id} gif={g} title={title} big={i === 0} why={explain(g, analysis)} onCopied={onCopied} onOpen={setPreview} />
          )}</div> : <p className="empty">No matching memes available. Run <code>npm run seed</code> or configure GIPHY.</p>}

          <div className="row"><button className="cta" onClick={findAnother}>🔄 Find Another</button><button className="ghost" onClick={() => setPhase('home')}>New situation</button></div>
        </section>
      )}
      <MemePreviewModal gif={preview} onClose={() => setPreview(null)} onCopied={onCopied} />
    </>
  )
}
