// Each category's `match` runs against the local library (real GIPHY-sourced entries,
// see src/data/fallbackGifs.json). `keywords` seed the live GIPHY search for that page
// (see services/gifService.fetchLive) so pages stay populated even as the library grows.
export const CATEGORIES = [
  {
    slug: 'funny', label: 'Funny', emoji: '😂',
    description: 'Pure chaos and comic timing — the reactions that make everyone laugh.',
    match: g => ['funny', 'sarcastic', 'chaotic'].includes(g.tone),
    keywords: ['funny', 'comedy', 'lol'],
  },
  {
    slug: 'happy', label: 'Happy', emoji: '😄',
    description: 'Good mood only — wins, celebrations and happy vibes.',
    match: g => ['happy', 'excited', 'amused'].includes(g.emotion) || ['Success', 'Celebration'].includes(g.category),
    keywords: ['happy', 'celebration', 'win'],
  },
  {
    slug: 'sad', label: 'Sad', emoji: '😢',
    description: 'For the low days — heartbreak, disappointment and dramatic sadness.',
    match: g => g.emotion === 'sad' || g.category === 'Sadness',
    keywords: ['sad', 'crying'],
  },
  {
    slug: 'angry', label: 'Angry', emoji: '😡',
    description: 'Rage, fury and pure frustration — for when you have had enough.',
    match: g => g.emotion === 'angry' || g.category === 'Anger',
    keywords: ['angry', 'rage', 'furious'],
  },
  {
    slug: 'relatable', label: 'Relatable', emoji: '🫠',
    description: 'The everyday chaos everyone secretly relates to.',
    match: g => ['College', 'Waiting', 'Awkward', 'Confusion', 'Facepalm', 'Disbelief'].includes(g.category) || (g.tags || []).includes('reaction'),
    keywords: ['relatable', 'mood', 'reaction'],
  },
  {
    slug: 'college', label: 'College Life', emoji: '🎓',
    description: 'Lectures, assignments, hostel life and everything in between.',
    match: g => ['College', 'Exam'].includes(g.category),
    keywords: ['college', 'student', 'lecture'],
  },
  {
    slug: 'coding', label: 'Coding', emoji: '💻',
    description: 'Bugs, debugging, deploys and the developer rollercoaster.',
    match: g => g.category === 'Coding',
    keywords: ['code', 'bug', 'programming'],
  },
  {
    slug: 'love', label: 'Love', emoji: '❤️',
    description: 'Relationship drama, crushes and everything in between.',
    match: g => g.category === 'Relationships',
    keywords: ['love', 'relationship', 'crush'],
  },
  {
    slug: 'motivation', label: 'Motivation', emoji: '🚀',
    description: 'The push you need — success, wins and comeback energy.',
    match: g => ['Success', 'Celebration'].includes(g.category) || g.emotion === 'excited',
    keywords: ['motivation', 'success', 'win'],
  },
  {
    slug: 'work', label: 'Work & Office', emoji: '💼',
    description: 'Meetings, deadlines and 9-to-5 chaos.',
    match: g => (g.tags || []).some(t => ['work', 'office', 'job', 'deadline', 'meeting'].includes(t)),
    keywords: ['work', 'office', 'deadline'],
  },
  {
    slug: 'exams', label: 'Exams', emoji: '📝',
    description: 'Exam stress, results day and last-minute panic.',
    match: g => g.category === 'Exam',
    keywords: ['exam', 'marks', 'result'],
  },
  {
    slug: 'friendship', label: 'Friendship', emoji: '🤝',
    description: 'Besties, ghosting friends and everything friendship brings.',
    match: g => g.category === 'Friendship',
    keywords: ['friend', 'bestie'],
  },
  {
    slug: 'indian', label: 'Indian Memes', emoji: '🇮🇳',
    description: "Bollywood, desi humour and India's favourite reactions.",
    match: g => g.category === 'Indian',
    keywords: ['bollywood', 'desi', 'indian'],
  },
]

export const getCategory = slug => CATEGORIES.find(c => c.slug === slug)
