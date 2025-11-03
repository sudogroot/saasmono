import type { FileDocument, FileTag } from '../types'

// Mock tags
export const mockTags: FileTag[] = [
  { id: '1', name: 'عقد', color: 'blue' },
  { id: '2', name: 'صك', color: 'green' },
  { id: '3', name: 'مستند رسمي', color: 'purple' },
  { id: '4', name: 'لائحة', color: 'orange' },
  { id: '5', name: 'مرافعة', color: 'red' },
  { id: '6', name: 'حكم', color: 'indigo' },
  { id: '7', name: 'صورة شخصية', color: 'pink' },
  { id: '8', name: 'فاتورة', color: 'yellow' },
  { id: '9', name: 'تقرير', color: 'cyan' },
  { id: '10', name: 'وكالة', color: 'teal' },
]

// Mock files
export const mockFiles: FileDocument[] = [
  {
    id: '1',
    name: 'عقد_بيع_عقار_2024',
    originalName: 'عقد_بيع_عقار_2024.pdf',
    fileType: 'pdf',
    mimeType: 'application/pdf',
    size: 2547891,
    url: '/mock/files/contract1.pdf',
    status: 'ready',
    uploadedAt: new Date('2024-03-15T10:30:00'),
    updatedAt: new Date('2024-03-15T10:30:00'),
    description: 'عقد بيع عقار في حي النزهة - الرياض',
    tags: [mockTags[0]!, mockTags[2]!],
    linkedEntities: [
      {
        id: 'case-1',
        type: 'case',
        name: 'قضية بيع عقار رقم 12345',
      },
      {
        id: 'client-1',
        type: 'client',
        name: 'محمد بن عبدالله السعيد',
      },
    ],
    uploadedBy: {
      id: 'user-1',
      name: 'أحمد الحارثي',
    },
    metadata: {
      pageCount: 15,
    },
  },
  {
    id: '2',
    name: 'صورة_الهوية_الوطنية',
    originalName: 'صورة_الهوية_الوطنية.jpg',
    fileType: 'image',
    mimeType: 'image/jpeg',
    size: 1245670,
    url: '/mock/files/id-card.jpg',
    thumbnailUrl: '/mock/files/id-card-thumb.jpg',
    status: 'ready',
    uploadedAt: new Date('2024-03-14T14:20:00'),
    updatedAt: new Date('2024-03-14T14:20:00'),
    description: 'صورة من الهوية الوطنية للمنوب',
    tags: [mockTags[2]!, mockTags[6]!],
    linkedEntities: [
      {
        id: 'client-1',
        type: 'client',
        name: 'محمد بن عبدالله السعيد',
      },
    ],
    uploadedBy: {
      id: 'user-1',
      name: 'أحمد الحارثي',
    },
    metadata: {
      width: 1920,
      height: 1080,
    },
  },
  {
    id: '3',
    name: 'لائحة_اعتراض_على_الحكم',
    originalName: 'لائحة_اعتراض_على_الحكم.docx',
    fileType: 'document',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: 456789,
    url: '/mock/files/objection.docx',
    status: 'ready',
    uploadedAt: new Date('2024-03-13T09:15:00'),
    updatedAt: new Date('2024-03-14T11:00:00'),
    description: 'لائحة اعتراضية على حكم محكمة الدرجة الأولى',
    tags: [mockTags[3]!, mockTags[4]!],
    linkedEntities: [
      {
        id: 'case-2',
        type: 'case',
        name: 'قضية عمالية رقم 67890',
      },
      {
        id: 'trial-1',
        type: 'trial',
        name: 'جلسة 15 مارس 2024',
      },
    ],
    uploadedBy: {
      id: 'user-2',
      name: 'فاطمة الزهراني',
    },
    metadata: {
      pageCount: 8,
    },
  },
  {
    id: '4',
    name: 'حكم_محكمة_الاستئناف',
    originalName: 'حكم_محكمة_الاستئناف.pdf',
    fileType: 'pdf',
    mimeType: 'application/pdf',
    size: 3456789,
    url: '/mock/files/verdict.pdf',
    status: 'ready',
    uploadedAt: new Date('2024-03-12T16:45:00'),
    updatedAt: new Date('2024-03-12T16:45:00'),
    description: 'حكم محكمة الاستئناف في القضية رقم 12345',
    tags: [mockTags[5]!, mockTags[2]!],
    linkedEntities: [
      {
        id: 'case-1',
        type: 'case',
        name: 'قضية بيع عقار رقم 12345',
      },
      {
        id: 'trial-2',
        type: 'trial',
        name: 'جلسة الحكم النهائي',
      },
    ],
    uploadedBy: {
      id: 'user-1',
      name: 'أحمد الحارثي',
    },
    metadata: {
      pageCount: 25,
    },
  },
  {
    id: '5',
    name: 'فاتورة_اتعاب_المحاماة',
    originalName: 'فاتورة_اتعاب_المحاماة.pdf',
    fileType: 'pdf',
    mimeType: 'application/pdf',
    size: 234567,
    url: '/mock/files/invoice.pdf',
    status: 'ready',
    uploadedAt: new Date('2024-03-11T13:30:00'),
    updatedAt: new Date('2024-03-11T13:30:00'),
    description: 'فاتورة أتعاب المحاماة للربع الأول من 2024',
    tags: [mockTags[7]!],
    linkedEntities: [
      {
        id: 'client-2',
        type: 'client',
        name: 'شركة النور للتجارة',
      },
    ],
    uploadedBy: {
      id: 'user-3',
      name: 'خالد العتيبي',
    },
    metadata: {
      pageCount: 2,
    },
  },
  {
    id: '6',
    name: 'وكالة_شرعية',
    originalName: 'وكالة_شرعية.pdf',
    fileType: 'pdf',
    mimeType: 'application/pdf',
    size: 1876543,
    url: '/mock/files/power-of-attorney.pdf',
    status: 'ready',
    uploadedAt: new Date('2024-03-10T10:00:00'),
    updatedAt: new Date('2024-03-10T10:00:00'),
    description: 'وكالة شرعية للترافع أمام المحاكم',
    tags: [mockTags[9]!, mockTags[2]!],
    linkedEntities: [
      {
        id: 'client-1',
        type: 'client',
        name: 'محمد بن عبدالله السعيد',
      },
      {
        id: 'case-1',
        type: 'case',
        name: 'قضية بيع عقار رقم 12345',
      },
    ],
    uploadedBy: {
      id: 'user-1',
      name: 'أحمد الحارثي',
    },
    metadata: {
      pageCount: 3,
    },
  },
  {
    id: '7',
    name: 'صورة_موقع_الحادث',
    originalName: 'صورة_موقع_الحادث.jpg',
    fileType: 'image',
    mimeType: 'image/jpeg',
    size: 3456789,
    url: '/mock/files/accident-scene.jpg',
    thumbnailUrl: '/mock/files/accident-scene-thumb.jpg',
    status: 'ready',
    uploadedAt: new Date('2024-03-09T08:20:00'),
    updatedAt: new Date('2024-03-09T08:20:00'),
    description: 'صورة من موقع حادث السير',
    tags: [mockTags[6]!],
    linkedEntities: [
      {
        id: 'case-3',
        type: 'case',
        name: 'قضية حادث مرور رقم 54321',
      },
      {
        id: 'opponent-1',
        type: 'opponent',
        name: 'شركة التأمين الوطنية',
      },
    ],
    uploadedBy: {
      id: 'user-2',
      name: 'فاطمة الزهراني',
    },
    metadata: {
      width: 4032,
      height: 3024,
    },
  },
  {
    id: '8',
    name: 'تقرير_الخبير_الفني',
    originalName: 'تقرير_الخبير_الفني.pdf',
    fileType: 'pdf',
    mimeType: 'application/pdf',
    size: 5678901,
    url: '/mock/files/expert-report.pdf',
    status: 'ready',
    uploadedAt: new Date('2024-03-08T15:10:00'),
    updatedAt: new Date('2024-03-08T15:10:00'),
    description: 'تقرير الخبير الفني في قضية العيوب الإنشائية',
    tags: [mockTags[8]!, mockTags[2]!],
    linkedEntities: [
      {
        id: 'case-4',
        type: 'case',
        name: 'قضية عيوب إنشائية رقم 98765',
      },
      {
        id: 'trial-3',
        type: 'trial',
        name: 'جلسة الخبرة الفنية',
      },
    ],
    uploadedBy: {
      id: 'user-3',
      name: 'خالد العتيبي',
    },
    metadata: {
      pageCount: 42,
    },
  },
  {
    id: '9',
    name: 'مذكرة_دفاع',
    originalName: 'مذكرة_دفاع.pdf',
    fileType: 'pdf',
    mimeType: 'application/pdf',
    size: 987654,
    url: '/mock/files/defense-memo.pdf',
    status: 'ready',
    uploadedAt: new Date('2024-03-07T11:25:00'),
    updatedAt: new Date('2024-03-07T11:25:00'),
    description: 'مذكرة دفاع شاملة في قضية التعويضات',
    tags: [mockTags[4]!],
    linkedEntities: [
      {
        id: 'case-5',
        type: 'case',
        name: 'قضية تعويضات رقم 11111',
      },
      {
        id: 'client-3',
        type: 'client',
        name: 'سارة القحطاني',
      },
    ],
    uploadedBy: {
      id: 'user-1',
      name: 'أحمد الحارثي',
    },
    metadata: {
      pageCount: 12,
    },
  },
  {
    id: '10',
    name: 'صك_ملكية',
    originalName: 'صك_ملكية.pdf',
    fileType: 'pdf',
    mimeType: 'application/pdf',
    size: 1234567,
    url: '/mock/files/deed.pdf',
    status: 'ready',
    uploadedAt: new Date('2024-03-06T09:40:00'),
    updatedAt: new Date('2024-03-06T09:40:00'),
    description: 'صك ملكية العقار محل النزاع',
    tags: [mockTags[1]!, mockTags[2]!],
    linkedEntities: [
      {
        id: 'case-1',
        type: 'case',
        name: 'قضية بيع عقار رقم 12345',
      },
      {
        id: 'client-1',
        type: 'client',
        name: 'محمد بن عبدالله السعيد',
      },
    ],
    uploadedBy: {
      id: 'user-1',
      name: 'أحمد الحارثي',
    },
    metadata: {
      pageCount: 5,
    },
  },
]

// Helper function to format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 بايت'
  const k = 1024
  const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}

// Helper function to get file icon based on type
export function getFileIcon(fileType: string): string {
  const icons: Record<string, string> = {
    pdf: 'FileText',
    document: 'FileText',
    image: 'Image',
    video: 'Video',
    audio: 'Music',
    other: 'File',
  }
  return icons[fileType] || 'File'
}

// Helper function to get file type label in Arabic
export function getFileTypeLabel(fileType: string): string {
  const labels: Record<string, string> = {
    pdf: 'PDF',
    document: 'مستند',
    image: 'صورة',
    video: 'فيديو',
    audio: 'صوت',
    other: 'آخر',
  }
  return labels[fileType] || 'ملف'
}
