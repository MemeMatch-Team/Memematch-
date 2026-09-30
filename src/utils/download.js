function slug(s) {
  return String(s || 'meme').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-+|-+$)/g, '') || 'meme'
}

function extOf(url) {
  const clean = String(url).split('?')[0].split('#')[0]
  const ext = clean.split('.').pop().toLowerCase()
  return ['gif', 'jpg', 'jpeg', 'png', 'webp'].includes(ext) ? (ext === 'jpeg' ? 'jpg' : ext) : 'gif'
}

function triggerDownload(href, filename) {
  const a = document.createElement('a')
  a.href = href
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
}

// Downloads the ACTUAL image file to the user's device (not just the source link).
// GIPHY's CDN sends permissive CORS headers, so the fetch→blob path works for it;
// if a future source blocks cross-origin reads, we fall back to opening the image
// so the person can still save it, rather than silently failing.
export async function downloadMeme(gif) {
  const url = gif.gifUrl
  const filename = `memematch-${slug(gif.category)}-${slug(gif.name)}.${extOf(url)}`.slice(0, 120)
  try {
    const res = await fetch(url, { mode: 'cors' })
    if (!res.ok) throw new Error('bad response')
    const blob = await res.blob()
    const blobUrl = URL.createObjectURL(blob)
    triggerDownload(blobUrl, filename)
    setTimeout(() => URL.revokeObjectURL(blobUrl), 4000)
    return { ok: true }
  } catch {
    window.open(url, '_blank', 'noopener')
    return { ok: false, reason: 'cors' }
  }
}
