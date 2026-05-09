// src/pages/Interview.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { generateQuestions, scoreAnswer } from '../utils/gemini.js'
import { detectFillers, calculateConfidenceScore, getTranscriptStats } from '../utils/confidence.js'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition.js'
import { saveSession } from '../utils/storage.js'
import styles from './Interview.module.css'

const TOTAL_QUESTIONS = 3

export default function Interview() {
  const navigate = useNavigate()
  const location = useLocation()
  const { domain, difficulty } = location.state || {}

  const [questions, setQuestions] = useState([])
  const [currentQ, setCurrentQ] = useState(0)
  const [loadingQuestions, setLoadingQuestions] = useState(true)
  const [scoringAnswer, setScoringAnswer] = useState(false)
  const [results, setResults] = useState([])
  const [phase, setPhase] = useState('loading') // loading | ready | recording | reviewing | done
  const [error, setError] = useState(null)

  const {
    transcript, interimText, isListening,
    error: micError, isSupported,
    startListening, stopListening, resetTranscript, fullText
  } = useSpeechRecognition()

  // Redirect if no domain selected
  useEffect(() => {
    if (!domain) { navigate('/'); return }
    loadQuestions()
  }, [])

  async function loadQuestions() {
    try {
      setLoadingQuestions(true)
      setPhase('loading')
      const qs = await generateQuestions(domain.label || domain, difficulty)
      setQuestions(qs)
      setPhase('ready')
    } catch (e) {
      setError('Failed to load questions. Check your API key in .env file.')
    } finally {
      setLoadingQuestions(false)
    }
  }

  function handleStartRecording() {
    resetTranscript()
    startListening()
    setPhase('recording')
  }

  function handleStopRecording() {
    stopListening()
    setPhase('reviewing')
  }

  async function handleSubmitAnswer() {
    const answerText = transcript.trim()
    setScoringAnswer(true)

    try {
      const aiScore = await scoreAnswer(questions[currentQ], answerText, domain.label || domain)
      const { count: fillerCount } = detectFillers(answerText)
      const { wordCount } = getTranscriptStats(answerText)
      const confidenceScore = calculateConfidenceScore(answerText, aiScore.relevanceScore)

      const result = {
        question: questions[currentQ],
        answer: answerText,
        relevanceScore: aiScore.relevanceScore,
        confidenceScore,
        fillerCount,
        wordCount,
        feedback: aiScore.feedback,
        keyPoints: aiScore.keyPoints || [],
        missedPoints: aiScore.missedPoints || []
      }

      const newResults = [...results, result]
      setResults(newResults)

      if (currentQ + 1 >= TOTAL_QUESTIONS) {
        // Save session
        const avgConfidence = newResults.reduce((s, r) => s + r.confidenceScore, 0) / newResults.length
        saveSession({ domain, difficulty, results: newResults, avgConfidence: Math.round(avgConfidence * 10) / 10 })
        navigate('/results', { state: { results: newResults, domain, difficulty } })
      } else {
        setCurrentQ(q => q + 1)
        resetTranscript()
        setPhase('ready')
      }
    } catch (e) {
      setError('Failed to score answer. Please try again.')
    } finally {
      setScoringAnswer(false)
    }
  }

  function handleSkip() {
    const result = {
      question: questions[currentQ],
      answer: '',
      relevanceScore: 0,
      confidenceScore: 0,
      fillerCount: 0,
      wordCount: 0,
      feedback: 'Question was skipped.',
      keyPoints: [],
      missedPoints: []
    }
    const newResults = [...results, result]
    setResults(newResults)

    if (currentQ + 1 >= TOTAL_QUESTIONS) {
      const avgConfidence = newResults.reduce((s, r) => s + r.confidenceScore, 0) / newResults.length
      saveSession({ domain, difficulty, results: newResults, avgConfidence: Math.round(avgConfidence * 10) / 10 })
      navigate('/results', { state: { results: newResults, domain, difficulty } })
    } else {
      setCurrentQ(q => q + 1)
      resetTranscript()
      setPhase('ready')
    }
  }

  const progress = ((currentQ) / TOTAL_QUESTIONS) * 100

  // ─── LOADING SCREEN ───────────────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <div className={styles.centered}>
        <div className={styles.spinner} />
        <p className={styles.loadingText}>Generating your {domain?.label} questions with AI...</p>
        <p className={styles.loadingSubtext}>This takes 5–10 seconds</p>
      </div>
    )
  }

  // ─── ERROR SCREEN ─────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className={styles.centered}>
        <div className={styles.errorIcon}>⚠️</div>
        <p className={styles.errorText}>{error}</p>
        <button className={styles.retryBtn} onClick={() => { setError(null); loadQuestions() }}>Try Again</button>
        <button className={styles.backBtn} onClick={() => navigate('/')}>Go Back</button>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.grid} aria-hidden="true" />

      <div className={styles.container}>
        {/* Top bar */}
        <div className={styles.topBar}>
          <button className={styles.exitBtn} onClick={() => navigate('/')}>← Exit</button>
          <div className={styles.domainTag}>{domain?.icon} {domain?.label}</div>
          <div className={styles.qCounter}>Q{currentQ + 1} of {TOTAL_QUESTIONS}</div>
        </div>

        {/* Progress bar */}
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>

        {/* Question card */}
        <div className={styles.questionCard}>
          <div className={styles.questionNumber}>Question {currentQ + 1}</div>
          <h2 className={styles.questionText}>{questions[currentQ]}</h2>
          <div className={styles.questionHint}>
            💡 Take a breath, then speak clearly. Aim for 1–2 minutes.
          </div>
        </div>

        {/* Mic error */}
        {(micError || !isSupported) && (
          <div className={styles.micError}>
            ⚠️ {micError || 'Speech recognition not supported. Please use Google Chrome.'}
          </div>
        )}

        {/* Recording area */}
        <div className={styles.recordArea}>
          {/* Transcript display */}
          <div className={styles.transcriptBox}>
            {(transcript || interimText) ? (
              <p className={styles.transcriptText}>
                {transcript}
                <span className={styles.interim}>{interimText}</span>
              </p>
            ) : (
              <p className={styles.transcriptPlaceholder}>
                {phase === 'recording'
                  ? 'Listening... speak your answer'
                  : 'Your answer will appear here as you speak'}
              </p>
            )}
          </div>

          {/* Word count */}
          {transcript && (
            <div className={styles.wordCount}>
              {transcript.trim().split(/\s+/).filter(Boolean).length} words spoken
            </div>
          )}

          {/* Controls */}
          <div className={styles.controls}>
            {phase === 'ready' && (
              <button className={styles.recordBtn} onClick={handleStartRecording}>
                <span className={styles.recordDot} />
                Start Recording
              </button>
            )}

            {phase === 'recording' && (
              <button className={styles.stopBtn} onClick={handleStopRecording}>
                <span className={styles.stopSquare} />
                Stop Recording
              </button>
            )}

            {phase === 'reviewing' && (
              <div className={styles.reviewControls}>
                <button className={styles.rerecordBtn} onClick={() => { resetTranscript(); setPhase('ready') }}>
                  🔄 Re-record
                </button>
                <button
                  className={styles.submitBtn}
                  onClick={handleSubmitAnswer}
                  disabled={scoringAnswer}
                >
                  {scoringAnswer ? (
                    <><span className={styles.btnSpinner} /> Analyzing...</>
                  ) : (
                    transcript.trim().length > 0
                      ? `Submit Answer →`
                      : 'Submit (empty)'
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Skip button */}
          {phase !== 'recording' && !scoringAnswer && (
            <button className={styles.skipBtn} onClick={handleSkip}>
              Skip this question
            </button>
          )}
        </div>

        {/* Live filler word warning */}
        {isListening && fullText && (() => {
          const { count } = detectFillers(fullText)
          return count > 2 ? (
            <div className={styles.fillerWarning}>
              ⚡ {count} filler words detected — try to slow down!
            </div>
          ) : null
        })()}
      </div>
    </div>
  )
}
