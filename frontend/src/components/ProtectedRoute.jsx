import { Navigate } from 'react-router-dom'

// Wrap any page that requires login in this. Keeps the "am I logged in?"
// check in exactly one place instead of copy-pasted into every page.
export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/login" replace />
  return children
}
