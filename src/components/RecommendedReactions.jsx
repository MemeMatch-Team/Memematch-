export default function RecommendedReactions({ analysis, language, onEmoji, onMeme }) {
  const text = `${analysis?.emotion || ''} ${analysis?.tone || ''} ${(analysis?.keywords || []).join(' ')}`.toLowerCase()
  const replyIntent = analysis?.responseIntent
  const emojis = replyIntent === 'thanks' ? ['🙏','❤️','😊','🫶']
    : replyIntent === 'welcome' ? ['😊','🤝','🙌','❤️']
    : replyIntent === 'congratulate' ? ['🎉','👏','🙌','🔥']
    : replyIntent === 'support' ? ['🫂','❤️','🙏','🥲']
    : /sad|cry|fail|frustrat|exam|bore/.test(text) ? ['😂','😭','💀','🤦']
    : /happy|success|win|excited|celebr/.test(text) ? ['🔥','🎉','👏','🙌']
    : /angry|rage/.test(text) ? ['😡','🤦','💀','👎']
    : /shock|surpris|confus/.test(text) ? ['😱','😮','👀','💀']
    : ['😂','😭','💀','🤔']

  return (
    <section className="recommended-reactions glass">
      <div className="section-heading">
        <div><h2>Recommended reactions</h2><p>Quick reactions matched to this message.</p></div>
        <span className="language-pill">{language}</span>
      </div>
      <div className="recommended-emoji">
        <span>Emoji</span>
        {emojis.map(e => <button key={e} type="button" onClick={() => onEmoji(e)} aria-label={`React with ${e}`}>{e}</button>)}
      </div>
      <p className="recommended-note">{replyIntent === 'thanks' ? 'These are warm options for a thank-you reply to the message.' : replyIntent === 'welcome' ? 'These fit a friendly welcome-style reply.' : replyIntent === 'congratulate' ? 'These fit a celebratory reply.' : replyIntent === 'support' ? 'These fit a supportive reply to the message.' : `These reactions match the message's ${analysis?.tone || 'overall'} tone.`}</p>
      <div className="recommended-meme-hint">
        <span>Meme reactions</span>
        <button type="button" onClick={onMeme}>🎞️ Open meme picker</button>
      </div>
    </section>
  )
}
