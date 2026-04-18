import { useState } from 'react'
import useConfigStore from '../../stores/useConfigStore'
import { createRepo, seedRepo } from '../../lib/github'

const inputStyle = {
  width: '100%', padding: '8px 10px', fontSize: 11,
  background: '#0d0d0f', border: '1px solid #2a2a2e',
  borderRadius: 3, color: '#f5f5f7', marginBottom: 10,
  fontFamily: "'Fira Code', monospace",
  outline: 'none',
}

const labelStyle = {
  display: 'block', fontSize: 8, letterSpacing: '0.1em',
  color: '#6b6b75', marginBottom: 4, textTransform: 'uppercase',
}

const btnStyle = {
  padding: '8px 20px', fontSize: 9, letterSpacing: '0.12em',
  textTransform: 'uppercase', border: '1px solid #3a3a3f',
  borderRadius: 3, color: '#f5f5f7', cursor: 'pointer',
  fontFamily: "'Fira Code', monospace", background: 'none',
  transition: '100ms linear',
}

export default function SetupWizard() {
  const setConfig = useConfigStore((s) => s.setConfig)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [pat, setPat] = useState('')
  const [owner, setOwner] = useState('')
  const [repo, setRepo] = useState('battle-dash-data')
  const [geminiKey, setGeminiKey] = useState('')
  const [name, setName] = useState('The Flame')

  const handleStep1 = async (e) => {
    e.preventDefault()
    if (!pat.trim() || !owner.trim() || !repo.trim()) {
      setError('All fields required')
      return
    }
    setError('')
    setLoading(true)
    try {
      await createRepo(pat, repo)
      await new Promise((r) => setTimeout(r, 1200)) // wait for GitHub to init
      await seedRepo(pat, owner, repo)
      setStep(2)
    } catch (err) {
      // Try seeding anyway (repo might already exist)
      try {
        await seedRepo(pat, owner, repo)
        setStep(2)
      } catch (err2) {
        setError(`GitHub error: ${err.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleStep2 = (skip = false) => {
    if (!skip && !geminiKey.trim()) {
      setError('Enter a key or click Skip')
      return
    }
    setError('')
    setStep(3)
  }

  const handleFinish = (e) => {
    e.preventDefault()
    setConfig({ pat, owner, repo, geminiKey, name: name.trim() || 'The Flame', isSetup: true })
  }

  const stepDots = [1, 2, 3].map((s) => (
    <span key={s} style={{
      width: 6, height: 6, borderRadius: '50%', display: 'inline-block',
      background: s <= step ? '#f5f5f7' : '#2a2a2e',
      margin: '0 3px',
    }} />
  ))

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#080809',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Fira Code', monospace",
    }}>
      <div style={{ width: 400, maxWidth: '90vw' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 18, fontWeight: 300, letterSpacing: '0.2em', color: '#f5f5f7' }}>
            BATTLE DASH
          </div>
          <div style={{ fontSize: 9, color: '#3d3d45', letterSpacing: '0.12em', marginTop: 4 }}>
            SETUP
          </div>
        </div>

        {/* Step dots */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          {stepDots}
        </div>

        {/* Step 1: GitHub */}
        {step === 1 && (
          <form onSubmit={handleStep1}>
            <div style={{ fontSize: 9, letterSpacing: '0.1em', color: '#6b6b75', marginBottom: 16, textTransform: 'uppercase' }}>
              Step 1 — GitHub Storage
            </div>
            <label style={labelStyle}>GitHub Personal Access Token</label>
            <input
              type="password"
              value={pat}
              onChange={(e) => setPat(e.target.value)}
              placeholder="ghp_..."
              style={inputStyle}
              autoFocus
            />
            <label style={labelStyle}>GitHub Username</label>
            <input
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="your-username"
              style={inputStyle}
            />
            <label style={labelStyle}>Repo Name</label>
            <input
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              placeholder="battle-dash-data"
              style={inputStyle}
            />
            {error && <div style={{ fontSize: 9, color: '#ff6b6b', marginBottom: 10 }}>{error}</div>}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setStep(2)}
                style={{ ...btnStyle, color: '#6b6b75', borderColor: '#2a2a2e', fontSize: 9 }}
              >
                SKIP FOR NOW
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{ ...btnStyle, opacity: loading ? 0.5 : 1 }}
              >
                {loading ? 'CREATING...' : 'CREATE REPO →'}
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Gemini */}
        {step === 2 && (
          <div>
            <div style={{ fontSize: 9, letterSpacing: '0.1em', color: '#6b6b75', marginBottom: 16, textTransform: 'uppercase' }}>
              Step 2 — Gemini AI (optional)
            </div>
            <label style={labelStyle}>Gemini API Key</label>
            <input
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="AIza..."
              style={inputStyle}
              autoFocus
            />
            <div style={{ fontSize: 9, color: '#3d3d45', marginBottom: 16, lineHeight: 1.6 }}>
              Used for AI task breakdown. Get a free key at ai.google.dev
            </div>
            {error && <div style={{ fontSize: 9, color: '#ff6b6b', marginBottom: 10 }}>{error}</div>}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => handleStep2(true)} style={{ ...btnStyle, color: '#6b6b75', borderColor: '#2a2a2e', fontSize: 9 }}>
                SKIP
              </button>
              <button onClick={() => handleStep2(false)} style={btnStyle}>
                NEXT →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Name */}
        {step === 3 && (
          <form onSubmit={handleFinish}>
            <div style={{ fontSize: 9, letterSpacing: '0.1em', color: '#6b6b75', marginBottom: 16, textTransform: 'uppercase' }}>
              Step 3 — Almost there
            </div>
            <label style={labelStyle}>What should Battle Dash call you?</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="The Flame"
              style={inputStyle}
              autoFocus
            />
            {error && <div style={{ fontSize: 9, color: '#ff6b6b', marginBottom: 10 }}>{error}</div>}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" style={btnStyle}>
                LAUNCH BATTLE DASH ✦
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
