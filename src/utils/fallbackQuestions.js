// src/utils/fallbackQuestions.js
// Backup questions used when AI fails during presentation

export const fallbackQuestions = {
  'Python': [
    'What is the difference between a list and a tuple in Python?',
    'Explain what decorators are in Python and give a real use case.',
    'What is the difference between deep copy and shallow copy?',
    'How does Python manage memory? Explain garbage collection.',
    'What are *args and **kwargs in Python functions?',
    'Explain the concept of generators and how they differ from normal functions.',
    'What is the GIL in Python and how does it affect multithreading?',
    'What is the difference between @staticmethod and @classmethod?',
    'How do list comprehensions work? Give an example.',
    'What are Python virtual environments and why do we use them?'
  ],

  'Machine Learning': [
    'What is the difference between supervised and unsupervised learning?',
    'Explain overfitting and how you would prevent it in a model.',
    'What is the bias-variance tradeoff in machine learning?',
    'Explain how a decision tree works and when you would use it.',
    'What is cross-validation and why is it important?',
    'What is gradient descent and how does it work?',
    'Explain the difference between precision and recall.',
    'What is a confusion matrix and what does each cell represent?',
    'What is regularization? Explain L1 vs L2 regularization.',
    'What is the difference between bagging and boosting?'
  ]

// Get 5 random questions from the backup list
export function getFallbackQuestions(domain) {
  // Match domain nane to our backup keys
  const key = Object.keys(fallbackQuestions).find(k =>
    domain.toLowerCase().includes(k.toLowerCase())
  )

  if (!key) return null

  const questions = fallbackQuestions[key]
  // Shuffle and pick 5
  const shuffled = [...questions].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 5)
}