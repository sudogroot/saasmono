# نظام إدارة الملفات - File Management System

نظام شامل لإدارة الملفات في منصة رقيم للمحاماة. مصمم بشكل أساسي للأجهزة المحمولة (PWA) مع دعم كامل لالتقاط الصور عبر الكاميرا.

## المكونات الرئيسية

### 1. FilesPage
الصفحة الرئيسية لإدارة الملفات. تجمع جميع المكونات الأخرى معاً.

```tsx
import { FilesPage } from '@/components/files'

function App() {
  return <FilesPage />
}
```

### 2. FileUpload
مكون رفع الملفات مع دعم:
- السحب والإفلات (Drag & Drop)
- رفع متعدد
- التقاط صور من الكاميرا (للأجهزة المحمولة)
- شريط التقدم
- التحقق من نوع وحجم الملف

```tsx
import { FileUpload } from '@/components/files'

<FileUpload
  onUpload={async (files) => {
    // Handle file upload
  }}
  options={{
    maxSize: 10 * 1024 * 1024, // 10MB
    allowCamera: true,
    allowMultiple: true,
    acceptedTypes: ['image/*', 'application/pdf']
  }}
/>
```

### 3. FileList
عرض الملفات في شكل شبكة أو قائمة مع إمكانيات البحث والتصفية.

```tsx
import { FileList } from '@/components/files'

<FileList
  files={files}
  onView={(file) => console.log('View', file)}
  onEdit={(file) => console.log('Edit', file)}
  onDownload={(file) => console.log('Download', file)}
  onDelete={(file) => console.log('Delete', file)}
  filters={{
    search: '',
    fileType: ['pdf', 'image'],
    tags: [],
  }}
/>
```

### 4. FileCard
بطاقة عرض ملف واحد. متوفرة في وضعين: شبكة (grid) وقائمة (list).

```tsx
import { FileCard } from '@/components/files'

<FileCard
  file={file}
  variant="grid" // or "list"
  onView={(file) => console.log('View', file)}
  onEdit={(file) => console.log('Edit', file)}
/>
```

### 5. FileViewer
عرض تفاصيل الملف الكاملة.

```tsx
import { FileViewer } from '@/components/files'

<FileViewer
  file={file}
  onEdit={() => console.log('Edit')}
  onDownload={() => console.log('Download')}
/>
```

### 6. FileEditor
تعديل بيانات الملف وإضافة الوسوم والربط مع القضايا والعملاء.

```tsx
import { FileEditor } from '@/components/files'

<FileEditor
  file={file}
  onSave={async (data) => {
    // Save changes
  }}
  onCancel={() => console.log('Cancel')}
/>
```

## الميزات الرئيسية

### ✅ مصمم للأجهزة المحمولة أولاً
- تصميم متجاوب يعمل على جميع أحجام الشاشات
- تجربة مستخدم محسنة للمس
- دعم التقاط الصور من كاميرا الهاتف

### ✅ رفع وإدارة الملفات
- رفع ملفات متعددة
- السحب والإفلات
- شريط تقدم الرفع
- معاينة الصور قبل الرفع

### ✅ الوسوم (Tags)
- إضافة وإزالة الوسوم
- البحث بالوسوم
- تصنيف الملفات

### ✅ الربط بالكيانات
ربط الملفات مع:
- القضايا (Cases)
- الجلسات (Trials)
- العملاء (Clients)
- الخصوم (Opponents)

### ✅ البحث والتصفية
- البحث في أسماء الملفات والأوصاف
- تصفية حسب نوع الملف
- تصفية حسب الوسوم
- تصفية حسب التاريخ
- تصفية حسب الكيانات المرتبطة

### ✅ واجهة عربية
جميع النصوص باللغة العربية مع دعم RTL كامل

## أنواع البيانات

### FileDocument
```typescript
interface FileDocument {
  id: string
  name: string
  originalName: string
  fileType: FileType
  mimeType: string
  size: number
  url: string
  thumbnailUrl?: string
  status: FileStatus
  uploadedAt: Date
  updatedAt: Date
  description?: string
  tags: FileTag[]
  linkedEntities: LinkedEntity[]
  uploadedBy: {
    id: string
    name: string
  }
  metadata?: {
    width?: number
    height?: number
    duration?: number
    pageCount?: number
  }
}
```

### FileTag
```typescript
interface FileTag {
  id: string
  name: string
  color?: string
}
```

### LinkedEntity
```typescript
interface LinkedEntity {
  id: string
  type: 'case' | 'trial' | 'client' | 'opponent'
  name: string
  metadata?: any
}
```

## بيانات تجريبية

الملف `mocks/files-data.ts` يحتوي على:
- 10 ملفات تجريبية بمحتوى عربي
- 10 وسوم مختلفة
- دوال مساعدة للتنسيق

```typescript
import { mockFiles, mockTags, formatFileSize } from '@/components/files/mocks/files-data'
```

## التكامل مع الباك إند

في التطبيق الحقيقي، استبدل البيانات التجريبية بـ API calls:

```typescript
// استبدل mockFiles بـ API call
const { data: files } = useQuery({
  ...orpc.files.listFiles.queryOptions()
})

// استبدل onUpload بـ mutation
const uploadMutation = useMutation(
  orpc.files.uploadFile.mutationOptions({
    onSuccess: () => {
      toast.success('تم رفع الملف بنجاح')
    }
  })
)
```

## الاستخدام في الصفحات

### استخدام الصفحة الكاملة
```tsx
import { FilesPage } from '@/components/files'

export default function FilesRoute() {
  return <FilesPage />
}
```

### استخدام مكونات فردية
```tsx
import { FileUpload, FileList } from '@/components/files'

export default function CustomFilesPage() {
  const [files, setFiles] = useState([])

  return (
    <div>
      <FileUpload onUpload={handleUpload} />
      <FileList files={files} />
    </div>
  )
}
```

## تخصيص التصميم

جميع المكونات تقبل `className` للتخصيص:

```tsx
<FileCard
  file={file}
  className="border-2 shadow-lg"
/>
```

## الاعتماديات

المكونات تستخدم:
- `@repo/ui` - مكونات واجهة المستخدم الأساسية
- `react-hook-form` - إدارة النماذج
- `date-fns` - تنسيق التواريخ (مع دعم اللغة العربية)
- `lucide-react` - الأيقونات
- `sonner` - الإشعارات

## الخطوات القادمة

للتكامل الكامل مع النظام:

1. إنشاء ORPC routes للملفات في الباك إند
2. إضافة جدول files في قاعدة البيانات
3. إعداد S3 أو خدمة تخزين سحابية للملفات
4. ربط المكونات بـ API calls الحقيقية
5. إضافة صلاحيات وأمان للملفات
