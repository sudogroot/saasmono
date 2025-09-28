export interface ImageGeneratorOptions {
  filename?: string
  format?: 'png' | 'jpeg'
  quality?: number
  scale?: number
  useFallback?: boolean
}

export async function generateTimetableImage(
  element: HTMLElement,
  options: ImageGeneratorOptions = {}
) {
  const {
    filename = 'timetable.png',
    format = 'png',
    quality = 1.0,
    scale = 2,
    useFallback = false
  } = options

  try {
    // Prepare element for screenshot by normalizing CSS
    const cleanup = prepareElementForScreenshot(element)

    // Dynamically import html2canvas to avoid SSR issues
    const html2canvas = (await import('html2canvas')).default

    // Configure html2canvas options based on fallback mode
    const canvasOptions = useFallback ? {
      // Simplified options for fallback mode
      scale: Math.min(scale, 1), // Reduce scale for fallback
      allowTaint: false,
      useCORS: false,
      backgroundColor: '#ffffff',
      logging: false,
      letterRendering: false,
      foreignObjectRendering: false,
      removeContainer: true,
      imageTimeout: 10000,
      // More aggressive element ignoring for fallback
      ignoreElements: (el: Element) => {
        if (el.tagName === 'SCRIPT' ||
            el.tagName === 'STYLE' ||
            el.tagName === 'NOSCRIPT') {
          return true
        }

        // Skip elements with any CSS custom properties
        if (el instanceof HTMLElement) {
          const style = window.getComputedStyle(el)
          for (let i = 0; i < style.length; i++) {
            const prop = style[i]
            if (prop?.startsWith('--')) {
              return true
            }
          }
        }

        return false
      }
    } : {
      // Standard options for normal mode
      scale: scale,
      allowTaint: true,
      useCORS: true,
      backgroundColor: '#ffffff',
      width: element.scrollWidth,
      height: element.scrollHeight,
      scrollX: 0,
      scrollY: 0,
      letterRendering: false,
      foreignObjectRendering: false,
      logging: false,
      imageTimeout: 15000,
      removeContainer: true,
      // More lenient element ignoring for normal mode
      ignoreElements: (el: Element) => {
        const classList = el.classList
        if (classList.contains('tooltip') ||
            classList.contains('popover') ||
            classList.contains('dropdown') ||
            el.tagName === 'SCRIPT' ||
            el.tagName === 'STYLE') {
          return true
        }

        return false
      }
    }

    const canvas = await html2canvas(element, canvasOptions)

    // Cleanup the prepared styles
    cleanup()

    // Convert canvas to blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      if (format === 'jpeg') {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Failed to create JPEG blob'))
        }, 'image/jpeg', quality)
      } else {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Failed to create PNG blob'))
        }, 'image/png')
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

    // More specific error handling
    if (error instanceof Error) {
      if (error.message.includes('Failed to resolve module')) {
        throw new Error('مكتبة html2canvas غير مثبتة. يرجى تثبيتها باستخدام: npm install html2canvas')
      }

      if (error.message.includes('color function') ||
          error.message.includes('lab') ||
          error.message.includes('oklab')) {
        throw new Error('خطأ في معالجة الألوان. يرجى المحاولة مرة أخرى أو تبسيط تصميم الجدول.')
      }

      if (error.message.includes('canvas') || error.message.includes('blob')) {
        throw new Error('فشل في إنشاء الصورة. قد يكون الجدول كبيراً جداً.')
      }
    }

    // Try fallback method if available
    if (!options.useFallback) {
      console.log('Attempting fallback method...')
      return generateTimetableImage(element, { ...options, useFallback: true })
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
  // Store original styles for all affected elements
  const originalStyles = new Map<HTMLElement, any>()

  // Function to normalize problematic CSS colors
  const normalizeColors = (el: HTMLElement) => {
    const computed = window.getComputedStyle(el)
    const original = {
      backgroundColor: el.style.backgroundColor,
      color: el.style.color,
      borderColor: el.style.borderColor,
      boxShadow: el.style.boxShadow,
      transform: el.style.transform,
      webkitTransform: el.style.webkitTransform,
      filter: el.style.filter,
    }

    originalStyles.set(el, original)

    // Convert problematic colors to standard formats
    const backgroundColor = computed.backgroundColor
    const color = computed.color
    const borderColor = computed.borderColor

    // Replace lab/oklab/color() with fallback colors
    if (backgroundColor.includes('lab(') || backgroundColor.includes('oklab(') || backgroundColor.includes('color(')) {
      // Extract rough equivalent or use white as fallback
      if (backgroundColor.includes('lab(0')) {
        el.style.backgroundColor = '#000000'
      } else if (backgroundColor.includes('lab(100')) {
        el.style.backgroundColor = '#ffffff'
      } else {
        el.style.backgroundColor = '#ffffff' // Safe fallback
      }
    }

    if (color.includes('lab(') || color.includes('oklab(') || color.includes('color(')) {
      if (color.includes('lab(0')) {
        el.style.color = '#000000'
      } else {
        el.style.color = '#000000' // Safe fallback
      }
    }

    if (borderColor.includes('lab(') || borderColor.includes('oklab(') || borderColor.includes('color(')) {
      el.style.borderColor = '#e5e7eb' // Gray-200 fallback
    }

    // Remove problematic CSS properties
    el.style.transform = 'none'
    el.style.webkitTransform = 'none'
    el.style.filter = 'none'

    // Remove CSS custom properties that might contain lab colors
    const style = el.style
    for (let i = style.length - 1; i >= 0; i--) {
      const property = style[i]
      if (property && property.startsWith('--')) {
        const value = style.getPropertyValue(property)
        if (value.includes('lab(') || value.includes('oklab(') || value.includes('color(')) {
          style.removeProperty(property)
        }
      }
    }
  }

  // Apply normalization to the main element and all children
  normalizeColors(element)
  const allElements = element.querySelectorAll('*')
  allElements.forEach(el => {
    if (el instanceof HTMLElement) {
      normalizeColors(el)
    }
  })

  // Return cleanup function
  return () => {
    // Restore all original styles
    originalStyles.forEach((original, el) => {
      el.style.backgroundColor = original.backgroundColor
      el.style.color = original.color
      el.style.borderColor = original.borderColor
      el.style.boxShadow = original.boxShadow
      el.style.transform = original.transform
      el.style.webkitTransform = original.webkitTransform
      el.style.filter = original.filter
    })
    originalStyles.clear()
  }
}