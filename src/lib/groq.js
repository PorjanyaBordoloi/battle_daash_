const ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

export async function* streamGroq(apiKey, prompt) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    }),
  })

  if (!res.ok) throw new Error(`Groq API → ${res.status}`)

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop()
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6).trim()
      if (data === '[DONE]') return
      try {
        const json = JSON.parse(data)
        const text = json.choices?.[0]?.delta?.content
        if (text) yield text
      } catch {}
    }
  }
}

export async function breakDownTask(apiKey, taskText) {
  const prompt = `Break down this task into 3-5 concrete subtasks. Return only a JSON array of strings, nothing else.
Task: "${taskText}"`
  let result = ''
  for await (const chunk of streamGroq(apiKey, prompt)) {
    result += chunk
  }
  try {
    const match = result.match(/\[[\s\S]*\]/)
    if (match) return JSON.parse(match[0])
  } catch {}
  return []
}
