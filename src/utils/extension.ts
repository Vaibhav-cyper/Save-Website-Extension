/**
 * Utility functions for Chrome extension environment
 */

/**
 * Check if we're running in a Chrome extension context
 */
export const isExtensionContext = (): boolean => {
  return typeof chrome !== 'undefined' && 
         typeof chrome.runtime !== 'undefined' && 
         typeof chrome.runtime.id !== 'undefined'
}

/**
 * Check if Chrome storage API is available
 */
export const isChromeStorageAvailable = (): boolean => {
  return typeof chrome !== 'undefined' && 
         typeof chrome.storage !== 'undefined' && 
         typeof chrome.storage.local !== 'undefined'
}

/**
 * Check if Chrome identity API is available
 */
export const isChromeIdentityAvailable = (): boolean => {
  return typeof chrome !== 'undefined' && 
         typeof chrome.identity !== 'undefined'
}

/**
 * Get Chrome extension manifest safely
 */
export const getChromeManifest = (): chrome.runtime.Manifest | null => {
  try {
    if (!isExtensionContext()) {
      return null
    }
    return chrome.runtime.getManifest()
  } catch (error) {
    console.error('Failed to get Chrome manifest:', error)
    return null
  }
}

/**
 * Get Chrome extension ID safely
 */
export const getChromeExtensionId = (): string | null => {
  try {
    if (!isExtensionContext()) {
      return null
    }
    return chrome.runtime.id
  } catch (error) {
    console.error('Failed to get Chrome extension ID:', error)
    return null
  }
}
