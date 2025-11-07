/**
 * Maps better-auth error codes to Arabic messages
 */
const betterAuthErrorCodes: Record<string, string> = {
  // Authentication errors
  'INVALID_EMAIL_OR_PASSWORD': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
  'INVALID_PASSWORD': 'كلمة المرور غير صحيحة',
  'INVALID_EMAIL': 'البريد الإلكتروني غير صحيح',
  'USER_NOT_FOUND': 'المستخدم غير موجود',
  'USER_ALREADY_EXISTS': 'المستخدم موجود بالفعل',

  // Password errors
  'PASSWORD_TOO_SHORT': 'كلمة المرور قصيرة جداً',
  'PASSWORD_TOO_LONG': 'كلمة المرور طويلة جداً',
  'USER_ALREADY_HAS_PASSWORD': 'المستخدم لديه كلمة مرور بالفعل',

  // Session errors
  'FAILED_TO_CREATE_SESSION': 'فشل في إنشاء الجلسة',
  'FAILED_TO_GET_SESSION': 'فشل في الحصول على الجلسة',
  'SESSION_EXPIRED': 'انتهت صلاحية الجلسة',

  // User management errors
  'FAILED_TO_CREATE_USER': 'فشل في إنشاء المستخدم',
  'FAILED_TO_UPDATE_USER': 'فشل في تحديث المستخدم',
  'USER_EMAIL_NOT_FOUND': 'البريد الإلكتروني للمستخدم غير موجود',
  'EMAIL_NOT_VERIFIED': 'البريد الإلكتروني غير مؤكد',
  'EMAIL_CAN_NOT_BE_UPDATED': 'لا يمكن تحديث البريد الإلكتروني',

  // Account linking errors
  'SOCIAL_ACCOUNT_ALREADY_LINKED': 'الحساب الاجتماعي مرتبط بالفعل',
  'CREDENTIAL_ACCOUNT_NOT_FOUND': 'حساب بيانات الاعتماد غير موجود',
  'ACCOUNT_NOT_FOUND': 'الحساب غير موجود',
  'FAILED_TO_UNLINK_LAST_ACCOUNT': 'فشل في إلغاء ربط الحساب الأخير',

  // Provider errors
  'PROVIDER_NOT_FOUND': 'مزود الخدمة غير موجود',
  'FAILED_TO_GET_USER_INFO': 'فشل في الحصول على معلومات المستخدم',

  // Token errors
  'INVALID_TOKEN': 'الرمز غير صالح',
  'ID_TOKEN_NOT_SUPPORTED': 'رمز المعرف غير مدعوم',
}

/**
 * Translates common error messages from English to Arabic
 */
function translateErrorMessage(message: string): string {
  // Common authentication errors
  const translations: Record<string, string> = {
    'Invalid email or password': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    'Invalid email address': 'عنوان البريد الإلكتروني غير صحيح',
    'Invalid credentials': 'بيانات الاعتماد غير صحيحة',
    'User not found': 'المستخدم غير موجود',
    'Email already exists': 'البريد الإلكتروني موجود بالفعل',
    'Password is too short': 'كلمة المرور قصيرة جداً',
    'Password must be at least 8 characters': 'يجب أن تكون كلمة المرور 8 أحرف على الأقل',
    'Network error': 'خطأ في الاتصال بالشبكة',
    'Server error': 'خطأ في الخادم',
    'Unauthorized': 'غير مصرح',
    'Forbidden': 'محظور',
    'Not found': 'غير موجود',
    'Too many requests': 'طلبات كثيرة جداً، يرجى المحاولة لاحقاً',
    'Session expired': 'انتهت صلاحية الجلسة',
    'Account is locked': 'الحساب مقفل',
    'Account is suspended': 'الحساب معلق',
    'Email verification required': 'مطلوب التحقق من البريد الإلكتروني',
  }

  // Check for exact match
  if (translations[message]) {
    return translations[message]
  }

  // Check for partial matches (case-insensitive)
  const lowerMessage = message.toLowerCase()
  for (const [english, arabic] of Object.entries(translations)) {
    if (lowerMessage.includes(english.toLowerCase())) {
      return arabic
    }
  }

  // Return original message if no translation found
  return message
}

/**
 * Extracts error message from various error types
 * Handles ORPC errors, standard errors, and other error formats
 * Translates error messages to Arabic
 */
export function getErrorMessage(error: unknown): string {
  // Handle null/undefined
  if (!error) {
    return 'حدث خطأ غير متوقع'
  }

  // Handle string errors
  if (typeof error === 'string') {
    return translateErrorMessage(error)
  }

  // Handle error objects
  if (typeof error === 'object') {
    const err = error as any

    // Log error for debugging (helps identify unhandled error structures)
    console.error('Error object received:', err)

    let extractedMessage: string | null = null

    // Check for better-auth error code first (priority)
    // The error response structure: { code: "INVALID_EMAIL_OR_PASSWORD", message: "Invalid email or password" }
    if (err.code && betterAuthErrorCodes[err.code]) {
      return betterAuthErrorCodes[err.code]
    }

    // Also check for error.error.code (error wrapped in context)
    if (err.error?.code && betterAuthErrorCodes[err.error.code]) {
      return betterAuthErrorCodes[err.error.code]
    }

    // Check for better-auth error format (top-level message from API response)
    if (err.message && typeof err.message === 'string' && !err.message.message) {
      extractedMessage = err.message
    }

    // Check for better-auth error context format (error wrapped in context)
    if (!extractedMessage && err.error) {
      // Check for nested error.error.message
      if (err.error.message && typeof err.error.message === 'string') {
        extractedMessage = err.error.message
      }

      // Check for error.error.statusText
      if (!extractedMessage && err.error.statusText) {
        extractedMessage = err.error.statusText
      }

      // Check if err.error itself has the error data directly
      if (!extractedMessage && typeof err.error === 'object' && err.error.code && err.error.message) {
        extractedMessage = err.error.message
      }
    }

    // Check for ORPC error format (nested message)
    if (!extractedMessage && err.message?.message) {
      extractedMessage = err.message.message
    }

    // Check for response data message (axios-like errors)
    if (!extractedMessage && err.response?.data?.message) {
      extractedMessage = err.response.data.message
    }

    // Check for response body message (fetch-like errors with body parsed as JSON)
    if (!extractedMessage && err.response?.body?.message) {
      extractedMessage = err.response.body.message
    }

    // Check for data message
    if (!extractedMessage && err.data?.message) {
      extractedMessage = err.data.message
    }

    // Check for issues array (Zod-like errors)
    if (!extractedMessage && err.issues && Array.isArray(err.issues) && err.issues.length > 0) {
      extractedMessage = err.issues[0].message
    }

    // If we found a message, translate it
    if (extractedMessage) {
      return translateErrorMessage(extractedMessage)
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
