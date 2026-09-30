// Usage: GIPHY_API_KEY=xxx npm run seed
// Pulls real GIFs from GIPHY and writes src/data/fallbackGifs.json.
// No URLs or IDs are invented. The script deduplicates by GIPHY ID and stops only
// after TARGET_UNIQUE records or after the configured search space is exhausted.
import { writeFileSync } from 'node:fs'

const KEY = process.env.GIPHY_API_KEY
if (!KEY) { console.error('Set GIPHY_API_KEY first'); process.exit(1) }

const TARGET_UNIQUE = 550
const PER_PAGE = 25
const MAX_PAGES_PER_QUERY = 4
const sleep = ms => new Promise(r => setTimeout(r, ms))

const BASE_QUERIES = [
  ['funny reaction','Funny','amused','funny',['funny','reaction']],
  ['laughing reaction','Laughing','amused','funny',['laughing','lol','reaction']],
  ['facepalm reaction','Facepalm','frustrated','sarcastic',['facepalm','disbelief']],
  ['awkward reaction','Awkward','awkward','funny',['awkward','cringe']],
  ['shocked reaction','Shock','shocked','funny',['shock','surprise']],
  ['confused reaction','Confusion','confused','funny',['confused','what']],
  ['angry reaction','Anger','angry','dramatic',['angry','rage']],
  ['crying reaction','Sadness','sad','dramatic',['sad','cry']],
  ['celebration reaction','Celebration','excited','funny',['celebration','win']],
  ['birthday thank you reaction','Celebration','happy','wholesome',['birthday','thank','thanks','gratitude','appreciation','reply']],
  ['birthday thank you gif','Celebration','happy','wholesome',['birthday','thank','thanks','reply']],
  ['thank you reaction','Relationships','happy','wholesome',['thank','thanks','gratitude','appreciation','reply']],
  ['thank you so much reaction','Relationships','happy','wholesome',['thank','thanks','gratitude','reply']],
  ['thanks for the birthday wishes','Celebration','happy','wholesome',['birthday','thanks','wishes','reply']],
  ['congratulations reply thank you','Celebration','happy','wholesome',['congratulations','thanks','reply']],
  ['happy anniversary thank you','Celebration','happy','wholesome',['anniversary','thanks','reply']],
  ['you are welcome reaction','Relationships','happy','wholesome',['welcome','reply']],
  ['success reaction','Success','happy','funny',['success','win','finally']],
  ['epic fail reaction','Failure','frustrated','funny',['failure','fail']],
  ['sarcastic reaction','Sarcasm','annoyed','sarcastic',['sarcasm','clap']],
  ['chaos reaction','Chaos','panicked','chaotic',['chaos','fire']],
  ['waiting forever reaction','Waiting','bored','sarcastic',['waiting']],
  ['motivation reaction','Motivation','excited','wholesome',['motivation','inspire']],
  ['work office reaction','Work','tired','sarcastic',['work','office','job']],
  ['monday reaction','Work','tired','sarcastic',['work','office','monday']],
  ['money reaction','Money','shocked','funny',['money','cash']],
  ['food reaction','Food','happy','funny',['food','hungry']],
  ['sleep reaction','Sleep','tired','funny',['sleep','tired']],
  ['friendship reaction','Friendship','happy','wholesome',['friend','bestie']],
  ['friend ghosted reaction','Friendship','disappointed','sarcastic',['friend','ghosted']],
  ['relationship drama reaction','Relationships','shocked','funny',['relationship','drama']],
  ['gaming reaction','Gaming','excited','funny',['gaming','game']],
  ['sports reaction','Sports','excited','funny',['sports','win']],
  ['travel reaction','Travel','excited','funny',['travel','trip']],
  ['indian reaction','Indian','amused','funny',['indian','desi']],
  ['bollywood reaction','Indian','surprised','funny',['desi','hindi','bollywood']],
  ['bollywood funny reaction','Indian','amused','funny',['desi','hindi','bollywood']],
  ['bollywood crying','Indian','sad','dramatic',['bollywood','desi']],
  ['bollywood celebration','Indian','happy','funny',['bollywood','desi']],
  ['desi mom reaction','Indian','angry','funny',['desi','mom']],
  ['exam stress','Exam','frustrated','sarcastic',['exam','student','college']],
  ['exam panic','Exam','panicked','funny',['exam','study','failure']],
  ['exam result reaction','Exam','shocked','funny',['exam','marks','result']],
  ['college student tired','College','tired','sarcastic',['college','student']],
  ['college boring lecture','College','bored','sarcastic',['college','lecture','student']],
  ['assignment deadline panic','College','panicked','funny',['assignment','deadline','college']],
  ['programmer debugging','Coding','frustrated','sarcastic',['code','bug','debug','programming']],
  ['code works celebration','Coding','happy','funny',['code','success','programming']],
  ['developer facepalm','Coding','frustrated','sarcastic',['programming','facepalm']],
]

