import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios.js'

export default function Register() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await api.post('/auth/register', { fullName, email, password })
      localStorage.setItem('token', res.data.token)
      navigate('/')
    } catch (err) {
      const msg =
          err.response?.data?.error ||
          err.response?.data?.email ||
          err.response?.data?.password ||
          err.response?.data?.message ||
          "Registration failed";
      setError(msg);

    } finally { setLoading(false) }
  }

  return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 16 }}>AI</div>
            <h1 style={{ fontSize: 22, fontWeight: 600 }}>Create your account</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Start practising for placements today</p>
          </div>

          <div className="card" style={{ padding: 24 }}>
            {error && (
                <div style={{ background: 'var(--red-dim)', border: '1px solid var(--red)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: 'var(--red)' }}>
                  {error}
                </div>
            )}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label className="label">Full name</label>
                <input className="input" placeholder="Ayush Joshi" value={fullName} onChange={e => setFullName(e.target.value)} required />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label className="label">Email</label>
                <input className="input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label className="label">Password</label>
                <input className="input" type="password" placeholder="at least 6 characters" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>
          </div>
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
          </p>
        </div>
      </div>
  )
}
