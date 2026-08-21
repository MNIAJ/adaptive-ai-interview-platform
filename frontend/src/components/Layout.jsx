import { Link, useNavigate } from 'react-router-dom'

// Wraps every logged-in page so there's one consistent header instead of
// each page being an island with no way to navigate except the back button.
export default function Layout({ children }) {
  const navigate = useNavigate()

  function logout() {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <span className="w-7 h-7 rounded bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">A</span>
            <span className="font-semibold text-slate-800">Adaptive Interview Platform</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link to="/" className="text-slate-600 hover:text-slate-900">Dashboard</Link>
            <button onClick={logout} className="text-slate-500 hover:text-red-600">Log out</button>
          </nav>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}
