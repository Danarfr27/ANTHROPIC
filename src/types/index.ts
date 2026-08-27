export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  isStreaming?: boolean
}

export interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

export interface OpenRouterResponse {
  choices: Array<{
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  error?: {
    message: string
    code: number
  }
}

export interface ApiKeyStatus {
  key: string
  isActive: boolean
  lastError?: string
  usageCount: number
}
