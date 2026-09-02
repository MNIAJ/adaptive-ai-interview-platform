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
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: 28 }}>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Interview Complete</p>
                <h1 style={{ fontSize: 26, fontWeight: 700 }}>{report.company}</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>{report.questionsAsked} questions answered</p>
            </div>

            {/* Score cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <div className="card" style={{ padding: 20 }}>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Average Score</p>
                    <p style={{ fontSize: 36, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{report.averageScore}<span style={{ fontSize: 16, color: 'var(--text-muted)', fontWeight: 400 }}>/10</span></p>
                </div>
                <div className="card" style={{ padding: 20 }}>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Company Readiness</p>
                    <p style={{ fontSize: 36, fontWeight: 700, color: scoreColor, lineHeight: 1 }}>{readiness}<span style={{ fontSize: 16, fontWeight: 400 }}>%</span></p>
                    <div style={{ marginTop: 10, height: 4, borderRadius: 2, background: 'var(--bg-raised)' }}>
                        <div style={{ width: `${readiness}%`, height: '100%', borderRadius: 2, background: scoreColor, transition: 'width 0.6s ease' }} />
                    </div>
                </div>
            </div>

            {/* Topics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
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

            {/* Recommendation */}
            <div className="card" style={{ padding: 20, marginBottom: 24, background: 'var(--accent-dim)', borderColor: 'var(--accent)44' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', marginBottom: 6 }}>Recommendation</p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    {readiness >= 70
                        ? `Strong performance. Focus on refining system design and edge cases for ${report.company}'s interview rounds.`
                        : readiness >= 50
                            ? `Good foundation. Spend more time on ${report.weakTopics.slice(0,2).join(' and ')} — these came up weak this session.`
                            : `Need more practice before ${report.company}. Revisit fundamentals in ${report.weakTopics.slice(0,2).join(' and ')} and attempt another session.`}
                </p>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
                <Link to="/" className="btn-primary" style={{ textDecoration: 'none', padding: '11px 24px' }}>Practice again</Link>
            </div>
        </div>
    )
}
