import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios.js'

// Hardcoded here for the MVP — a real Phase-4 version would fetch this
// from GET /api/companies once that endpoint exists. Kept in sync with
// DataSeeder.java's seeded companies.
const COMPANIES = ['Amazon', 'Microsoft', 'Google', 'TCS Digital', 'Infosys', 'Accenture', 'Capgemini', 'Deloitte']
const INTERVIEW_TYPES = ['TECHNICAL', 'HR', 'BEHAVIORAL', 'CORE_CS', 'CODING']

export default function Dashboard() {
  const [company, setCompany] = useState(COMPANIES[0])
  const [type, setType] = useState(INTERVIEW_TYPES[0])
  const [resumeFile, setResumeFile] = useState(null)
  const [resumeResult, setResumeResult] = useState(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleUploadResume(e) {
    e.preventDefault()
    if (!resumeFile) return
    const formData = new FormData()
    formData.append('file', resumeFile)
    try {
      const res = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResumeResult(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Resume upload failed')
    }
  }

  async function handleStartInterview() {
    setError('')
    try {
      const res = await api.post('/interview/start', { companyName: company, interviewType: type })
      sessionStorage.setItem('currentQuestion', JSON.stringify(res.data))
      navigate(`/interview/${res.data.sessionId}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Could not start interview')
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">Welcome back</h1>
        <p className="text-slate-500 mt-1">Upload your resume, then start a mock interview tailored to a company.</p>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center justify-center">1</span>
          <h2 className="font-medium text-slate-800">Upload your resume</h2>
          <span className="text-xs text-slate-400">(optional)</span>
        </div>
        <form onSubmit={handleUploadResume} className="flex gap-3">
          <input className="text-sm" type="file" accept="application/pdf"
            onChange={(e) => setResumeFile(e.target.files[0])} />
          <button className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-4 py-2 text-sm font-medium" type="submit">
            Upload
          </button>
        </form>
        {resumeResult && (
          <div className="mt-4 bg-slate-50 rounded-lg p-3">
            <p className="text-sm text-slate-600">
              <span className="font-medium text-slate-800">Skills detected: </span>
              {resumeResult.skillsFound.join(', ') || 'none found'}
            </p>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center justify-center">2</span>
          <h2 className="font-medium text-slate-800">Start a mock interview</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Company</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={company} onChange={(e) => setCompany(e.target.value)}>
              {COMPANIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Interview type</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={type} onChange={(e) => setType(e.target.value)}>
              {INTERVIEW_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <button onClick={handleStartInterview} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-5 py-2.5 font-medium">
          Start Interview →
        </button>
      </div>
    </div>
  )
}
