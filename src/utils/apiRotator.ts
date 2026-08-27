import { ApiKeyStatus } from '../types'

/**
 * OpenRouter API Key Rotator
 * Mengelola multiple API keys dengan auto-rotation
 */

class ApiKeyRotator {
  private keys: string[]
  private statuses: Map<string, ApiKeyStatus>
  private currentIndex: number

  constructor(apiKeysString: string) {
    this.keys = apiKeysString
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0)

    this.statuses = new Map()
    this.currentIndex = 0

    // Initialize statuses
    this.keys.forEach(key => {
      this.statuses.set(key, {
        key: this.maskKey(key),
        isActive: true,
        usageCount: 0
      })
    })
  }

  private maskKey(key: string): string {
    if (key.length <= 12) return '***'
    return key.substring(0, 8) + '...' + key.substring(key.length - 4)
  }

  getCurrentKey(): string | null {
    const activeKeys = this.keys.filter(k => {
      const status = this.statuses.get(k)
      return status?.isActive !== false
    })

    if (activeKeys.length === 0) {
      console.error('[ApiRotator] Semua API key telah habis atau error!')
      return null
    }

    // Cari key aktif berikutnya
    let attempts = 0
    while (attempts < this.keys.length) {
      const key = this.keys[this.currentIndex]
      const status = this.statuses.get(key)

      if (status?.isActive !== false) {
        return key
      }

      this.currentIndex = (this.currentIndex + 1) % this.keys.length
      attempts++
    }

    return null
  }

  markKeyError(key: string, errorMessage: string): void {
    const status = this.statuses.get(key)
    if (status) {
      status.isActive = false
      status.lastError = errorMessage
      console.warn(`[ApiRotator] Key ${status.key} dinonaktifkan: ${errorMessage}`)
    }

    // Rotate ke key berikutnya
    this.currentIndex = (this.currentIndex + 1) % this.keys.length
  }

  markKeySuccess(key: string): void {
    const status = this.statuses.get(key)
    if (status) {
      status.usageCount++
    }
  }

  getStatus(): ApiKeyStatus[] {
    return Array.from(this.statuses.values())
  }

  getActiveKeyCount(): number {
    return Array.from(this.statuses.values()).filter(s => s.isActive).length
  }

  resetAllKeys(): void {
    this.keys.forEach(key => {
      this.statuses.set(key, {
        key: this.maskKey(key),
        isActive: true,
        usageCount: 0
      })
    })
    this.currentIndex = 0
  }

  rotate(): string | null {
    this.currentIndex = (this.currentIndex + 1) % this.keys.length
    return this.getCurrentKey()
  }
}

// Singleton instance
let rotatorInstance: ApiKeyRotator | null = null

export const initializeRotator = (apiKeysString: string): ApiKeyRotator => {
  rotatorInstance = new ApiKeyRotator(apiKeysString)
  return rotatorInstance
}

export const getRotator = (): ApiKeyRotator | null => {
  return rotatorInstance
}

export const createRotator = (apiKeysString: string): ApiKeyRotator => {
  return new ApiKeyRotator(apiKeysString)
}
