import { useState, useEffect } from 'react'
import { authService } from '../service/auth'
import type { User } from '@supabase/supabase-js'

export interface UseAuthReturn {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initialize auth state
    const initializeAuth = async () => {
      const currentUser = authService.getCurrentUser()
      setUser(currentUser)
      setIsLoading(false)
    }

    initializeAuth()

    // You might want to set up a listener for auth state changes
    // This is a simplified version - in a real app you'd want to listen to Supabase auth events
    const interval = setInterval(() => {
      const currentUser = authService.getCurrentUser()
      if (currentUser?.id !== user?.id) {
        setUser(currentUser)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [user?.id])

  const signInWithGoogle = async () => {
    setIsLoading(true)
    try {
      const result = await authService.signInWithGoogle();
      if (result) {
        setUser(authService.getCurrentUser())
      }
      return result
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    setIsLoading(true)
    try {
      await authService.signOut()
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    user,
    isAuthenticated: user !== null,
    isLoading,
    signInWithGoogle,
    signOut,
  }
}
