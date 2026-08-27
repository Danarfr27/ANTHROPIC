import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Menu, Square, Sparkles, AlertCircle, Paperclip, X } from 'lucide-react'
import { Message, ChatSession } from '../types'
import { useOpenRouter } from '../hooks/useOpenRouter'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import Sidebar from './Sidebar'
import { createWorker } from 'tesseract.js'

const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

const ChatInterface = () => {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const stored = localStorage.getItem('pentest_sessions')
    if (stored) {
      const parsed = JSON.parse(stored)
      return parsed.map((s: any) => ({
        ...s,
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.updatedAt),
        messages: s.messages.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }))
      }))
    }
    return []
  })

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [ocrStatus, setOcrStatus] = useState<string | null>(null)
  const [ocrError, setOcrError] = useState<string | null>(null)
  const [isProcessingFile, setIsProcessingFile] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { isLoading, error, sendMessage, cancelRequest } = useOpenRouter()

  const activeSession = sessions.find(s => s.id === activeSessionId)

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [sessions, streamingContent])

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = inputRef.current.scrollHeight + 'px'
    }
  }, [input])

  // Save sessions
  useEffect(() => {
    localStorage.setItem('pentest_sessions', JSON.stringify(sessions))
  }, [sessions])

  const createNewSession = useCallback(() => {
    const newSession: ChatSession = {
      id: generateId(),
      title: 'Chat Baru',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setSessions(prev => [newSession, ...prev])
    setActiveSessionId(newSession.id)
    setSidebarOpen(false)
  }, [])
  // Create initial session if none exists
  useEffect(() => {
    if (sessions.length === 0) {
      createNewSession()
    } else if (!activeSessionId) {
      setActiveSessionId(sessions[0].id)
    }
  }, [sessions, activeSessionId, createNewSession])

  const handleSend = async () => {
    if (!input.trim() || isLoading || !activeSessionId) return

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    // Update session with user message
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        const updatedMessages = [...s.messages, userMessage]
        return {
          ...s,
          messages: updatedMessages,
          title: s.title === 'Chat Baru' ? input.trim().slice(0, 40) + (input.length > 40 ? '...' : '') : s.title,
          updatedAt: new Date()
        }
      }
      return s
    }))

    setInput('')
    setStreamingContent('')

    // Get current messages for API
    const currentMessages = activeSession ? [...activeSession.messages, userMessage] : [userMessage]

    // Send to API
    await sendMessage(
      currentMessages,
      (chunk) => {
        setStreamingContent(prev => prev + chunk)
      },
      () => {
        // On complete, add assistant message
        setSessions(prev => prev.map(s => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: [
                ...s.messages,
                {
                  id: generateId(),
                  role: 'assistant',
                  content: streamingContent || 'Maaf, saya tidak dapat memberikan respons saat ini.',
                  timestamp: new Date()
                }
              ],
              updatedAt: new Date()
            }
          }
          return s
        }))
        setStreamingContent('')
      }
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      e.target.value = ''
      if (!file) return

      setIsProcessingFile(true)
      setOcrError(null)
      setOcrStatus(`Membaca ${file.name}...`)

      try {
        if (
          file.type.startsWith('text/') ||
          /\.(md|csv|json|log|xml|html?)$/i.test(file.name)
        ) {
          const text = await file.text()
          if (!text.trim()) {
            throw new Error('File tidak berisi teks.')
          }
          setInput(prev => `${prev}${prev ? '\n\n' : ''}${text}`)
          setOcrStatus(`Teks dari ${file.name} berhasil dimuat`)
          return
        }

        if (!file.type.startsWith('image/')) {
          throw new Error('Format belum didukung. Gunakan gambar, TXT, MD, CSV, JSON, LOG, XML, atau HTML.')
        }

        const worker = await createWorker('eng')
        let result
        try {
          result = await worker.recognize(file)
        } finally {
          await worker.terminate()
        }
        const text = result.data.text.trim()

        if (!text) {
          throw new Error('Tidak ada teks yang terbaca dari gambar.')
        }

        setInput(prev => `${prev}${prev ? '\n\n' : ''}${text}`)
        setOcrStatus(`OCR ${file.name} selesai`)
      } catch (error) {
        setOcrError(error instanceof Error ? error.message : 'Gagal memproses file.')
        setOcrStatus(null)
      } finally {
        setIsProcessingFile(false)
    }
  }

  const deleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id))
    if (activeSessionId === id) {
      const remaining = sessions.filter(s => s.id !== id)
      setActiveSessionId(remaining.length > 0 ? remaining[0].id : null)
    }
  }

  const selectSession = (id: string) => {
    setActiveSessionId(id)
    setSidebarOpen(false)
  }

  // Combine messages with streaming content
  const displayMessages = activeSession ? [...activeSession.messages] : []
  if (streamingContent && isLoading) {
    displayMessages.push({
      id: 'streaming',
      role: 'assistant',
      content: streamingContent,
      timestamp: new Date(),
      isStreaming: true
    })
  }

  return (
    <div className="flex h-screen w-full">
      {/* Sidebar */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onNewChat={createNewSession}
        onSelectSession={selectSession}
        onDeleteSession={deleteSession}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0a0a0f]">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-gray-800/50 bg-[#0a0a0f]/80 backdrop-blur-xl z-10">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-800/50 text-gray-400 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-white">
              {activeSession?.title || 'PenTest AI'}
            </h2>
          </div>
          {isLoading && (
            <div className="ml-auto flex items-center gap-2 text-xs text-emerald-400">
              <motion.div
                className="w-3 h-3 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              Memproses...
            </div>
          )}
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {displayMessages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600/20 to-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Selamat Datang di PenTest AI</h3>
              <p className="text-gray-500 max-w-md text-sm leading-relaxed">
                Saya adalah Sentinel, asisten penetration testing Anda. Tanyakan apa saja tentang keamanan siber, 
                vulnerability assessment, exploit techniques, atau defensive strategies.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 max-w-lg w-full">
                {[
                  'Analisis kerentanan OWASP Top 10',
                  'Cara melakukan reconnaissance',
                  'Exploit SQL Injection dengan sqlmap',
                  'Security assessment untuk API REST'
                ].map((suggestion, i) => (
                  <motion.button
                    key={i}
                    className="text-left px-4 py-3 rounded-xl bg-gray-800/30 border border-gray-700/50 hover:border-emerald-500/30 hover:bg-emerald-500/5 text-sm text-gray-400 hover:text-emerald-300 transition-all"
                    onClick={() => setInput(suggestion)}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {suggestion}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="max-w-3xl mx-auto">
              <AnimatePresence>
                {displayMessages.map((message, index) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    index={index}
                  />
                ))}
              </AnimatePresence>
              {isLoading && !streamingContent && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mx-4 mb-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="ml-auto text-xs text-red-400 hover:text-red-300 underline"
              >
                Refresh
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Area */}
        <div className="border-t border-gray-800/50 bg-[#0a0a0f]/80 backdrop-blur-xl p-4">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-end gap-2 bg-[#12121a] border border-gray-700/50 rounded-2xl p-2 focus-within:border-emerald-500/30 focus-within:ring-1 focus-within:ring-emerald-500/10 transition-all">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,text/plain,text/markdown,text/csv,application/json,.md,.csv,.json,.log,.xml,.html,.htm"
                onChange={handleFileUpload}
                className="hidden"
              />
              <motion.button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || isProcessingFile}
                title="Upload gambar untuk OCR atau file teks"
                className="p-2.5 rounded-xl text-gray-500 hover:bg-emerald-500/10 hover:text-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Paperclip className="w-4 h-4" />
              </motion.button>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tanyakan tentang penetration testing..."
                className="flex-1 bg-transparent text-white placeholder-gray-600 resize-none max-h-32 py-3 px-3 focus:outline-none text-sm leading-relaxed"
                rows={1}
                disabled={isLoading}
              />
              <div className="flex items-center gap-1 pb-1">
                {isLoading ? (
                  <motion.button
                    onClick={cancelRequest}
                    className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Square className="w-4 h-4" />
                  </motion.button>
                ) : (
                  <motion.button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Send className="w-4 h-4" />
                  </motion.button>
                )}
              </div>
            </div>
            {(ocrStatus || ocrError) && (
              <div className={`mt-2 flex items-center gap-2 text-[11px] font-mono ${ocrError ? 'text-red-400' : 'text-emerald-400'}`}>
                <span className="truncate">{ocrError || ocrStatus}</span>
                <button
                  type="button"
                  onClick={() => {
                    setOcrStatus(null)
                    setOcrError(null)
                  }}
                  className="ml-auto p-0.5 hover:text-white"
                  aria-label="Tutup status upload"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <p className="text-center text-[10px] text-gray-700 mt-2 font-mono">
              Powered by Anthropic Claude Sonnet 4.7
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatInterface
