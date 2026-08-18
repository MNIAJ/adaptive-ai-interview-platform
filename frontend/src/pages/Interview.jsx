import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios.js'

// This page IS the adaptive loop from a UI perspective: it always renders
// whatever question the backend just decided is next — it has no idea
// whether that's a follow-up or a new base question. All the branching
// intelligence lives in AdaptiveInterviewEngine on the backend, which is
// exactly the separation of concerns you want.
export default function Interview() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [current, setCurrent] = useState(() => JSON.parse(sessionStorage.getItem('currentQuestion')))
  const [answer, setAnswer] = useState('')
  const [lastFeedback, setLastFeedback] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await api.post('/interview/answer', {
        sessionId: Number(sessionId),
        questionId: current.nextQuestionId,
        answerText: answer,
      })

      setLastFeedback({ score: res.data.lastScore, feedback: res.data.lastFeedback, wasFollowUp: res.data.wasFollowUp })

      if (res.data.finished) {
        navigate(`/report/${sessionId}`)
        return
      }

      setCurrent(res.data)
      setAnswer('')
    } finally {
      setSubmitting(false)
    }
  }

  if (!current) return <p className="p-8">No active question — go back to the dashboard and start an interview.</p>

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto">
        {lastFeedback && (
          <div className={`p-4 rounded-lg mb-6 ${lastFeedback.score >= 6 ? 'bg-green-50' : 'bg-amber-50'}`}>
            <p className="text-sm font-medium">Previous answer score: {lastFeedback.score}/10</p>
            <p className="text-sm text-slate-600">{lastFeedback.feedback}</p>
            {lastFeedback.wasFollowUp && <p className="text-xs text-slate-500 mt-1">(this was a follow-up on the same topic)</p>}
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">{current.nextQuestionTopic}</p>
          <h2 className="text-lg font-medium mb-4">{current.nextQuestionText}</h2>
          <form onSubmit={handleSubmit}>
            <textarea className="w-full border rounded px-3 py-2 mb-4 h-32"
              placeholder="Type your answer..." value={answer}
              onChange={(e) => setAnswer(e.target.value)} required />
            <button className="bg-blue-600 text-white rounded px-4 py-2" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Answer'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
