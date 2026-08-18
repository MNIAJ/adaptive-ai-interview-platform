import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios.js'

// Hardcoded here for the MVP — a real Phase-4 version would fetch this
// from GET /api/companies once that endpoint exists.
const COMPANIES = ['Amazon', 'TCS Digital']
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
      // Stash the first question so the Interview page doesn't need a second call
      sessionStorage.setItem('currentQuestion', JSON.stringify(res.data))
      navigate(`/interview/${res.data.sessionId}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Could not start interview')
    }
  }

  function logout() {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <button onClick={logout} className="text-sm text-slate-500">Log out</button>
        </div>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="font-medium mb-3">1. Upload your resume (optional)</h2>
          <form onSubmit={handleUploadResume} className="flex gap-3">
            <input type="file" accept="application/pdf"
              onChange={(e) => setResumeFile(e.target.files[0])} />
            <button className="bg-slate-900 text-white rounded px-4 py-2 text-sm" type="submit">Upload</button>
          </form>
          {resumeResult && (
            <p className="text-sm text-slate-600 mt-3">
              Skills detected: {resumeResult.skillsFound.join(', ') || 'none found'}
            </p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="font-medium mb-3">2. Start a mock interview</h2>
          <div className="flex gap-3 mb-4">
            <select className="border rounded px-3 py-2" value={company} onChange={(e) => setCompany(e.target.value)}>
              {COMPANIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="border rounded px-3 py-2" value={type} onChange={(e) => setType(e.target.value)}>
              {INTERVIEW_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <button onClick={handleStartInterview} className="bg-blue-600 text-white rounded px-4 py-2">
            Start Interview
          </button>
        </div>
      </div>
    </div>
  )
}
