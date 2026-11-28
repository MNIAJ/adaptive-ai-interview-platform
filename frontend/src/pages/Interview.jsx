import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios.js'
import PracticalRound from '../components/PracticalRound.jsx'
import VoiceInterviewer from '../components/VoiceInterviewer.jsx'

export default function Interview() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [current, setCurrent] = useState(() => (() => { const q = JSON.parse(sessionStorage.getItem('currentQuestion')); return q?.sessionId === Number(sessionId) ? q : null })())
  const [error, setError] = useState('')
  const [answer, setAnswer] = useState('')
  const [meta,setMeta]=useState(null)
  const [seconds,setSeconds]=useState(0)
  const busy=useRef(false)
  const answerRef=useRef('')
  answerRef.current=answer
  function updateAnswer(value){answerRef.current=value.slice(0,4000);setAnswer(answerRef.current);if(draftKey)sessionStorage.setItem(draftKey,answerRef.current)}
  const draftKey=current ? `draft:${sessionId}:${current.nextQuestionId}` : null
  useEffect(()=>{ let alive=true; api.get(`/interview/session/${sessionId}`).then(({data})=>{if(!alive)return; if(data.status==='COMPLETED'){navigate(`/report/${sessionId}`);return} setMeta(data);setCurrent(data.question||null);setQuestionCount(data.questionNumber);sessionStorage.setItem('interviewMode',data.mode)}).catch(e=>{if(alive)setError(e.response?.data?.error||'Unable to restore interview')});return()=>{alive=false}},[sessionId,navigate])
  useEffect(()=>{if(draftKey)setAnswer(sessionStorage.getItem(draftKey)||'')},[draftKey])
  useEffect(()=>{if(!meta)return;const tick=()=>setSeconds(Math.max(0,Math.floor((Date.now()-new Date(meta.startedAt).getTime())/1000)));tick();const id=setInterval(tick,1000);return()=>clearInterval(id)},[meta])
  const [lastFeedback, setLastFeedback] = useState(null)
  const [questionCount, setQuestionCount] = useState(() => Number(sessionStorage.getItem(`questionCount:${sessionId}`)) || 1)
  const [submitting, setSubmitting] = useState(false)
  const textareaRef = useRef(null)

  useEffect(() => { textareaRef.current?.focus() }, [current])

  async function handleSubmit(e, skip=false, practicalAnswer=null) {
    e.preventDefault()
    if (busy.current || !meta || (!skip && !(practicalAnswer?.code || answer).trim())) return
    busy.current=true
    setSubmitting(true); setError('')
    try {
      const res = await api.post('/interview/answer', {
        sessionId: Number(sessionId),
        questionId: current.nextQuestionId,
        answerText: skip ? "[SKIPPED]" : practicalAnswer?.code ?? answer,
        languageId: practicalAnswer?.languageId,
      })
      sessionStorage.removeItem(draftKey)
      setLastFeedback({ score: res.data.lastScore, feedback: res.data.lastFeedback, wasFollowUp: res.data.wasFollowUp })
      if (res.data.finished) { sessionStorage.removeItem(`questionCount:${sessionId}`); sessionStorage.removeItem("currentQuestion"); navigate(`/report/${sessionId}`); return }
      setCurrent(res.data)
      sessionStorage.setItem('currentQuestion', JSON.stringify(res.data))
      setAnswer('')
      setQuestionCount(n => n + 1)
      sessionStorage.setItem(`questionCount:${sessionId}`, String(questionCount + 1))
    } catch (err) { setError(err.response?.data?.error || 'Evaluation failed. Try again.') } finally { busy.current=false; setSubmitting(false) }
  }

  async function endInterview(){if(busy.current||!window.confirm("End this interview and view your results?"))return;busy.current=true;setSubmitting(true);try{await api.post(`/interview/end/${sessionId}`);if(draftKey)sessionStorage.removeItem(draftKey);sessionStorage.removeItem("currentQuestion");navigate(`/report/${sessionId}`)}catch(e){setError(e.response?.data?.error||"Could not end interview")}finally{busy.current=false;setSubmitting(false)}}
  if (!current || !meta) return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <p style={{ color: 'var(--text-muted)' }}>{error || "Restoring interview…"}</p>
      </div>
  )

  const difficulty = current.currentDifficulty || 3

  return (
      <div className="premium-interview" style={{ maxWidth: 1240, margin: '0 auto' }}>
        {/* Session bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Question {questionCount}/{meta.maxQuestions} · {current.stage || "Practice"}</span>
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

        <div className="card" style={{padding:16,marginBottom:20,display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap'}}><span>Elapsed: {Math.floor(seconds/60)}:{String(seconds%60).padStart(2,'0')}</span><button className="btn-ghost" disabled={submitting} onClick={endInterview}>End interview</button></div>
        <progress style={{width:'100%',marginBottom:16}} value={questionCount-1} max={meta.maxQuestions}/>
        {/* Feedback from previous answer */}
        {lastFeedback && sessionStorage.getItem("interviewMode") !== "SIMULATION" && (
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

        {error && <p role="alert">{error}</p>}
        <p style={{fontSize:12, marginBottom:8}}>{current.stage} · {current.origin === 'PUBLIC_REPORT_INSPIRED' ? 'Public report inspired' : 'Original practice'} {current.sourceUrl && <a href={current.sourceUrl} target="_blank" rel="noreferrer">Source</a>}</p>
        {current.stage?.startsWith("PRACTICAL_") ? <PracticalRound key={current.nextQuestionId} current={current} sessionId={sessionId} disabled={submitting} onSubmit={(e,code,languageId)=>handleSubmit(e,false,{code,languageId})} onSkip={e=>handleSubmit(e,true)}/> : <div className="interview-workspace"><VoiceInterviewer questionId={current.nextQuestionId} question={current.nextQuestionText} number={questionCount} total={meta.maxQuestions} company={sessionStorage.getItem(`company:${sessionId}`)} disabled={submitting} onTranscript={text=>updateAnswer((answerRef.current+' '+text).trim())}/>
        <div className="interview-answer">
        {/* Question card */}
        <div className="card" style={{ padding: '24px 28px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <span style={{
            background: 'var(--accent-dim)', color: 'var(--accent)',
            border: '1px solid var(--border)', borderRadius: 6,
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
            onChange={e => updateAnswer(e.target.value)}
            maxLength={4000}
            disabled={submitting}
            required
        />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn-primary" type="submit" disabled={submitting || !answer.trim()} style={{ padding: '11px 24px' }}>
              {submitting ? 'Evaluating...' : 'Submit Answer'}
            </button>
            <button type="button" className="btn-ghost" disabled={submitting} onClick={e=>handleSubmit(e,true)}>Skip question</button>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {answer.split(/\s+/).filter(Boolean).length} words
          </span>
          </div>
        </form></div></div>}
      </div>
  )
}
