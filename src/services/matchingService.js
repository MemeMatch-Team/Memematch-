// Keyword analysis (no-AI fallback) + scoring/ranking of existing GIFs.
// Domain keywords include English, Hindi/Marathi (Devanagari) and common Hinglish/Minglish
// (Marathi/Hindi written in Roman letters) spellings, so a mixed-language sentence still
// lands in the right category even without the AI backend.
const RULES = [
  ['Exam', ['exam', 'paper', 'marks', 'study', 'studied', 'test', 'result', 'परीक्षा', 'निकाल', 'नतीजा', 'pariksha', 'nikal'], 'frustrated', 'sarcastic'],
  ['Coding', ['code', 'bug', 'error', 'errors', 'programming', 'debug', 'debugging', 'program', 'deploy', 'कोड'], 'frustrated', 'chaotic'],
  ['Friendship', ['friend', 'bro', 'notes', 'bestie', 'disappeared', 'ghosted', 'dost', 'yaar', 'mitra', 'दोस्त', 'दोस्ती', 'मित्र', 'यार'], 'disappointed', 'sarcastic'],
  ['Success', ['won', 'success', 'finally', 'worked', 'works', 'passed', 'got the job'], 'happy', 'funny'],
  ['Anger', ['angry', 'rage', 'annoyed', 'furious', 'hate', 'gussa', 'raag', 'गुस्सा', 'राग', 'चिड'], 'angry', 'dramatic'],
  ['Confusion', ['confused', 'what', 'understand', 'explained', 'lost', 'samjhat', 'kalat', 'समझ', 'कळत'], 'confused', 'sarcastic'],
  ['Sadness', ['sad', 'cry', 'crying', 'failed', 'heartbroken', 'dukhi', 'udaas', 'दुखी', 'दुःख', 'उदास', 'रडत'], 'sad', 'dramatic'],
  ['College', ['professor', 'lecture', 'class', 'assignment', 'college', 'hostel', 'कॉलेज', 'लेक्चर', 'महाविद्यालय'], 'tired', 'sarcastic'],
  ['Waiting', ['waiting', 'late', 'still', 'forever', 'वाट'], 'bored', 'sarcastic'],
]
const CHAOS = ['error', 'errors', 'fire', 'everything', 'disaster', 'destroyed', 'nothing', 'never', 'crashed', 'panic']

