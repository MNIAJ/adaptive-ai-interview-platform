import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/axios.js'

export default function Report() {
    const { sessionId } = useParams()
    const [report, setReport] = useState(null)
    const [error, setError] = useState('')

    useEffect(() => {
        api.get(`/interview/report/${sessionId}`)
            .then(res => setReport(res.data))
            .catch(err => setError(err.response?.data?.error || 'Could not load report'))
    }, [sessionId])

    if (error) return <div style={{ padding: 40, color: 'var(--red)', fontSize: 14 }}>{error}</div>
    if (!report) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
            <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading report...</div>
        </div>
    )

    const readiness = report.readinessPercent
    const scoreColor = readiness >= 70 ? 'var(--green)' : readiness >= 50 ? 'var(--amber)' : 'var(--red)'

    return (
        <div className="v6-report" style={{ maxWidth: 1100, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: 28 }}>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Interview Complete</p>
                <h1 style={{ fontSize: 26, fontWeight: 700 }}>{report.company}</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>{report.questionsAsked} questions answered</p>
            </div>

            <div style={{display:'flex',gap:12,alignItems:'center',marginBottom:16}}><button className="btn-ghost" onClick={()=>{document.querySelectorAll(".v6-report details").forEach(d=>d.open=true);window.print()}}>Print / Save PDF</button><span>{Math.floor((report.durationSeconds||0)/60)} min elapsed</span></div>

            {/* Score cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <div className="card" style={{ padding: 20 }}>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Average Score</p>
                    <p style={{ fontSize: 36, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{report.averageScore}<span style={{ fontSize: 16, color: 'var(--text-muted)', fontWeight: 400 }}>/10</span></p>
                </div>
                <div className="card" style={{ padding: 20 }}>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Practice performance</p>
                    <p style={{ fontSize: 36, fontWeight: 700, color: scoreColor, lineHeight: 1 }}>{readiness}<span style={{ fontSize: 16, fontWeight: 400 }}>%</span></p>
                    <div style={{ marginTop: 10, height: 4, borderRadius: 2, background: 'var(--bg-raised)' }}>
                        <div style={{ width: `${readiness}%`, height: '100%', borderRadius: 2, background: scoreColor, transition: 'width 0.6s ease' }} />
                    </div>
                </div>
            </div>

            <TopicRadar scores={report.topicScores || {}} />
            <p style={{fontSize:12,marginBottom:12}}>Practice score, not a hiring probability. Based on the questions answered in this session.</p>
            <div className="card" style={{padding:20,marginBottom:20}}><h3>Interview stage scores</h3>{Object.entries(report.stageScores || {}).map(([stage,score]) => <p key={stage}>{stage}: {score.toFixed(1)}/10</p>)}</div>
            {/* Topics (unchanged — still the plain per-topic score buckets) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <div className="card" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)' }} />
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Strong topics</p>
                    </div>
                    {report.strongTopics.length > 0
                        ? report.strongTopics.map(t => (
                            <div key={t} style={{ padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 13, color: 'var(--text-secondary)' }}>{t}</div>
                        ))
                        : <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>None yet</p>}
                </div>
                <div className="card" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--amber)' }} />
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Needs work</p>
                    </div>
                    {report.weakTopics.length > 0
                        ? report.weakTopics.map(t => (
                            <div key={t} style={{ padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 13, color: 'var(--text-secondary)' }}>{t}</div>
                        ))
                        : <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>None — great session!</p>}
                </div>
            </div>

            {/* NEW: Key strengths / weaknesses — actual observations from the
                transcript (via ReportInsightService), not just topic names. */}
            {(report.keyStrengths?.length > 0 || report.keyWeaknesses?.length > 0) && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                    <div className="card" style={{ padding: 20 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>Key strengths</p>
                        {report.keyStrengths?.length > 0
                            ? <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                                {report.keyStrengths.map((s, i) => <li key={i}>{s}</li>)}
                              </ul>
                            : <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>None yet</p>}
                    </div>
                    <div className="card" style={{ padding: 20 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>Key weaknesses</p>
                        {report.keyWeaknesses?.length > 0
                            ? <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                                {report.keyWeaknesses.map((s, i) => <li key={i}>{s}</li>)}
                              </ul>
                            : <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>None — great session!</p>}
                    </div>
                </div>
            )}

            <section className="card v6-study" style={{padding:20,marginBottom:20}}><h2>Personalised 7-day preparation plan</h2><p>Based on the lowest-scoring answers in this session. Suggested commitment: 45–60 minutes per day.</p>{Array.from({length:7},(_,i)=>{const ranked=[...(report.answers||[])].sort((a,b)=>a.score-b.score);const a=ranked.length?ranked[i%Math.min(ranked.length,5)]:null;return <article key={i}><h3>Day {i+1} — {i===6?'Timed reassessment':i===5?'Mixed revision':a&&a.score<6?'Priority improvement':'Consolidate skills'}</h3>{i<5&&a?<><p><strong>Focus:</strong> {a.question}</p><p><strong>Previous score:</strong> {a.score}/10. {a.feedback}</p><p><strong>Study:</strong> {a.rubric||'Review the concept and compare against a reliable reference.'}</p><p><strong>Practice:</strong> Rewrite your answer without notes, explain your reasoning, then test with a new example. Target: 8/10.</p></>:<p>{i===6?'Complete another interview in the same mode and compare topic scores.':'Review the five priority questions and practise explaining each in two minutes.'}</p>}</article>})}</section>
            {/* NEW: Study plan */}
            {report.studyPlan?.length > 0 && (
                <div className="card" style={{ padding: 20, marginBottom: 20 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>Study plan</p>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                        {report.studyPlan.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                </div>
            )}

            {/* Recommendation — now real backend-generated text (report.recommendation),
                not a hardcoded template keyed off the readiness bucket. */}
            <div className="card" style={{ padding: 20, marginBottom: 24, background: 'var(--accent-soft)', borderColor: 'var(--border)'  }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', marginBottom: 6 }}>Recommendation</p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    {report.recommendation}
                </p>
            </div>

            <section className="card" style={{padding:20,marginBottom:20}}><h3>Question-by-question review</h3>{(report.answers||[]).map((a,i)=><details open key={i} style={{padding:'12px 0',borderBottom:'1px solid var(--border)'}}><summary style={{cursor:'pointer'}}>{i+1}. {a.question} — {a.score}/10</summary><p style={{whiteSpace:'pre-wrap',marginTop:12}}><strong>Your answer:</strong> {a.answer}</p><p><strong>Feedback:</strong> {a.feedback}</p><p><strong>Expected criteria:</strong> {a.rubric||'Not recorded'}</p></details>)}</section>
            <div style={{ display: 'flex', gap: 12 }}>
                <Link to="/new-interview" className="btn-primary" style={{ textDecoration: 'none', padding: '11px 24px' }}>Practice again</Link>
            </div>
        </div>
    )
}

function TopicRadar({scores}) {
 const entries=Object.entries(scores).filter(([,v])=>Number.isFinite(v));
 const n=entries.length, point=(i,r)=>[160+100*r*Math.sin(i*2*Math.PI/n),150-100*r*Math.cos(i*2*Math.PI/n)];
 return <section className="card" style={{padding:24,marginBottom:20}}><h2 style={{fontSize:20,fontWeight:700}}>Student capabilities</h2><p style={{color:'var(--text-muted)'}}>Only assessed topics are shown.</p><div className="radar-grid">{n>=3?<svg viewBox="0 0 320 300" role="img" aria-label="Radar chart of assessed topic scores">{[.2,.4,.6,.8,1].map(r=><polygon key={r} points={entries.map((_,i)=>point(i,r).join(',')).join(' ')} fill="none" stroke="#d9dbe7"/>)}{entries.map(([t],i)=><g key={t}><line x1="160" y1="150" x2={point(i,1)[0]} y2={point(i,1)[1]} stroke="#d9dbe7"/><text x={point(i,1.25)[0]} y={point(i,1.25)[1]} fontSize="9" textAnchor="middle" fill="#566176">{t}</text></g>)}<polygon points={entries.map(([,v],i)=>point(i,v/10).join(',')).join(' ')} fill="#6254df33" stroke="#6254df" strokeWidth="2"/></svg>:<p>At least three assessed topics are needed for a radar chart.</p>}<div>{entries.map(([t,v])=><div key={t} style={{marginBottom:12}}><div style={{display:'flex',justifyContent:'space-between'}}><strong>{t}</strong><span>{v.toFixed(1)}/10</span></div><div className="topic-bar"><i style={{width:`${v*10}%`}}/></div></div>)}</div></div></section>
}
