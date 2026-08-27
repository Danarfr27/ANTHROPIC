import { useState, useCallback, useRef } from 'react'
import { Message } from '../types'
import { getSystemMessage } from '../utils/persona'

const API_URL = import.meta.env.VITE_CHAT_API_URL || 'https://firdhanaiv17.vercel.app/index.html/api/chat'

const getContent = (data: unknown): string => {
  if (typeof data === 'string') return data
  if (!data || typeof data !== 'object') return ''
  const value = data as {
    content?: unknown
    message?: unknown
    choices?: Array<{ delta?: { content?: unknown }; message?: { content?: unknown } }>
  }
  return typeof value.content === 'string'
    ? value.content
    : typeof value.message === 'string'
      ? value.message
      : typeof value.choices?.[0]?.delta?.content === 'string'
        ? value.choices[0].delta.content
        : typeof value.choices?.[0]?.message?.content === 'string'
          ? value.choices[0].message.content
          : ''
}

export const useOpenRouter = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(async (
    messages: Message[],
    onStream: (chunk: string) => void,
    onComplete: () => void
  ): Promise<void> => {
    setIsLoading(true)
    setError(null)
    abortControllerRef.current?.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: getSystemMessage() },
            ...messages.slice(-12).map(({ role, content }) => ({ role, content }))
          ],
          stream: true,
          temperature: 0.2,
          max_tokens: 512
        }),
        signal: controller.signal
      })

      if (!response.ok) {
        throw new Error((await response.text()) || `HTTP ${response.status}`)
      }

      const contentType = response.headers.get('content-type') || ''
      if (!contentType.includes('text/event-stream')) {
        const data = await response.json() as unknown
        const content = getContent(data)
        if (content) onStream(content)
      } else {
        const reader = response.body?.getReader()
        if (!reader) throw new Error('Tidak dapat membaca response stream')
        const decoder = new TextDecoder()
        let buffer = ''
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''
          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed || trimmed === 'data: [DONE]') continue
            const payload = trimmed.startsWith('data:') ? trimmed.slice(5).trim() : trimmed
            try {
              const content = getContent(JSON.parse(payload))
              if (content) onStream(content)
            } catch {
              // Ignore incomplete SSE frames; the next chunk completes them.
            }
          }
        }
      }
      onComplete()
    } catch (requestError) {
      if (!(requestError instanceof Error && requestError.name === 'AbortError')) {
        setError(requestError instanceof Error ? requestError.message : 'Terjadi kesalahan yang tidak diketahui')
      }
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }, [])

  const cancelRequest = useCallback(() => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
    setIsLoading(false)
  }, [])

  return { isLoading, error, sendMessage, cancelRequest }
}
