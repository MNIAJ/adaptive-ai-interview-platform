import {useState,useEffect,useRef} from 'react'
import {useNavigate,Link,useSearchParams} from 'react-router-dom'
import api from '../api/axios.js'
import CompanyLogo from '../components/CompanyLogo.jsx'
import './workspace.css'
export const COMPANIES = [
  { name: 'TCS Ninja',   difficulty: 'LOW',    color: '#6254df', topics: 'Company-specific practice', badge: 'Ninja' },
  { name: 'TCS Digital', difficulty: 'MEDIUM', color: '#6254df', topics: 'Company-specific practice', badge: 'Digital' },
  { name: 'TCS Prime',   difficulty: 'HIGH',   color: '#6254df', topics: 'Company-specific practice', badge: 'Prime' },
  { name: 'HCLTech',     difficulty: 'MEDIUM', color: '#6254df', topics: 'Company-specific practice' },
  { name: 'Infosys',     difficulty: 'MEDIUM', color: '#6254df', topics: 'Company-specific practice' },
  { name: 'Cognizant',   difficulty: 'MEDIUM', color: '#6254df', topics: 'Company-specific practice' },
  { name: 'Connecticus', difficulty: 'MEDIUM', color: '#6254df', topics: 'Company-specific practice' },
  { name: 'Centiro', difficulty: 'MEDIUM', color: '#6254df', topics: 'SQL · Coding · AI literacy' },
  { name: 'AlgoQuant',   difficulty: 'HIGH',   color: '#6254df', topics: 'Company-specific practice' },
]

const INTERVIEW_TYPES = [
 {value:'TECHNICAL',label:'Technical interview',desc:'Core CS · DSA · SQL · React practicals'},
 {value:'HR',label:'HR & Behavioural',desc:'Communication · teamwork · situational judgement'},
 {value:'SIMULATION',label:'Campus placement simulation',desc:'Full interview · resume, technical, HR and practical rounds'},
]
const QUESTION_COUNTS = [5, 10, 15, 20]
const TIERS = [['ALL', 'All'], ['LOW', 'Foundation'], ['MEDIUM', 'Intermediate'], ['HIGH', 'Advanced']]
const tierName = d => (d === 'LOW' ? 'Foundation' : d === 'HIGH' ? 'Advanced' : 'Intermediate')
const MINS_PER_QUESTION = 3 // rough estimate shown in the launch summary only

export default function Dashboard(){
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [interviewType, setInterviewType] = useState('SIMULATION')
  const [totalQuestions, setTotalQuestions] = useState(10)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [tier, setTier] = useState('ALL')
  const searchRef = useRef(null)
  const navigate = useNavigate()
  const [params]=useSearchParams()
  useEffect(()=>{const c=COMPANIES.find(c=>c.name===params.get('company'));if(c)setSelectedCompany(c)},[params])
  // Press "/" anywhere to jump to company search.
  useEffect(() => {
    const onKey = e => { if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); searchRef.current?.focus() } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  async function handleStart() {
    if (!selectedCompany) { setError('Select a company first'); return }
    setStarting(true); setError('')
    try {
      const res = await api.post('/interview/start', { companyName: selectedCompany.name, interviewType, totalQuestions: interviewType === "SIMULATION" ? 15 : totalQuestions })
      sessionStorage.setItem('interviewMode', interviewType)
      sessionStorage.setItem(`company:${res.data.sessionId}`, selectedCompany.name)
      sessionStorage.setItem('currentQuestion', JSON.stringify(res.data))
      sessionStorage.setItem(`questionCount:${res.data.sessionId}`, '1')
      navigate(`/interview/${res.data.sessionId}`)
    } catch (err) { setError(err.response?.data?.error || 'Could not start interview') }
    finally { setStarting(false) }
  }

  const mode = INTERVIEW_TYPES.find(t => t.value === interviewType)
  const shown = COMPANIES.filter(c => (tier === 'ALL' || c.difficulty === tier) && c.name.toLowerCase().includes(query.trim().toLowerCase()))

return <div className="premium-dashboard career-grid v64-setup"><section className="career-main"><div className="v64-heading"><span>INTERVIEW STUDIO</span><h1>Configure your interview</h1><p>Choose a format and target company. Your AI interviewer will guide you through the session.</p></div>        <div className="section-heading" id="practice"><h2>01 / Choose interview format</h2></div>
        <div className="v6-modes" role="group" aria-label="Interview type">
          {INTERVIEW_TYPES.map((t,i) => <button key={t.value} aria-pressed={interviewType === t.value} className={interviewType === t.value ? 'chosen' : ''} onClick={() => setInterviewType(t.value)}><span className="mode-symbol" aria-hidden="true">{['⌘','◎','✦'][i]}</span><strong>{t.label}</strong><small>{t.desc}</small><span className="mode-choice">{interviewType===t.value?'Selected ✓':'Select format →'}</span></button>)}
        </div>
        <div className="section-heading" id="companies">
          <h2>02 / Choose target company</h2>
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
              {selectedCompany && <div className="summary-chips"><span>{mode?.label}</span><span>{interviewType === "SIMULATION" ? "Full structured interview" : `${totalQuestions} questions`}</span></div>}
            </div>
          </div>
          <div className="setup-controls">
            {interviewType !== "SIMULATION" && <div>
              <label>Questions</label>
              <div className="count-tabs" role="group" aria-label="Number of questions">
                {QUESTION_COUNTS.map(n => <button key={n} aria-pressed={totalQuestions === n} className={totalQuestions === n ? 'chosen' : ''} onClick={() => setTotalQuestions(n)}>{n}</button>)}
              </div>
            </div>}
            <button className="btn-primary" disabled={starting || !selectedCompany} onClick={handleStart}>{starting ? 'Starting…' : 'Start interview →'}</button>
          </div>
          {error && <p role="alert" className="error-message">{error}</p>}
        </section>
</section></div>}
