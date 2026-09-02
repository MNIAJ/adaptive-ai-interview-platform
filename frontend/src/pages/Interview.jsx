import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios.js'

export default function Interview() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [current, setCurrent] = useState(() => JSON.parse(sessionStorage.getItem('currentQuestion')))
  const [answer, setAnswer] = useState('')
  const [lastFeedback, setLastFeedback] = useState(null)
  const [questionCount, setQuestionCount] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const textareaRef = useRef(null)

  useEffect(() => { textareaRef.current?.focus() }, [current])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!answer.trim()) return
    setSubmitting(true)
    try {
      const res = await api.post('/interview/answer', {
        sessionId: Number(sessionId),
        questionId: current.nextQuestionId,
        answerText: answer,
      })
      setLastFeedback({ score: res.data.lastScore, feedback: res.data.lastFeedback, wasFollowUp: res.data.wasFollowUp })
      if (res.data.finished) { navigate(`/report/${sessionId}`); return }
      setCurrent(res.data)
      setAnswer('')
      setQuestionCount(n => n + 1)
    } finally { setSubmitting(false) }
  }

  if (!current) return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <p style={{ color: 'var(--text-muted)' }}>No active session. Go back to the dashboard.</p>
      </div>
  )

  const difficulty = current.currentDifficulty || 3

  return (
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        {/* Session bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Question {questionCount}</span>
            <div style={{ width: 1, height: 12, background: 'var(--border)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            {current.nextQuestionTopic}
          </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginRight: 6 }}>Difficulty</span>
            {[1,2,3,4,5].map(d => (
                <div key={d} style={{
                  width: 20, height: 4, borderRadius: 2,
                  background: d <= difficulty ? 'var(--accent)' : 'var(--bg-subtle)'
                }} />
            ))}
          </div>
        </div>

        {/* Feedback from previous answer */}
        {lastFeedback && (
            <div style={{
              background: lastFeedback.score >= 6 ? 'var(--green-dim)' : 'var(--amber-dim)',
              border: `1px solid ${lastFeedback.score >= 6 ? 'var(--green)44' : 'var(--amber)44'}`,
              borderRadius: 10, padding: '14px 16px', marginBottom: 20
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 99,
              color: lastFeedback.score >= 6 ? 'var(--green)' : 'var(--amber)',
              background: lastFeedback.score >= 6 ? 'var(--green-dim)' : 'var(--amber-dim)',
              border: `1px solid ${lastFeedback.score >= 6 ? 'var(--green)44' : 'var(--amber)44'}`
            }}>{lastFeedback.score}/10</span>
                {lastFeedback.wasFollowUp && (
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>↳ follow-up on same topic</span>
                )}
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{lastFeedback.feedback}</p>
            </div>
        )}

        {/* Question card */}
        <div className="card" style={{ padding: '24px 28px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <span style={{
            background: 'var(--accent-dim)', color: 'var(--accent)',
            border: '1px solid var(--accent)44', borderRadius: 6,
            padding: '3px 10px', fontSize: 11, fontWeight: 600
          }}>{current.nextQuestionTopic}</span>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5 }}>
            {current.nextQuestionText}
          </h2>
        </div>

        {/* Answer */}
        <form onSubmit={handleSubmit}>
        <textarea
            ref={textareaRef}
            className="input"
            style={{ height: 160, resize: 'vertical', borderRadius: 10, padding: '14px 16px', fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}
            placeholder="Type your answer here... Be specific, use examples, mention time/space complexity where relevant."
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            required
        />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn-primary" type="submit" disabled={submitting || !answer.trim()} style={{ padding: '11px 24px' }}>
              {submitting ? 'Evaluating...' : 'Submit Answer'}
            </button>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {answer.split(/\s+/).filter(Boolean).length} words
          </span>
          </div>
        </form>
      </div>
  )
}
