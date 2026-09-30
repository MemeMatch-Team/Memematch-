import { energy } from '../services/matchingService.js'
import { useChaos } from '../chaos/ChaosContext.jsx'
export default function MemeEnergy({ analysis }) {
  const { pct, label } = energy(analysis)
  const { energy: fmt } = useChaos()
  return (
    <div className="energy" role="img" aria-label={`Meme energy ${pct} percent, ${label}`}>
      <div className="energy-top"><span>Meme energy</span><b>{fmt(pct)}</b></div>
      <div className="bar"><i style={{ width: pct + '%' }} /></div>
      <div className="chaos">Chaos level: {label}</div>
    </div>
  )
}
