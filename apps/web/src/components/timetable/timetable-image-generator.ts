export interface ImageGeneratorOptions {
  filename?: string
  format?: 'png' | 'jpeg'
  quality?: number
  scale?: number
}

export async function generateTimetableImage(
  element: HTMLElement,
  options: ImageGeneratorOptions = {}
) {
  const {
    filename = 'timetable.png',
    format = 'png',
    quality = 1.0,
    scale = 2
  } = options

  try {
    // Dynamically import html2canvas to avoid SSR issues
    const html2canvas = (await import('html2canvas')).default

    // Configure html2canvas options for better quality
    const canvas = await html2canvas(element, {
      scale: scale,
      allowTaint: true,
      useCORS: true,
      backgroundColor: '#ffffff',
      width: element.scrollWidth,
      height: element.scrollHeight,
      scrollX: 0,
      scrollY: 0,
      // Additional options for better Arabic text rendering
      letterRendering: true,
      foreignObjectRendering: true,
    })

    // Convert canvas to blob
    const blob = await new Promise<Blob>((resolve) => {
      if (format === 'jpeg') {
        canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', quality)
      } else {
        canvas.toBlob((blob) => resolve(blob!), 'image/png')
      }
    })

    // Create download link
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename

    // Append to body, click, and remove
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Clean up the object URL
    URL.revokeObjectURL(url)

    return {
      success: true,
      blob,
      size: blob.size,
      filename
    }
  } catch (error) {
    console.error('Error generating timetable image:', error)

    // Fallback: show message about html2canvas dependency
    if (error instanceof Error && error.message.includes('Failed to resolve module')) {
      throw new Error('مكتبة html2canvas غير مثبتة. يرجى تثبيتها باستخدام: npm install html2canvas')
    }

    throw new Error('فشل في إنشاء صورة جدول الحصص. يرجى المحاولة مرة أخرى.')
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

// Helper function to format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 بايت'

  const k = 1024
  const sizes = ['بايت', 'ك.ب', 'م.ب', 'ج.ب']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

// Function to prepare element for better screenshot quality
export function prepareElementForScreenshot(element: HTMLElement) {
  // Store original styles
  const originalStyles = {
    transform: element.style.transform,
    webkitTransform: element.style.webkitTransform,
    filter: element.style.filter,
  }

  // Apply styles for better screenshot quality
  element.style.transform = 'scale(1)'
  element.style.webkitTransform = 'scale(1)'
  element.style.filter = 'none'

  // Return cleanup function
  return () => {
    element.style.transform = originalStyles.transform
    element.style.webkitTransform = originalStyles.webkitTransform
    element.style.filter = originalStyles.filter
  }
}