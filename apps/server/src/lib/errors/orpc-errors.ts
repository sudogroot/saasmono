import { ORPCError } from '@orpc/server'

export class OrpcErrorHelper {
  static notFound(message: string = 'Resource not found') {
    return new ORPCError('NOT_FOUND', { message })
  }

  static unauthorized(message: string = 'Unauthorized access') {
    return new ORPCError('UNAUTHORIZED', { message })
  }

  static badRequest(message: string = 'Bad request') {
    return new ORPCError('BAD_REQUEST', { message })
  }

  static internalError(message: string = 'Internal server error') {
    return new ORPCError('INTERNAL_SERVER_ERROR', { message })
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

  static handleServiceError(error: any, defaultMessage: string = 'Operation failed') {
    console.error('========== error', error);
    if (error.message?.includes('not found')) {
      return this.notFound(error.message)
    }
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
