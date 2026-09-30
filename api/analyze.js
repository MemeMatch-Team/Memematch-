// Vercel serverless function. AI only UNDERSTANDS text; it never generates media.
const SYSTEM = `You analyze a user's message so an app can pick an EXISTING reaction GIF/meme.
The message may be in English, Hindi, Marathi, Hinglish, Minglish (Marathi written in Roman letters), Devanagari script, Roman script, a mix of these languages in one sentence, informal slang, or contain emojis. Never rely on the script alone and never ask the user to pick a language — understand the actual meaning, emotion and context regardless of which language(s) or spelling are used.
Reply with ONLY a JSON object, no markdown:
{"emotion":string,"situation":string,"context":string,"tone":string,"intensity":integer 1-10,"keywords":string[3-6],"category":one of ["Exam","Coding","Friendship","Relationships","Success","Failure","Confusion","Anger","Shock","Sadness","Awkward","Waiting","Excitement","Chaos","College","Indian","Funny","Celebration"],"responseIntent":one of ["thanks","welcome","congratulate","support","reaction"],"responseType":one of ["reply","reaction"],"intentKeywords":string[2-5]}
"keywords" must be short English words describing the situation (translate non-English terms) so they can be matched against an English-tagged meme library. If the user is describing an incoming wish such as "Happy Birthday", "Congratulations", "Happy Anniversary", "All the best", or a compliment, set responseIntent to "thanks" and intentKeywords to terms such as "thank you", "thanks", "gratitude", "appreciation", plus the topic. The app is choosing a reply/reaction to the incoming message, so do not choose a generic funny reaction when a natural reply intent is clear.`
export default async function handler(req, res) {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return res.status(503).json({ error: 'missing_key' })
  const text = String(req.body?.text || '').slice(0, 500)
  if (!text.trim()) return res.status(400).json({ error: 'empty' })
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 300, system: SYSTEM, messages: [{ role: 'user', content: text }] })
    })
    if (!r.ok) return res.status(r.status === 429 ? 429 : 502).json({ error: 'upstream' })
    const data = await r.json()
    const raw = (data.content?.[0]?.text || '').replace(/```json|```/g, '').trim()
    res.status(200).json(JSON.parse(raw))
  } catch { res.status(502).json({ error: 'failed' }) }
}
