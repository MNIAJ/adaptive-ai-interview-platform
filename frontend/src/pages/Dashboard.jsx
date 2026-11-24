import { useState, useEffect, useMemo, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios.js'
import CompanyLogo from '../components/CompanyLogo.jsx'

const COMPANIES = [
  { name: 'TCS Ninja',   difficulty: 'LOW',    color: '#6254df', topics: '73 curated practice records', badge: 'Ninja' },
  { name: 'TCS Digital', difficulty: 'MEDIUM', color: '#6254df', topics: '76 curated practice records', badge: 'Digital' },
  { name: 'TCS Prime',   difficulty: 'HIGH',   color: '#6254df', topics: '76 curated practice records', badge: 'Prime' },
  { name: 'HCLTech',     difficulty: 'MEDIUM', color: '#6254df', topics: '76 curated practice records' },
  { name: 'Infosys',     difficulty: 'MEDIUM', color: '#6254df', topics: '76 curated practice records' },
  { name: 'Cognizant',   difficulty: 'MEDIUM', color: '#6254df', topics: '76 curated practice records' },
  { name: 'Connecticus', difficulty: 'MEDIUM', color: '#6254df', topics: '76 curated practice records' },
  { name: 'AlgoQuant',   difficulty: 'HIGH',   color: '#6254df', topics: '81 curated practice records' },
]

const INTERVIEW_TYPES = [
  { value: 'SIMULATION', label: 'Campus simulation', desc: 'Introduction → Projects → Technical → HR' },
  { value: 'TECHNICAL',  label: 'Technical',   desc: 'DSA, System Design, Core CS' },
  { value: 'HR',         label: 'HR',          desc: 'Behavioural, Communication' },
  { value: 'BEHAVIORAL', label: 'Behavioural', desc: 'Situational, Leadership' },
  { value: 'CODING',     label: 'Coding',      desc: 'Algorithms and data structures' },
  { value: 'CORE_CS',    label: 'Core CS',     desc: 'OS, Networks, DBMS, OOP' },
]
const QUESTION_COUNTS = [5, 7, 10, 15, 20]
const TIERS = [['ALL', 'All'], ['LOW', 'Foundation'], ['MEDIUM', 'Intermediate'], ['HIGH', 'Advanced']]
const tierName = d => (d === 'LOW' ? 'Foundation' : d === 'HIGH' ? 'Advanced' : 'Intermediate')
const MINS_PER_QUESTION = 3 // rough estimate shown in the launch summary only

function Ring({ value }) {
  const r = 52, c = 2 * Math.PI * r
  return (
    <svg className="ring" viewBox="0 0 128 128" role="img" aria-label={value == null ? 'No readiness score yet' : `Readiness ${value} out of 100`}>
      <circle cx="64" cy="64" r={r} className="ring-bg" />
      <circle cx="64" cy="64" r={r} className="ring-fg" strokeDasharray={c} strokeDashoffset={c * (1 - (value || 0) / 100)} transform="rotate(-90 64 64)" />
      <text x="64" y="64" className="ring-num">{value ?? '—'}</text>
      <text x="64" y="84" className="ring-sub">/ 100</text>
    </svg>
  )
}

// Last 7 days of practice, built from the history you already fetch.
function weekActivity(history) {
  const day = d => new Date(d).toDateString()
  const counts = {}
  ;(history || []).forEach(s => { if (s.startedAt) counts[day(s.startedAt)] = (counts[day(s.startedAt)] || 0) + 1 })
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return { label: d.toLocaleDateString(undefined, { weekday: 'narrow' }), n: counts[day(d)] || 0 } })
  let streak = 0
  for (let i = 6; i >= 0; i--) { if (days[i].n) streak++; else if (i === 6) continue; else break }
  return { days, streak }
}

