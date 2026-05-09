import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser, registerUser } from '../utils/auth.js'
import styles from './Login.module.css'

export default function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleSubmit() {
    setError('')
    setLoading(true)

    if (!username || !password) {
      setError('Please fill in all fields!')
      setLoading(false)
      return
    }

    if (mode === 'register' && !name) {
      setError('Please enter your name!')
      setLoading(false)
      return
    }

    let result
    if (mode === 'login') {
      result = loginUser(username, password)
    } else {
      result = registerUser(name, username, password)
    }

    if (result.success) {
      setLoading(false)
      window.location.href = '/'
    } else {
      setError(result.error)
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className={styles.page}>
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.container}>

        <div className={`${styles.logo} fade-up`}>
          <div className={styles.logoIcon}>🎯</div>
          <div className={styles.logoText}>Interview Analyzer</div>
        </div>

        <div className={`${styles.card} fade-up-delay-1`}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${mode === 'login' ? styles.activeTab : ''}`}
              onClick={() => { setMode('login'); setError('') }}
            >Login</button>
            <button
              className={`${styles.tab} ${mode === 'register' ? styles.activeTab : ''}`}
              onClick={() => { setMode('register'); setError('') }}
            >Register</button>
          </div>

          <h1 className={styles.title}>
            {mode === 'login' ? 'Welcome back! 👋' : 'Create account 🚀'}
          </h1>
          <p className={styles.subtitle}>
            {mode === 'login'
              ? 'Login to continue your interview practice'
              : 'Register to start practicing interviews'}
          </p>

          <div className={styles.form}>
            {mode === 'register' && (
              <div className={styles.field}>
                <label className={styles.label}>Full Name</label>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
            )}

            <div className={styles.field}>
              <label className={styles.label}>Username</label>
              <input
                className={styles.input}
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Password</label>
              <input
                className={styles.input}
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            {error && (
              <div className={styles.error}>⚠️ {error}</div>
            )}

            <button
              className={styles.submitBtn}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Login →' : 'Create Account →'}
            </button>
          </div>

          <p className={styles.switchText}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              className={styles.switchBtn}
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
            >
              {mode === 'login' ? 'Register here' : 'Login here'}
            </button>
          </p>
        </div>

        <p className={`${styles.hint} fade-up-delay-2`}>
          🔒 Your data stays only on your device — no server needed
        </p>
      </div>
    </div>
  )
}