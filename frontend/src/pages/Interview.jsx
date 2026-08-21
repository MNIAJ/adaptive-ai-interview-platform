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
  const [questionsAnswered, setQuestionsAnswered] = useState(0)
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
      setQuestionsAnswered((n) => n + 1)

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

  if (!current) return <p>No active question — go back to the dashboard and start an interview.</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-slate-500">Question {questionsAnswered + 1}</p>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((d) => (
            <div key={d} className={`w-6 h-1.5 rounded-full ${d <= (current.currentDifficulty || 3) ? 'bg-indigo-600' : 'bg-slate-200'}`} />
          ))}
        </div>
      </div>

      {lastFeedback && (
        <div className={`p-4 rounded-xl mb-6 border ${lastFeedback.score >= 6 ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
          <p className="text-sm font-medium text-slate-800">Previous answer score: {lastFeedback.score}/10</p>
          <p className="text-sm text-slate-600 mt-0.5">{lastFeedback.feedback}</p>
          {lastFeedback.wasFollowUp && <p className="text-xs text-slate-500 mt-1.5">↳ this was a follow-up on the same topic</p>}
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <p className="text-xs text-indigo-600 font-medium mb-2 uppercase tracking-wide">{current.nextQuestionTopic}</p>
        <h2 className="text-lg font-medium text-slate-900 mb-5">{current.nextQuestionText}</h2>
        <form onSubmit={handleSubmit}>
          <textarea className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-4 h-32 text-sm"
            placeholder="Type your answer..." value={answer}
            onChange={(e) => setAnswer(e.target.value)} required />
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-5 py-2.5 font-medium disabled:opacity-50" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Answer'}
          </button>
        </form>
      </div>
    </div>
  )
}