export default function Dashboard() {
  const [history, setHistory] = useState(null)
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [interviewType, setInterviewType] = useState('SIMULATION')
  const [totalQuestions, setTotalQuestions] = useState(7)
  const [resumeFile, setResumeFile] = useState(null)
  const [resumeResult, setResumeResult] = useState(null)
  const [resumeLoading, setResumeLoading] = useState(true)
  const [resumeError, setResumeError] = useState('')
  const [resumeRetry, setResumeRetry] = useState(0)
  const [historyError, setHistoryError] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [tier, setTier] = useState('ALL')
  const [dragging, setDragging] = useState(false)
  const searchRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => { api.get('/interview/history').then(r => setHistory(r.data)).catch(() => { setHistoryError(true); setHistory([]) }) }, [])

  useEffect(() => {
    let cancelled = false
    setResumeLoading(true); setResumeError('')
    api.get('/resume/me')
      .then(res => { if (!cancelled && res.status === 200 && res.data) setResumeResult(res.data) })
      .catch(err => { if (!cancelled) setResumeError(err.response?.data?.error || 'Could not retrieve your saved resume. Please retry.') })
      .finally(() => { if (!cancelled) setResumeLoading(false) })
    return () => { cancelled = true }
  }, [resumeRetry])

  // Press "/" anywhere to jump to company search.
  useEffect(() => {
    const onKey = e => { if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); searchRef.current?.focus() } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  async function handleUpload(e) {
    e.preventDefault()
    if (!resumeFile) return
    setUploading(true); setResumeError('')
    const fd = new FormData()
    fd.append('file', resumeFile)
    try {
      const res = await api.post('/resume/upload', fd)
      setResumeResult(res.data); setResumeFile(null)
    } catch (err) { setResumeError(err.response?.data?.error || 'Upload failed') }
    finally { setUploading(false) }
  }

  async function handleStart() {
    if (!selectedCompany) { setError('Select a company first'); return }
    setStarting(true); setError('')
    try {
      const res = await api.post('/interview/start', { companyName: selectedCompany.name, interviewType, totalQuestions })
      sessionStorage.setItem('interviewMode', interviewType)
      sessionStorage.setItem('currentQuestion', JSON.stringify(res.data))
      sessionStorage.setItem(`questionCount:${res.data.sessionId}`, '1')
      navigate(`/interview/${res.data.sessionId}`)
    } catch (err) { setError(err.response?.data?.error || 'Could not start interview') }
    finally { setStarting(false) }
  }

  function onDrop(e) {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f && f.type === 'application/pdf') setResumeFile(f); else setResumeError('Resume must be a PDF')
  }

  const completed = history?.filter(s => s.status === 'COMPLETED') || []
  const scored = completed.filter(s => s.averageScore != null)
  const average = scored.length ? scored.reduce((a, b) => a + Number(b.averageScore), 0) / scored.length : null
  const readiness = average == null ? null : Math.round(average * 10)
  const recent = [...completed].sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt)).slice(0, 3)
  const week = useMemo(() => weekActivity(history), [history])
  const hour = new Date().getHours()
  const mode = INTERVIEW_TYPES.find(t => t.value === interviewType)
  const shown = COMPANIES.filter(c => (tier === 'ALL' || c.difficulty === tier) && c.name.toLowerCase().includes(query.trim().toLowerCase()))

  return (
    <div className="career-grid">
      <section className="career-main">
        <div className="greeting">
          <div>
            <div className="eyebrow">Career dashboard</div>
            <h1>{hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'}</h1>
            <p>{week.streak > 0 ? `${week.streak}-day practice streak. Keep it going.` : 'Build confidence for your next opportunity.'}</p>
          </div>
          <a className="quick-link" href="#companies">Pick a company <span>↗</span></a>
        </div>

        <div className="mode-tabs" id="practice" role="group" aria-label="Interview type">
          {INTERVIEW_TYPES.map(t => (
            <button key={t.value} aria-pressed={interviewType === t.value} className={interviewType === t.value ? 'chosen' : ''} onClick={() => setInterviewType(t.value)}>{t.label}</button>
          ))}
        </div>

        <div className="section-heading"><h2>Recent simulations</h2><Link to="/history">View all history →</Link></div>
        <div className="recent-grid">
          <a href="#companies" className="recent-card new-practice"><span className="plus-mark">+</span><strong>New practice</strong><small>Pick a company and start a mock interview.</small></a>
          {history === null && [0, 1, 2].map(i => <div key={i} className="recent-card skeleton" aria-hidden="true" />)}
          {recent.map(x => {
            const pct = Math.max(0, Math.min(100, Number(x.averageScore || 0) * 10))
            return (
              <Link key={x.sessionId} to={`/report/${x.sessionId}`} className="recent-card">
                <div className="recent-top"><CompanyLogo name={x.company} /><span className="score-pill">{x.averageScore == null ? '—' : Number(x.averageScore).toFixed(1) + '/10'}</span></div>
                <strong>{x.company}</strong>
                <small>{x.interviewType?.replaceAll('_', ' ')} · {x.startedAt ? new Date(x.startedAt).toLocaleDateString() : ''}</small>
                <div className="recent-bottom"><small>● Completed</small><div className="progress-track"><i style={{ width: `${pct}%` }} /></div></div>
              </Link>
            )
          })}
          {historyError && <div role="alert" className="recent-empty">Could not load interview history. Refresh to retry.</div>}
          {history !== null && !historyError && !recent.length && <div className="recent-empty">Completed interviews will appear here, with scores you can compare over time.</div>}
        </div>

        <div className="section-heading" id="companies">
          <h2>Prepare by company</h2>
          <span>{shown.length} of {COMPANIES.length} profiles</span>
        </div>
        <div className="company-tools">
          <label className="search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            <input ref={searchRef} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Escape' && (setQuery(''), e.currentTarget.blur())} placeholder="Search companies" aria-label="Search companies" />
            <kbd>/</kbd>
          </label>
          <div className="count-tabs" role="group" aria-label="Difficulty">
            {TIERS.map(([v, l]) => <button key={v} aria-pressed={tier === v} className={tier === v ? 'chosen' : ''} onClick={() => setTier(v)}>{l}</button>)}
          </div>
        </div>
        <div className="company-grid">
          {shown.map(c => {
            const on = selectedCompany?.name === c.name
            const level = c.difficulty === 'LOW' ? 1 : c.difficulty === 'HIGH' ? 3 : 2
            return (
              <button key={c.name} aria-pressed={on} className={'company-tile ' + (on ? 'selected' : '')} onClick={() => setSelectedCompany(c)}>
                <div className="company-top"><CompanyLogo name={c.name} size={52} /><span className="select-dot">{on ? '✓' : ''}</span></div>
                <strong>{c.name}{c.badge && <em className="tier-badge">{c.badge}</em>}</strong>
                <small>{c.topics}</small>
                <div className="company-foot">
                  <span className="meter" aria-hidden="true">{[1, 2, 3].map(n => <i key={n} className={n <= level ? 'on' : ''} />)}</span>
                  <span>{tierName(c.difficulty)}</span>
                </div>
              </button>
            )
          })}
          {!shown.length && <div className="recent-empty wide">No company matches “{query}”. Clear the search or change the difficulty filter.</div>}
        </div>

        <section className={'setup-panel ' + (selectedCompany ? 'ready' : '')} id="setup">
          <div className="setup-who">
            {selectedCompany ? <CompanyLogo name={selectedCompany.name} size={56} /> : <span className="plus-mark">↑</span>}
            <div>
              <h3>{selectedCompany?.name || 'Choose a company above'}</h3>
              <p>{mode?.desc}</p>
              {selectedCompany && <div className="summary-chips"><span>{mode?.label}</span><span>{totalQuestions} questions</span><span>≈ {totalQuestions * MINS_PER_QUESTION} min</span></div>}
            </div>
          </div>
          <div className="setup-controls">
            <div>
              <label>Questions</label>
              <div className="count-tabs" role="group" aria-label="Number of questions">
                {QUESTION_COUNTS.map(n => <button key={n} aria-pressed={totalQuestions === n} className={totalQuestions === n ? 'chosen' : ''} onClick={() => setTotalQuestions(n)}>{n}</button>)}
              </div>
            </div>
            <button className="btn-primary" disabled={starting || !selectedCompany} onClick={handleStart}>{starting ? 'Starting…' : 'Start interview →'}</button>
          </div>
          {error && <p role="alert" className="error-message">{error}</p>}
        </section>
      </section>

      <aside className="career-right">
        <div className="right-card readiness-card">
          <div className="eyebrow">Average readiness</div>
          <Ring value={readiness} />
          <p>{readiness == null ? 'Complete an interview to see your practice score.' : `Based on ${scored.length} completed mock interview${scored.length === 1 ? '' : 's'}. Average ${average.toFixed(1)} / 10.`}</p>
        </div>

        <div className="right-card week-card">
          <div className="week-head"><div className="eyebrow">This week</div><strong>{history ? week.days.reduce((sum, d) => sum + d.n, 0) : '—'}<small> sessions</small></strong></div>
          <div className="week-strip">{week.days.map((d, i) => <div key={i} className="week-day"><i className={d.n ? 'on' : ''} style={d.n ? { opacity: Math.min(1, 0.45 + d.n * 0.25) } : undefined} title={`${d.n} session${d.n === 1 ? '' : 's'}`} /><span>{d.label}</span></div>)}</div>
        </div>

        <div className="right-card resume-card" id="resume">
          <span className="plus-mark">▤</span>
          <h3>Resume analysis</h3>
          <p>Personalize your interview with your skills.</p>
          {resumeResult && <div className="resume-saved">✓ Resume analysis saved{resumeResult.uploadedAt ? ` · ${new Date(resumeResult.uploadedAt).toLocaleDateString()}` : ''}</div>}
          {resumeError && <div role="alert" className="resume-error">{resumeError}<button type="button" onClick={() => setResumeRetry(n => n + 1)}>Retry loading</button></div>}
          <form onSubmit={handleUpload}>
            <label className={'file-picker drop ' + (dragging ? 'over' : '')} onDragOver={e => { e.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={onDrop}>
              {resumeFile?.name || 'Drop a PDF or browse'}
              <input type="file" accept="application/pdf" onChange={e => setResumeFile(e.target.files[0])} />
            </label>
            <button className="btn-primary" disabled={!resumeFile || uploading}>{uploading ? 'Analysing…' : resumeResult ? 'Replace resume' : 'Upload resume'}</button>
          </form>
          {resumeLoading ? <small>Checking saved resume…</small> : resumeResult ? (
            <div className="skills-list">
              {(resumeResult.skillsFound || []).map(s => <span key={s}>{s}</span>)}
              {!resumeResult.skillsFound?.length && <small>No skills detected.</small>}
              {resumeResult.projectsSummary && <details className="resume-projects"><summary>Extracted project details</summary><p>{resumeResult.projectsSummary}</p></details>}
            </div>
          ) : null}
        </div>

        <div className="right-card encouragement">
          <span>✦</span>
          <h3>Ready to level up?</h3>
          <p>Small steps today, stronger interviews tomorrow.</p>
          <Link to="/history">Track your progress →</Link>
        </div>
      </aside>
    </div>
  )
}
