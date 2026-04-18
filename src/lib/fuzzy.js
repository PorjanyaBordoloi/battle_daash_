export function fuzzySearch(items, query, getField) {
  if (!query.trim()) return items
  const q = query.toLowerCase()
  return items.filter(item => getField(item).toLowerCase().includes(q))
}

export function fuzzyScore(str, query) {
  const s = str.toLowerCase()
  const q = query.toLowerCase()
  if (s.includes(q)) return 2
  let score = 0
  let qi = 0
  for (let i = 0; i < s.length && qi < q.length; i++) {
    if (s[i] === q[qi]) { score++; qi++ }
  }
  return qi === q.length ? score : 0
}
