import { useEffect, useRef, useState } from 'react'
import { useChaos } from './ChaosContext.jsx'
import { speak, burst, pick, CRAZY_MODS } from './chaos.js'

const FAKE_CODE = [
  ['import', ' torch ', 'from', ' transformers'],
  ['', '', '', ''],
  ['class', ' NeuralNetwork', '(nn.Module):', ''],
  ['    def', ' forward', '(self, x):', ''],
  ['        # TODO: figure out why this works', '', '', ''],
  ['        x = self.layer(x) ', '* 0 + 42', '', ''],
  ['        return', ' x.softmax(dim=-1)', '', ''],
  ['', '', '', ''],
  ['async def', ' train', '(epochs=9999):', ''],
  ['    for epoch in', ' range(epochs):', '', ''],
  ['        loss = ', 'model(batch).backward()', '', ''],
  ['        print', '(f"epoch {epoch} loss: nan")', '', ''],
]
const FAKE_LOG = [
  '$ npm run build',
  '> vite build',
  '✓ 47 modules transformed.',
  'warning: Sharma ji ka beta would have fixed this already',
  '$ git commit -m "final final FINAL v2"',
  '$ python train.py --epochs 9999',
  'Epoch 1/9999 - loss: nan - accuracy: 0.00',
  'Epoch 2/9999 - loss: nan - accuracy: 0.00',
  'Traceback (most recent call last): ...working hard, please wait',
]

