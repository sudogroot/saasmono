import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import PDFDocument from 'pdfkit'
import type { LatePassConfig, LatePassTicket } from '@/types/late-pass-ticket'
import { qrCodeGenerator } from './qr-code-generator'
import { formatDateTime, formatTime } from './date'

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export interface TicketPDFData {
  ticket: LatePassTicket
  config: LatePassConfig
  qrCodeDataURL: string
}

export class LatePassTicketPDFGenerator {
  private outputDir: string

  constructor(outputDir: string = 'src/public/late-pass-tickets/pdfs') {
    this.outputDir = outputDir
  }

  /**
   * Generate late pass ticket PDF
   * @param data - Ticket data including ticket, config, and QR code
   * @returns Relative path to the generated PDF
   */
  async generateTicketPDF(data: TicketPDFData): Promise<string> {
    // Ensure output directory exists
    await fs.ensureDir(this.outputDir)

    // Generate filename
    const pdfFilename = `${data.ticket.ticketNumber}.pdf`
    const pdfPath = path.join(this.outputDir, pdfFilename)

    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    })

    // Create write stream
    const stream = fs.createWriteStream(pdfPath)
    doc.pipe(stream)

    // Build the PDF content
    await this.buildTicketPDF(doc, data)

    // Finalize PDF
    doc.end()

    // Wait for stream to finish
    await new Promise<void>((resolve, reject) => {
      stream.on('finish', () => resolve())
      stream.on('error', (err) => reject(err))
    })

    // Return relative path for storage in database
    return `late-pass-tickets/pdfs/${pdfFilename}`
  }

  /**
   * Build the PDF content
   */
  private async buildTicketPDF(doc: PDFKit.PDFDocument, data: TicketPDFData): Promise<void> {
    const { ticket, config, qrCodeDataURL } = data
    const pageWidth = doc.page.width
    const pageHeight = doc.page.height
    const margin = 50

    // Register Arabic font (variable font supports multiple weights)
    const fontPath = path.join(__dirname, 'fonts')
    doc.registerFont('Cairo', path.join(fontPath, 'Cairo-Variable.ttf'))

    // Header - Title (Arabic only, RTL)
    doc
      .fontSize(24)
      .font('Cairo')
      .fillColor('#2563eb')
      .text('للحصة حضور تصريح', margin, margin, { align: 'center' })

    // Reset color and move down
    doc.fillColor('#000000')
    doc.moveDown(3)

    // Ticket Number Box
    const ticketBoxY = margin + 80
    doc
      .rect(margin, ticketBoxY, pageWidth - 2 * margin, 50)
      .fillAndStroke('#f0f9ff', '#2563eb')

    doc
      .fontSize(16)
      .font('Cairo')
      .fillColor('#1e40af')
      .text(`${ticket.ticketNumber}: التصريح رقم `, margin + 20, ticketBoxY + 15, {
        width: pageWidth - 2 * margin - 40,
        align: 'right'
      })

    doc.fillColor('#000000')

    // Student Information Section (RTL)
    let currentY = ticketBoxY + 80
    const labelWidth = 120
    const contentX = pageWidth - margin - labelWidth

    doc
      .fontSize(14)
      .font('Cairo')
      .text('الطالب بيانات', margin, currentY, { align: 'right', width: pageWidth - 2 * margin })

    currentY += 25

    doc
      .fontSize(11)
      .font('Cairo')
      .text('الاسم:', contentX, currentY, { align: 'right' })
      .text(`${ticket.student.name} ${ticket.student.lastName}`, margin, currentY, { align: 'right', width: contentX - margin - 10 })

    currentY += 20

    doc
      .font('Cairo')
      .text('البريد:', contentX, currentY, { align: 'right' })
      .text(ticket.student.email, margin, currentY, { align: 'right', width: contentX - margin - 10 })

    // Timetable Information Section (RTL)
    currentY += 40

    doc
      .fontSize(14)
      .font('Cairo')
      .text('الحصة تفاصيل', margin, currentY, { align: 'right', width: pageWidth - 2 * margin })

    currentY += 25

    doc
      .fontSize(11)
      .font('Cairo')
      .text(`الحصة: عنوان`, contentX, currentY, { align: 'right' })
      .text(ticket.timetable.title, margin, currentY, { align: 'right', width: contentX - margin - 10 })

    currentY += 20

    if (ticket.timetable.educationSubject) {
      doc
        .font('Cairo')
        .text('الدراسية: المادة', contentX, currentY, { align: 'right' })
        .text(
          ticket.timetable.educationSubject.displayNameAr,
          margin,
          currentY,
          { align: 'right', width: contentX - margin - 10 }
        )
      currentY += 20
    }

    doc
      .font('Cairo')
      .text('القاعة:', contentX, currentY, { align: 'right' })
      .text(ticket.timetable.room.name, margin, currentY, { align: 'right', width: contentX - margin - 10 })

    currentY += 20

    const classTime = `${formatTime(ticket.timetable.endDateTime)} - ${formatTime(ticket.timetable.startDateTime)}`

    doc
      .font('Cairo')
      .text('الحصة: موعد', contentX, currentY, { align: 'right' })
      .text(classTime, margin, currentY, { align: 'right', width: contentX - margin - 10 })

    // Ticket Validity Section (RTL)
    currentY += 40

    doc
      .fontSize(14)
      .font('Cairo')
      .text('مدة الصلاحية', margin, currentY, { align: 'right', width: pageWidth - 2 * margin })

    currentY += 25

    doc
      .fontSize(11)
      .font('Cairo')
      .text('الإصدار: تاريخ', contentX, currentY, { align: 'right' })
      .text(
        formatDateTime(ticket.issuedAt),
        margin,
        currentY,
        { align: 'right', width: contentX - margin - 10 }
      )

    currentY += 20

    doc
      .font('Cairo')
      .text('الصلاحية: تنتهي', contentX, currentY, { align: 'right' })
      .fillColor('#dc2626')
      .text(
        formatDateTime(ticket.expiresAt),
        margin,
        currentY,
        { align: 'right', width: contentX - margin - 10 }
      )

    doc.fillColor('#000000')

    // QR Code Section
    const qrY = currentY + 50
    const qrSize = 150
    const qrX = (pageWidth - qrSize) / 2

    // Add QR code from data URL
    const base64Data = qrCodeDataURL.split(',')[1]
    if (!base64Data) {
      throw new Error('Invalid QR code data URL format')
    }
    const qrImageData = Buffer.from(base64Data, 'base64')
    doc.image(qrImageData, qrX, qrY, {
      width: qrSize,
      height: qrSize,
    })

    // QR Code instructions (Arabic only)
    const instructionY = qrY + qrSize + 15

    doc
      .fontSize(10)
      .font('Cairo')
      .fillColor('#6b7280')
      .text('حضورك لتسجيل الرمز امسح', margin, instructionY, {
        width: pageWidth - 2 * margin,
        align: 'center',
      })

    // Footer - Important Notes (Arabic only, RTL)
    const footerY = pageHeight - margin - 80

    doc
      .fontSize(9)
      .font('Cairo')
      .fillColor('#991b1b')
      .text('مهمة تنبيهات', margin, footerY, { align: 'right', width: pageWidth - 2 * margin })

    doc
      .fontSize(8)
      .font('Cairo')
      .fillColor('#6b7280')
      .text('فقط واحدة لحصة صالح التصريح • ', margin, footerY + 15, { align: 'right', width: pageWidth - 2 * margin })
      .text('المحدد الوقت انتهاء قبل المسح يجب • ', margin, footerY + 28, { align: 'right', width: pageWidth - 2 * margin })
      .text('مرة من أكثر استخدامه يمكن لا • ', margin, footerY + 41, { align: 'right', width: pageWidth - 2 * margin })

    // Issued by footer (Arabic)
    doc
      .fontSize(8)
      .fillColor('#9ca3af')
      .text(
        `${ticket.issuedBy.name} ${ticket.issuedBy.lastName} من صادر :`,
        margin,
        pageHeight - margin - 15,
        {
          width: pageWidth - 2 * margin,
          align: 'center',
        }
      )
  }

  /**
   * Delete PDF file
   * @param relativePath - Relative path to PDF file
   */
  async deletePDF(relativePath: string): Promise<void> {
    const fullPath = path.join('src/public', relativePath)
    await fs.remove(fullPath)
  }
}

// Singleton instance
export const latePassTicketPDFGenerator = new LatePassTicketPDFGenerator()

/**
 * Generate complete late pass ticket (QR code + PDF)
 * @param ticket - Complete ticket data with relations
 * @param config - Late pass configuration
 * @returns Object containing QR and PDF paths
 */
export async function generateCompleteTicket(
  ticket: LatePassTicket,
  config: LatePassConfig
): Promise<{ qrCodePath: string; pdfPath: string }> {
  // Generate QR code data URL for PDF embedding
  const qrCodeDataURL = await qrCodeGenerator.generateQRCodeDataURL(ticket.qrCodeData)

  // Also save QR code as file
  const qrCodePath = await qrCodeGenerator.generateQRCode(
    ticket.qrCodeData,
    ticket.ticketNumber
  )

  // Generate PDF with embedded QR code
  const pdfPath = await latePassTicketPDFGenerator.generateTicketPDF({
    ticket,
    config,
    qrCodeDataURL,
  })

  return {
    qrCodePath,
    pdfPath,
  }
}
