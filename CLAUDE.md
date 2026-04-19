# Battle Dash — Project Intelligence File
> Read this at the start of every session. It is the single source of truth for state, decisions, and pending work.

---

## What This Is

**Battle Dash** — a self-hosted personal productivity tool built for Paul ("The Flame").
- React 18 + Vite, zero backend
- Deployed on Vercel: `https://battle-daash.vercel.app`
- GitHub repo (source): `https://github.com/PorjanyaBordoloi/battle_daash_.git` (branch: `main`)
- GitHub repo (data storage): user's private repo via GitHub REST API
- AI: Groq API (`llama-3.3-70b-versatile`), free tier, key stored in localStorage
- No UI library, no Tailwind — pure CSS custom properties throughout
- Font: Fira Code 300/400/500 from Google Fonts

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + Vite 5 |
| Routing | React Router v6 |
| State | Zustand with `persist` middleware (localStorage) |
| Storage | GitHub REST API (private repo as JSON database) |
| AI | Groq API — `llama-3.3-70b-versatile` via streaming SSE |
| Styling | Pure CSS custom properties, no Tailwind |
| Deploy | Vercel (auto-detects Vite) |

---

## Design System

### Color Tokens (`src/styles/tokens.css`)
```
--bg-base: #080809       ← root background
--bg-s1:   #0d0d0f       ← card/panel base
--bg-s2:   #111114       ← raised surface
--bg-s3:   #161619
--bg-s4:   #1c1c20
--bg-s5:   #222226
--border-dim:    #2a2a2e
--border-mid:    #3a3a3f
--border-bright: #555560
--text-primary:  #f5f5f7
--text-secondary:#b0b0b8
--text-tertiary: #6b6b75
--text-ghost:    #3d3d45
--text-dead:     #252528  ← completed task text
--accent: #f5f5f7
--font: 'Fira Code', monospace
--transition: 100ms linear
--sidebar-w: 48px
--topbar-h: 40px
--right-w: 220px
```

### Key Design Rules
- No gradients. No decorative shadows. No color-coded modules (except Music module which uses subtle tints).
- Active elements: white border or white text only.
- All transitions: 100ms linear.
- Fira Code everywhere — section labels 8–9px uppercase, body 11–12px, timer 24px light.
- Three-pane layout: Sidebar (48px) | Center (flex-1) | Right panel (220px).

---

## File Map

```
src/
├── App.jsx                          ← Router + Shell wrapper
├── main.jsx
├── styles/
│   ├── tokens.css                   ← all CSS custom properties
│   ├── reset.css
│   └── global.css                   ← shared utility classes (.pill, .btn-text, etc.)
├── lib/
│   ├── github.js                    ← GitHub REST API (read/write/createRepo/seedRepo)
│   ├── groq.js                      ← Groq streaming AI (streamGroq, breakDownTask)
│   ├── gemini.js                    ← UNUSED — left in, not wired anywhere
│   ├── dates.js                     ← todayKey, getWeekDays, getPast90Days, etc.
│   └── fuzzy.js                     ← fuzzy search for CommandPalette
├── stores/
│   ├── nanoid.js                    ← local nanoid util
│   ├── useConfigStore.js            ← { pat, owner, repo, groqKey, name, isSetup }
│   ├── useDailyStore.js             ← entries, timeboxes, reviews, moveEntry, moveTimebox
│   ├── useProjectStore.js           ← projects kanban
│   ├── useHabitStore.js             ← habits + checkins
│   ├── useMusicStore.js             ← tracks, sessions, references, guitarLogs
│   └── useUIStore.js                ← commandPalette, syncStatus, activeDate, pomodoro
├── components/
│   ├── layout/
│   │   ├── Shell.jsx                ← checks isSetup, renders SetupWizard or main app
│   │   ├── Topbar.jsx               ← 40px bar: date, ✦ PLAN button, sync indicator
│   │   ├── Sidebar.jsx              ← 48px icon nav with active left-border
│   │   └── ThreePane.jsx            ← Sidebar + Center outlet + Right panel
│   ├── shared/
│   │   ├── SectionHeader.jsx        ← label + full-width dim line
│   │   ├── CommandPalette.jsx       ← Cmd+K fuzzy search overlay
│   │   └── SyncIndicator.jsx        ← ● synced / dim syncing / — offline
│   ├── today/
│   │   ├── TodayView.jsx
│   │   ├── BulletLog.jsx            ← date header + entry list + new entry input
│   │   ├── BulletEntry.jsx          ← checkbox (tasks) or sigil char + text + context menu
│   │   ├── TimeboxGrid.jsx          ← 06:00–23:00 hourly rows
│   │   └── TimeboxBlock.jsx         ← empty (dashed) / filled / edit inline
│   ├── rightpanel/
│   │   ├── RightPanel.jsx           ← stacks all 4 right panel sections
│   │   ├── MiniCalendar.jsx         ← month grid, click to navigate
│   │   ├── HabitsWeek.jsx           ← 7 dot buttons per habit + streak
│   │   ├── PomodoroTimer.jsx        ← live 25:00 countdown, 4 session dots
│   │   └── DailyReview.jsx          ← two autosave textareas
│   ├── week/
│   │   └── WeekView.jsx             ← Google Calendar-style grid, full drag-and-drop
│   ├── projects/
│   │   ├── ProjectsView.jsx
│   │   ├── KanbanColumn.jsx
│   │   └── ProjectCard.jsx
│   ├── habits/
│   │   └── HabitsView.jsx           ← 90-day heatmap + ASCII bar chart
│   ├── music/
│   │   ├── MusicView.jsx            ← 6 sub-tabs (see Music Module section)
│   │   └── MusicRightPanel.jsx      ← pipeline snapshot + week stats + in-progress bars
│   └── setup/
│       └── SetupWizard.jsx          ← 3-step onboarding
```

