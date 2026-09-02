import { Link, useNavigate, useLocation } from 'react-router-dom'

export default function Layout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
        <header style={{
          background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)',
          position: 'sticky', top: 0, zIndex: 50
        }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8, background: 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff'
              }}>AI</div>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>Interview Platform</span>
            </Link>
            <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Link to="/" style={{
                padding: '6px 12px', borderRadius: 6, fontSize: 13, textDecoration: 'none',
                color: location.pathname === '/' ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: location.pathname === '/' ? 'var(--bg-raised)' : 'transparent'
              }}>Dashboard</Link>
              <button onClick={() => { localStorage.removeItem('token'); navigate('/login') }}
                      style={{ padding: '6px 12px', borderRadius: 6, fontSize: 13, background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                Sign out
              </button>
            </nav>
          </div>
        </header>
        <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
          {children}
        </main>
      </div>
  )
}
