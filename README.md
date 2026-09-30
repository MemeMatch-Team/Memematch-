# MemeMatch AI — The Meme Decision Engine

MemeMatch AI is an existing React + Vite meme/reaction app: describe what happened, let the existing analysis + ranking pipeline understand it, then choose a matching GIF or reaction.

## What's new
- Soft, neutral messaging-inspired visual system with a reusable subtle doodle wallpaper.
- Mobile-first message composer instead of a traditional dashboard form.
- Message reaction flow with emoji and GIPHY/local meme reactions.
- Compact emoji picker with Common, Funny, Love, Sad, Angry and Shocked groups.
- Smart recommended reactions based on the existing analysis result.
- Language selector for All, English, Hindi, Marathi, Hinglish, Minglish and Indian.
- Language-aware ranking using detected language plus existing context/emotion/keyword/tone/popularity/trend signals.
- 500+ library seeding pipeline using only real GIPHY records, deduplicated by GIPHY ID.
- Existing save, search, trending, categories, preview, sharing, download, AI analysis and fallback behavior preserved.

## Supported languages
English · Hindi · Marathi · Hinglish · Minglish · Hindi/Marathi in Devanagari · Roman Hindi · Roman Marathi · mixed-language messages.

Language detection is deliberately lightweight and deterministic on the client. When Anthropic analysis is available, it still provides the semantic analysis; the detected language is added locally so it can influence ranking and filtering.

## Reaction system
1. A user submits a message.
2. Existing AI/fallback analysis determines emotion, situation, context, tone, intensity and keywords.
3. The app detects the input language/mix.
4. Existing GIPHY + local-library matching produces results.
5. The message appears in a messaging-style bubble.
6. `React` opens Emoji or Meme reaction modes.
7. Emoji reactions can be selected, changed and removed.
8. Meme reactions use the existing GIPHY proxy and local fallback library.
9. Recommended emoji reactions are derived from the existing analysis instead of a separate AI claim.

Reaction state is currently local to the page; persistent multi-user chat storage is not introduced because that would require a backend/user-account architecture that the existing project does not have.

## Architecture
```text
Browser (React)
  ├── /api/analyze ──> Anthropic text analysis (server-side key)
  ├── /api/gifs ─────> GIPHY search (server-side key)
  └── local fallback library
       ↓
src/services/matchingService.js
       ↓
ranked memes + language filtering + reaction recommendations
```

The implementation keeps React + Vite. It does not add Tailwind, Next.js, TypeScript, Firebase or Supabase.

## GIF library
Records use the existing shape and add optional `language`:
```js
{
  id, name, gifUrl, previewUrl, category, emotion, tone,
  language, tags, popularityScore, trendScore, source, pageUrl
}
```

The checked-in fallback file currently contains the records that were already supplied with the project. It is **not** falsely padded to 500.

To generate a larger real library:
```bash
GIPHY_API_KEY=your_key npm run seed
```

The seed script:
- searches a broad set of English, Indian, Hindi, Marathi, Hinglish and Minglish queries;
- paginates each query;
- deduplicates by real GIPHY ID;
- stores real GIPHY URLs only;
- adds language metadata where the query identifies a language;
- stops at 550 unique records or when the configured search space is exhausted;
- prints `Meme library generated: N unique GIFs`.

A result below 500 means GIPHY did not provide enough unique records for the configured search space/API access. The script does not fabricate records to reach the target.

## API keys
Keep keys server-side:
- `ANTHROPIC_API_KEY`
- `GIPHY_API_KEY`

Do not add `VITE_ANTHROPIC_API_KEY` or `VITE_GIPHY_API_KEY`.

## Development
```bash
npm install
npm run dev
```

For local Vercel serverless functions:
```bash
npx vercel dev
```

## Validation
```bash
npm run build
```

Manual checks should include:
- English, Hindi, Marathi, Hinglish, Minglish and mixed-language messages.
- Emoji-heavy, empty and keyword-light messages.
- React → emoji → change → remove.
- React → meme → search → select.
- Language filtering.
- AI/GIPHY unavailable fallback.
- Mobile widths around 360, 390, 412, 768, 1024 and 1440px.

MemeMatch never generates media. It understands text and selects/ranks existing GIFs.

### Context-aware reply matching
The recommendation engine distinguishes between a general reaction and a reply intent. Incoming messages such as birthday wishes, congratulations, anniversary wishes, compliments, and other positive greetings can be classified as `thanks`/reply intent. In those cases the live GIPHY query and ranking prioritize thank-you/appreciation/reply media instead of generic funny reactions. The local fallback remains available when GIPHY is unavailable.

## ⚡ Mid-Hack Chaos Bounty (HCC · DKTE)
Open the **⚡ CHAOS** button (bottom-left) to toggle / demo everything:
1. 🤦‍♂️ Sharma Ji Ka Beta guilt alert — move the mouse out of the top of the window, switch tabs, or try to close the tab
2. 🤖 Robotic Voice Roast — speaks a roast when results load or on empty input
3. 🥪 DKTE Canteen Mode — intensity → vada pavs, meme energy → cups of chai, saved count → 🥪
4. 🚨 Professor Approaching — press **Esc** (or the invisible bottom-right corner) for a fake VS Code
5. ⏳ Sarcastic loading screen — "Consulting your ex…"
6. 🏃 Fleeing Send button — short dodges only (max ~90px), gives up after 7 dodges; clicking it says "You wasted N seconds finding the button" (Ctrl+Enter also submits)
🤪 **Mayhem Emoji Mode** — reactions become mutating, wobbling mashups + full-screen emoji rain; GIF reactions spin and colour-shift.
