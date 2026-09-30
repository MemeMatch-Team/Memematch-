// Chaos helpers — MID-HACK CHAOS BOUNTY (HCC · DKTE)

export const ROASTS = {
  default: [
    'Congratulations, you just lost 20 seconds of your life.',
    'Wow. Your problems are now a meme. Sharma ji ka beta has no such problems.',
    'Result loaded. Your dignity did not.',
  ],
  frustrated: ['Skill issue detected. Have you tried turning your life off and on again?'],
  sad: ['Sad? Cry in the canteen. Vada pav is only fifteen rupees.'],
  happy: ['Happy? Suspicious. Attendance must be above seventy five percent.'],
  angry: ['Calm down. The professor is watching. Or is that just your imagination?'],
  bored: ['Bored? Go attend a lecture. Oh wait, you are bored because of that.'],
  confused: ['Confused? Same. The whole team is confused. Nobody knows why this works.'],
  tired: ['Tired? You should have slept instead of building this.'],
  shocked: ['Shocked? Wait until you see the semester results.'],
  excited: ['Excited? Deploy on Friday night then. Live a little.'],
}
export const ERROR_ROASTS = [
  'Error. Skill issue. Not mine, yours.',
  'That was empty. Just like the fridge in the hostel.',
]

export const SARCASTIC = [
  'Consulting your ex… 💔',
  'Checking if attendance is < 75%… 📉',
  'Bribing the algorithm… 💸',
  'Asking Sharma ji ka beta for help… 🤓',
  'Copying answers from the back bench… 📝',
  'Pretending to work hard… 💻',
  'Waiting for the canteen to open… 🥪',
  'Blaming the WiFi… 📶',
  'Reading your message with judgement… 🧐',
  'Downloading more RAM… 🐏',
]

export const CRAZY_MODS = ['🔥', '🤡', '💀', '👁️', '🌀', '🥴', '🫠', '⚡', '🍕', '👽', '🧿', '🪩', '🐸', '🗿', '🫡', '🦆']
export const CRAZY_SPICE = ['💥', '✨', '🌈', '🍌', '🚀', '🧨', '🛸', '🌶️']
export const pick = a => a[Math.floor(Math.random() * a.length)]

// Turns a plain emoji into an unhinged mashup, e.g. 😂 -> 🤡😂🔥
export function mutateEmoji(base) {
  const shape = Math.floor(Math.random() * 4)
  const m1 = pick(CRAZY_MODS), m2 = pick(CRAZY_MODS), s = pick(CRAZY_SPICE)
  if (shape === 0) return `${m1}${base}${m2}`
  if (shape === 1) return `${base}${base}${m1}`
  if (shape === 2) return `${s}${base}${s}`
  return `${m1}${base}${s}${m2}`
}

export function speak(text, { crazy = true, queue = false } = {}) {
  try {
    if (!('speechSynthesis' in window)) return
    if (!queue) window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.pitch = crazy ? 0.2 + Math.random() * 0.6 : 1     // robotic deep voice
    u.rate = crazy ? 0.85 + Math.random() * 0.4 : 1
    u.volume = 1
    window.speechSynthesis.speak(u)
  } catch { /* browser said no */ }
}

export function roastFor(emotion) {
  const list = ROASTS[(emotion || '').toLowerCase()] || ROASTS.default
  return pick([...list, ...ROASTS.default])
}

// 🥪 Canteen Mode converters
export const vadaPav = n => {
  const v = Math.round(n)
  return `${v} 🥪 vada pav${v === 1 ? '' : 's'}`
}
export const chai = pct => `${(pct / 12).toFixed(1)} ☕ cups of chai`

export const burst = emoji => window.dispatchEvent(new CustomEvent('chaos:burst', { detail: emoji }))
