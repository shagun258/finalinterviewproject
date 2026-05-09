// src/pages/Results.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadarChart,
  PolarGrid, PolarAngleAxis, Radar
} from 'recharts'
import { highlightFillers, detectFillers } from '../utils/confidence.js'
import { generateOverallFeedback } from '../utils/gemini.js'
import styles from './Results.module.css'

export default function Results() {
  const navigate = useNavigate()
  const location = useLocation()
  const { results, domain, difficulty } = location.state || {}

  const [overallFeedback, setOverallFeedback] = useState('')
  const [loadingFeedback, setLoadingFeedback] = useState(true)
  const [expandedQ, setExpandedQ] = useState(0)

  useEffect(() => {
    if (!results) { navigate('/'); return }
    loadFeedback()
  }, [])

  async function loadFeedback() {
    try {
      const feedback = await generateOverallFeedback(domain?.label || domain, results)
      setOverallFeedback(feedback)
    } catch {
      setOverallFeedback('Could not load AI feedback. But check your scores below!')
    } finally {
      setLoadingFeedback(false)
    }
  }

  if (!results) return null

  // Calculate averages
  const avgConfidence = results.reduce((s, r) => s + r.confidenceScore, 0) / results.length
  const avgRelevance  = results.reduce((s, r) => s + r.relevanceScore, 0)  / results.length
  const totalFillers  = results.reduce((s, r) => s + r.fillerCount, 0)
  const totalWords    = results.reduce((s, r) => s + r.wordCount, 0)

  // Bar chart data
  const barData = results.map((r, i) => ({
    name: `Q${i + 1}`,
    Confidence: +r.confidenceScore.toFixed(1),
    Relevance:  +r.relevanceScore.toFixed(1),
  }))

  // Radar chart data
  const radarData = [
    { subject: 'Fluency',    A: Math.max(0, 10 - totalFillers) },
    { subject: 'Relevance',  A: +avgRelevance.toFixed(1) },
    { subject: 'Confidence', A: +avgConfidence.toFixed(1) },
    { subject: 'Depth',      A: Math.min(10, totalWords / 50) },
    { subject: 'Consistency',A: 10 - (Math.max(...results.map(r => r.confidenceScore)) - Math.min(...results.map(r => r.confidenceScore))) },
  ]

  function getScoreColor(score) {
    if (score >= 7.5) return '#6ee7b7'
    if (score >= 5)   return '#fbbf24'
    return '#f87171'
  }

  function getScoreLabel(score) {
    if (score >= 8)   return 'Excellent 🔥'
    if (score >= 6.5) return 'Good 👍'
    if (score >= 5)   return 'Average 📈'
    return 'Needs Work 💪'
  }

  return (
    <div className={styles.page}>
      <div className={styles.grid} aria-hidden="true" />

      <div className={styles.container}>
        {/* Header */}
        <div className={`${styles.header} fade-up`}>
          <div className={styles.headerTop}>
            <button className={styles.homeBtn} onClick={() => navigate('/')}>← Home</button>
            <div className={styles.domainTag}>{domain?.icon} {domain?.label} · {difficulty}</div>
          </div>
          <h1 className={styles.title}>Your Results</h1>
          <p className={styles.subtitle}>Here's how you performed across all 5 questions</p>
        </div>

        {/* Score cards row */}
        <div className={`${styles.scoreRow} fade-up-delay-1`}>
          <div className={styles.scoreCard}>
            <div className={styles.scoreNum} style={{ color: getScoreColor(avgConfidence) }}>
              {avgConfidence.toFixed(1)}
            </div>
            <div className={styles.scoreLabel}>Avg Confidence</div>
            <div className={styles.scoreTag} style={{ color: getScoreColor(avgConfidence) }}>
              {getScoreLabel(avgConfidence)}
            </div>
          </div>

          <div className={styles.scoreCard}>
            <div className={styles.scoreNum} style={{ color: getScoreColor(avgRelevance) }}>
              {avgRelevance.toFixed(1)}
            </div>
            <div className={styles.scoreLabel}>Avg Relevance</div>
            <div className={styles.scoreTag} style={{ color: getScoreColor(avgRelevance) }}>
              /10
            </div>
          </div>

          <div className={styles.scoreCard}>
            <div className={styles.scoreNum} style={{ color: totalFillers > 10 ? '#f87171' : totalFillers > 5 ? '#fbbf24' : '#6ee7b7' }}>
              {totalFillers}
            </div>
            <div className={styles.scoreLabel}>Filler Words</div>
            <div className={styles.scoreTag} style={{ color: 'var(--text3)' }}>
              {totalFillers === 0 ? 'Perfect!' : totalFillers < 5 ? 'Very Good' : totalFillers < 10 ? 'Moderate' : 'Work on it'}
            </div>
          </div>

          <div className={styles.scoreCard}>
            <div className={styles.scoreNum} style={{ color: 'var(--accent2)' }}>
              {totalWords}
            </div>
            <div className={styles.scoreLabel}>Total Words</div>
            <div className={styles.scoreTag} style={{ color: 'var(--text3)' }}>across all answers</div>
          </div>
        </div>

        {/* AI Overall Feedback */}
        <div className={`${styles.feedbackBox} fade-up-delay-2`}>
          <div className={styles.feedbackHeader}>
            <span className={styles.feedbackIcon}>🤖</span>
            <span className={styles.feedbackTitle}>AI Coach Feedback</span>
          </div>
          {loadingFeedback ? (
            <div className={styles.feedbackLoading}>
              <div className={styles.feedbackDots}>
                <span /><span /><span />
              </div>
              <span>Generating personalized feedback...</span>
            </div>
          ) : (
            <p className={styles.feedbackText}>{overallFeedback}</p>
          )}
        </div>

        {/* Charts side by side */}
        <div className={`${styles.chartsRow} fade-up-delay-2`}>
          {/* Bar chart */}
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Score per Question</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#9090a8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} tick={{ fill: '#9090a8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#12121a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f0f0f5' }}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                />
                <Bar dataKey="Confidence" fill="#6ee7b7" radius={[4,4,0,0]} />
                <Bar dataKey="Relevance"  fill="#38bdf8" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className={styles.chartLegend}>
              <span><span className={styles.dot} style={{ background: '#6ee7b7' }} />Confidence</span>
              <span><span className={styles.dot} style={{ background: '#38bdf8' }} />Relevance</span>
            </div>
          </div>

          {/* Radar chart */}
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Skill Radar</h3>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9090a8', fontSize: 11 }} />
                <Radar name="You" dataKey="A" stroke="#6ee7b7" fill="#6ee7b7" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Per-question breakdown */}
        <div className={`${styles.section} fade-up-delay-3`}>
          <h2 className={styles.sectionTitle}>Question-by-question breakdown</h2>
          <div className={styles.questionList}>
            {results.map((r, i) => (
              <div key={i} className={styles.qCard}>
                {/* Question header - clickable */}
                <button
                  className={styles.qHeader}
                  onClick={() => setExpandedQ(expandedQ === i ? -1 : i)}
                >
                  <div className={styles.qLeft}>
                    <div className={styles.qNum}>Q{i + 1}</div>
                    <div className={styles.qQuestion}>{r.question}</div>
                  </div>
                  <div className={styles.qRight}>
                    <div className={styles.qScore} style={{ color: getScoreColor(r.confidenceScore) }}>
                      {r.confidenceScore.toFixed(1)}
                    </div>
                    <div className={styles.qChevron}>{expandedQ === i ? '▲' : '▼'}</div>
                  </div>
                </button>

                {/* Expanded details */}
                {expandedQ === i && (
                  <div className={styles.qBody}>
                    {/* Mini scores */}
                    <div className={styles.miniScores}>
                      <div className={styles.miniScore}>
                        <span style={{ color: getScoreColor(r.confidenceScore) }}>{r.confidenceScore.toFixed(1)}</span>
                        <span>Confidence</span>
                      </div>
                      <div className={styles.miniScore}>
                        <span style={{ color: getScoreColor(r.relevanceScore) }}>{r.relevanceScore}/10</span>
                        <span>Relevance</span>
                      </div>
                      <div className={styles.miniScore}>
                        <span style={{ color: r.fillerCount > 3 ? '#f87171' : '#6ee7b7' }}>{r.fillerCount}</span>
                        <span>Fillers</span>
                      </div>
                      <div className={styles.miniScore}>
                        <span style={{ color: 'var(--accent2)' }}>{r.wordCount}</span>
                        <span>Words</span>
                      </div>
                    </div>

                    {/* Transcript with highlights */}
                    {r.answer ? (
                      <div className={styles.answerSection}>
                        <div className={styles.answerLabel}>Your Answer (filler words highlighted)</div>
                        <div
                          className={styles.answerText}
                          dangerouslySetInnerHTML={{ __html: highlightFillers(r.answer) || '<em>No answer recorded</em>' }}
                        />
                      </div>
                    ) : (
                      <div className={styles.skippedTag}>⏭ Question skipped</div>
                    )}

                    {/* AI Feedback */}
                    <div className={styles.aiFeedback}>
                      <div className={styles.feedbackLabel}>💬 AI Feedback</div>
                      <p>{r.feedback}</p>
                    </div>

                    {/* Key points / Missed */}
                    {r.keyPoints?.length > 0 && (
                      <div className={styles.pointsRow}>
                        <div className={styles.pointsBlock}>
                          <div className={styles.pointsTitle} style={{ color: '#6ee7b7' }}>✓ Covered well</div>
                          {r.keyPoints.map((pt, j) => (
                            <div key={j} className={styles.point} style={{ color: '#6ee7b7' }}>• {pt}</div>
                          ))}
                        </div>
                        {r.missedPoints?.length > 0 && (
                          <div className={styles.pointsBlock}>
                            <div className={styles.pointsTitle} style={{ color: '#f87171' }}>✗ Could improve</div>
                            {r.missedPoints.map((pt, j) => (
                              <div key={j} className={styles.point} style={{ color: '#f87171' }}>• {pt}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className={styles.actions}>
          <button className={styles.retryBtn} onClick={() => navigate('/interview', { state: { domain, difficulty } })}>
            🔄 Retry Same Domain
          </button>
          <button className={styles.homeBtn2} onClick={() => navigate('/')}>
            Choose New Domain →
          </button>
        </div>
      </div>
    </div>
  )
}
