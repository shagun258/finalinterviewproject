// src/utils/confidence.js
// Analyzes transcript for confidence signals - no AI needed, pure logic

const FILLER_WORDS = [
  'umm', 'um', 'uh', 'uhh', 'uhm',
  'hmm', 'hm', 'er', 'err',
  'like', 'basically', 'literally',
  'you know', 'i mean', 'kind of', 'sort of',
  'actually', 'honestly', 'right', 'okay so',
  'so yeah', 'i guess', 'i think maybe',
  'whatever', 'stuff', 'things'
]

// Find all filler word occurrences with their positions
export function detectFillers(transcript) {
  if (!transcript) return { fillers: [], count: 0, positions: [] }

  const lower = transcript.toLowerCase()
  const found = []

  FILLER_WORDS.forEach(filler => {
    let idx = 0
    while ((idx = lower.indexOf(filler, idx)) !== -1) {
      // Make sure it's a whole word match
      const before = idx === 0 || /\W/.test(lower[idx - 1])
      const after = idx + filler.length >= lower.length || /\W/.test(lower[idx + filler.length])
      if (before && after) {
        found.push({ word: filler, index: idx, end: idx + filler.length })
      }
      idx += filler.length
    }
  })

  return {
    fillers: [...new Set(found.map(f => f.word))],
    count: found.length,
    positions: found.sort((a, b) => a.index - b.index)
  }
}

// Calculate fluency score 0-10
export function calculateFluencyScore(transcript) {
  if (!transcript || transcript.trim().length === 0) return 0

  const words = transcript.trim().split(/\s+/)
  const totalWords = words.length
  const { count: fillerCount } = detectFillers(transcript)

  // Filler ratio (lower is better)
  const fillerRatio = fillerCount / totalWords

  // Penalize by filler ratio
  let score = 10
  if (fillerRatio > 0.3) score = 1       // more than 30% fillers = very bad
  else if (fillerRatio > 0.2) score = 3  // 20-30%
  else if (fillerRatio > 0.1) score = 5  // 10-20%
  else if (fillerRatio > 0.05) score = 7 // 5-10%
  else if (fillerRatio > 0.02) score = 8 // 2-5%
  else score = 10                          // under 2% fillers

  // Penalize very short answers
  if (totalWords < 10) score = Math.min(score, 3)
  else if (totalWords < 25) score = Math.min(score, 6)

  return Math.max(0, Math.min(10, score))
}

// Calculate combined confidence score
export function calculateConfidenceScore(transcript, relevanceScore) {
  const fluency = calculateFluencyScore(transcript)
  // Weighted: 40% fluency + 60% content relevance
  const combined = (fluency * 0.4) + (relevanceScore * 0.6)
  return Math.round(combined * 10) / 10
}

// Highlight filler words in transcript HTML
export function highlightFillers(transcript) {
  if (!transcript) return ''
  const { positions } = detectFillers(transcript)
  if (positions.length === 0) return transcript

  let result = ''
  let lastIdx = 0

  positions.forEach(({ index, end, word }) => {
    result += transcript.slice(lastIdx, index)
    result += `<mark class="filler-highlight">${transcript.slice(index, end)}</mark>`
    lastIdx = end
  })
  result += transcript.slice(lastIdx)
  return result
}

// Word count and speaking time estimate
export function getTranscriptStats(transcript) {
  if (!transcript) return { wordCount: 0, estimatedSeconds: 0 }
  const words = transcript.trim().split(/\s+/).filter(Boolean)
  const wordCount = words.length
  // Average speaking rate: ~130 words per minute
  const estimatedSeconds = Math.round((wordCount / 130) * 60)
  return { wordCount, estimatedSeconds }
}
