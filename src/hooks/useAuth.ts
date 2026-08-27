import { useState, useCallback, useEffect } from 'react'

const AUTH_KEY = 'pentest_auth'
const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 jam

interface AuthState {
  isAuthenticated: boolean
  username: string | null
  loginAt: number | null
}

const getStoredAuth = (): AuthState => {
  try {
    const stored = localStorage.getItem(AUTH_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Cek apakah session masih valid
      if (parsed.loginAt && Date.now() - parsed.loginAt < SESSION_DURATION) {
        return parsed
      }
    }
  } catch {
    // ignore
  }
  return { isAuthenticated: false, username: null, loginAt: null }
}

export const useAuth = () => {
  const [auth, setAuth] = useState<AuthState>(getStoredAuth)

  const login = useCallback((username: string, password: string): boolean => {
    const validUsername = import.meta.env.VITE_AUTH_USERNAME || 'admin'
    const validPassword = import.meta.env.VITE_AUTH_PASSWORD || 'admin123'

    if (username === validUsername && password === validPassword) {
      const newAuth: AuthState = {
        isAuthenticated: true,
        username,
        loginAt: Date.now()
      }
      localStorage.setItem(AUTH_KEY, JSON.stringify(newAuth))
      setAuth(newAuth)
      window.location.assign(
        import.meta.env.VITE_AUTH_REDIRECT_URL || 'https://firdhanaiv17.vercel.app/index.html/'
      )
      return true
    }
    return false
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY)
    setAuth({ isAuthenticated: false, username: null, loginAt: null })
  }, [])

  const isSessionValid = useCallback((): boolean => {
    if (!auth.isAuthenticated || !auth.loginAt) return false
    return Date.now() - auth.loginAt < SESSION_DURATION
  }, [auth])

  // Auto-logout jika session expired
  useEffect(() => {
    if (auth.isAuthenticated && !isSessionValid()) {
      logout()
    }
  }, [auth.isAuthenticated, isSessionValid, logout])

  return {
    isAuthenticated: auth.isAuthenticated,
    username: auth.username,
    login,
    logout,
    isSessionValid
  }
}
