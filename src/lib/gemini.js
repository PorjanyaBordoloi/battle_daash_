const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent'

export async function* streamGemini(apiKey, prompt) {
  const res = await fetch(`${ENDPOINT}?key=${apiKey}&alt=sse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  })
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
      if (line.startsWith('data: ')) {
        try {
          const json = JSON.parse(line.slice(6))
          const text = json.candidates?.[0]?.content?.parts?.[0]?.text
          if (text) yield text
        } catch {}
      }
    }
  }
}

export async function breakDownTask(apiKey, taskText) {
  const prompt = `Break down this task into 3-5 concrete subtasks. Return only a JSON array of strings, nothing else.
Task: "${taskText}"`
  let result = ''
  for await (const chunk of streamGemini(apiKey, prompt)) {
    result += chunk
  }
  try {
    const match = result.match(/\[[\s\S]*\]/)
    if (match) return JSON.parse(match[0])
  } catch {}
  return []
}