const LANGUAGE_QUERIES = [
  ['hindi meme reaction','Hindi',['hindi','desi','reaction']],
  ['hindi funny reaction','Hindi',['hindi','funny','reaction']],
  ['hindi crying reaction','Hindi',['hindi','crying','sad']],
  ['hindi angry reaction','Hindi',['hindi','angry','reaction']],
  ['hindi shocked reaction','Hindi',['hindi','shocked','reaction']],
  ['hindi exam meme','Hindi',['hindi','exam','student']],
  ['hindi college meme','Hindi',['hindi','college','student']],
  ['hindi friendship meme','Hindi',['hindi','friendship','friend']],
  ['hindi office meme','Hindi',['hindi','office','work']],
  ['hindi success meme','Hindi',['hindi','success','win']],
  ['hindi failure meme','Hindi',['hindi','failure','fail']],
  ['marathi meme reaction','Marathi',['marathi','reaction']],
  ['marathi funny reaction','Marathi',['marathi','funny','reaction']],
  ['marathi comedy reaction','Marathi',['marathi','comedy','reaction']],
  ['marathi college meme','Marathi',['marathi','college','student']],
  ['marathi exam reaction','Marathi',['marathi','exam','student']],
  ['marathi friendship meme','Marathi',['marathi','friendship','friend']],
  ['marathi angry reaction','Marathi',['marathi','angry','reaction']],
  ['marathi shocked reaction','Marathi',['marathi','shocked','reaction']],
  ['marathi crying reaction','Marathi',['marathi','crying','sad']],
  ['marathi student reaction','Marathi',['marathi','student','reaction']],
  ['marathi office reaction','Marathi',['marathi','office','work']],
  ['hinglish meme reaction','Hinglish',['hinglish','indian','reaction']],
  ['hinglish funny reaction','Hinglish',['hinglish','funny','reaction']],
  ['hinglish exam','Hinglish',['hinglish','exam','student']],
  ['hinglish friendship','Hinglish',['hinglish','friendship','friend']],
  ['hinglish office','Hinglish',['hinglish','office','work']],
  ['hinglish coding','Hinglish',['hinglish','coding','developer']],
  ['minglish marathi reaction','Minglish',['minglish','marathi','reaction']],
  ['marathi roman reaction','Minglish',['marathi','roman','reaction']],
  ['marathi roman comedy','Minglish',['marathi','roman','comedy']],
]

const queries = [
  ...BASE_QUERIES.map(([q,c,e,t,tags]) => ({ q, category:c, emotion:e, tone:t, tags, language: c === 'Indian' ? 'Indian' : 'All' })),
  ...LANGUAGE_QUERIES.map(([q,language,tags]) => ({ q, category:'Indian', emotion:'amused', tone:'funny', tags, language })),
]

// Add practical combinations without inventing media.
for (const lang of ['hindi','marathi','hinglish','minglish']) {
  for (const mood of ['funny','sad','angry','shocked','confused','happy','facepalm','exam','college','coding','office','friendship','success']) {
    queries.push({ q:`${lang} ${mood} reaction`, category:'Indian', emotion:mood, tone:['sad','angry','confused'].includes(mood) ? 'sarcastic' : 'funny', tags:[lang,mood,'reaction'], language:lang[0] === 'h' && lang !== 'hinglish' ? 'Hindi' : lang === 'marathi' ? 'Marathi' : lang === 'minglish' ? 'Minglish' : 'Hinglish' })
  }
}

async function get(url) {
  const r = await fetch(url)
  if (!r.ok) throw new Error(`GIPHY ${r.status}`)
  return r.json()
}

const trending = new Set()
try {
  const t = await get(`https://api.giphy.com/v1/gifs/trending?api_key=${KEY}&limit=50&rating=pg-13`)
  for (const g of t.data || []) trending.add(g.id)
} catch (e) {
  console.warn('Trending lookup skipped:', e.message)
}

const out = []
const seen = new Set()
let calls = 0

for (const spec of queries) {
  if (out.length >= TARGET_UNIQUE) break
  let added = 0
  for (let page = 0; page < MAX_PAGES_PER_QUERY && out.length < TARGET_UNIQUE; page++) {
    const offset = page * PER_PAGE
    let data = []
    try {
      const r = await get(`https://api.giphy.com/v1/gifs/search?api_key=${KEY}&q=${encodeURIComponent(spec.q)}&limit=${PER_PAGE}&offset=${offset}&rating=pg-13&lang=en`)
      data = r.data || []
      calls++
    } catch (e) {
      console.warn(`${spec.q} page ${page + 1}: ${e.message}`)
      break
    }
    if (!data.length) break
    for (const [i, g] of data.entries()) {
      if (out.length >= TARGET_UNIQUE || seen.has(g.id)) continue
      const media = g.images?.fixed_height
      const still = g.images?.fixed_height_still
      if (!media?.url || !still?.url) continue
      // The ID and URLs come directly from GIPHY; no synthetic records are created.
      seen.add(g.id)
      out.push({
        id:g.id, name:g.title || spec.q, gifUrl:media.url, previewUrl:still.url,
        category:spec.category, emotion:spec.emotion, tone:spec.tone, language:spec.language === 'All' ? undefined : spec.language,
        tags:[...new Set([...spec.q.split(/\s+/), ...spec.tags, spec.category.toLowerCase()])],
        popularityScore:Math.max(40,95-(i%10)*5),
        trendScore:trending.has(g.id) ? 90 : 45,
        source:'GIPHY', pageUrl:g.url,
      })
      added++
    }
    await sleep(120)
  }
  console.log(`${spec.q}: +${added} (total ${out.length})`)
}

writeFileSync(new URL('../src/data/fallbackGifs.json', import.meta.url), JSON.stringify(out, null, 1))
console.log(`Meme library generated: ${out.length} unique GIFs`)
console.log(`GIPHY search calls: ${calls}`)
if (out.length < 500) console.warn('Library is below 500 because the available GIPHY result set/API did not provide enough unique records.')
