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


  const logout = () => { localStorage.removeItem('token'); sessionStorage.clear(); navigate('/login') }

  const interview = location.pathname.startsWith('/interview/')
  const title = interview ? 'Interview studio' : location.pathname.startsWith('/report/') ? 'Performance report' : location.pathname === '/history' ? 'Interview history' : ({'/new-interview':'New interview','/companies':'Companies','/resume-analysis':'Resume analysis'}[location.pathname] || 'Overview')
  return <div className={'app-shell premium-shell '+(interview?'focus-shell':'')}>
    <aside className="premium-sidebar"><NavLink to="/" className="wordmark"><span><Glyph type="bolt" /></span> PlacementAI</NavLink><div className="nav-caption">WORKSPACE</div><nav aria-label="Primary navigation"><NavLink to="/" end><Glyph type="home"/> Overview</NavLink><NavLink to="/new-interview"><Glyph type="bolt"/> New interview</NavLink><NavLink to="/companies"><Glyph type="grid"/> Companies</NavLink><NavLink to="/history"><Glyph type="history"/> Interview history</NavLink><NavLink to="/resume-analysis"><Glyph type="file"/> Resume analysis</NavLink></nav><div className="sidebar-bottom"><span>PLACEMENT WORKSPACE</span><button onClick={logout}><Glyph type="exit"/> Sign out</button></div></aside>
    <header className="premium-topbar"><div><span className="breadcrumb">Workspace / </span><strong>{title}</strong></div><NavLink to={interview?'/history':'/'} className="header-link">{interview?'Save & leave →':'PlacementAI'}</NavLink></header>
    <main className="workspace">{children}</main>
  </div>
}
