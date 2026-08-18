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

  if (error) return <p className="p-8 text-red-600">{error}</p>
  if (!report) return <p className="p-8">Loading report...</p>

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm">
        <h1 className="text-2xl font-semibold mb-1">{report.company} — Interview Report</h1>
        <p className="text-slate-500 mb-6">{report.questionsAsked} questions answered</p>

        <div className="flex gap-8 mb-6">
          <div>
            <p className="text-3xl font-semibold">{report.averageScore}/10</p>
            <p className="text-sm text-slate-500">Average score</p>
          </div>
          <div>
            <p className="text-3xl font-semibold">{report.readinessPercent}%</p>
            <p className="text-sm text-slate-500">Company readiness</p>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="font-medium text-green-700 mb-1">Strong topics</h2>
          <p className="text-sm text-slate-600">{report.strongTopics.join(', ') || 'None yet'}</p>
        </div>
        <div className="mb-6">
          <h2 className="font-medium text-amber-700 mb-1">Weak topics</h2>
          <p className="text-sm text-slate-600">{report.weakTopics.join(', ') || 'None yet'}</p>
        </div>

        <Link to="/" className="text-blue-600 text-sm">Back to dashboard</Link>
      </div>
    </div>
  )
}
