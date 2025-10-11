import fs from 'fs-extra'
import path from 'path'
import mime from 'mime-types'

/**
 * Allowed MIME types for file uploads
 */
export const ALLOWED_MIME_TYPES = [
  'application/pdf', // PDF
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
  'application/msword', // DOC
  'image/png', // PNG
  'image/jpeg', // JPG/JPEG
  'image/jpg', // JPG
]

/**
 * Max file size: 5MB in bytes
 */
export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

/**
 * Max number of files per session note
 */
export const MAX_FILES_PER_NOTE = 6

/**
 * Base public directory
 */
export const PUBLIC_DIR = path.join(process.cwd(), 'src', 'public')

/**
 * Temp upload directory
 */
export const TEMP_DIR = path.join(PUBLIC_DIR, 'tmp')

/**
 * Validate file type and size
 */
export function validateFile(file: Express.Multer.File): {
  valid: boolean
  error?: string
} {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
    }
  }

  // Validate MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return {
      valid: false,
      error: `File type ${file.mimetype} is not allowed`,
    }
  }

  return { valid: true }
}

/**
 * Ensure directory exists
 */
export async function ensureDirectory(dirPath: string): Promise<void> {
  await fs.ensureDir(dirPath)
}

/**
 * Move file from temp to final destination
 * This is a reusable function that can be used across different features
 */
export async function moveFileFromTemp(
  tempFilePath: string,
  destinationDir: string,
  fileName: string
): Promise<string> {
  try {
    // Ensure destination directory exists
    await ensureDirectory(destinationDir)

    // Construct full destination path
    const destinationPath = path.join(destinationDir, fileName)

    // Move file
    await fs.move(tempFilePath, destinationPath, { overwrite: true })

    // Return relative path from public directory
    const relativePath = path.relative(PUBLIC_DIR, destinationPath)
    return `/${relativePath.split(path.sep).join('/')}`
  } catch (error) {
    throw new Error(`Failed to move file: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Delete file from filesystem
 */
export async function deleteFile(filePath: string): Promise<void> {
  try {
    const fullPath = path.join(PUBLIC_DIR, filePath.startsWith('/') ? filePath.slice(1) : filePath)
    await fs.remove(fullPath)
  } catch (error) {
    // Silently fail if file doesn't exist
    console.warn(`Failed to delete file ${filePath}:`, error)
  }
}

/**
 * Get file extension from MIME type
 */
export function getExtensionFromMimeType(mimeType: string): string {
  const ext = mime.extension(mimeType)
  return ext ? `.${ext}` : ''
}

/**
 * Generate unique filename
 */
export function generateUniqueFileName(originalName: string): string {
  const ext = path.extname(originalName)
  const baseName = path.basename(originalName, ext)
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `${baseName}-${timestamp}-${random}${ext}`
}

/**
 * Clean keywords string: lowercase, remove special chars, remove multiple spaces
 */
export function cleanKeywords(keywords: string): string {
  if (!keywords) return ''

  return keywords
    .toLowerCase() // Convert to lowercase
    .replace(/[^a-z0-9,\s]/g, '') // Remove special characters except commas and spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .split(',') // Split by comma
    .map((k) => k.trim()) // Trim each keyword
    .filter((k) => k.length > 0) // Remove empty keywords
    .join(',') // Join back with comma
}