// Mood words that flip the *emotion* directly, independent of the domain-category rules
// above. This is what lets a message with no English keyword at all — pure Hindi/Marathi,
// Devanagari or romanized — still come back with a sensible emotion.
const MOOD_LEXICON = {
  // Devanagari
  'अच्छा': 'happy', 'छान': 'happy', 'मस्त': 'happy', 'खुश': 'happy', 'आनंद': 'happy', 'जबरदस्त': 'happy',
  'खराब': 'sad', 'वाईट': 'sad', 'दुखी': 'sad', 'दुःख': 'sad', 'उदास': 'sad',
  'गुस्सा': 'angry', 'राग': 'angry', 'चिड': 'angry',
  'बोरिंग': 'bored', 'कंटाळा': 'bored', 'थकलो': 'tired', 'थक': 'tired',
  // Romanized Hindi / Marathi (Hinglish / Minglish)
  'accha': 'happy', 'achha': 'happy', 'mast': 'happy', 'khush': 'happy', 'badhiya': 'happy', 'changla': 'happy', 'chan': 'happy', 'zabardast': 'happy',
  'kharab': 'sad', 'kharaab': 'sad', 'vait': 'sad', 'dukhi': 'sad', 'udaas': 'sad',
  'gussa': 'angry', 'raag': 'angry', 'chid': 'angry',
  'boring': 'bored', 'kantala': 'bored', 'thakloy': 'tired', 'thak': 'tired', 'thaka': 'tired', 'thak gaya': 'tired',
}
// Devanagari domain words normalized to the English tag/keyword they mean, so search and
// keyword-matching work against the (English-tagged) meme library either way.
const NORMALIZE = {
  'कॉलेज': 'college', 'लेक्चर': 'lecture', 'महाविद्यालय': 'college',
  'परीक्षा': 'exam', 'निकाल': 'result', 'नतीजा': 'result',
  'दोस्त': 'friend', 'दोस्ती': 'friendship', 'मित्र': 'friend',
  'कोड': 'code',
}
// \p{L}+\p{M}+ keeps Devanagari vowel signs/virama attached to their base letter — splitting
// only on \p{L} would chop a word like "अच्छा" apart at the combining marks.
const tokenize = s => (String(s).toLowerCase().match(/[\p{L}\p{M}\p{N}']+/gu) || [])
const expandTokens = words => { const out = new Set(words); for (const w of words) if (NORMALIZE[w]) out.add(NORMALIZE[w]); return out }


const DEVANAGARI_RE = /[\u0900-\u097F]/
const RESPONSE_INTENTS = [
  { intent: 'thanks', type: 'reply', patterns: ['happy birthday', 'hbd', 'birthday wish', 'birthday wishes', 'janamdin', 'जन्मदिन', 'जन्मदिनाच्या', 'वाढदिवस', 'वाढदिवसाच्या', 'वाढदिवसाच्या हार्दिक शुभेच्छा', 'congratulations', 'congrats', 'अभिनंदन', 'शुभेच्छा', 'happy anniversary', 'anniversary wishes', 'all the best', 'good luck', 'get well soon', 'well done', 'good job', 'great job', 'nice pic', 'beautiful', 'handsome', 'proud of you'], tags: ['thank you', 'thanks', 'gratitude', 'appreciation', 'reply'] },
  { intent: 'welcome', type: 'reply', patterns: ['thank you', 'thanks', 'thank u', 'धन्यवाद', 'धन्यावाद', 'आभार'], tags: ['welcome', 'you are welcome', 'no problem', 'reply'] },
  { intent: 'congratulate', type: 'reply', patterns: ['i got the job', 'got the job', 'i got selected', 'got selected', 'i passed', 'passed my exam', 'i won', 'we won'], tags: ['congratulations', 'celebrate', 'proud', 'well done'] },
  { intent: 'support', type: 'reply', patterns: ['i am sick', 'i feel sick', 'feeling sick', 'i am unwell', 'i am sad', 'i am depressed', 'bad day', 'rough day', 'i lost', 'i failed'], tags: ['support', 'comfort', 'care', 'hug'] },
]
export const inferResponseIntent = text => {
  const raw = String(text || '').toLowerCase()
  const hit = RESPONSE_INTENTS.find(x => x.patterns.some(p => raw.includes(p)))
  return hit ? { responseIntent: hit.intent, responseType: hit.type, intentKeywords: hit.tags } : { responseIntent: 'reaction', responseType: 'reaction', intentKeywords: ['reaction'] }
}

const HINDI_WORDS = new Set(['mera','meri','mujhe','aaj','hai','tha','thi','bahut','khup','exam','yaar','bhai','mood','acha','accha','kharab','gaya','gayi'])
const MARATHI_WORDS = new Set(['mala','majha','maza','mi','ahe','aahe','khup','madhe','hota','hoti','kantala','bhook','changla','chhan','marathi'])
export function getGifLanguage(g) {
  if (g?.language) return g.language
  const tags = (g?.tags || []).map(String).map(t => t.toLowerCase())
  if (tags.includes('marathi')) return 'Marathi'
  if (tags.includes('hinglish')) return 'Hinglish'
  if (tags.includes('minglish')) return 'Minglish'
  if (tags.includes('hindi') || tags.includes('bollywood') || tags.includes('desi')) return 'Hindi'
  return 'English'
}

export function detectLanguage(text) {
  const raw = String(text || '').toLowerCase()
  const words = tokenize(raw)
  const hasDevanagari = DEVANAGARI_RE.test(raw)
  const hi = words.filter(w => HINDI_WORDS.has(w)).length
  const mr = words.filter(w => MARATHI_WORDS.has(w)).length
  const hasEnglish = words.some(w => ['the','my','is','was','with','code','exam','college','works','boring','finally','boss'].includes(w))
  if (hasDevanagari) {
    // Shared Devanagari vocabulary is ambiguous; strong Marathi markers take precedence.
    return mr > hi ? 'Marathi' : 'Hindi'
  }
  if (hi && mr) return 'Hinglish'
  if (mr) return hasEnglish ? 'Minglish' : 'Marathi'
  if (hi) return hasEnglish ? 'Hinglish' : 'Hindi'
  return hasEnglish ? 'English' : 'All'
}

export function analyzeFallback(text) {
  const words = tokenize(text)
  const expanded = expandTokens(words)
  let best = ['Funny', [], 'amused', 'funny'], top = 0
  for (const r of RULES) {
    const hits = r[1].filter(k => expanded.has(k)).length
    if (hits > top) { top = hits; best = r }
  }
  const [category, , ruleEmotion, tone] = best
  let emotion = ruleEmotion
  for (const w of words) { if (MOOD_LEXICON[w]) { emotion = MOOD_LEXICON[w]; break } }
  const chaosHits = words.filter(w => CHAOS.includes(w)).length
  const intensity = Math.min(10, 4 + chaosHits * 2 + (text.match(/!/g) || []).length + (/\d{2,}/.test(text) ? 1 : 0))
  const stop = new Set([
    'the', 'and', 'but', 'was', 'said', 'that', 'with', 'for', 'have', 'has', 'now', 'today', 'then', 'again', 'after',
    'aaj', 'mera', 'meri', 'mujhe', 'mai', 'main', 'hai', 'ka', 'ki', 'ke', 'ko', 'se', 'ne', 'hoon', 'tha', 'thi',
    'majha', 'mala', 'mi', 'ahe', 'aahe', 'khup', 'madhe', 'hota',
    'आज', 'मेरा', 'मेरी', 'मुझे', 'है', 'का', 'की', 'के', 'को', 'से', 'माझा', 'मला', 'मी', 'आहे', 'खूप',
  ])
  const keywords = [...new Set([...words, ...[...expanded].filter(w => !words.includes(w))].filter(w => w.length > 1 && !stop.has(w)))].slice(0, 6)
  const intent = inferResponseIntent(text)
  if (intent.responseIntent === 'thanks') {
    const birthday = /happy birthday|hbd|birthday|janamdin|जन्मदिन|वाढदिवस/i.test(String(text))
    return { emotion: 'happy', situation: birthday ? 'birthday wishes' : 'positive wishes', context: birthday ? 'birthday' : 'appreciation', tone: 'warm', intensity: 4, keywords: [...new Set([...(birthday ? ['birthday'] : []), 'thanks', 'thank you', 'appreciation', ...intent.intentKeywords])].slice(0, 8), category: 'Celebration', ...intent }
  }
  if (intent.responseIntent === 'welcome') {
    return { emotion: 'happy', situation: 'thanks received', context: 'gratitude', tone: 'warm', intensity: 3, keywords: ['welcome', 'thanks', 'reply'], category: 'Relationships', ...intent }
  }
  if (intent.responseIntent === 'congratulate') {
    return { emotion: 'happy', situation: 'personal success', context: 'celebration', tone: 'warm', intensity: 5, keywords: ['congratulations', 'celebration', ...intent.intentKeywords], category: 'Success', ...intent }
  }
  if (intent.responseIntent === 'support') {
    return { emotion: 'supportive', situation: 'support needed', context: 'support', tone: 'warm', intensity: 4, keywords: ['support', 'comfort', ...intent.intentKeywords], category: 'Friendship', ...intent }
  }
  return { emotion, situation: keywords.slice(0, 3).join(' '), context: category.toLowerCase(), tone, intensity, keywords, category, ...intent }
}

export function validateAnalysis(a) {
  if (!a || typeof a !== 'object') return null
  const ok = ['emotion', 'situation', 'context', 'tone', 'category'].every(k => typeof a[k] === 'string' && a[k])
  if (!ok || !Array.isArray(a.keywords)) return null
  const intensity = Math.min(10, Math.max(1, Math.round(Number(a.intensity) || 5)))
  return { ...a, intensity, keywords: a.keywords.map(String).slice(0, 8) }
}

const inter = (a, b) => a.filter(x => b.includes(x)).length
const norm = v => String(v || '').toLowerCase().trim()
export function scoreGif(g, a) {
  const tags = (g.tags || []).map(norm)
  const nameTokens = tokenize(g.name || '').map(norm)
  const haystack = [...new Set([...tags, ...nameTokens, norm(g.category), norm(g.emotion), norm(g.tone)])]
  const kws = (a.keywords || []).map(norm)
  const intentWords = (a.intentKeywords || []).map(norm)
  const cat = norm(a.category)
  const ctx = norm(a.context)
  const gifCategory = norm(g.category)
  const gifEmotion = norm(g.emotion)
  const gifTone = norm(g.tone)
  const contextHit = haystack.includes(ctx) || haystack.includes(cat) || kws.some(k => haystack.includes(k))
  const contextScore = contextHit ? (gifCategory === cat || tags.includes(ctx) ? 1 : 0.72) : 0
  const emotionScore = gifEmotion === norm(a.emotion) ? 1 : 0
  const keywordScore = Math.min(1, inter(haystack, kws) / Math.max(1, Math.min(kws.length, 4)))
  const intentScore = intentWords.length ? Math.min(1, inter(haystack, intentWords) / Math.max(1, Math.min(intentWords.length, 3))) : 0
  const toneScore = gifTone === norm(a.tone) ? 1 : 0
  const inten = gifTone === 'chaotic' || gifCategory === 'chaos' ? (a.intensity || 5) / 10 : 1 - Math.abs((a.intensity || 5) - 5) / 10
  const requestedLanguage = a.language || 'All'
  const gifLanguage = getGifLanguage(g)
  const langScore = requestedLanguage === 'All' ? 0.5
    : gifLanguage === requestedLanguage ? 1
    : requestedLanguage === 'Indian' && ['Hindi','Marathi','Hinglish','Minglish','Indian'].includes(gifLanguage) ? 0.75
    : 0
  const replyBonus = a.responseType === 'reply' ? intentScore : 0
  // Topic/context and reply intent intentionally outweigh generic humour/popularity.
  const s = 28 * contextScore + 24 * keywordScore + 18 * intentScore + 10 * emotionScore + 7 * toneScore + 5 * langScore + 4 * inten + 2 * (g.popularityScore / 100) + 2 * (g.trendScore / 100) + 10 * replyBonus
  return Math.round(Math.min(99, s))
}
export const rank = (gifs, a) => gifs.map(g => ({ ...g, match: scoreGif(g, a) })).sort((x, y) => y.match - x.match)

export function explain(g, a) {
  const shared = inter((g.tags || []).map(norm), (a.keywords || []).map(norm))
  const intentShared = inter((g.tags || []).map(norm), (a.intentKeywords || []).map(norm))
  if (a.responseIntent === 'thanks' && intentShared) return 'A thank-you style response that fits the message.'
  if (a.responseIntent === 'welcome' && intentShared) return 'A warm welcome-style reply for the message.'
  if (a.responseIntent === 'congratulate' && intentShared) return 'A celebratory reply that fits the message.'
  if (g.category?.toLowerCase() === a.category.toLowerCase()) return `Matches your ${a.context || a.category.toLowerCase()} moment${shared ? ` and ${shared} of your keywords` : ''}.`
  if (g.emotion === a.emotion.toLowerCase()) return `Captures the ${a.emotion} mood you described.`
  return `A ${g.tone || 'fun'} reaction that fits the context.`
}

export function searchLibrary(gifs, q) {
  const ws = [...expandTokens(tokenize(q))]
  if (!ws.length) return []
  return gifs.map(g => {
    const hay = [g.name, g.category, g.emotion, g.tone, ...(g.tags || [])].join(' ').toLowerCase()
    return { g, n: ws.filter(w => hay.includes(w)).length }
  }).filter(x => x.n).sort((a, b) => b.n - a.n).map(x => ({ ...x.g, match: Math.min(99, 50 + x.n * 20) }))
}

export { tokenize }

export const FILTERS = {
  All: () => true,
  '😂 Funny': g => ['funny', 'sarcastic', 'chaotic'].includes(g.tone),
  '🎬 Reaction': g => (g.tags || []).some(t => ['reaction', 'facepalm', 'shock', 'disbelief'].includes(t)) || g.category === 'Facepalm',
  '🇮🇳 Indian': g => g.category === 'Indian' || (g.tags || []).includes('desi'),
  '🎓 College': g => ['College', 'Exam'].includes(g.category),
  '📝 Exam': g => g.category === 'Exam',
  '💻 Coding': g => g.category === 'Coding',
  '🤝 Friendship': g => g.category === 'Friendship',
  '💀 Chaos': g => g.category === 'Chaos' || g.tone === 'chaotic',
  '🔥 Trending': g => g.trendScore >= 70,
}

export function energy(a) {
  const chaos = a.keywords.filter(k => CHAOS.includes(k.toLowerCase())).length
  const pct = Math.min(100, Math.round(a.intensity * 8 + chaos * 6 + (a.tone === 'sarcastic' || a.tone === 'chaotic' ? 6 : 0)))
  const label = pct < 40 ? '🙂 Mild' : pct < 65 ? '😂 Funny' : pct < 85 ? '🔥 Chaotic' : '💀 TOTAL CHAOS'
  return { pct, label }
}

export function buildSections(list, a = {}) {
  const used = new Set(), take = (arr) => { const g = arr.find(x => x && !used.has(x.id)); if (g) used.add(g.id); return g }
  const best = take(list)
  if (a.responseType === 'reply' && a.responseIntent && a.responseIntent !== 'reaction') {
    const alternatives = take(list.slice(1))
    const third = take(list.slice(2))
    const label = a.responseIntent === 'thanks' ? '🙏 Thank-you reply' : a.responseIntent === 'welcome' ? '🤝 Warm reply' : a.responseIntent === 'congratulate' ? '🎉 Celebration reply' : '💛 Supportive reply'
    return [[ '🏆 Best reply', best ], [label, alternatives], ['✨ Another suitable reply', third]].filter(s => s[1])
  }
  const trending = take([...list.slice(0, 12)].sort((a, b) => b.trendScore - a.trendScore))
  const reaction = take(list.filter(g => g.tone === 'funny' || g.tone === 'sarcastic').concat(list))
  const chaos = take([...list.slice(0, 15)].sort((a, b) => (b.tone === 'chaotic') - (a.tone === 'chaotic') || b.trendScore - a.trendScore))
  return [['🏆 Best match', best], ['🔥 Trending match', trending], ['😂 Reaction GIF', reaction], ['💀 Chaotic pick', chaos]].filter(s => s[1])
}
