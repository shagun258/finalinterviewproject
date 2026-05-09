const API_KEY = import.meta.env.VITE_OPENROUTER_KEY

async function callAI(prompt) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
      'HTTP-Referer': 'http://localhost:5173',
    },
    body: JSON.stringify({
      model: 'openrouter/auto',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 512
    })
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  const data = await res.json()
  return data.choices[0].message.content
}

export async function generateQuestions(domain, difficulty = 'medium') {
  try {
    const prompt = `You are a senior technical interviewer. Generate exactly 5 ${difficulty}-level interview questions for a ${domain} role.
Return ONLY a JSON array of strings, no markdown, no extra text.
Example: ["Question 1?","Question 2?","Question 3?","Question 4?","Question 5?"]`

    const raw = await callAI(prompt)
    const cleaned = raw.replace(/```json|```/g, '').trim()
    const start = cleaned.indexOf('[')
    const end = cleaned.lastIndexOf(']') + 1
    return JSON.parse(cleaned.slice(start, end))
  } catch (error) {
    console.log('AI failed, using backup questions...')
    const { getFallbackQuestions } = await import('./fallbackQuestions.js')
    const backup = getFallbackQuestions(domain)
    if (backup) return backup
    throw error
  }
}

export async function scoreAnswer(question, answer, domain) {
  if (!answer || answer.trim().length < 10) {
    return {
      relevanceScore: 0,
      feedback: 'No answer was provided.',
      keyPoints: [],
      missedPoints: []
    }
  }

  try {
    const prompt = `You are a ${domain} interviewer. Evaluate this spoken answer.
Question: "${question}"
Answer: "${answer}"
Return ONLY a JSON object with these exact fields, no markdown:
{"relevanceScore": <0-10>, "feedback": "<2-3 sentences>", "keyPoints": ["<point>"], "missedPoints": ["<point>"]}`

    const raw = await callAI(prompt)
    const cleaned = raw.replace(/```json|```/g, '').trim()
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}') + 1
    return JSON.parse(cleaned.slice(start, end))
  } catch {
    return {
      relevanceScore: 5,
      feedback: 'AI scoring unavailable. Your answer was recorded successfully.',
      keyPoints: [],
      missedPoints: []
    }
  }
}

export async function generateOverallFeedback(domain, results) {
  try {
    const summary = results.map((r, i) =>
      `Q${i + 1}: Relevance ${r.relevanceScore}/10, Confidence ${r.confidenceScore}/10, Fillers: ${r.fillerCount}`
    ).join('\n')

    const prompt = `You are a career coach reviewing a mock interview for a ${domain} role.
Session summary:
${summary}
Write a short 3-4 sentence overall performance review. Be encouraging but specific. No markdown.`

    return await callAI(prompt)
  } catch {
    return 'Great effort completing the interview! Focus on reducing filler words and giving more detailed answers to improve your score.'
  }
}