import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios.js'

const COMPANIES = [
  { name: 'Amazon',    difficulty: 'HIGH',   color: '#ff9900', topics: 'DSA · Leadership · System Design' },
  { name: 'Microsoft', difficulty: 'HIGH',   color: '#00a1f1', topics: 'OOP · DSA · Problem Solving' },
  { name: 'Google',    difficulty: 'HIGH',   color: '#34a853', topics: 'DSA · System Design · Problem Solving' },
  { name: 'TCS Digital', difficulty: 'MEDIUM', color: '#6c63ff', topics: 'DBMS · OOP · Problem Solving' },
  { name: 'Infosys',   difficulty: 'MEDIUM', color: '#007cc3', topics: 'CS Fundamentals · Communication · DBMS' },
  { name: 'Accenture', difficulty: 'MEDIUM', color: '#a100ff', topics: 'Communication · OOP · Reasoning' },
  { name: 'Capgemini', difficulty: 'MEDIUM', color: '#0070ad', topics: 'Communication · DSA · DBMS' },
  { name: 'Deloitte',  difficulty: 'MEDIUM', color: '#86bc25', topics: 'Communication · Reasoning · CS Fundamentals' },
]

const INTERVIEW_TYPES = [
  { value: 'TECHNICAL',  label: 'Technical',  desc: 'DSA, System Design, Core CS' },
  { value: 'HR',         label: 'HR',          desc: 'Behavioural, Communication' },
  { value: 'BEHAVIORAL', label: 'Behavioural', desc: 'Situational, Leadership' },
  { value: 'CORE_CS',    label: 'Core CS',     desc: 'OS, Networks, DBMS, OOP' },
]

export default function Dashboard() {
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [interviewType, setInterviewType] = useState('TECHNICAL')
  const [resumeFile, setResumeFile] = useState(null)
  const [resumeResult, setResumeResult] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleUpload(e) {
    e.preventDefault()
    if (!resumeFile) return
    setUploading(true); setError('')
    const fd = new FormData()
    fd.append('file', resumeFile)
    try {
      const res = await api.post('/resume/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setResumeResult(res.data)
    } catch (err) { setError(err.response?.data?.error || 'Upload failed') }
    finally { setUploading(false) }
  }

  async function handleStart() {
    if (!selectedCompany) { setError('Select a company first'); return }
    setStarting(true); setError('')
    try {
      const res = await api.post('/interview/start', { companyName: selectedCompany.name, interviewType })
      sessionStorage.setItem('currentQuestion', JSON.stringify(res.data))
      navigate(`/interview/${res.data.sessionId}`)
    } catch (err) { setError(err.response?.data?.error || 'Could not start interview') }
    finally { setStarting(false) }
  }

  return (
      <div>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Mock Interviews</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Choose a company and interview type to begin your session.</p>
        </div>

        {error && (
            <div style={{ background: 'var(--red-dim)', border: '1px solid var(--red)', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 13, color: 'var(--red)' }}>
              {error}
            </div>
        )}

        {/* Resume Upload */}
        <div className="card" style={{ padding: 20, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <p style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>Resume Analysis</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Upload your PDF to auto-detect skills and personalise questions</p>
            </div>
            <form onSubmit={handleUpload} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <label style={{
                background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: 8,
                padding: '8px 14px', fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer'
              }}>
                {resumeFile ? resumeFile.name : 'Choose PDF'}
                <input type="file" accept="application/pdf" style={{ display: 'none' }} onChange={e => setResumeFile(e.target.files[0])} />
              </label>
              {resumeFile && (
                  <button className="btn-ghost" type="submit" disabled={uploading} style={{ padding: '8px 16px', fontSize: 13 }}>
                    {uploading ? 'Analysing...' : 'Upload'}
                  </button>
              )}
            </form>
          </div>
          {resumeResult && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Skills detected from your resume:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {resumeResult.skillsFound.map(s => (
                      <span key={s} style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent)44', borderRadius: 99, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>{s}</span>
                  ))}
                  {resumeResult.skillsFound.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>No known skills detected — try ensuring your PDF has selectable text.</span>}
                </div>
              </div>
          )}
        </div>

        {/* Company Grid */}
        <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Select company</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12, marginBottom: 24 }}>
          {COMPANIES.map(c => (
              <button key={c.name} onClick={() => setSelectedCompany(c)} style={{
                background: selectedCompany?.name === c.name ? 'var(--bg-raised)' : 'var(--bg-surface)',
                border: `1px solid ${selectedCompany?.name === c.name ? c.color + '88' : 'var(--border)'}`,
                borderRadius: 10, padding: '14px 16px', cursor: 'pointer', textAlign: 'left',
                transition: 'border-color 0.15s, background 0.15s', width: '100%'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>{c.name}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                    color: c.difficulty === 'HIGH' ? '#ef4444' : '#f59e0b',
                    background: c.difficulty === 'HIGH' ? '#ef444418' : '#f59e0b18',
                    border: `1px solid ${c.difficulty === 'HIGH' ? '#ef444433' : '#f59e0b33'}`
                  }}>{c.difficulty}</span>
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.topics}</p>
                {selectedCompany?.name === c.name && (
                    <div style={{ marginTop: 8, width: 20, height: 3, borderRadius: 2, background: c.color }} />
                )}
              </button>
          ))}
        </div>

        {/* Interview Type + Start */}
        <div className="card" style={{ padding: 20 }}>
          <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Interview type</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
            {INTERVIEW_TYPES.map(t => (
                <button key={t.value} onClick={() => setInterviewType(t.value)} style={{
                  background: interviewType === t.value ? 'var(--accent-dim)' : 'var(--bg-raised)',
                  border: `1px solid ${interviewType === t.value ? 'var(--accent)88' : 'var(--border)'}`,
                  borderRadius: 8, padding: '10px 16px', cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.15s'
                }}>
                  <p style={{ fontWeight: 600, fontSize: 13, color: interviewType === t.value ? 'var(--accent)' : 'var(--text-primary)', marginBottom: 2 }}>{t.label}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.desc}</p>
                </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn-primary" onClick={handleStart} disabled={starting || !selectedCompany} style={{ padding: '11px 24px', fontSize: 14 }}>
              {starting ? 'Starting...' : `Start ${selectedCompany ? selectedCompany.name : ''} Interview`}
            </button>
            {!selectedCompany && <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Select a company above to continue</p>}
          </div>
        </div>
      </div>
  )
}
