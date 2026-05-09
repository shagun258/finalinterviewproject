import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Interview from './pages/Interview.jsx'
import Results from './pages/Results.jsx'
import Login from './pages/Login.jsx'
import { isLoggedIn } from './utils/auth.js'

function ProtectedRoute({ children }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />
  }
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <ProtectedRoute><Home /></ProtectedRoute>
      } />
      <Route path="/interview" element={
        <ProtectedRoute><Interview /></ProtectedRoute>
      } />
      <Route path="/results" element={
        <ProtectedRoute><Results /></ProtectedRoute>
      } />
    </Routes>
  )
}