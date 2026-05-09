import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSessions } from '../utils/storage.js'
import { getCurrentUser, logoutUser } from '../utils/auth.js'
import styles from './Home.module.css'

const DOMAINS = [
  { id: 'web-dev',          label: 'Web Development',   icon: '🌐', desc: 'React, HTML, CSS, JS, APIs' },
  { id: 'dsa',              label: 'DSA & Algorithms',  icon: '🧮', desc: 'Arrays, Trees, DP, Graphs' },
  { id: 'machine-learning', label: 'Machine Learning',  icon: '🤖', desc: 'ML, Deep Learning, NLP' },
  { id: 'system-design',    label: 'System Design',     icon: '🏗️', desc: 'Scalability, Databases, APIs' },
  { id: 'python',           label: 'Python',            icon: '🐍', desc: 'OOP, Libraries, Best Practices' },
  { id: 'devops',           label: 'DevOps',            icon: '⚙️', desc: 'CI/CD, Docker, Cloud, Linux' },
  { id: 'database',         label: 'Databases',         icon: '🗄️', desc: 'SQL, NoSQL, Query Optimization' },
  { id: 'java',             label: 'Java & Spring',     icon: '☕', desc: 'OOP, Spring Boot, JVM' },
]

const DIFFICULTIES = [
  { id: 'easy',   label: 'Easy',   color: '#6ee7b7', desc: 'Fresher / 0-1 yr' },
  { id: 'medium', label: 'Medium', color: '#38bdf8', desc: 'Mid level / 1-3 yr' },
  { id: 'hard',   label: 'Hard',   color: '#f472b6', desc: 'Senior / 3+ yr' },
]

export default function Home() {
  const navigate = useNavigate()
  const [selectedDomain, setSelectedDomain] = useState(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium')
  const sessions = getSessions()
  const user = getCurrentUser()

  function handleLogout() {
    logoutUser()
    navigate('/login')
  }

  function startInterview() {
    if (!selectedDomain) return
    navigate('/interview', { state: { domain: selectedDomain, difficulty: selectedDifficulty } })
  }

  return (
    <div className={styles.page}>
      <div className={styles.grid} aria-hidden="true" />

      <div className={styles.container}>

        {/* User top bar */}
        <div className={styles.userBar}>
          <span className={styles.userGreet}>👋 Hello, <strong>{user?.name || 'Student'}</strong></span>
          <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>

        {/* Header */}
        <header className={`${styles.header} fade-up`}>
          <div className={styles.badge}>AI-Powered Mock Interviews</div>
          <h1 className={styles.title}>
            Ace Your Next<br />
            <span className={styles.accent}>Interview</span>
          </h1>
          <p className={styles.subtitle}>
            Answer questions out loud. We analyze your confidence, fluency, and content in real time.
          </p>
        </header>

        {/* Domain selection */}
        <section className={`${styles.section} fade-up-delay-1`}>
          <h2 className={styles.sectionTitle}>Choose your domain</h2>
          <div className={styles.domainGrid}>
            {DOMAINS.map(domain => (
              <button
                key={domain.id}
                className={`${styles.domainCard} ${selectedDomain?.id === domain.id ? styles.selected : ''}`}
                onClick={() => setSelectedDomain(domain)}
              >
                <span className={styles.domainIcon}>{domain.icon}</span>
                <span className={styles.domainLabel}>{domain.label}</span>
                <span className={styles.domainDesc}>{domain.desc}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Difficulty selection */}
        <section className={`${styles.section} fade-up-delay-2`}>
          <h2 className={styles.sectionTitle}>Difficulty level</h2>
          <div className={styles.diffRow}>
            {DIFFICULTIES.map(d => (
              <button
                key={d.id}
                className={`${styles.diffBtn} ${selectedDifficulty === d.id ? styles.diffSelected : ''}`}
                style={selectedDifficulty === d.id ? { borderColor: d.color, color: d.color } : {}}
                onClick={() => setSelectedDifficulty(d.id)}
              >
                <span className={styles.diffLabel}>{d.label}</span>
                <span className={styles.diffDesc}>{d.desc}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Start button */}
        <div className={`${styles.startWrap} fade-up-delay-3`}>
          <button
            className={styles.startBtn}
            onClick={startInterview}
            disabled={!selectedDomain}
          >
            {selectedDomain
              ? `Start ${selectedDomain.label} Interview →`
              : 'Select a domain to begin'}
          </button>
          {selectedDomain && (
            <p className={styles.startHint}>
              5 questions · {selectedDifficulty} difficulty · ~10 minutes
            </p>
          )}
        </div>

        {/* Past sessions */}
        {sessions.length > 0 && (
          <section className={`${styles.section} fade-up-delay-3`}>
            <h2 className={styles.sectionTitle}>Past sessions</h2>
            <div className={styles.sessionList}>
              {sessions.slice(0, 3).map(s => (
                <div key={s.id} className={styles.sessionCard}>
                  <div className={styles.sessionLeft}>
                    <span className={styles.sessionDomain}>{s.domain?.label || s.domain}</span>
                    <span className={styles.sessionDate}>{s.date}</span>
                  </div>
                  <div className={styles.sessionRight}>
                    <span className={styles.sessionScore}
                      style={{ color: s.avgConfidence >= 7 ? '#6ee7b7' : s.avgConfidence >= 5 ? '#fbbf24' : '#f87171' }}>
                      {s.avgConfidence?.toFixed(1)}/10
                    </span>
                    <span className={styles.sessionLabel}>avg score</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  )
}