---

## GitHub Storage Schema

Data lives in the user's private GitHub repo as JSON:

```
data/
  daily/YYYY-MM-DD.json   ← { entries: [], timebox: {}, review: {} }
  projects.json           ← { projects: [] }
  habits.json             ← { habits: [], checkins: {} }
  music.json              ← { tracks: [], sessions: [], references: [], guitarLogs: [] }
  config.json             ← { seeded: true, version: '0.1.0' }
```

**Write flow:** fetch current file SHA → update JSON → base64 encode → PUT to GitHub contents API.
All reads from localStorage (synced on load). Writes go to both simultaneously.

**Key functions in `src/lib/github.js`:**
- `githubRequest(pat, path, method, body)` — base fetch wrapper
- `readFile(pat, owner, repo, path)` → `{ content, sha }`
- `writeFile(pat, owner, repo, path, content, sha)` — base64 encodes + PUTs
- `createRepo(pat, name)` — handles 422 (already exists) gracefully
- `seedRepo(pat, owner, repo)` — reads SHA first, then writes defaults for all 4 data files

---

## Zustand Stores

### `useConfigStore` — `bd-config`
```js
{ pat, owner, repo, groqKey, name, isSetup }
```
- `setConfig(cfg)` — merges cfg into state
- `clearConfig()` — resets to defaults

### `useDailyStore` — `bd-daily`
```js
{ entries: {'YYYY-MM-DD': [entry]}, timeboxes: {'YYYY-MM-DD': {hour: block}}, reviews: {}, shas: {} }
```
Entry shape: `{ id, date, sigil, text, indent, done, migratedTo }`
Timebox shape: `{ id, date, hour, label }`
- `addEntry(date, {sigil, text, indent})`
- `toggleDone(date, id)` — flips done, toggles sigil · ↔ ×
- `updateEntry / deleteEntry / migrateEntry`
- `addTimebox / updateTimebox / deleteTimebox`
- `moveEntry(fromDate, id, toDate)` — moves entry between days
- `moveTimebox(fromDate, fromHour, toDate, toHour)` — moves timebox block

### `useProjectStore` — `bd-projects`
```js
{ projects: [], sha }
```
Project shape: `{ id, title, status: 'backlog'|'in-progress'|'done', tags, milestones, createdAt }`

### `useHabitStore` — `bd-habits`
```js
{ habits: [], checkins: {'YYYY-MM-DD': ['habitId']}, sha }
```

### `useMusicStore` — `bd-music`
```js
{ tracks: [], sessions: [], references: [], guitarLogs: [], sha }
```
Track shape: `{ id, title, key, bpm, timeSignature, daw, collaborator, genre, status, progress, createdAt, updatedAt }`
Status values: `idea | production | mixing | mastering | released`
Session shape: `{ id, date, trackId, trackName, daw, sessionType, bpm, key, duration, notes }`
Reference shape: `{ id, title, artist, notes, vibe, referencePoints, addedAt }`
GuitarLog shape: `{ id, date, technique, duration, difficulty, notes }`

### `useUIStore` — `bd-ui`
```js
{ commandPaletteOpen, syncStatus, activeDate, pomodoroTime, pomodoroRunning, pomodoroSession, contextMenu }
```

---

## Sigil System

| Char | Meaning |
|---|---|
| `·` | open task — renders as checkbox (click to complete) |
| `×` | completed task — strikethrough, text-dead color |
| `>` | migrated — dimmed, shows destination |
| `<` | scheduled — moved to timebox |
| `○` | event |
| `—` | note |
| `!` | priority |
| `*` | starred / inspiration |

Bullet entries: right-click → context menu (migrate to tomorrow / break down via AI / delete).
Keyboard: `n` = new entry, `Enter` = save, `Esc` = cancel, `Tab` = indent.

---

## Music Module (6 Sub-tabs)

**tabs:** `tracks | pipeline | sessions | references | guitar | ai brain`

### Tracks
- Cards with title, key, BPM, DAW, genre pills
- Click status pill → cycles through pipeline stages
- Expand → progress slider + delete

