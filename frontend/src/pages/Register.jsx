import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios.js'

export default function Register() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const res = await api.post('/auth/register', { fullName, email, password })
      localStorage.setItem('token', res.data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.password || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-xl font-semibold mb-6">Create an account</h1>
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        <input className="w-full border rounded px-3 py-2 mb-3" placeholder="Full name"
          value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        <input className="w-full border rounded px-3 py-2 mb-3" type="email" placeholder="Email"
          value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="w-full border rounded px-3 py-2 mb-4" type="password" placeholder="Password (6+ chars)"
          value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="w-full bg-slate-900 text-white rounded py-2" type="submit">Register</button>
        <p className="text-sm mt-4 text-center">
          Already have an account? <Link to="/login" className="text-blue-600">Log in</Link>
        </p>
      </form>
    </div>
  )
}
