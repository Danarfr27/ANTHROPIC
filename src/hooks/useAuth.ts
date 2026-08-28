import { useState, useCallback, useEffect } from 'react'

const AUTH_KEY = 'pentest_auth'
const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 jam
const configuredLoginApiUrl = import.meta.env.VITE_LOGIN_API_URL || '/api/login'
const LOGIN_API_URL = configuredLoginApiUrl.replace('/index.html/api/', '/api/')

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

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    const response = await fetch(LOGIN_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })

    if (response.ok) {
      const newAuth: AuthState = {
        isAuthenticated: true,
        username,
        loginAt: Date.now()
      }
      localStorage.setItem(AUTH_KEY, JSON.stringify(newAuth))
      setAuth(newAuth)
      window.location.assign(
        import.meta.env.VITE_AUTH_REDIRECT_URL || '/'
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
