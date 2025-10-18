import fs from 'fs-extra'
import path from 'path'
import QRCode from 'qrcode'

export class QRCodeGenerator {
  private outputDir: string

  constructor(outputDir: string = 'src/public/late-pass-tickets/qr-codes') {
    this.outputDir = outputDir
  }

  /**
   * Generate QR code image from data and save to file
   * @param data - QR code data (usually JWT token)
   * @param filename - Output filename (without extension)
   * @returns Relative path to the generated QR code image
   */
  async generateQRCode(data: string, filename: string): Promise<string> {
    // Ensure output directory exists
    await fs.ensureDir(this.outputDir)

    // Generate filename with extension
    const qrFilename = `${filename}.png`
    const qrPath = path.join(this.outputDir, qrFilename)

    // Generate QR code with options
    await QRCode.toFile(qrPath, data, {
      type: 'png',
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H', // High error correction for better scanning
    })

    // Return relative path for storage in database
    return `late-pass-tickets/qr-codes/${qrFilename}`
  }

  /**
   * Generate QR code as base64 data URL (for inline use in PDFs)
   * @param data - QR code data
   * @returns Base64 data URL
   */
  async generateQRCodeDataURL(data: string): Promise<string> {
    const dataURL = await QRCode.toDataURL(data, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    })

    return dataURL
  }

  /**
   * Delete QR code file
   * @param relativePath - Relative path to QR code file
   */
  async deleteQRCode(relativePath: string): Promise<void> {
    const fullPath = path.join('src/public', relativePath)
    await fs.remove(fullPath)
  }
}

// Singleton instance
export const qrCodeGenerator = new QRCodeGenerator()
