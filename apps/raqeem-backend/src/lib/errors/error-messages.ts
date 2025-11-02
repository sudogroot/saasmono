/**
 * Arabic error messages for the application
 */
export const ERROR_MESSAGES = {
  // Authentication & Authorization
  UNAUTHORIZED: 'غير مصرح بالوصول',
  USER_NOT_IN_SESSION: 'المستخدم غير موجود في الجلسة',
  NO_ACTIVE_ORGANIZATION: 'لا توجد منظمة نشطة',
  USER_NOT_IN_ORG: 'المستخدم غير موجود في المنظمة',

  // Client errors
  CLIENT_NOT_FOUND: 'العميل غير موجود',
  CLIENT_CREATE_FAILED: 'فشل في إنشاء العميل',
  CLIENT_UPDATE_FAILED: 'فشل في تحديث العميل',
  CLIENT_DELETE_FAILED: 'فشل في حذف العميل',
  CLIENT_FETCH_FAILED: 'فشل في جلب بيانات العميل',
  CLIENTS_FETCH_FAILED: 'فشل في جلب قائمة العملاء',

  // Case errors
  CASE_NOT_FOUND: 'القضية غير موجودة',
  CASE_CREATE_FAILED: 'فشل في إنشاء القضية',
  CASE_UPDATE_FAILED: 'فشل في تحديث القضية',
  CASE_DELETE_FAILED: 'فشل في حذف القضية',
  CASE_FETCH_FAILED: 'فشل في جلب بيانات القضية',
  CASES_FETCH_FAILED: 'فشل في جلب قائمة القضايا',

  // Trial errors
  TRIAL_NOT_FOUND: 'الجلسة غير موجودة',
  TRIAL_CREATE_FAILED: 'فشل في إنشاء الجلسة',
  TRIAL_UPDATE_FAILED: 'فشل في تحديث الجلسة',
  TRIAL_DELETE_FAILED: 'فشل في حذف الجلسة',
  TRIAL_FETCH_FAILED: 'فشل في جلب بيانات الجلسة',
  TRIALS_FETCH_FAILED: 'فشل في جلب قائمة الجلسات',

  // Opponent errors
  OPPONENT_NOT_FOUND: 'الخصم غير موجود',
  OPPONENT_CREATE_FAILED: 'فشل في إنشاء الخصم',
  OPPONENT_UPDATE_FAILED: 'فشل في تحديث الخصم',
  OPPONENT_DELETE_FAILED: 'فشل في حذف الخصم',
  OPPONENT_FETCH_FAILED: 'فشل في جلب بيانات الخصم',
  OPPONENTS_FETCH_FAILED: 'فشل في جلب قائمة الخصوم',

  // Court errors
  COURT_NOT_FOUND: 'المحكمة غير موجودة',
  COURT_CREATE_FAILED: 'فشل في إنشاء المحكمة',
  COURT_UPDATE_FAILED: 'فشل في تحديث المحكمة',
  COURT_DELETE_FAILED: 'فشل في حذف المحكمة',
  COURT_FETCH_FAILED: 'فشل في جلب بيانات المحكمة',
  COURTS_FETCH_FAILED: 'فشل في جلب قائمة المحاكم',

  // Validation errors
  VALIDATION_ERROR: 'خطأ في التحقق من البيانات',
  INVALID_INPUT: 'البيانات المدخلة غير صحيحة',
  REQUIRED_FIELD: 'هذا الحقل مطلوب',
  INVALID_EMAIL: 'البريد الإلكتروني غير صحيح',
  INVALID_PHONE: 'رقم الهاتف غير صحيح',
  INVALID_DATE: 'التاريخ غير صحيح',
  INVALID_TIME: 'الوقت غير صحيح',
  STRING_TOO_SHORT: 'القيمة قصيرة جداً',
  STRING_TOO_LONG: 'القيمة طويلة جداً',
  NUMBER_TOO_SMALL: 'الرقم صغير جداً',
  NUMBER_TOO_LARGE: 'الرقم كبير جداً',

  // Generic errors
  INTERNAL_ERROR: 'حدث خطأ داخلي في الخادم',
  NOT_FOUND: 'المورد غير موجود',
  BAD_REQUEST: 'طلب غير صحيح',
  OPERATION_FAILED: 'فشلت العملية',

  // Database errors
  DATABASE_ERROR: 'خطأ في قاعدة البيانات',
  DUPLICATE_ENTRY: 'القيمة موجودة مسبقاً',
  CONSTRAINT_VIOLATION: 'انتهاك قيد البيانات',
} as const

/**
 * Field names in Arabic for validation errors
 */
export const FIELD_NAMES: Record<string, string> = {
  name: 'الاسم',
  email: 'البريد الإلكتروني',
  phone: 'رقم الهاتف',
  nationalId: 'رقم الهوية',
  clientType: 'نوع العميل',
  caseNumber: 'رقم القضية',
  caseTitle: 'عنوان القضية',
  caseSubject: 'موضوع القضية',
  clientId: 'العميل',
  opponentId: 'الخصم',
  courtId: 'المحكمة',
  courtFileNumber: 'رقم الملف بالمحكمة',
  caseStatus: 'حالة القضية',
  priority: 'الأولوية',
  trialNumber: 'رقم الجلسة',
  trialDate: 'تاريخ الجلسة',
  trialTime: 'وقت الجلسة',
  trialDateTime: 'تاريخ ووقت الجلسة',
  caseId: 'القضية',
}

/**
 * Translates Zod validation errors to Arabic
 */
