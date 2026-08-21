import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/axios.js'

export default function Report() {
  const { sessionId } = useParams()
  const [report, setReport] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/interview/report/${sessionId}`)
      .then((res) => setReport(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Could not load report'))
  }, [sessionId])

  if (error) return <p className="text-red-600">{error}</p>
  if (!report) return <p className="text-slate-500">Loading report...</p>

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      <p className="text-xs text-indigo-600 font-medium uppercase tracking-wide mb-1">Interview Report</p>
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">{report.company}</h1>
      <p className="text-slate-500 mb-6">{report.questionsAsked} questions answered</p>

      <div className="flex gap-10 mb-8">
        <div>
          <p className="text-3xl font-semibold text-slate-900">{report.averageScore}<span className="text-lg text-slate-400">/10</span></p>
          <p className="text-sm text-slate-500">Average score</p>
        </div>
        <div>
          <p className="text-3xl font-semibold text-indigo-600">{report.readinessPercent}%</p>
          <p className="text-sm text-slate-500">Company readiness</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h2 className="font-medium text-green-800 text-sm mb-1">Strong topics</h2>
          <p className="text-sm text-green-900">{report.strongTopics.join(', ') || 'None yet'}</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h2 className="font-medium text-amber-800 text-sm mb-1">Weak topics</h2>
          <p className="text-sm text-amber-900">{report.weakTopics.join(', ') || 'None yet'}</p>
        </div>
      </div>

      <Link to="/" className="text-indigo-600 text-sm font-medium">← Back to dashboard</Link>
    </div>
  )
}
