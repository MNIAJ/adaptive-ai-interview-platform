import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios.js'

function formatDate(iso) {
    if (!iso) return '-'
    return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

const STATUS_STYLE = {
    COMPLETED:   { label: 'Completed',   color: 'var(--green)' },
    IN_PROGRESS: { label: 'In progress', color: 'var(--amber)' },
    ABANDONED:   { label: 'Abandoned',   color: 'var(--text-muted)' },
}

export default function History() {
    const [sessions, setSessions] = useState(null)
    const [error, setError] = useState('')

    useEffect(() => {
        api.get('/interview/history')
            .then(res => setSessions(res.data))
            .catch(err => setError(err.response?.data?.error || 'Could not load history'))
    }, [])

    if (error) return <div style={{ padding: 40, color: 'var(--red)', fontSize: 14 }}>{error}</div>
    if (!sessions) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
            <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading history...</div>
        </div>
    )

    return (
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Interview History</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Every mock interview you've taken, most recent first.</p>
            </div>

            {sessions.length === 0 && (
                <div className="card" style={{ padding: 32, textAlign: 'center' }}>
                    <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>No interviews yet.</p>
                    <Link to="/" className="btn-primary" style={{ textDecoration: 'none', padding: '10px 20px' }}>Start your first interview</Link>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {sessions.map(s => {
                    const status = STATUS_STYLE[s.status] ?? { label: s.status, color: 'var(--text-muted)' }
                    return (
                        <div key={s.sessionId} className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                                    <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{s.company}</span>
                                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, color: status.color, border: `1px solid ${status.color}55` }}>
                        {status.label}
                      </span>
                                </div>
                                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                    {s.interviewType.replace('_', ' ')} · {formatDate(s.startedAt)} · {s.questionsAnswered} question{s.questionsAnswered === 1 ? '' : 's'} answered
                                </p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                {s.averageScore != null && (
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{s.averageScore}<span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>/10</span></p>
                                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.readinessPercent}% ready</p>
                                    </div>
                                )}
                                {s.status === 'COMPLETED' && (
                                    <Link to={`/report/${s.sessionId}`} className="btn-ghost" style={{ textDecoration: 'none', padding: '8px 16px', fontSize: 13 }}>
                                        View Report
                                    </Link>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
