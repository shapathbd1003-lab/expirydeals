'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface AuthUser {
  id: string
  role: string
  fullName: string
  full_name: string
  email: string
  email_verified: boolean
  phone?: string
  city?: string
}

interface AuthContext {
  user: AuthUser | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ error?: string }>
  logout: () => void
  setToken: (t: string, user: AuthUser) => void
  refreshUser: () => void
}

const Ctx = createContext<AuthContext>({
  user: null, token: null, loading: true,
  login: async () => ({}), logout: () => {}, setToken: () => {}, refreshUser: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setTokenState] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Try to refresh token on mount
    fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.data?.access_token) {
          setTokenState(data.data.access_token)
          return fetch('/api/users/me', {
            headers: { Authorization: `Bearer ${data.data.access_token}` },
          })
            .then((r) => (r.ok ? r.json() : null))
            .then((u) => u?.data && setUser(u.data))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    })
    const data = await res.json()
    if (!res.ok) return { error: data.error?.message || 'Login failed' }

    setTokenState(data.data.access_token)
    setUser(data.data.user)
    return {}
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    setUser(null)
    setTokenState(null)
    router.push('/')
  }

  const setToken = (t: string, u: AuthUser) => {
    setTokenState(t)
    setUser(u)
  }

  const refreshUser = () => {
    if (!token) return
    fetch('/api/users/me', { headers: { Authorization: `Bearer ${token}` }, credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => d?.data && setUser(d.data))
      .catch(() => {})
  }

  return (
    <Ctx.Provider value={{ user, token, loading, login, logout, setToken, refreshUser }}>
      {children}
    </Ctx.Provider>
  )
}

export const useAuth = () => useContext(Ctx)

export function authFetch(token: string | null) {
  return (url: string, opts: RequestInit = {}) =>
    fetch(url, {
      ...opts,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(opts.headers || {}),
      },
    })
}