export function translateZodError(zodError: any): string {
  if (!zodError.issues || zodError.issues.length === 0) {
    return ERROR_MESSAGES.VALIDATION_ERROR
  }

  const firstIssue = zodError.issues[0]
  const fieldName = FIELD_NAMES[firstIssue.path[0]] || firstIssue.path[0]

  switch (firstIssue.code) {
    case 'invalid_type':
      if (firstIssue.received === 'undefined' || firstIssue.received === 'null') {
        return `${fieldName} ${ERROR_MESSAGES.REQUIRED_FIELD}`
      }
      return `${fieldName} ${ERROR_MESSAGES.INVALID_INPUT}`

    case 'invalid_string':
      if (firstIssue.validation === 'email') {
        return ERROR_MESSAGES.INVALID_EMAIL
      }
      return `${fieldName} ${ERROR_MESSAGES.INVALID_INPUT}`

    case 'too_small':
      if (firstIssue.type === 'string') {
        if (firstIssue.minimum === 1) {
          return `${fieldName} مطلوب`
        }
        return `${fieldName} ${ERROR_MESSAGES.STRING_TOO_SHORT}`
      }
      if (firstIssue.type === 'number') {
        return `${fieldName} ${ERROR_MESSAGES.NUMBER_TOO_SMALL}`
      }
      return `${fieldName} ${ERROR_MESSAGES.INVALID_INPUT}`

    case 'too_big':
      if (firstIssue.type === 'string') {
        return `${fieldName} ${ERROR_MESSAGES.STRING_TOO_LONG}`
      }
      if (firstIssue.type === 'number') {
        return `${fieldName} ${ERROR_MESSAGES.NUMBER_TOO_LARGE}`
      }
      return `${fieldName} ${ERROR_MESSAGES.INVALID_INPUT}`

    case 'invalid_enum_value':
      return `${fieldName} ${ERROR_MESSAGES.INVALID_INPUT}`

    default:
      return `${fieldName}: ${firstIssue.message}`
  }
}

/**
 * Maps English error messages to Arabic
 */
export function translateErrorMessage(englishMessage: string): string {
  const errorMap: Record<string, string> = {
    // Not found errors
    'Client not found': ERROR_MESSAGES.CLIENT_NOT_FOUND,
    'Case not found': ERROR_MESSAGES.CASE_NOT_FOUND,
    'Trial not found': ERROR_MESSAGES.TRIAL_NOT_FOUND,
    'Opponent not found': ERROR_MESSAGES.OPPONENT_NOT_FOUND,
    'Court not found': ERROR_MESSAGES.COURT_NOT_FOUND,
    'User not found in organization': ERROR_MESSAGES.USER_NOT_IN_ORG,

    // Create errors
    'Failed to create client': ERROR_MESSAGES.CLIENT_CREATE_FAILED,
    'Failed to create case': ERROR_MESSAGES.CASE_CREATE_FAILED,
    'Failed to create trial': ERROR_MESSAGES.TRIAL_CREATE_FAILED,
    'Failed to create opponent': ERROR_MESSAGES.OPPONENT_CREATE_FAILED,
    'Failed to create court': ERROR_MESSAGES.COURT_CREATE_FAILED,

    // Update errors
    'Failed to update client': ERROR_MESSAGES.CLIENT_UPDATE_FAILED,
    'Failed to update case': ERROR_MESSAGES.CASE_UPDATE_FAILED,
    'Failed to update trial': ERROR_MESSAGES.TRIAL_UPDATE_FAILED,
    'Failed to update opponent': ERROR_MESSAGES.OPPONENT_UPDATE_FAILED,
    'Failed to update court': ERROR_MESSAGES.COURT_UPDATE_FAILED,

    // Delete errors
    'Failed to delete client': ERROR_MESSAGES.CLIENT_DELETE_FAILED,
    'Failed to delete case': ERROR_MESSAGES.CASE_DELETE_FAILED,
    'Failed to delete trial': ERROR_MESSAGES.TRIAL_DELETE_FAILED,
    'Failed to delete opponent': ERROR_MESSAGES.OPPONENT_DELETE_FAILED,
    'Failed to delete court': ERROR_MESSAGES.COURT_DELETE_FAILED,

    // Fetch errors
    'Failed to fetch client': ERROR_MESSAGES.CLIENT_FETCH_FAILED,
    'Failed to fetch clients': ERROR_MESSAGES.CLIENTS_FETCH_FAILED,
    'Failed to fetch case': ERROR_MESSAGES.CASE_FETCH_FAILED,
    'Failed to fetch cases': ERROR_MESSAGES.CASES_FETCH_FAILED,
    'Failed to fetch trial': ERROR_MESSAGES.TRIAL_FETCH_FAILED,
    'Failed to fetch trials': ERROR_MESSAGES.TRIALS_FETCH_FAILED,
    'Failed to fetch opponent': ERROR_MESSAGES.OPPONENT_FETCH_FAILED,
    'Failed to fetch opponents': ERROR_MESSAGES.OPPONENTS_FETCH_FAILED,
    'Failed to fetch court': ERROR_MESSAGES.COURT_FETCH_FAILED,
    'Failed to fetch courts': ERROR_MESSAGES.COURTS_FETCH_FAILED,

    // Generic errors
    'No active organization found': ERROR_MESSAGES.NO_ACTIVE_ORGANIZATION,
    'User not found in session': ERROR_MESSAGES.USER_NOT_IN_SESSION,
    'Unauthorized access': ERROR_MESSAGES.UNAUTHORIZED,
    'Internal server error': ERROR_MESSAGES.INTERNAL_ERROR,
    'Bad request': ERROR_MESSAGES.BAD_REQUEST,
    'Resource not found': ERROR_MESSAGES.NOT_FOUND,
  }

  return errorMap[englishMessage] || englishMessage
}
