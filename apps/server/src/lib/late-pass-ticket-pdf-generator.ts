import fs from 'fs-extra'
import path from 'path'
import PDFDocument from 'pdfkit'
import type { LatePassConfig, LatePassTicket } from '@/types/late-pass-ticket'
import { qrCodeGenerator } from './qr-code-generator'

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
    await new Promise((resolve, reject) => {
      stream.on('finish', resolve)
      stream.on('error', reject)
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

    // Header - Title
    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .fillColor('#2563eb')
      .text('Late Pass Ticket', margin, margin, { align: 'center' })
      .text('تذكرة الدخول المتأخر', margin, margin + 30, { align: 'center' })

    // Reset color and move down
    doc.fillColor('#000000')
    doc.moveDown(3)

    // Ticket Number Box
    const ticketBoxY = margin + 100
    doc
      .rect(margin, ticketBoxY, pageWidth - 2 * margin, 50)
      .fillAndStroke('#f0f9ff', '#2563eb')

    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .fillColor('#1e40af')
      .text(`Ticket #: ${ticket.ticketNumber}`, margin + 20, ticketBoxY + 15, { width: pageWidth - 2 * margin - 40 })

    doc.fillColor('#000000')

    // Student Information Section
    let currentY = ticketBoxY + 80

    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Student Information / معلومات الطالب', margin, currentY)

    currentY += 25

    doc
      .fontSize(11)
      .font('Helvetica')
      .text('Name / الاسم:', margin, currentY)
      .font('Helvetica-Bold')
      .text(`${ticket.student.name} ${ticket.student.lastName}`, margin + 120, currentY)

    currentY += 20

    doc
      .font('Helvetica')
      .text('Email / البريد:', margin, currentY)
      .font('Helvetica-Bold')
      .text(ticket.student.email, margin + 120, currentY)

    // Timetable Information Section
    currentY += 40

    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Class Information / معلومات الحصة', margin, currentY)

    currentY += 25

    doc
      .fontSize(11)
      .font('Helvetica')
      .text('Class / الحصة:', margin, currentY)
      .font('Helvetica-Bold')
      .text(ticket.timetable.title, margin + 120, currentY)

    currentY += 20

    if (ticket.timetable.educationSubject) {
      doc
        .font('Helvetica')
        .text('Subject / المادة:', margin, currentY)
        .font('Helvetica-Bold')
        .text(
          ticket.timetable.educationSubject.displayNameEn || ticket.timetable.educationSubject.displayNameAr,
          margin + 120,
          currentY
        )
      currentY += 20
    }

    doc
      .font('Helvetica')
      .text('Room / القاعة:', margin, currentY)
      .font('Helvetica-Bold')
      .text(ticket.timetable.room.name, margin + 120, currentY)

    currentY += 20

    const classTime = `${new Date(ticket.timetable.startDateTime).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })} - ${new Date(ticket.timetable.endDateTime).toLocaleTimeString('en-US', {
      timeStyle: 'short',
    })}`

    doc
      .font('Helvetica')
      .text('Time / الوقت:', margin, currentY)
      .font('Helvetica-Bold')
      .text(classTime, margin + 120, currentY)

    // Ticket Validity Section
    currentY += 40

    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Ticket Validity / صلاحية التذكرة', margin, currentY)

    currentY += 25

    doc
      .fontSize(11)
      .font('Helvetica')
      .text('Issued At / تاريخ الإصدار:', margin, currentY)
      .font('Helvetica-Bold')
      .text(
        new Date(ticket.issuedAt).toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
        margin + 150,
        currentY
      )

    currentY += 20

    doc
      .font('Helvetica')
      .text('Expires At / تنتهي في:', margin, currentY)
      .font('Helvetica-Bold')
      .fillColor('#dc2626')
      .text(
        new Date(ticket.expiresAt).toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
        margin + 150,
        currentY
      )

    doc.fillColor('#000000')

    // QR Code Section
    const qrY = currentY + 50
    const qrSize = 150
    const qrX = (pageWidth - qrSize) / 2

    // Add QR code from data URL
    const qrImageData = Buffer.from(qrCodeDataURL.split(',')[1], 'base64')
    doc.image(qrImageData, qrX, qrY, {
      width: qrSize,
      height: qrSize,
    })

    // QR Code instructions
    const instructionY = qrY + qrSize + 15

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#6b7280')
      .text('Scan this QR code to mark attendance', margin, instructionY, {
        width: pageWidth - 2 * margin,
        align: 'center',
      })
      .text('امسح رمز الاستجابة السريعة لتسجيل الحضور', margin, instructionY + 15, {
        width: pageWidth - 2 * margin,
        align: 'center',
      })

    // Footer - Important Notes
    const footerY = pageHeight - margin - 80

    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor('#991b1b')
      .text('IMPORTANT NOTES / ملاحظات مهمة', margin, footerY)

    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor('#6b7280')
      .text(
        '• This ticket is valid for ONE class session only / هذه التذكرة صالحة لحصة واحدة فقط',
        margin,
        footerY + 15
      )
      .text('• Must be scanned before expiration time / يجب مسحها قبل انتهاء الصلاحية', margin, footerY + 28)
      .text('• Cannot be reused after scanning / لا يمكن إعادة استخدامها بعد المسح', margin, footerY + 41)

    // Issued by footer
    doc
      .fontSize(8)
      .fillColor('#9ca3af')
      .text(
        `Issued by: ${ticket.issuedBy.name} ${ticket.issuedBy.lastName}`,
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
