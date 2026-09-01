'use client'

// Resizes + re-encodes an image file in the browser before upload, so slow
// connections don't have to transmit full-resolution phone photos (often
// 8-10MB) as base64. Falls back to the original file's data URL if the
// browser can't decode/compress it (e.g. an unsupported format).
export function compressImageFile(file: File, maxDimension = 1600, quality = 0.8): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onerror = () => resolve('')
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => resolve(reader.result as string) // fall back to original
      img.onload = () => {
        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')
        if (!ctx) { resolve(reader.result as string); return }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}

export async function compressImageFiles(files: File[], maxDimension = 1600, quality = 0.8): Promise<string[]> {
  const results = await Promise.all(files.map(f => compressImageFile(f, maxDimension, quality)))
  return results.filter(Boolean)
}
