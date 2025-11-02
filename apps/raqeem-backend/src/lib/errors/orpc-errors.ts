import { ORPCError } from '@orpc/server'
import { ZodError } from 'zod'
import { ERROR_MESSAGES, translateErrorMessage, translateZodError } from './error-messages'

export class OrpcErrorHelper {
  static notFound(message: string = 'Resource not found') {
    const arabicMessage = translateErrorMessage(message)
    return new ORPCError('NOT_FOUND', { message: arabicMessage })
  }

  static unauthorized(message: string = 'Unauthorized access') {
    const arabicMessage = translateErrorMessage(message)
    return new ORPCError('UNAUTHORIZED', { message: arabicMessage })
  }

  static badRequest(message: string = 'Bad request') {
    const arabicMessage = translateErrorMessage(message)
    return new ORPCError('BAD_REQUEST', { message: arabicMessage })
  }

  static internalError(message: string = 'Internal server error') {
    const arabicMessage = translateErrorMessage(message)
    return new ORPCError('INTERNAL_SERVER_ERROR', { message: arabicMessage })
  }

  static userNotFoundInOrg() {
    return this.notFound('User not found in organization')
  }

  static noActiveOrganization() {
    return this.badRequest('No active organization found')
  }

  static userNotInSession() {
    return this.unauthorized('User not found in session')
  }

  static parentNotFoundInOrg() {
    return this.notFound('Parent not found in organization')
  }

  static studentNotFoundInOrg() {
    return this.notFound('Student not found in organization')
  }

  static teacherNotFoundInOrg() {
    return this.notFound('Teacher not found in organization')
  }

  static relationNotFound() {
    return this.notFound('Parent-student relation not found')
  }

  static assignmentNotFound() {
    return this.notFound('Assignment not found in organization')
  }

  static usersNotFoundInOrg() {
    return this.notFound('Users not found in organization')
  }

  /**
   * Handles service errors and converts them to Arabic messages
   * IMPORTANT: This function ensures NO raw database errors or SQL queries are exposed to the frontend
   * @param error The error object from the service
   * @param defaultMessage The default English message to use if error message cannot be determined
   */
  static handleServiceError(error: any, defaultMessage: string = 'Operation failed') {
    // Log the FULL error details server-side for debugging (never send to client)
    console.error('[ERROR HANDLER] Full error details (server-side only):', {
      errorType: typeof error,
      errorName: error?.name,
      errorMessage: error?.message,
      errorStack: error?.stack,
      errorCode: error?.code,
      errorDetail: error?.detail,
      errorConstraint: error?.constraint,
      defaultMessage,
      fullError: error,
    })

    // Handle Zod validation errors
    if (error instanceof ZodError || error?.name === 'ZodError') {
      const arabicMessage = translateZodError(error)
      console.log('[ERROR HANDLER] Zod validation error:', arabicMessage)
      return this.badRequest(arabicMessage)
    }

    // Handle different error types
    if (error instanceof ORPCError) {
      // Already an ORPC error, just return it
      return error
    }

    // Handle PostgreSQL/Database errors (CRITICAL: Never expose SQL to frontend)
    if (error?.code) {
      console.error('[ERROR HANDLER] Database error detected, code:', error.code)

      switch (error.code) {
        case '23505': // Unique constraint violation
          console.log('[ERROR HANDLER] Constraint:', error.constraint)
          return this.badRequest(ERROR_MESSAGES.DUPLICATE_ENTRY)

        case '23503': // Foreign key constraint violation
          console.log('[ERROR HANDLER] Foreign key violation:', error.constraint)
          return this.badRequest(ERROR_MESSAGES.CONSTRAINT_VIOLATION)

        case '23502': // Not null violation
          console.log('[ERROR HANDLER] Not null violation:', error.column)
          return this.badRequest(ERROR_MESSAGES.REQUIRED_FIELD)

        case '22P02': // Invalid text representation
          console.log('[ERROR HANDLER] Invalid data format')
          return this.badRequest(ERROR_MESSAGES.INVALID_INPUT)

        case '42P01': // Undefined table
        case '42703': // Undefined column
          // These are programming errors, never expose to user
          console.error('[ERROR HANDLER] CRITICAL: Database schema error')
          return this.internalError(ERROR_MESSAGES.INTERNAL_ERROR)

        default:
          // Any other database error - NEVER expose SQL details
          console.error('[ERROR HANDLER] Unhandled database error code:', error.code)
          return this.internalError(ERROR_MESSAGES.DATABASE_ERROR)
      }
    }

    // Check if error message contains SQL keywords (safety check)
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase()
      const sqlKeywords = ['insert into', 'select', 'update', 'delete from', 'drop', 'alter table', 'create table']
      const containsSQL = sqlKeywords.some(keyword => errorMessage.includes(keyword))

      if (containsSQL) {
        // CRITICAL: SQL detected in error message - NEVER send to frontend
        console.error('[ERROR HANDLER] CRITICAL: SQL detected in error message - blocking from frontend')
        return this.internalError(ERROR_MESSAGES.DATABASE_ERROR)
      }

      // Check for specific error patterns (safe to translate)
      if (errorMessage.includes('not found')) {
        return this.notFound(error.message)
      }

      if (errorMessage.includes('unauthorized')) {
        return this.unauthorized(error.message)
      }

      if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
        return this.badRequest(error.message)
      }

      // Try to translate the error message
      const translatedMessage = translateErrorMessage(error.message)
      if (translatedMessage !== error.message) {
        // We found a translation, use it
        return this.internalError(error.message)
      }

      // Check if error message is safe to expose (doesn't contain technical details)
      const isSafeMessage = error.message.length < 100 && !error.message.includes('Error:') && !error.message.includes('params:')

      if (isSafeMessage) {
        return this.internalError(error.message)
      } else {
        // Message looks too technical, use default instead
        console.error('[ERROR HANDLER] Error message looks technical, using default')
        return this.internalError(defaultMessage)
      }
    }

    // Fallback: use the default message (NEVER expose raw error)
    console.error('[ERROR HANDLER] Fallback to default message')
    return this.internalError(defaultMessage)
  }
}

// Context Helper Functions
export function getOrgId(context: any): string {
  const orgId = context.session?.session?.activeOrganizationId
  if (!orgId) {
    throw OrpcErrorHelper.noActiveOrganization()
  }
  return orgId
}

export function getCurrentUserId(context: any): string {
  const userId = context.session?.user?.id
  if (!userId) {
    throw OrpcErrorHelper.userNotInSession()
  }
  return userId
}
