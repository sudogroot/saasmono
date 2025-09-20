'use client'

import { useEffect, useState } from 'react'
import { authClient } from '@/lib/auth-client'

interface User {
  id: string
  name: string
  email: string
  image?: string
}

interface Session {
  user: User
  token?: string
  expiresAt?: string
}

interface SessionData {
  user: User | null
  session: Session | null
}

const STORAGE_KEYS = {
  USER: 'manarah_user',
  SESSION: 'manarah_session',
} as const

export function useSessionStorage() {
  const [localData, setLocalData] = useState<SessionData>({ user: null, session: null })
  const [isLoading, setIsLoading] = useState(true)
  const { data: authData, isPending } = authClient.useSession()

  const getStoredData = (): SessionData => {
    if (typeof window === 'undefined') return { user: null, session: null }

    try {
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER)
      const storedSession = localStorage.getItem(STORAGE_KEYS.SESSION)

      return {
        user: storedUser ? JSON.parse(storedUser) : null,
        session: storedSession ? JSON.parse(storedSession) : null,
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return { user: null, session: null }
    }
  }

  const setStoredData = (data: SessionData) => {
    if (typeof window === 'undefined') return

    try {
      if (data.user) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user))
      } else {
        localStorage.removeItem(STORAGE_KEYS.USER)
      }

      if (data.session) {
        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(data.session))
      } else {
        localStorage.removeItem(STORAGE_KEYS.SESSION)
      }
    } catch (error) {
      console.error('Error writing to localStorage:', error)
    }
  }

  const clearStoredData = () => {
    if (typeof window === 'undefined') return

    try {
      localStorage.removeItem(STORAGE_KEYS.USER)
      localStorage.removeItem(STORAGE_KEYS.SESSION)
      setLocalData({ user: null, session: null })
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  }

  useEffect(() => {
    const stored = getStoredData()
    setLocalData(stored)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (!isPending && authData) {
      const sessionData: SessionData = {
        user: authData.user ? {
          id: authData.user.id,
          name: authData.user.name || '',
          email: authData.user.email || '',
          image: authData.user.image,
        } : null,
        session: authData.session ? {
          user: authData.user ? {
            id: authData.user.id,
            name: authData.user.name || '',
            email: authData.user.email || '',
            image: authData.user.image,
          } : null as any,
          token: authData.session.token,
          expiresAt: authData.session.expiresAt,
        } : null,
      }

      setLocalData(sessionData)
      setStoredData(sessionData)
    } else if (!isPending && !authData) {
      clearStoredData()
    }
  }, [authData, isPending])

  return {
    data: localData,
    isPending: isPending || isLoading,
    clearStoredData,
    refreshFromAuth: () => {
      if (authData) {
        const sessionData: SessionData = {
          user: authData.user ? {
            id: authData.user.id,
            name: authData.user.name || '',
            email: authData.user.email || '',
            image: authData.user.image,
          } : null,
          session: authData.session ? {
            user: authData.user ? {
              id: authData.user.id,
              name: authData.user.name || '',
              email: authData.user.email || '',
              image: authData.user.image,
            } : null as any,
            token: authData.session.token,
            expiresAt: authData.session.expiresAt,
          } : null,
        }
        setLocalData(sessionData)
        setStoredData(sessionData)
      }
    },
  }
}