function PanicScreen({ onExit }) {
  const [lines, setLines] = useState(4)
  const [log, setLog] = useState(2)
  useEffect(() => {
    const id = setInterval(() => {
      setLines(l => (l >= FAKE_CODE.length ? 4 : l + 1))
      setLog(l => (l >= FAKE_LOG.length ? 2 : l + 1))
    }, 900)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="panic" onDoubleClick={onExit}>
      <div className="panic-bar"><span className="dot r" /><span className="dot y" /><span className="dot g" /><b>train.py — hackathon-project — Visual Studio Code</b></div>
      <div className="panic-body">
        <aside>
          <p>EXPLORER</p>
          <ul><li>▾ hackathon-project</li><li>&nbsp;&nbsp;▸ node_modules</li><li>&nbsp;&nbsp;▸ src</li><li className="sel">&nbsp;&nbsp;train.py</li><li>&nbsp;&nbsp;model.pkl</li><li>&nbsp;&nbsp;README.md</li><li>&nbsp;&nbsp;final_FINAL_v2.py</li></ul>
        </aside>
        <div className="panic-main">
          <div className="panic-tabs"><span className="on">train.py</span><span>model.py</span></div>
          <pre className="panic-code">
            {FAKE_CODE.slice(0, lines).map((l, i) => (
              <div key={i}><i>{String(i + 1).padStart(2, ' ')}</i> <em className="k">{l[0]}</em><em className="f">{l[1]}</em><em className="s">{l[2]}</em>{l[3]}</div>
            ))}
            <span className="caret" />
          </pre>
          <div className="panic-term">
            <p>TERMINAL &nbsp; PROBLEMS 47 &nbsp; OUTPUT</p>
            <pre>{FAKE_LOG.slice(0, log).join('\n')}<span className="caret" /></pre>
          </div>
        </div>
      </div>
      <div className="panic-status">⎇ main* &nbsp; ⊗ 47 ⚠ 0 &nbsp; Python 3.11 &nbsp; (press Esc or double-click to escape)</div>
    </div>
  )
}

export default function ChaosLayer() {
  const { voice, flee, mayhem, canteen, toggle } = useChaos()
  const [panic, setPanic] = useState(false)
  const [guilt, setGuilt] = useState(false)
  const [menu, setMenu] = useState(false)
  const [rain, setRain] = useState([])
  const lastGuilt = useRef(0)

  // 🚨 Professor Approaching — Esc key
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') setPanic(p => !p) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  useEffect(() => { if (panic) window.speechSynthesis?.cancel() }, [panic])

  // 🤦‍♂️ Sharma Ji Ka Beta guilt alert — exit intent, tab close, tab switch
  const showGuilt = () => {
    if (Date.now() - lastGuilt.current < 15000) return
    lastGuilt.current = Date.now()
    setGuilt(true)
    if (voice) speak("Leaving already? Sharma ji ka beta wouldn't close this tab.")
  }
  useEffect(() => {
    const onLeave = e => { if (e.clientY <= 0 && !e.relatedTarget) showGuilt() }
    const onBefore = e => { e.preventDefault(); e.returnValue = "Leaving already? Sharma ji ka beta wouldn't close this tab." }
    const title = document.title
    const onVis = () => { document.title = document.hidden ? 'Sharma ji ka beta is still here 😤' : title }
    document.addEventListener('mouseout', onLeave)
    window.addEventListener('beforeunload', onBefore)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      document.removeEventListener('mouseout', onLeave)
      window.removeEventListener('beforeunload', onBefore)
      document.removeEventListener('visibilitychange', onVis)
      document.title = title
    }
  }, [voice])

  // 🌪️ Emoji rain when a reaction fires
  useEffect(() => {
    const onBurst = e => {
      const base = e.detail
      const items = Array.from({ length: 34 }, (_, i) => ({
        id: Date.now() + i,
        ch: Math.random() < 0.55 ? base : pick(CRAZY_MODS),
        left: Math.random() * 100,
        dur: 1.6 + Math.random() * 1.8,
        delay: Math.random() * 0.5,
        size: 24 + Math.random() * 44,
        spin: (Math.random() - 0.5) * 1440,
      }))
      setRain(r => [...r, ...items])
      setTimeout(() => setRain(r => r.filter(x => !items.includes(x))), 4200)
    }
    window.addEventListener('chaos:burst', onBurst)
    return () => window.removeEventListener('chaos:burst', onBurst)
  }, [])

  return (
    <>
      {mayhem && <div className="rain" aria-hidden="true">{rain.map(r => (
        <span key={r.id} style={{ left: r.left + '%', fontSize: r.size, animationDuration: r.dur + 's', animationDelay: r.delay + 's', '--spin': r.spin + 'deg' }}>{r.ch}</span>
      ))}</div>}

      <div className="chaos-fab">
        {menu && (
          <div className="chaos-menu glass" role="menu">
            <b>⚡ CHAOS MENU</b>
            <label><input type="checkbox" checked={voice} onChange={() => toggle('voice')} /> 🤖 Robotic Voice Roast</label>
            <label><input type="checkbox" checked={canteen} onChange={() => toggle('canteen')} /> 🥪 DKTE Canteen Mode</label>
            <label><input type="checkbox" checked={flee} onChange={() => toggle('flee')} /> 🏃 Fleeing Send Button</label>
            <label><input type="checkbox" checked={mayhem} onChange={() => toggle('mayhem')} /> 🤪 Mayhem Emoji Mode</label>
            <button type="button" onClick={() => { setMenu(false); setPanic(true) }}>🚨 Professor Approaching</button>
            <button type="button" onClick={() => { setMenu(false); lastGuilt.current = 0; showGuilt() }}>🤦‍♂️ Test guilt alert</button>
            <button type="button" onClick={() => { burst('🤡'); if (voice) speak('Congratulations, you just lost 20 seconds of your life.') }}>💥 Test emoji chaos</button>
            <small>Tip: press Esc anytime to look busy.</small>
          </div>
        )}
        <button type="button" className="chaos-btn" onClick={() => setMenu(m => !m)} aria-expanded={menu}>⚡ CHAOS</button>
      </div>

      {/* Hidden panic button (bottom-right corner) */}
      <button type="button" className="hidden-panic" aria-label="Professor approaching" title="🚨" onClick={() => setPanic(true)} />

      {guilt && (
        <div className="guilt-back" role="alertdialog" aria-modal="true">
          <div className="guilt glass">
            <div className="guilt-emoji">🤦‍♂️</div>
            <h2>Leaving already?</h2>
            <p>Sharma ji ka beta wouldn’t close this tab.</p>
            <div className="row">
              <button type="button" className="cta" onClick={() => setGuilt(false)}>Fine, I’ll stay 😔</button>
              <button type="button" className="ghost" onClick={() => setGuilt(false)}>Cancel (disappoint parents)</button>
            </div>
          </div>
        </div>
      )}

      {panic && <PanicScreen onExit={() => setPanic(false)} />}
    </>
  )
}
