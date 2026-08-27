import { useState, useCallback, useRef } from 'react'
import { Message } from '../types'
import { getSystemMessage } from '../utils/persona'
import { initializeRotator } from '../utils/apiRotator'

const API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const MODEL = import.meta.env.VITE_OPENROUTER_MODEL || 'google/gemma-4-26b-a4b-it:free'
const API_KEYS = import.meta.env.VITE_OPENROUTER_API_KEYS || ''

export const useOpenRouter = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const rotatorRef = useRef(initializeRotator(API_KEYS))

  const sendMessage = useCallback(async (
    messages: Message[],
    onStream: (chunk: string) => void,
    onComplete: () => void
  ): Promise<void> => {
    setIsLoading(true)
    setError(null)

    // Abort previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    const systemMessage = {
      role: 'system',
      content: getSystemMessage()
    }

    const apiMessages = [
      systemMessage,
      ...messages.map(m => ({
        role: m.role,
        content: m.content
      }))
    ]

    let attempt = 0
    const maxAttempts = rotatorRef.current.getActiveKeyCount() || 1

    while (attempt < maxAttempts) {
      const apiKey = rotatorRef.current.getCurrentKey()

      if (!apiKey) {
        setError('Semua API key telah habis atau error. Silakan periksa konfigurasi API key Anda.')
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'PenTest AI Chatbot'
          },
          body: JSON.stringify({
            model: MODEL,
            messages: apiMessages,
            stream: true,
            temperature: 0.7,
            max_tokens: 4096
          }),
          signal: abortControllerRef.current.signal
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          const errorMsg = errorData.error?.message || `HTTP ${response.status}`

          // Jika rate limit atau unauthorized, rotasi key
          if (response.status === 429 || response.status === 401) {
            rotatorRef.current.markKeyError(apiKey, errorMsg)
            attempt++
            continue
          }

          throw new Error(errorMsg)
        }

        rotatorRef.current.markKeySuccess(apiKey)

        // Handle streaming
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        if (!reader) {
          throw new Error('Tidak dapat membaca response stream')
        }

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed || trimmed === 'data: [DONE]') continue
            if (!trimmed.startsWith('data: ')) continue

            try {
              const jsonStr = trimmed.slice(6)
              const data = JSON.parse(jsonStr)

              if (data.choices?.[0]?.delta?.content) {
                onStream(data.choices[0].delta.content)
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }

        onComplete()
        setIsLoading(false)
        return

      } catch (err) {
        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            setIsLoading(false)
            return
          }

          // Jika error terkait rate limit, coba key berikutnya
          if (err.message.includes('rate limit') || err.message.includes('quota')) {
            rotatorRef.current.markKeyError(apiKey, err.message)
            attempt++
            continue
          }

          setError(err.message)
        } else {
          setError('Terjadi kesalahan yang tidak diketahui')
        }

        setIsLoading(false)
        return
      }
    }

    setError('Semua API key telah mencapai limit. Silakan tunggu beberapa saat atau tambahkan API key baru.')
    setIsLoading(false)
  }, [])

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setIsLoading(false)
  }, [])

  return {
    isLoading,
    error,
    sendMessage,
    cancelRequest
  }
}
