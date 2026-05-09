// src/utils/storage.js

const SESSION_KEY = 'interview_sessions'

export function saveSession(session) {
  const existing = getSessions()
  const newSession = {
    ...session,
    id: Date.now(),
    date: new Date().toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }
  existing.unshift(newSession)
  // Keep only last 10 sessions
  const trimmed = existing.slice(0, 10)
  localStorage.setItem(SESSION_KEY, JSON.stringify(trimmed))
  return newSession
}

export function getSessions() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || '[]')
  } catch {
    return []
  }
}

export function clearSessions() {
  localStorage.removeItem(SESSION_KEY)
}
