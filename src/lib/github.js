const BASE = 'https://api.github.com'

export async function githubRequest(pat, path, method = 'GET', body = null) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${pat}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : null,
  })
  if (!res.ok) throw new Error(`GitHub ${method} ${path} → ${res.status}`)
  if (res.status === 204) return null
  return res.json()
}

export async function readFile(pat, owner, repo, path) {
  try {
    const data = await githubRequest(pat, `/repos/${owner}/${repo}/contents/${path}`)
    return {
      content: JSON.parse(atob(data.content)),
      sha: data.sha,
    }
  } catch {
    return { content: null, sha: null }
  }
}

export async function writeFile(pat, owner, repo, path, content, sha) {
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2))))
  return githubRequest(pat, `/repos/${owner}/${repo}/contents/${path}`, 'PUT', {
    message: `update ${path}`,
    content: encoded,
    ...(sha ? { sha } : {}),
  })
}

export async function createRepo(pat, name) {
  const res = await fetch(`${BASE}/user/repos`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${pat}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, private: true, auto_init: true }),
  })
  // 422 = repo already exists — treat as success
  if (res.status === 422 || res.status === 201 || res.ok) return
  throw new Error(`GitHub POST /user/repos → ${res.status}`)
}

export async function seedRepo(pat, owner, repo) {
  const files = {
    'data/projects.json': { projects: [] },
    'data/habits.json': { habits: [], checkins: {} },
    'data/music.json': { tracks: [], sessions: [] },
    'data/config.json': { seeded: true, version: '0.1.0' },
  }
  for (const [path, content] of Object.entries(files)) {
    // Read existing SHA so we don't get a 422 conflict on existing files
    const { sha } = await readFile(pat, owner, repo, path)
    await writeFile(pat, owner, repo, path, content, sha)
  }
}
