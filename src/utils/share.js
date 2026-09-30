// Tries to share the actual image FILE via the Web Share API (navigator.canShare with files),
// which is what most mobile browsers need to let the user post the real meme rather than a link.
// Falls back to sharing a link, then to the caller offering WhatsApp/copy as manual options.
export async function shareMeme(gif) {
  const link = gif.pageUrl || gif.gifUrl
  const text = `${gif.name} — found with MemeMatch AI`

  try {
    const res = await fetch(gif.gifUrl, { mode: 'cors' })
    if (res.ok) {
      const blob = await res.blob()
      const type = blob.type || 'image/gif'
      const file = new File([blob], `memematch-${(gif.category || 'meme').toLowerCase()}.${type.split('/')[1] || 'gif'}`, { type })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: gif.name, text })
        return { ok: true, method: 'file' }
      }
    }
  } catch (e) {
    if (e?.name === 'AbortError') return { ok: false, method: 'cancelled' }
    // CORS/network failure — fall through to link share
  }

  if (navigator.share) {
    try {
      await navigator.share({ title: gif.name, text, url: link })
      return { ok: true, method: 'link' }
    } catch (e) {
      if (e?.name === 'AbortError') return { ok: false, method: 'cancelled' }
    }
  }

  return { ok: false, method: 'none' }
}

export function whatsappShareUrl(gif) {
  const link = gif.pageUrl || gif.gifUrl
  return `https://wa.me/?text=${encodeURIComponent(`${gif.name} 😂 ${link}`)}`
}

export async function copyLink(gif) {
  const link = gif.pageUrl || gif.gifUrl
  try {
    await navigator.clipboard.writeText(link)
    return true
  } catch {
    return false
  }
}
