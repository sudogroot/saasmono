import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import * as React from 'react'
import { useCallback, useRef } from 'react'

interface UseDebouncedSearchInput {
  minChars?: number
  delay?: number
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Debounce function that delays execution until after delay milliseconds have passed
 * since the last time it was invoked
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

/**
 * React hook for debounced functions
 * @param callback The function to debounce
 * @param delay Delay in milliseconds (default: 500ms)
 * @returns Debounced version of the callback
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): (...args: Parameters<T>) => void {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  const debouncedCallback = useCallback(
    debounce((...args: Parameters<T>) => {
      callbackRef.current(...args)
    }, delay),
    [delay]
  )

  return debouncedCallback
}

/**
 * React hook for debounced search with minimum character requirement
 * @param minChars Minimum number of characters before search is triggered (default: 1)
 * @param delay Delay in milliseconds (default: 500ms)
 * @returns Object containing search term, setSearchTerm function, and shouldSearch boolean
 */
export function useDebouncedSearch(input: UseDebouncedSearchInput) {
  const { minChars = 1, delay = 500 } = input
  const [searchTerm, setSearchTerm] = React.useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState('')

  const debouncedSetSearch = useDebounce((value: string) => {
    setDebouncedSearchTerm(value)
  }, delay)

  const handleSearchChange = React.useCallback((value: string) => {
    setSearchTerm(value)
    debouncedSetSearch(value)
  }, [debouncedSetSearch])

  const shouldSearch = debouncedSearchTerm.length >= minChars

  return {
    searchTerm,
    debouncedSearchTerm,
    setSearchTerm: handleSearchChange,
    shouldSearch,
  }
}