### Pipeline (Kanban)
- 5 columns: Idea → Production → Mixing → Mastering → Released
- HTML5 drag-and-drop between columns
- Each column tinted with its stage color
- Stage colors: idea=#7755aa, production=#4488cc, mixing=#44aa66, mastering=#cc8844, released=#aaaacc

### Sessions
- Log: track (dropdown or free text), DAW, session type, BPM, key, duration, notes
- **FIX PENDING:** LOG SESSION button uses `onClick` directly (not form submit) — the `form onSubmit` approach was broken; this fix was in-progress at end of last session. Verify it works after applying.
- Sessions render as rows with colored left border by session type

### References
- Title, artist, 6 vibe tags (dark/chill/hype/melancholic/euphoric/raw), reference points, notes
- Cards colored by vibe tag

### Guitar
- Log: technique focus, duration, difficulty (1–5 dot selector), notes
- Weekly dot-grid (7 days) + running day streak counter

### AI Brain
- **✦ PLAN MY WEEK** → reads active projects + recent sessions → Groq streams a Mon–Fri plan
- **◈ LEARNING SUGGESTIONS** → reads pipeline stage distribution → Groq suggests techniques/resources
- **Chat input** → free-form music Q&A through Groq
- All output streams token-by-token into a terminal-style output box

---

## Week View (Calendar)

Google Calendar-style grid:
- Sticky day header row (7 columns Mon–Sun)
- All-day row: shows unscheduled bullet entries, drag-droppable between days
- Hourly rows (00:00–23:00): each cell shows timebox block if one exists
- Drag an entry → drops into time slot → auto-creates timebox block at that hour
- Drag a timebox block → moves to new day/hour
- Entry chips colored by sigil type (blue=task, orange=priority, purple=event, green=done, etc.)
- Timebox blocks: green tint (`#0f1a14` bg, `#1e4030` border, `#50b080` text)
- Today column has slightly raised bg

---

## Setup Wizard

3-step full-screen onboarding:

**Step 1 — GitHub**
- PAT (classic token needs `repo` scope; fine-grained needs Repository read+write)
- Username (exact, case-sensitive — e.g. `PorjanyaBordoloi` not `Porjanya_Bordoloi`)
- Repo name
- "Repo already exists — skip creation" checkbox (use this if PAT can't create repos or repo already exists)
- On submit: calls `createRepo` (handles 422 gracefully) → `seedRepo` (fetches SHA first to avoid conflicts)

**Step 2 — Groq API Key**
- Placeholder: `gsk_...`
- Skippable

**Step 3 — Name**
- Default: "The Flame"

---

## Known Issues / Pending Work

1. **Sessions LOG SESSION button** — was broken (form onSubmit not firing). Fix applied in last message but not yet committed/pushed. The fix changes `<form onSubmit={handleAdd}>` + `type="submit"` button to a plain `<div>` with `onClick={handleAdd}` on the button directly. Verify this is committed.

2. **✦ PLAN button in topbar** — button exists in `Topbar.jsx` with no handler attached. Needs wiring to Groq to fill today's timebox from open tasks.

3. **Daily review "what migrates?"** — textarea exists in `DailyReview.jsx` but no AI suggestion button. Spec called for Groq-powered suggestions based on open task age.

4. **GitHub sync** — `github.js` has `readFile` and `writeFile` but the stores don't auto-sync on load or write-through on change. The sync indicator in the topbar shows status but sync isn't fully wired. This is the next big infrastructure piece.

5. **`gemini.js`** — still exists in `src/lib/` but is completely unused. Safe to delete.

6. **CommandPalette** — wired to `Cmd+K` and has fuzzy search UI, but needs to verify it's reading from all stores (entries, projects, tracks).

---

## Commit History

```
ac555e6  Music Producer module: session logger, pipeline kanban, references, guitar tracker, AI brain
ae88499  Week view: Google Calendar-style drag-and-drop grid with colored event blocks
5aa968f  Replace Gemini with Groq (llama-3.3-70b-versatile), add checkbox tick to bullet entries
7f01383  Fix setup: handle 422 (repo exists), fetch SHA before seed writes, trim username
f02b2f2  Fix setup wizard: add 'repo already exists' toggle, PAT scope hint, better error message
f8d17bf  Battle Dash — initial release
```

---

## Session Boot Checklist (for next session)

1. Read this file fully
2. Check pending issues above — start with #1 (verify Sessions fix is committed and working)
3. Run `npm run build` to confirm clean build before touching anything
4. Run `npm run dev` and test the Sessions tab LOG SESSION button end-to-end
5. If working, next priority: wire the `✦ PLAN` topbar button (#2)

---

## Dev Commands

```bash
cd "/Users/porjanyabordoloi/Downloads/Personal/Battle Dash"
npm run dev        # dev server → localhost:5173
npm run build      # production build → dist/
git push origin clean-main:main --force   # push to GitHub (branch is clean-main locally, main on remote)
```

> Note: local branch is `clean-main`, remote is `main`. Always push with `git push origin clean-main:main`.
