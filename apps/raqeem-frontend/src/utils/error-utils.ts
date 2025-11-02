/**
 * Extracts error message from various error types
 * Handles ORPC errors, standard errors, and other error formats
 */
export function getErrorMessage(error: unknown): string {
  // Handle null/undefined
  if (!error) {
    return 'حدث خطأ غير متوقع'
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error
  }

  // Handle error objects
  if (typeof error === 'object') {
    const err = error as any

    // Check for auth client error format (error.error.message)
    if (err.error?.message) {
      return err.error.message
    }

    // Check for auth client error status text
    if (err.error?.statusText) {
      return err.error.statusText
    }

    // Check for ORPC error format (nested message)
    if (err.message?.message) {
      return err.message.message
    }

    // Check for standard error message
    if (err.message && typeof err.message === 'string') {
      return err.message
    }

    // Check for response data message (axios-like errors)
    if (err.response?.data?.message) {
      return err.response.data.message
    }

    // Check for data message
    if (err.data?.message) {
      return err.data.message
    }

    // Check for error property
    if (err.error?.message) {
      return err.error.message
    }

    // Check for issues array (Zod-like errors)
    if (err.issues && Array.isArray(err.issues) && err.issues.length > 0) {
      return err.issues[0].message
    }

    // Try to stringify the error as last resort
    try {
      const stringified = JSON.stringify(err)
      if (stringified !== '{}') {
        console.error('Unhandled error format:', stringified)
      }
    } catch (e) {
      // Ignore stringify errors
    }
  }

  // Default fallback
  return 'حدث خطأ غير متوقع'
}
