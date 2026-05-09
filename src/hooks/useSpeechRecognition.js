// src/hooks/useSpeechRecognition.js
import { useState, useRef, useCallback } from 'react'

export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState(null)
  const [interimText, setInterimText] = useState('')
  const recognitionRef = useRef(null)

  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported. Please use Google Chrome.')
      return
    }

    setError(null)
    setTranscript('')
    setInterimText('')

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = true      // keep listening until we stop it
    recognition.interimResults = true  // show text as user speaks
    recognition.lang = 'en-US'
    recognition.maxAlternatives = 1

    recognition.onstart = () => setIsListening(true)

    recognition.onresult = (event) => {
      let finalText = ''
      let interim = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalText += result[0].transcript + ' '
        } else {
          interim += result[0].transcript
        }
      }

      if (finalText) {
        setTranscript(prev => prev + finalText)
      }
      setInterimText(interim)
    }

    recognition.onerror = (event) => {
      if (event.error === 'no-speech') return // not a real error
      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone in browser settings.')
      } else {
        setError(`Microphone error: ${event.error}`)
      }
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
      setInterimText('')
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [isSupported])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsListening(false)
    setInterimText('')
  }, [])

  const resetTranscript = useCallback(() => {
    setTranscript('')
    setInterimText('')
  }, [])

  return {
    transcript,
    interimText,
    isListening,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    fullText: transcript + interimText
  }
}
