import { createClient } from '@supabase/supabase-js'
import { isChromeStorageAvailable } from '../utils/extension'

// Replace these with your actual Supabase project values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase configuration. Please check your environment variables.')
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing')
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing')
}

const createCustomStorage = () => {
  if (isChromeStorageAvailable()) {
    // Chrome extension storage
    return {
      getItem: (key: string) => {
        return new Promise<string | null>((resolve) => {
          chrome.storage.local.get([key], (result) => {
            if (chrome.runtime.lastError) {
              console.error('Chrome storage error:', chrome.runtime.lastError)
              resolve(null)
              return
            }
            resolve(result[key] || null)
          })
        })
      },
      setItem: (key: string, value: string) => {
        return new Promise<void>((resolve) => {
          chrome.storage.local.set({ [key]: value }, () => {
            if (chrome.runtime.lastError) {
              console.error('Chrome storage error:', chrome.runtime.lastError)
            }
            resolve()
          })
        })
      },
      removeItem: (key: string) => {
        return new Promise<void>((resolve) => {
          chrome.storage.local.remove([key], () => {
            if (chrome.runtime.lastError) {
              console.error('Chrome storage error:', chrome.runtime.lastError)
            }
            resolve()
          })
        })
      },
    }
  } else {
    // Fallback to localStorage for development/testing
    return {
      getItem: (key: string) => {
        return Promise.resolve(localStorage.getItem(key))
      },
      setItem: (key: string, value: string) => {
        localStorage.setItem(key, value)
        return Promise.resolve()
      },
      removeItem: (key: string) => {
        localStorage.removeItem(key)
        return Promise.resolve()
      },
    }
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Configure for Chrome extension environment
    persistSession: true,
    storage: createCustomStorage(),
  },
})


