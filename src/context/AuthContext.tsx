import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import * as authApi from '../api/auth'
import { getStoredToken } from '../api/client'
import type { LoginRequest, RegisterRequest, User } from '../types'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  login: (payload: LoginRequest) => Promise<void>
  register: (payload: RegisterRequest) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    const token = getStoredToken()
    if (!token) {
      setUser(null)
      return
    }
    try {
      const me = await authApi.fetchCurrentUser()
      setUser(me)
    } catch {
      authApi.logoutLocal()
      setUser(null)
    }
  }, [])

  useEffect(() => {
    void (async () => {
      setIsLoading(true)
      await refreshUser()
      setIsLoading(false)
    })()
  }, [refreshUser])

  const login = useCallback(async (payload: LoginRequest) => {
    const { user: loggedIn } = await authApi.login(payload)
    setUser(loggedIn)
  }, [])

  const register = useCallback(async (payload: RegisterRequest) => {
    const { user: registered } = await authApi.register(payload)
    setUser(registered)
  }, [])

  const logout = useCallback(() => {
    authApi.logoutLocal()
    setUser(null)
  }, [])

  const isAdmin = user?.roles.some((r) => r.toLowerCase() === 'admin') ?? false

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      isAdmin,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, isLoading, isAdmin, login, register, logout, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
