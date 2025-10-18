import { format } from 'date-fns'

/**
 * Formats a date using the configured format from environment variables
 * @param date - Date to format
 * @param formatPattern - Optional custom format pattern (defaults to NEXT_PUBLIC_DATE_FORMAT)
 * @returns Formatted date string
 */
export function formatDate(date: Date | string, formatPattern?: string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const pattern = formatPattern || process.env.NEXT_PUBLIC_DATE_FORMAT || 'yyyy/MM/dd'
  return format(dateObj, pattern)
}

/**
   * Formats a time using the configured format from environment variables
   * @param date - Date to format
   * @param formatPattern - Optional custom format pattern (defaults to NEXT_PUBLIC_TIME_FORMAT)
   * @returns Formatted time string
   */
  export function formatTime(date: Date | string, formatPattern?: string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const pattern = formatPattern || process.env.NEXT_PUBLIC_TIME_FORMAT || 'HH:mm'
    return format(dateObj, pattern)
  }