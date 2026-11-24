import { NavLink, useNavigate, useLocation } from 'react-router-dom'

const PATHS = {
  home: 'M3 10l9-7 9 7v10h-6v-7H9v7H3z',
  history: 'M3 12a9 9 0 1 0 3-7M3 4v5h5M12 7v5l4 2',
  file: 'M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h7',
  bolt: 'M13 2L4 14h7l-1 8 10-12h-7z',
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  exit: 'M10 3H4v18h6M9 12h12m-4-4 4 4-4 4',
}
function Glyph({ type }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={PATHS[type]} /></svg>
}

export default function Layout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()

  const jump = id => {
    if (location.pathname === '/') document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    else { navigate('/'); setTimeout(() => document.getElementById(id)?.scrollIntoView(), 200) }
  }
  const logout = () => { localStorage.removeItem('token'); sessionStorage.clear(); navigate('/login') }

  return (
    <div className="app-shell">
      <header className="topbar">
        <NavLink to="/" className="wordmark"><span><Glyph type="bolt" /></span> PlacementAI</NavLink>
        <nav aria-label="Primary">
          <NavLink to="/" end>Dashboard</NavLink>
          <button onClick={() => jump('practice')}>Practice</button>
          <button onClick={() => jump('companies')}>Companies</button>
          <NavLink to="/history">History</NavLink>
        </nav>
        <button className="account-button" onClick={logout} aria-label="Sign out"><span className="account-avatar">ST</span><span>Sign out</span></button>
      </header>
      <aside className="side" aria-label="Quick navigation">
        <button className="gradient-icon" title="Start practice" aria-label="Start practice" onClick={() => jump('practice')}><Glyph type="bolt" /></button>
        <NavLink to="/" end title="Dashboard" aria-label="Dashboard"><Glyph type="home" /></NavLink>
        <button title="Companies" aria-label="Companies" onClick={() => jump('companies')}><Glyph type="grid" /></button>
        <button title="Resume" aria-label="Resume" onClick={() => jump('resume')}><Glyph type="file" /></button>
        <NavLink to="/history" title="History" aria-label="History"><Glyph type="history" /></NavLink>
        <button className="side-exit" title="Sign out" aria-label="Sign out" onClick={logout}><Glyph type="exit" /></button>
      </aside>
      <main className="workspace">{children}</main>
    </div>
  )
}
