export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
}

export type HeadingItem = { level: number; text: string; id: string }

export function extractHeadings(markdown: string, maxLevel: number = 3): HeadingItem[] {
  const regex = /^(#{1,3})\s+(.+)$/gm
  const items: HeadingItem[] = []
  let match: RegExpExecArray | null
  while ((match = regex.exec(markdown)) !== null) {
    const level = match[1].length
    if (level <= maxLevel) {
      const text = match[2].trim()
      items.push({ level, text, id: slugify(text) })
    }
  }
  return items
}


